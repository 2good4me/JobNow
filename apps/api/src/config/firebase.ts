import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Look for serviceAccountKey.json in the project root
    // Robustly find the service account key in a monorepo
    const pathsToTry = [
        path.join(__dirname, '../../../../serviceAccountKey.json'), // From src/config
        path.join(__dirname, '../../../serviceAccountKey.json'),    // From dist/config
        path.join(process.cwd(), 'serviceAccountKey.json'),         // Current dir
        path.join(process.cwd(), '../../serviceAccountKey.json'),  // Two levels up
        'C:/Users/Nhu Vu/JobNow/serviceAccountKey.json',            // Absolute fallback (adjust as needed)
    ];

    let initialized = false;
    for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
            console.log(`✅ Found service account key at: ${p}`);
            admin.initializeApp({
                credential: admin.credential.cert(p)
            });
            initialized = true;
            break;
        }
    }

    if (!initialized) {
        console.log('⚠️ No service account key found. Using default credentials or project ID fallback.');
        admin.initializeApp({ projectId: 'jobnow-80037' });
    }

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };

