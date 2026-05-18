import { NextResponse } from "next/server";
import {
  approveTipsterApplication,
  getPendingApplications,
  rejectTipsterApplication,
} from "@/lib/applications";
import { getPendingSubmissions, resolveCompetitionSubmission } from "@/lib/competition";
import { getPendingTips, resolveTip } from "@/lib/tipster-tips";
import { ensureTipsterProfile } from "@/lib/tipster-profiles";
import {
  getAccessTokenFromRequest,
  getSupabaseServerClient,
  getSupabaseUserFromToken,
} from "@/lib/supabase-server";
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from "@/lib/email";

async function requireAdmin(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) return null;
  const user = await getSupabaseUserFromToken(token);
  if (!user || user.user_metadata?.role !== "admin") return null;
  return { user };
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [pendingApplications, pendingSubmissions, pendingTips] = await Promise.all([
    getPendingApplications(),
    getPendingSubmissions(),
    getPendingTips(),
  ]);

  return NextResponse.json({ pendingApplications, pendingSubmissions, pendingTips });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const action = body.action as string;

  if (action === "approve-application") {
    const applicationId = body.applicationId as string;
    const note = typeof body.note === "string" ? body.note : undefined;
    const application = await approveTipsterApplication(applicationId, admin.user.id, note);
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    let approvedEmail: string | undefined;
    let approvedName = "Tipster";
    try {
      const serviceClient = getSupabaseServerClient();
      const { data: targetUser } = await serviceClient.auth.admin.getUserById(application.userId);
      const existingMetadata = targetUser?.user?.user_metadata ?? {};
      if (existingMetadata.role !== "admin") {
        await serviceClient.auth.admin.updateUserById(application.userId, {
          user_metadata: { ...existingMetadata, role: "tipster" },
        });
      }

      const displayName =
        (typeof existingMetadata.full_name === "string" && existingMetadata.full_name.trim()) ||
        targetUser?.user?.email ||
        "Tipster";
      approvedEmail = targetUser?.user?.email ?? undefined;
      approvedName = displayName;
      await ensureTipsterProfile({
        userId: application.userId,
        name: displayName,
        specialty: application.specialty,
        bio: application.bio,
      });
    } catch (error) {
      console.error("Failed to promote user to tipster:", error);
      return NextResponse.json(
        { error: "Application marked approved but role/profile setup failed. Check SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    if (approvedEmail) {
      try {
        await sendApplicationApprovedEmail({ to: approvedEmail, name: approvedName });
      } catch (error) {
        console.error("Failed to send approval email:", error);
      }
    }

    return NextResponse.json({ success: true, application });
  }

  if (action === "reject-application") {
    const applicationId = body.applicationId as string;
    const note = typeof body.note === "string" ? body.note : undefined;
    const application = await rejectTipsterApplication(applicationId, admin.user.id, note);
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    try {
      const serviceClient = getSupabaseServerClient();
      const { data: targetUser } = await serviceClient.auth.admin.getUserById(application.userId);
      const email = targetUser?.user?.email;
      const metadata = targetUser?.user?.user_metadata ?? {};
      const name =
        (typeof metadata.full_name === "string" && metadata.full_name.trim()) || email || "there";
      if (email) {
        await sendApplicationRejectedEmail({ to: email, name, note: application.note });
      }
    } catch (error) {
      console.error("Failed to send rejection email:", error);
    }

    return NextResponse.json({ success: true, application });
  }

  if (action === "resolve-tip") {
    const tipId = body.tipId as string;
    const status = body.status as "won" | "lost";
    if (status !== "won" && status !== "lost") {
      return NextResponse.json({ error: "status must be 'won' or 'lost'." }, { status: 400 });
    }
    try {
      const tip = await resolveTip(tipId, status);
      if (!tip) return NextResponse.json({ error: "Tip not found or already resolved." }, { status: 404 });
      return NextResponse.json({ success: true, tip });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resolve tip.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "resolve-submission") {
    const submissionId = body.submissionId as string;
    const status = body.status as "won" | "lost";
    if (status !== "won" && status !== "lost") {
      return NextResponse.json({ error: "status must be 'won' or 'lost'." }, { status: 400 });
    }
    try {
      const submission = await resolveCompetitionSubmission(submissionId, status);
      if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
      return NextResponse.json({ success: true, submission });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resolve submission.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
