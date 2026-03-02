import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Look for serviceAccountKey.json in the project root
const serviceAccountPath = path.resolve(process.cwd(), '../../serviceAccountKey.json');
const altServiceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

// Check if app is already initialized to avoid re-initialization error
if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Using service account key from project root');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
    } else if (fs.existsSync(altServiceAccountPath)) {
        console.log('Using service account key from api folder');
        admin.initializeApp({
            credential: admin.credential.cert(altServiceAccountPath)
        });
    } else {
        console.log('Initializing Firebase with default credentials (likely environment variables)');
        admin.initializeApp();
    }
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };

