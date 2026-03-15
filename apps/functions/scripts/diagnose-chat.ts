
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const serviceAccount = require('../../service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function diagnoseChat() {
  console.log('Searching for conversations with VietHoa...');
  
  // Try to find by name "VietHoa" in candidate_name or employer_name
  const convs = await db.collection('conversations')
    .where('candidate_name', '==', 'VietHoa')
    .get();

  if (convs.empty) {
    const convs2 = await db.collection('conversations')
      .where('employer_name', '==', 'VietHoa')
      .get();
    
    if (convs2.empty) {
      console.log('No conversations found for name VietHoa');
      return;
    }
    logConvs(convs2);
  } else {
    logConvs(convs);
  }
}

function logConvs(snap: any) {
  snap.forEach((doc: any) => {
    console.log(`\n--- Conversation ID: ${doc.id} ---`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

diagnoseChat().catch(console.error);
