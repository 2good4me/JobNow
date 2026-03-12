import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

// Must rely on GOOGLE_APPLICATION_CREDENTIALS for local run if no service acct key 
// OR we just print applications
initializeApp();

const db = getFirestore();

async function run() {
  console.log('Fetching applications...');
  const snapshot = await db.collection('applications').limit(5).get();
  
  if (snapshot.empty) {
    console.log('No applications found.');
    return;
  }

  snapshot.forEach(doc => {
    console.log('--- Application ID:', doc.id);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

run().catch(console.error);
