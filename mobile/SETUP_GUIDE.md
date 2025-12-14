# Care-AI Mobile App - Step-by-Step Setup Guide

This guide will walk you through setting up and running the Care-AI mobile application on your computer and mobile devices.

## 📋 Prerequisites

Before you start, make sure you have:

### Required Software
1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Check installation: `node --version`

2. **npm** (comes with Node.js)
   - Check installation: `npm --version`

3. **Git** (to clone the repository)
   - Download from: https://git-scm.com/
   - Check installation: `git --version`

### For Testing on Your Phone
4. **Expo Go App** (free)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

### For Running on Computer (Optional)
5. **Android Studio** (for Android emulator)
   - Download from: https://developer.android.com/studio

6. **Xcode** (for iOS simulator, Mac only)
   - Download from Mac App Store

---

## 🚀 Step 1: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
git clone https://github.com/AhmedAl-Mahdi/test.git
cd test/mobile
```

---

## 📦 Step 2: Install Dependencies

In the `mobile` folder, run:

```bash
npm install
```

This will download all the required packages. It may take 3-5 minutes.

---

## 🔧 Step 3: Configure Environment Variables

1. Create a copy of the example environment file:

```bash
cp .env.example .env
```

2. Open the `.env` file in a text editor and fill in your values:

```env
# Backend API URL (your Render deployment)
EXPO_PUBLIC_API_URL=https://your-backend-url.onrender.com

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Where to Find These Values:

**Backend API URL:**
- This is the URL of your deployed FastAPI backend on Render
- Example: `https://care-ai-backend-abc123.onrender.com`

**Supabase URL and Key:**
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to Settings > API
4. Copy the "Project URL" for `EXPO_PUBLIC_SUPABASE_URL`
5. Copy the "anon public" key for `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## ▶️ Step 4: Start the Development Server

Run the following command:

```bash
npm start
```

You should see a QR code in your terminal and a message like:
```
Metro waiting on exp://192.168.1.x:8081
```

**Keep this terminal window open!** This is your development server.

---

## 📱 Step 5: Run on Your Phone (Easiest Method)

### For iOS (iPhone):
1. Open the **Expo Go** app on your iPhone
2. Tap "Scan QR Code"
3. Point your camera at the QR code in your terminal
4. Wait for the app to load (first time may take 1-2 minutes)

### For Android:
1. Open the **Expo Go** app on your Android phone
2. Tap "Scan QR Code"
3. Point your camera at the QR code in your terminal
4. Wait for the app to load

**Note:** Your phone and computer must be on the same Wi-Fi network!

---

## 💻 Step 6: Run on Emulator/Simulator (Optional)

### For Android Emulator:

1. Make sure Android Studio is installed and an emulator is set up
2. Start your Android emulator
3. In a new terminal (keep the first one running), run:
```bash
npm run android
```

### For iOS Simulator (Mac only):

1. Make sure Xcode is installed
2. In a new terminal (keep the first one running), run:
```bash
npm run ios
```

---

## 🎨 Features Available in the Mobile App

Once the app loads, you'll see 6 tabs at the bottom:

1. **Dashboard** 🏠
   - Quick access to all features
   - Notification center
   - Health tips

2. **Symptoms** 🩺
   - AI-powered symptom checker
   - Enter symptoms and get analysis

3. **MindWell** 💬
   - Mental health chatbot
   - 24/7 emotional support

4. **Imaging** 🔬
   - Upload medical scans
   - AI analysis for 9 disease types:
     - Pneumonia
     - Breast Cancer
     - Kidney Cancer
     - Brain Tumor
     - Colon Cancer
     - Lung Cancer
     - Cervical Cancer
     - Lymphoma
     - Oral Cancer

5. **Medications** 💊
   - Track your medications
   - Set reminders
   - Manage inventory
   - Low-stock alerts

6. **Profile** 👤
   - View your account info
   - Sign out

---

## 🔍 Troubleshooting

### Problem: QR code not scanning
**Solution:** 
- Make sure your phone and computer are on the same Wi-Fi network
- Try typing the URL manually in Expo Go (shown below the QR code)

### Problem: "Unable to connect to server"
**Solution:**
- Check that `npm start` is still running in your terminal
- Restart the development server: Press Ctrl+C, then run `npm start` again

### Problem: App crashes on startup
**Solution:**
- Clear Expo cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Problem: Cannot connect to backend
**Solution:**
- Check your `.env` file has the correct `EXPO_PUBLIC_API_URL`
- Make sure your backend is running on Render
- Test the backend URL in a web browser

### Problem: "Network request failed"
**Solution:**
- Verify your backend URL includes `https://` (not `http://`)
- Check that your Render backend service is active
- Try restarting the app

### Problem: Images won't upload
**Solution:**
- Grant camera/photo permissions when prompted
- Check Settings > Expo Go > Permissions on your phone

---

## 🔄 Making Changes

While the app is running:
- Any code changes you make will automatically reload the app
- If the app doesn't reload, shake your phone to open the developer menu
- Press "Reload" to manually refresh

---

## 🏗️ Building for Production

### Create Standalone App:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Build for Android:
```bash
eas build --platform android
```

4. Build for iOS:
```bash
eas build --platform ios
```

---

## 📚 Additional Resources

- **Expo Documentation:** https://docs.expo.dev/
- **React Native Documentation:** https://reactnative.dev/
- **Supabase Documentation:** https://supabase.com/docs
- **Backend API Documentation:** See your Render backend URL + `/docs`

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in the terminal
3. Check the Expo Go app logs (shake phone > "Debug Remote JS")
4. Open an issue on the GitHub repository

---

## ✅ Quick Start Checklist

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Expo Go app installed on phone
- [ ] Development server started (`npm start`)
- [ ] App running on phone or emulator
- [ ] Backend URL is correct and accessible
- [ ] Supabase credentials are valid

---

## 🎉 You're All Set!

You should now have the Care-AI mobile app running on your device. Try logging in with your Supabase account and explore all the features!

**Important Notes:**
- Keep your `.env` file secure and never commit it to version control
- The app uses your production backend on Render
- All data is stored in your Supabase database
- Camera/photo permissions are required for the Imaging feature

Enjoy using Care-AI! 🏥📱
