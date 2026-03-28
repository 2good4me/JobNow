import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

const db = getFirestore();

async function migrateJobShifts() {
  const jobsSnap = await db.collection('jobs').get();
  let migratedJobs = 0;
  let migratedShifts = 0;

  for (const jobDoc of jobsSnap.docs) {
    const jobData = jobDoc.data();
    const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
    if (shifts.length === 0) continue;

    const batch = db.batch();
    let hasWrite = false;

    for (const rawShift of shifts) {
      const shift = rawShift as Record<string, unknown>;
      const shiftId = String(shift.id ?? '').trim();
      if (!shiftId) continue;

      const shiftRef = jobDoc.ref.collection('shifts').doc(shiftId);
      const shiftSnap = await shiftRef.get();
      if (shiftSnap.exists) continue;

      batch.set(shiftRef, {
        id: shiftId,
        job_id: jobDoc.id,
        employer_id: String(jobData.employer_id ?? jobData.employerId ?? ''),
        name: String(shift.name ?? ''),
        start_time: String(shift.start_time ?? shift.startTime ?? '00:00'),
        end_time: String(shift.end_time ?? shift.endTime ?? '00:00'),
        quantity: Number(shift.quantity ?? 0),
        status: String(shift.status ?? 'OPEN'),
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
      hasWrite = true;
      migratedShifts += 1;
    }

    if (hasWrite) {
      batch.set(jobDoc.ref, {
        updated_at: FieldValue.serverTimestamp(),
      }, { merge: true });
      await batch.commit();
      migratedJobs += 1;
    }
  }

  console.log(`Migrated ${migratedShifts} shifts across ${migratedJobs} jobs.`);
}

migrateJobShifts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Shift migration failed:', error);
    process.exit(1);
  });
