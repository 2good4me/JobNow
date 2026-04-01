# Implementation Plan - Deploying JobNow as a Mobile App via Firebase

The goal is to transform the JobNow web application into a mobile-ready experience leveraging your new **Firebase Blaze (Paid) Plan**. We will use **Firebase Hosting** as the backbone for high-performance delivery and **Capacitor** as the bridge to native mobile platforms (Android/iOS).

## User Review Required

> [!IMPORTANT]
> **Firebase Hosting vs Native App**: To have a "Mobile App" through Firebase, the standard path for a React app is:
> 1. **PWA (Firebase Hosting)**: The fastest way. Users install it from the browser. It feels like an app, works offline, and supports push notifications.
> 2. **Native Shell (Capacitor)**: Wraps the Firebase-hosted content into an APK (Android) or IPA (iOS) for the App Stores.

> [!NOTE]
> Since you have the Blaze plan, we will enable **Firebase Cloud Messaging (FCM)** for native push notifications and **Firebase App Check** for security.

## Proposed Changes

### Firebase Security Rules

#### [MODIFY] firestore.rules
Update the rules to secure the databases based on user roles:
- **`jobs` collection**:
  - `read`: Any authenticated user.
  - `write` (create, update, delete): Only users with `role == 'EMPLOYER'`.
- **`applications` collection**:
  - `read`: The candidate who applied, OR the employer who owns the job.
  - `create`: Only users with `role == 'CANDIDATE'`.
  - `update`: Only the employer who owns the job (to change status).
  - `delete`: Not allowed or onlyCandidate.

### Frontend Services

#### [NEW] apps/web/src/features/jobs/services/job.service.ts
Create a service file to communicate with the `jobs` collection in Firestore.
- `createJob(data)`: Add a new job document.
- `getEmployerJobs(employerId)`: Query jobs where `employerId` matches.
- `getJobById(jobId)`: Get a single job document definition.
*Note: We will use types from `packages/types/src/job.ts` (e.g., `Job`).*

#### [NEW] apps/web/src/features/jobs/services/application.service.ts
Create a service file to communicate with the `applications` collection in Firestore.
- `applyForJob(jobId, candidateId)`: Create a new application document.
- `getApplicantsForJob(jobId)`: Query applications where `jobId` matches.
- `updateApplicationStatus(applicationId, status)`: Update the status of an application.
*Note: We will use types from `packages/types/src/application.ts` (e.g., `Application`).*

### Frontend Employer Routes

#### [NEW] apps/web/src/routes/employer/applicants.tsx
Refactor Stitch MCP screen `91db6512b945479e80b9124cd6de1969` into a TanStack Route.
- Implement Glassmorphism and Mobile-First constraints.
- Create mock data for Job Applicants.

#### [NEW] apps/web/src/routes/employer/post-job.tsx
Refactor Stitch MCP screens `e160768e80624a4a9c16fbd445f43fee` and `62ec7081b4b54b0384b0368466fcb45e`.
- Combine step 1 (Info) and step 2 (Map) into a smooth, long-scroll form.

#### [NEW] apps/web/src/routes/employer/profile.tsx
Refactor Stitch MCP screen `ce172e00219c4e78ab626c663e9429e1`.
- Display mock data for employer profile (avatar, company name, rating, settings menu).
- Ensure styling accommodates bottom navigation logic.

## Verification Plan

### Automated Tests
- Run `firebase_validate_security_rules` to ensure the new rules are syntactically correct and provide the expected protection.

### Manual Verification
- Code review of the service files to ensure proper error handling (try/catch) and correct Firestore method usage.
- Data schema mock check inside the service files.

## Open Questions

- **Do you want to distribute the app via Firebase App Distribution (for testing) or just host it as a PWA for now?**
- **Do you already have a Firebase project ID you'd like to use for the mobile app specifically, or should we stick with the existing one?**
