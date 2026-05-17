import { promises as fs } from "fs";
import path from "path";

export type TipsterApplication = {
  id: string;
  userId: string;
  specialty: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  note?: string;
};

export interface ApplicationStorage {
  applications: TipsterApplication[];
}

const storageFile = path.join(process.cwd(), "data", "applications.json");

export async function readApplicationStorage(): Promise<ApplicationStorage> {
  try {
    const raw = await fs.readFile(storageFile, "utf8");
    return JSON.parse(raw) as ApplicationStorage;
  } catch (error) {
    const initial: ApplicationStorage = { applications: [] };
    await fs.mkdir(path.dirname(storageFile), { recursive: true });
    await fs.writeFile(storageFile, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

export async function writeApplicationStorage(storage: ApplicationStorage) {
  await fs.mkdir(path.dirname(storageFile), { recursive: true });
  await fs.writeFile(storageFile, JSON.stringify(storage, null, 2), "utf8");
}

export function createTipsterApplication(storage: ApplicationStorage, userId: string, specialty: string, bio: string) {
  const application: TipsterApplication = {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    specialty: specialty.trim(),
    bio: bio.trim(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  storage.applications.push(application);
  return application;
}

export function approveTipsterApplication(storage: ApplicationStorage, applicationId: string, reviewerId?: string, note?: string) {
  const application = storage.applications.find((item) => item.id === applicationId);
  if (!application) return undefined;
  application.status = "approved";
  application.reviewedAt = new Date().toISOString();
  application.reviewerId = reviewerId;
  application.note = note;
  return application;
}

export function rejectTipsterApplication(storage: ApplicationStorage, applicationId: string, reviewerId?: string, note?: string) {
  const application = storage.applications.find((item) => item.id === applicationId);
  if (!application) return undefined;
  application.status = "rejected";
  application.reviewedAt = new Date().toISOString();
  application.reviewerId = reviewerId;
  application.note = note;
  return application;
}

export function getPendingApplications(storage: ApplicationStorage) {
  return storage.applications.filter((application) => application.status === "pending");
}

export function getLatestApplicationForUser(storage: ApplicationStorage, userId: string) {
  const own = storage.applications.filter((application) => application.userId === userId);
  if (own.length === 0) return undefined;
  return own.reduce((latest, current) =>
    new Date(current.submittedAt).getTime() > new Date(latest.submittedAt).getTime() ? current : latest,
  );
}

export function userHasOpenApplication(storage: ApplicationStorage, userId: string) {
  return storage.applications.some(
    (application) =>
      application.userId === userId && (application.status === "pending" || application.status === "approved"),
  );
}
