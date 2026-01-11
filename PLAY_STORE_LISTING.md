
# Store Listing: R - The Professional Pulse

## Description
**Elevate your professional journey with R.**

R is not just another social network; it’s a high-fidelity ecosystem designed for the modern innovator. Whether you're a developer, designer, or entrepreneur, R connects you with the people and ideas that move the needle.

### 🚀 Why R?
- **Premium Experience**: A minimalist, high-contrast UI that favors focus over distraction.
- **Smart Feed**: Our Gemini-powered AI helps moderate content to ensure a professional, high-signal environment.
- **Seamless Storytelling**: Share your "Work in Progress" with fluid, disappearing stories.
- **Dark Mode by Design**: A sophisticated Slate-Indigo theme that’s easy on the eyes during late-night deep work.

### 🛠 Key Features:
- **Instant Broadcast**: Share insights or AI-enhanced images to your professional timeline.
- **Watch**: High-quality video content from industry leaders.
- **Encrypted-Feel Chat**: Real-time professional messaging with contact synchronization.
- **Discovery**: Intelligent networking to find mentors and collaborators in your city.

---

## 📦 How to Generate Your Signed AAB (Release Guide)

### Step 1: Create a Keystore
Run this in your terminal to generate your upload key:
`keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`

### Step 2: Create `key.properties`
In `/android/key.properties`, add:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=upload
storeFile=/Users/yourname/upload-keystore.jks
```

### Step 3: Production Build
Run the following command to generate the optimized App Bundle:
`flutter build appbundle --release --obfuscate --split-debug-info=./debug-info`

**The final file will be located at:**
`build/app/outputs/bundle/release/app-release.aab`
