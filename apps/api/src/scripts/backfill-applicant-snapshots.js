/**
 * Backfill Script: Denormalize candidate data into existing ApplicationDocs
 * 
 * This script reads all applications from Firestore,
 * looks up each candidate's profile, and writes the denormalized
 * snapshot (name, avatar, skills, rating, verified) directly into
 * the application document. This eliminates the N+1 query problem.
 *
 * Usage: node apps/api/src/scripts/backfill-applicant-snapshots.js
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
    const applicationsRef = db.collection('applications');
    const candidatesRef = db.collection('candidates');

    console.log('🔍 Fetching all applications...');
    const appSnapshot = await applicationsRef.get();
    console.log(`📋 Found ${appSnapshot.size} applications`);

    if (appSnapshot.empty) {
        console.log('✅ No applications to backfill.');
        return;
    }

    // Collect unique candidate IDs
    const candidateIds = new Set();
    appSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const cid = data.candidate_id || data.candidateId;
        if (cid) candidateIds.add(cid);
    });

    console.log(`👤 Found ${candidateIds.size} unique candidates to look up...`);

    // Batch-fetch all candidate profiles
    const candidateProfiles = new Map();
    const candidateArray = Array.from(candidateIds);

    // Firestore `in` queries max 30 items, so chunk them
    for (let i = 0; i < candidateArray.length; i += 30) {
        const chunk = candidateArray.slice(i, i + 30);
        const candidateSnap = await candidatesRef
            .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
            .get();

        candidateSnap.docs.forEach(doc => {
            const d = doc.data();
            candidateProfiles.set(doc.id, {
                name: d.full_name || d.fullName || d.display_name || d.displayName || '',
                avatar: d.avatar_url || d.avatarUrl || d.photo_url || d.photoURL || '',
                skills: d.skills || [],
                rating: d.reputation_score || d.reputationScore || 0,
                verified: (d.verification_status || d.verificationStatus) === 'VERIFIED',
            });
        });
    }

    console.log(`✅ Loaded ${candidateProfiles.size} candidate profiles`);

    // Batch-write denormalized data into application docs
    let batch = db.batch();
    let batchCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const appDoc of appSnapshot.docs) {
        const data = appDoc.data();
        const cid = data.candidate_id || data.candidateId;

        // Skip if already denormalized
        if (data.candidate_name || data.candidateName) {
            skippedCount++;
            continue;
        }

        const profile = candidateProfiles.get(cid);
        if (!profile) {
            console.warn(`⚠️  Candidate ${cid} not found for application ${appDoc.id}`);
            continue;
        }

        batch.update(appDoc.ref, {
            candidate_name: profile.name,
            candidate_avatar: profile.avatar,
            candidate_skills: profile.skills,
            candidate_rating: profile.rating,
            candidate_verified: profile.verified,
        });

        batchCount++;
        updatedCount++;

        // Firestore batch limit is 500
        if (batchCount >= 498) {
            await batch.commit();
            console.log(`  ✏️  Committed batch of ${batchCount} updates`);
            batch = db.batch();
            batchCount = 0;
        }
    }

    // Commit remaining
    if (batchCount > 0) {
        await batch.commit();
        console.log(`  ✏️  Committed final batch of ${batchCount} updates`);
    }

    console.log('\n🎉 Backfill complete!');
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped (already denormalized): ${skippedCount}`);
    console.log(`   Total applications: ${appSnapshot.size}`);
}

run().catch(err => {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
});
