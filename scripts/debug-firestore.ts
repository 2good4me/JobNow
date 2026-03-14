import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

initializeApp();
const db = getFirestore();

async function debug() {
  console.log('--- Checking Jobs ---');
  const jobsSnap = await db.collection('jobs').limit(5).get();
  jobsSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Job ${doc.id}: title="${data.title}", employer_id="${data.employer_id}", employerId="${data.employerId}"`);
  });

  console.log('\n--- Checking Applications ---');
  const appsSnap = await db.collection('applications').limit(5).get();
  appsSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`App ${doc.id}: job_id="${data.job_id}", employer_id="${data.employer_id}", candidate_id="${data.candidate_id}"`);
  });
}

debug();
