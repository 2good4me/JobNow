import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

// Note: This script assumes you have firebase-admin installed in the root or apps/functions
// And that you are running in an environment with access to Firestore (e.g. Service Account or Emulator)

try {
  initializeApp({
    projectId: 'jobnow-80037',
  });
} catch (e) {
  // already initialized
}

const db = getFirestore();

async function diagnose() {
  console.log('--- START DIAGNOSIS ---');
  
  // 1. Check all users with ADMIN role
  const adminsSnap = await db.collection('users').where('role', '==', 'ADMIN').get();
  console.log(`Found ${adminsSnap.size} admins:`);
  adminsSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`- UID: ${doc.id}, Name: ${data.full_name || data.fullName}, Role: ${data.role}`);
  });

  // 2. Check the specific job from the screenshot ("bưng bê")
  const jobsSnap = await db.collection('jobs').where('title', '==', 'bưng bê').get();
  if (jobsSnap.empty) {
    console.log('Job "bưng bê" not found.');
  } else {
    jobsSnap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Job Found: ID: ${doc.id}, Moderation: ${data.moderation_status}, Status: ${data.status}`);
    });
  }
  
  console.log('--- END DIAGNOSIS ---');
}

diagnose().catch(console.error);
