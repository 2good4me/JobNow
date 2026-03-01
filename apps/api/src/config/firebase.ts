import * as admin from 'firebase-admin';

// Check if app is already initialized to avoid re-initialization error
if (!admin.apps.length) {
    admin.initializeApp({
        // By default, the initializeApp function will infer credentials
        // and project ID from the environment automatically when run in GCP.
        // For local development, it gets them from the FIREBASE_CONFIG env var
    });
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
