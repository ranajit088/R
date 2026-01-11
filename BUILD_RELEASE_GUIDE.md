# R - Production Build Guide (Android APK)

Follow these instructions to generate the final release file for 'R' that is compatible with all Android devices.

---

## 🚀 The Universal Build Command

Run this command in your project terminal to create a "Fat APK" that includes support for ARM (32-bit & 64-bit) and x86 architectures:

```bash
flutter build apk --release --target-platform android-arm,android-arm64,android-x64 --obfuscate --split-debug-info=./debug-info
```

### Flag Breakdown:
*   `--release`: Optimizes the code for performance (removes debugging overhead).
*   `--target-platform`: Explicitly includes all major CPU architectures to ensure it works on any phone.
*   `--obfuscate`: Scrambles your Dart code to protect your intellectual property.
*   `--split-debug-info`: Saves symbols to a separate folder, making the APK size smaller while allowing you to de-symbolize crash logs later.

---

## 📂 Final File Location

Once the build finishes, Flutter will save your APK here:

**`build/app/outputs/flutter-apk/app-release.apk`**

*Note: If you used `--split-per-abi`, you would see individual files like `app-armeabi-v7a-release.apk`, but for simple distribution to friends, the single `app-release.apk` is best.*

---

## 🛠 Ensuring Universal Compatibility

To guarantee 'R' runs on every possible Android device (from a cheap tablet to a flagship S24 Ultra), we handle three specific areas:

1.  **ABI Support**: By using `--target-platform android-arm,android-arm64,android-x64`, we bundle the native libraries for both older 32-bit chips and modern 64-bit chips.
2.  **Minimum SDK**: Ensure your `android/app/build.gradle` has `minSdkVersion 21` or higher. This covers 98%+ of active Android devices globally.
3.  **Permissions**: Since 'R' uses the Gemini API and camera features, ensure the `AndroidManifest.xml` includes:
    *   `android.permission.INTERNET`
    *   `android.permission.CAMERA`
    *   `android.permission.RECORD_AUDIO`

---

## ✅ Pre-Build Checklist
1.  **Version Bump**: Increment `version` in `pubspec.yaml` (e.g., `1.0.4+5`).
2.  **Icon Check**: Ensure `flutter pub run flutter_launcher_icons` has been executed.
3.  **ProGuard**: Ensure `minifyEnabled true` is set in your release build type in `build.gradle` for maximum shrinkage.
