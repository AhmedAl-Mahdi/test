# Care-AI Mobile App

A React Native mobile application for the Care-AI health co-pilot platform, featuring symptom checking, mental health chat, and diagnostic imaging analysis.

## Features

- 🔐 **Secure Authentication** - Supabase-powered login and signup
- 🏥 **Symptom Checker** - AI-powered symptom analysis with Gemini
- 💬 **MindWell Chat** - Mental wellness support chatbot
- 🔬 **Diagnostic Imaging** - ONNX model-based medical image analysis
  - Pneumonia Detection
  - Breast Cancer Screening
  - Kidney Disease Detection
  - Brain Tumor Classification
- 📱 **Real-time Notifications** - Stay updated with health reminders
- 👤 **User Profile** - Manage your health information

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio/Emulator
- Physical device with Expo Go app (optional)

## Setup Instructions

### 1. Clone the Repository

```bash
cd mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `mobile/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Getting Your Keys:**

1. **Supabase URL & Anon Key:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy `Project URL` and `anon/public key`

2. **Backend API URL:**
   - Your Render backend URL (e.g., `https://care-ai-backend.onrender.com`)
   - Must match the deployed backend from the web app

### 4. Run the App

#### Start Expo Dev Server

```bash
npm start
```

This will open Expo Dev Tools in your browser.

#### Run on Android

```bash
npm run android
```

**Requirements:**
- Android Studio installed
- Android emulator running OR
- Physical Android device with USB debugging enabled

#### Run on iOS (Mac only)

```bash
npm run ios
```

**Requirements:**
- Xcode installed
- iOS Simulator running OR
- Physical iOS device

#### Run with Expo Go (Easiest for Testing)

1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Run `npm start`

3. Scan the QR code with:
   - **iOS:** Camera app
   - **Android:** Expo Go app

## Project Structure

```
mobile/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
├── .env.example                # Environment variables template
├── assets/                     # App icons and images
├── src/
│   ├── config/
│   │   ├── supabase.js        # Supabase client setup
│   │   └── api.js             # Axios API client
│   ├── context/
│   │   └── AuthContext.js     # Authentication context
│   ├── navigation/
│   │   ├── AuthNavigator.js   # Auth screens navigation
│   │   └── MainNavigator.js   # Main app navigation
│   └── screens/
│       ├── LoginScreen.js     # Login page
│       ├── SignUpScreen.js    # Registration page
│       ├── DashboardScreen.js # Home dashboard
│       ├── SymptomsScreen.js  # Symptom checker
│       ├── MindWellScreen.js  # Mental health chat
│       ├── ImagingScreen.js   # Diagnostic imaging
│       └── ProfileScreen.js   # User profile
```

## Backend Integration

The mobile app connects to the same FastAPI backend as the web application.

### API Endpoints Used

- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `POST /symptoms/analyze` - Symptom analysis
- `POST /chat/mindwell` - Mental wellness chat
- `POST /imaging/analyze` - Medical image analysis
- `GET /notifications` - User notifications

### Authentication Flow

1. User logs in via Supabase
2. JWT token stored in AsyncStorage
3. Token automatically added to all API requests
4. Token refreshed automatically when expired

## Testing

### Test on Real Device

1. Connect device via USB
2. Enable Developer Options
3. Enable USB Debugging
4. Run `npm run android` or `npm run ios`

### Test with Expo Go

1. Install Expo Go app
2. Run `npm start`
3. Scan QR code
4. App loads directly on device

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA (Mac only)

```bash
expo build:ios
```

### Using EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### "Network request failed"

- Check `.env` file has correct `EXPO_PUBLIC_API_URL`
- Ensure backend is running on Render
- Check phone/emulator has internet connection

### "Unable to connect to Supabase"

- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify database tables exist (see backend README)

### Camera not working

- Grant camera permissions in device settings
- For Android emulator, use camera emulation
- For iOS simulator, use hosted image instead

### App crashes on startup

- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check all environment variables are set

### "Invariant Violation: requireNativeComponent"

- This usually means a native module hasn't been linked
- Restart the development server
- Rebuild the app

## Features Coming Soon

- Medication manager integration
- Health metrics tracking
- Symptom screening questionnaires
- Profile editing
- Push notifications

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs on Render
3. Check Supabase logs
4. Open an issue on GitHub

## License

MIT License - See LICENSE file for details
