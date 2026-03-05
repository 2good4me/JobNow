import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const rootServiceAccount = path.resolve(process.cwd(), 'serviceAccountKey.json');

if (!admin.apps.length) {
  if (fs.existsSync(rootServiceAccount)) {
    admin.initializeApp({
      credential: admin.credential.cert(rootServiceAccount),
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function backfillJobs() {
  const snapshot = await db.collection('jobs').get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const patch: Record<string, unknown> = {};

    if (data.employerId && !data.employer_id) patch.employer_id = data.employerId;
    if (data.categoryId && !data.category_id) patch.category_id = data.categoryId;
    if (data.salaryType && !data.salary_type) patch.salary_type = data.salaryType;
    if (data.isGpsRequired !== undefined && data.is_gps_required === undefined) patch.is_gps_required = data.isGpsRequired;

    if (Array.isArray(data.shifts)) {
      patch.shifts = data.shifts.map((shift: any) => ({
        id: shift.id,
        name: shift.name,
        start_time: shift.start_time ?? shift.startTime,
        end_time: shift.end_time ?? shift.endTime,
        quantity: shift.quantity,
      }));
    }

    if (Object.keys(patch).length > 0) {
      patch.updated_at = admin.firestore.FieldValue.serverTimestamp();
      await doc.ref.set(patch, { merge: true });
      updated += 1;
    }
  }

  return updated;
}

async function backfillApplications() {
  const snapshot = await db.collection('applications').get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const patch: Record<string, unknown> = {};

    if (data.jobId && !data.job_id) patch.job_id = data.jobId;
    if (data.shiftId && !data.shift_id) patch.shift_id = data.shiftId;
    if (data.employerId && !data.employer_id) patch.employer_id = data.employerId;
    if (data.candidateId && !data.candidate_id) patch.candidate_id = data.candidateId;
    if (data.paymentStatus && !data.payment_status) patch.payment_status = data.paymentStatus;
    if (data.coverLetter && !data.cover_letter) patch.cover_letter = data.coverLetter;
    if (data.createdAt && !data.created_at) patch.created_at = data.createdAt;
    if (data.updatedAt && !data.updated_at) patch.updated_at = data.updatedAt;

    if (Object.keys(patch).length > 0) {
      patch.updated_at = admin.firestore.FieldValue.serverTimestamp();
      await doc.ref.set(patch, { merge: true });
      updated += 1;
    }
  }

  return updated;
}

async function main() {
  const jobsUpdated = await backfillJobs();
  const applicationsUpdated = await backfillApplications();

  console.log('Backfill completed');
  console.log({ jobsUpdated, applicationsUpdated });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
