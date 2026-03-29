import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Look for serviceAccountKey.json in the project root
const serviceAccountPath = path.resolve(process.cwd(), '../../serviceAccountKey.json');
const altServiceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

// Check if app is already initialized to avoid re-initialization error
if (!admin.apps.length) {
    console.log('Current working directory:', process.cwd());
    console.log('Checking service account at:', serviceAccountPath);
    console.log('Checking alternative path:', altServiceAccountPath);
    
    if (fs.existsSync(serviceAccountPath)) {
        console.log('✅ Found service account key at project root');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
    } else if (fs.existsSync(altServiceAccountPath)) {
        console.log('✅ Found service account key in current folder');
        admin.initializeApp({
            credential: admin.credential.cert(altServiceAccountPath)
        });
    } else {
        console.log('⚠️ No service account key found. Using default credentials.');
        admin.initializeApp({ projectId: 'jobnow-80037' });
    }
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };

