import { db } from '../apps/api/src/config/firebase';

async function cleanup() {
  console.log('Starting cleanup of test data in Firestore...');
  const jobsSnapshot = await db.collection('jobs').get();
  
  let count = 0;
  for (const doc of jobsSnapshot.docs) {
    const data = doc.data();
    const title = (data.title || '').toLowerCase();
    
    const isTest = title.includes('dsfsdf') || title.includes('bưng bê');
    
    if (isTest) {
      console.log(`Deleting Job: ${doc.id} - ${data.title}`);
      await db.collection('jobs').doc(doc.id).delete();
      count++;
      
      const apps = await db.collection('applications').where('jobId', '==', doc.id).get();
      for (const app of apps.docs) {
        await db.collection('applications').doc(app.id).delete();
        console.log(` - Deleted related application: ${app.id}`);
      }
    }
  }
  
  console.log(`Cleanup complete. Deleted ${count} test jobs.`);
  process.exit(0);
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
