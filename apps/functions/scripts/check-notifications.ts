import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

async function checkNotifications() {
  console.log('Checking notifications...');
  // We'll look for recent notifications in the whole collection
  const snapshot = await db.collection('notifications')
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();

  if (snapshot.empty) {
    console.log('No notifications found in the entire collection.');
    return;
  }

  console.log(`Found ${snapshot.size} recent notifications:`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}, UserID: ${data.userId || data.user_id}, Type: ${data.type}, CreatedAt: ${data.created_at?.toDate?.() || data.created_at}`);
  });
}

checkNotifications().catch(console.error);
