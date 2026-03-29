
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(fs.readFileSync('d:/JobNow/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixTransaction() {
  try {
    const txsSnap = await db.collection('transactions')
      .where('amount', '==', 5000000)
      .where('status', '==', 'PENDING')
      .get();

    if (txsSnap.empty) {
      console.log('No pending transaction found for 5,000,000đ');
      return;
    }

    const txDoc = txsSnap.docs[0];
    const txData = txDoc.data();
    const userId = txData.userId || txData.user_id;

    if (!userId) {
      console.log('Transaction found but no userId associated.');
      return;
    }

    console.log(`Found transaction: ${txDoc.id} for user: ${userId}`);

    await db.runTransaction(async (t) => {
      const userRef = db.collection('users').doc(userId);
      const userSnap = await t.get(userRef);

      if (!userSnap.exists) {
        throw new Error('User not found');
      }

      const currentBalance = Number(userSnap.data()?.balance ?? 0);
      
      t.update(txDoc.ref, { 
        status: 'COMPLETED',
        updatedAt: new Date(),
        updated_at: new Date()
      });

      t.update(userRef, { 
        balance: currentBalance + 5000000,
        updatedAt: new Date(),
        updated_at: new Date()
      });
    });

    console.log('SUCCESS: Transaction marked as COMPLETED and balance updated.');
  } catch (err) {
    console.error('ERROR:', err);
  }
}

fixTransaction();
