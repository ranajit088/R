# R - Terminal Deployment Guide (Firebase CLI)

Automating your distribution allows you to push new builds of 'R' without ever opening a web browser.

---

## 🔑 1. Firebase Authentication
First, ensure you have the Firebase CLI installed (`npm install -g firebase-tools`). Then, authenticate your terminal:

```bash
firebase login
```
*This will open your browser. Sign in with the Google account associated with the 'R' project.*

---

## 🆔 2. Find Your App ID
You need your unique App ID for the distribution command. You can find it in the Firebase Console Settings or by running:

```bash
firebase apps:list
```
*Look for the ID associated with `com.professional.r` (e.g., `1:1234567890:android:abc123def456`).*

---

## 🚀 3. The One-Line Distribution Command
Run this command from your project root to build and ship the 'R' app to your friends instantly:

```bash
# First, build the APK
flutter build apk --release --target-platform android-arm,android-arm64,android-x64

# Then, distribute it
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
    --app "YOUR_APP_ID_HERE" \
    --groups "Friends-of-R" \
    --release-notes "New Facebook Video Feed added! Tested on ARM and x86 devices."
```

### Command Flags:
*   `distribute`: The core command for App Distribution.
*   `--app`: Your project's App ID (from Step 2).
*   `--groups`: The alias of the tester group you created in the console.
*   `--release-notes`: Text that appears in the testers' invitation and the App Tester app.

---

## 🧪 4. Verifying Success
After the command finishes, you will see:
`✔  Uploaded and distributed build/app/outputs/flutter-apk/app-release.apk successfully.`

Your friends in the **Friends-of-R** group will receive a notification on their phones immediately.

---

## 💡 Efficiency Tip
Add this to your `scripts` or create a simple `deploy.sh` file to ship with a single command:
```bash
#!/bin/bash
echo "Building R..."
flutter build apk --release
echo "Shipping R to testers..."
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk --app "YOUR_APP_ID" --groups "Friends-of-R" --release-notes "Quick fix for Watch screen."
```
