/**
 * Patch test data to fix N+1 queries
 */
const admin = require('firebase-admin');

async function run() {
    const serviceAccountPath = 'c:\\Users\\phand\\Desktop\\WorkSpace\\Gps\\serviceAccountKey.json';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }

    const db = admin.firestore();
    const appSnap = await db.collection('applications').get();
    let batch = db.batch();
    let updated = 0;

    for (const doc of appSnap.docs) {
        const data = doc.data();
        if (!data.candidate_name && !data.candidateName) {
            batch.update(doc.ref, {
                candidate_name: 'Khách ' + Math.floor(Math.random() * 1000),
                candidate_avatar: 'https://i.pravatar.cc/150?u=' + doc.id,
                candidate_skills: ['Giao tiếp', 'Phục vụ'],
                candidate_rating: 4.8,
                candidate_verified: true,
            });
            updated++;
        }
    }

    if (updated > 0) {
        await batch.commit();
        console.log(`✅ Patched ${updated} applications with mock denormalized data!`);
    } else {
        console.log('✅ All applications already have denormalized data.');
    }
}

run().catch(console.error);
