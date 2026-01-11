
# R - Beta Testing Deployment Guide (Firebase App Distribution)

Follow these steps to get your 'R' app into the hands of your friends and testers.

---

## 🏗 Phase 1: Enable App Distribution in Firebase Console

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project **"R - Professional Network"**.
3.  In the left sidebar, scroll down to the **Release & Monitor** section.
4.  Click on **App Distribution**.
5.  Click **Get Started**.
6.  If prompted, select your Android App (e.g., `com.professional.r`).

---

## 👥 Phase 2: Create a Testers Group

Managing testers in groups is better than adding individual emails every time.

1.  Inside the App Distribution dashboard, click the **Testers & Groups** tab.
2.  Click **Add Group**.
3.  Name the group `R-Internal-Alpha` or `Friends-of-R`.
4.  In the **Add Testers** field, type or paste your friends' email addresses:
    *   *friend1@example.com*
    *   *friend2@example.com*
5.  Press **Enter** to add them. They will receive an automated invitation email once you upload a build.

---

## 📤 Phase 3: Manual APK Upload (The "R" Workflow)

Since you've built your signed APK, follow these steps to push it:

1.  **Locate your APK**: 
    In your project root, find: `build/app/outputs/flutter-apk/app-release.apk`
2.  **Upload to Firebase**:
    *   Go to the **Releases** tab in App Distribution.
    *   Drag and drop the `app-release.apk` file into the upload box.
3.  **Configure the Release**:
    *   **Add Testers/Groups**: Select the `Friends-of-R` group you created.
    *   **Release Notes**: Add a professional summary:
        > "R v1.0.4 Beta - Introducing the 'Watch' Tab with Facebook integration. Please test video scaling and save functionality."
4.  **Distribute**:
    *   Click **Distribute to X Testers**.

---

## 📱 What Your Friends See

1.  They get an **email invite** with a link.
2.  They click **Get Started**.
3.  They sign in with their Google account.
4.  They will be prompted to install the **Firebase App Tester** app (essential for updates).
5.  Inside that app, they click **Download** on 'R'.

---

## 💡 Pro Tip for 'R'
If you want to automate this later, you can use the **Firebase CLI**:
`firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk --app YOUR_APP_ID --groups "Friends-of-R"`
