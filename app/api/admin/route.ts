import { NextResponse } from "next/server";
import { approveTipsterApplication, getPendingApplications, readApplicationStorage, rejectTipsterApplication, writeApplicationStorage } from "@/lib/applications";
import { readCompetitionStorage, writeCompetitionStorage } from "@/lib/competition";
import { getAccessTokenFromRequest, getSupabaseServerClient, getSupabaseUserFromToken } from "@/lib/supabase-server";

async function requireAdmin(request: Request) {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const user = await getSupabaseUserFromToken(token);
  if (!user || user.user_metadata?.role !== "admin") {
    return null;
  }

  const applicationStorage = await readApplicationStorage();
  return { applicationStorage, user };
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const competitionStorage = await readCompetitionStorage();
  const pendingSubmissions = competitionStorage.submissions.filter((submission) => submission.status === "pending");
  const pendingApplications = getPendingApplications(admin.applicationStorage);

  return NextResponse.json({ pendingSubmissions, pendingApplications });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationStorage } = admin;
  const body = await request.json();
  const action = body.action as string;

  if (action === "approve-application") {
    const applicationId = body.applicationId as string;
    const note = typeof body.note === "string" ? body.note : undefined;
    const application = approveTipsterApplication(applicationStorage, applicationId, admin.user.id, note);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    try {
      const serviceClient = getSupabaseServerClient();
      const { data: targetUser } = await serviceClient.auth.admin.getUserById(application.userId);
      const existingMetadata = targetUser?.user?.user_metadata ?? {};
      if (existingMetadata.role !== "admin") {
        await serviceClient.auth.admin.updateUserById(application.userId, {
          user_metadata: { ...existingMetadata, role: "tipster" },
        });
      }
    } catch (error) {
      console.error("Failed to promote user to tipster:", error);
      return NextResponse.json(
        { error: "Application marked approved but role update failed. Check SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    await writeApplicationStorage(applicationStorage);
    return NextResponse.json({ success: true, application });
  }

  if (action === "reject-application") {
    const applicationId = body.applicationId as string;
    const note = typeof body.note === "string" ? body.note : undefined;
    const application = rejectTipsterApplication(applicationStorage, applicationId, admin.user.id, note);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }
    await writeApplicationStorage(applicationStorage);
    return NextResponse.json({ success: true, application });
  }

  if (action === "resolve-submission") {
    const competitionStorage = await readCompetitionStorage();
    const submissionId = body.submissionId as string;
    const status = body.status as "won" | "lost";
    const submission = competitionStorage.submissions.find((item) => item.id === submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    if (submission.status !== "pending") {
      return NextResponse.json({ error: "Submission already resolved." }, { status: 400 });
    }
    submission.status = status;
    submission.resultAmount = status === "won" ? Number((submission.stake * submission.odds).toFixed(2)) : 0;
    await writeCompetitionStorage(competitionStorage);
    return NextResponse.json({ success: true, submission });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
