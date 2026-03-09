import { collection, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';

async function checkJobs() {
    try {
        const snapshot = await getDocs(collection(db, 'jobs'));
        console.log(`Found ${snapshot.size} jobs`);
        snapshot.docs.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().title}`);
        });
    } catch (err) {
        console.error('Error checking jobs:', err);
    }
}

checkJobs();
