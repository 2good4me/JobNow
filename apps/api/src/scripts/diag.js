const admin = require('firebase-admin');
const path = require('path');

async function run() {
    try {
        const serviceAccountPath = 'c:\\Users\\phand\\Desktop\\WorkSpace\\Gps\\serviceAccountKey.json';
        process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }

        const db = admin.firestore();
        const snapshot = await db.collection('jobs').limit(1).get();

        if (snapshot.empty) {
            console.log('JOBS_COLLECTION_EMPTY');
        } else {
            console.log('JOBS_COLLECTION_HAS_DATA');
            console.log('Sample Job:', JSON.stringify(snapshot.docs[0].data(), null, 2));
        }
    } catch (error) {
        console.error('DIAGNOSTIC_ERROR:', error.message);
    }
}

run();
