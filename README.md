# Care-AI: Your Integrated Health Co-Pilot

Care-AI is a modern web application that combines AI-powered health tools to help users manage their wellbeing. It includes symptom analysis, health screening questionnaires, mental health support, diagnostic imaging capabilities, medication tracking with inventory management, and personalized health tips.

![Care-AI Dashboard](https://via.placeholder.com/800x400?text=Care-AI+Dashboard)

## Features

### 🩺 Symptom Checker
- AI-powered symptom analysis using Google's Gemini API
- Provides potential conditions with probability scores
- Suggests appropriate next steps (Self-Care, Consult a Doctor, or Immediate Care)
- Saves analysis history for future reference

### 📋 Health Screening
- Questionnaire-based health assessments
- Available screenings: General Health, Mental Wellness, Lifestyle Assessment
- Personalized tips and advice based on your answers
- Score-based results with actionable recommendations

### 🧠 MindWell Chatbot
- Empathetic AI companion for mental health support
- Safe space to express thoughts and feelings
- Crisis intervention with hotline information
- Conversation history saved privately

### 🩻 Diagnostic Imaging Hub
- Analyzes medical images using ONNX deep learning models
- Supports multiple scan types:
  - Chest X-rays for pneumonia detection
  - Mammograms for breast cancer screening
  - CT scans for kidney cancer detection
  - MRI scans for brain tumor detection
- Demo mode with sample images

### 💊 Medication Manager
- Add and track medications with name, dosage, and schedule
- Customizable reminder timing (5, 10, 15, 30, or 60 minutes before dose)
- **Inventory tracking** with stock count and low-stock alerts
- Set custom thresholds for low inventory warnings
- Log when you take each dose (automatically decrements inventory)
- View upcoming reminders for due medications
- Personal settings for notification preferences

### 👤 User Profile
- Manage personal information (name, email, age, gender)
- Health metrics (height, weight, blood type)
- BMI calculator with category display
- Medical conditions and allergies tracking
- Privacy-focused secure storage

### 💡 Personalized Health Tips
- Dashboard slideshow with health tips
- Tips personalized based on your profile data
- Auto-rotating carousel with manual navigation

### 🔔 Notifications
- Real-time alerts and reminders
- Support for Supabase Realtime subscriptions

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router** for navigation
- **Lucide React** for icons
- **Supabase JS** for real-time features

### Backend
- **FastAPI** (Python) for high-performance API
- **Supabase** for authentication and database
- **Google Gemini API** for AI-powered analysis
- **ONNX Runtime** for medical image analysis
- **HuggingFace Hub** for model downloads

## Project Structure

```
care-ai/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── requirements.txt    # Python dependencies
│   ├── routes/             # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── symptoms.py     # Symptom analysis endpoints
│   │   ├── chat.py         # MindWell chat endpoints
│   │   ├── imaging.py      # Diagnostic imaging endpoints
│   │   └── notifications.py # Notification endpoints
│   ├── services/           # Business logic
│   │   ├── supabase_service.py
│   │   ├── gemini_service.py
│   │   └── imaging_service.py
│   └── models/             # Pydantic schemas
│       └── schemas.py
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── AuthContext.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SymptomsPage.jsx
│   │   │   ├── MindWellPage.jsx
│   │   │   └── ImagingPage.jsx
│   │   ├── utils/          # Utility functions
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── demo_images/            # Sample medical images
├── models/                 # ONNX model storage
├── render.yaml             # Render deployment config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Supabase account (free tier works)
- Google AI Studio account (for Gemini API key)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/care-ai.git
cd care-ai
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run these queries to create tables:

```sql
-- Symptom history table
CREATE TABLE symptom_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  symptoms_input TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations table
CREATE TABLE chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE symptom_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own symptom history"
  ON symptom_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom history"
  ON symptom_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE user_id = auth.uid()
    )
  );

-- Medications table
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule TEXT NOT NULL,
  reminder_minutes_before INTEGER DEFAULT 15,
  notes TEXT,
  inventory_count INTEGER DEFAULT 0,
  inventory_threshold INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  blood_type TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication logs table (tracks when doses are taken)
CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table (for reminder preferences)
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  reminder_settings JSONB DEFAULT '{"default_reminder_minutes": 15, "notifications_enabled": true, "email_reminders": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for medication_logs
CREATE POLICY "Users can view own medication logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

**⚠️ IMPORTANT NOTE:** If the backend uses the Supabase **Service Role Key** (not the anon key), it bypasses RLS. However, to be safe, you can also disable RLS temporarily for testing:

```sql
-- ONLY FOR TESTING - Disable RLS (remove these after testing works)
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
```

3. Get your project URL and keys from **Settings > API**

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Copy the key for use in environment variables

### 4. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 5. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your credentials:
```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Testing the Application

### Manual Testing

1. Open `http://localhost:5173` in your browser
2. Create a new account using the Sign Up form
3. Verify your email (check your inbox)
4. Log in with your credentials
5. Test each feature:
   - **Symptom Checker**: Describe symptoms like "I have a fever and headache"
   - **MindWell**: Have a conversation about how you're feeling
   - **Imaging**: Upload a medical image or use demo images

### API Testing

You can test the backend API directly:

```bash
# Health check
curl http://localhost:8000/api/health

# Analyze symptoms (requires auth token)
curl -X POST http://localhost:8000/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "I have a high fever and body aches"}'
```

## Deploying to Render

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** > **Blueprint**
4. Connect your GitHub repository
5. Render will detect `render.yaml` and create both services
6. Set environment variables for each service:

**Backend Environment Variables:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FRONTEND_URL`: Your frontend URL (e.g., `https://care-ai-frontend.onrender.com`)

**Frontend Environment Variables:**
- `VITE_API_URL`: Your backend URL (e.g., `https://care-ai-backend.onrender.com/api`)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Option 2: Manual Setup

#### Deploy Backend

1. Click **New** > **Web Service**
2. Connect your repository
3. Configure:
   - **Name**: care-ai-backend
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

#### Deploy Frontend

1. Click **New** > **Static Site**
2. Connect your repository
3. Configure:
   - **Name**: care-ai-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. Add environment variables
5. Add rewrite rule: `/*` → `/index.html`
6. Deploy

## Important Notes

### Security Considerations

- Never commit `.env` files with real credentials
- Use Supabase Row Level Security (RLS) for data protection
- The Supabase service role key should only be used on the backend
- Use the anon key on the frontend

### ONNX Models

The diagnostic imaging models are downloaded from HuggingFace Hub on first use. This may take a moment when first accessing the imaging feature.

### Disclaimer

**Care-AI is a proof-of-concept application and is NOT a substitute for professional medical advice, diagnosis, or treatment.** Always consult with a qualified healthcare provider for any health concerns.

## Missing Information to Complete Setup

To fully deploy this application, you'll need:

1. **Supabase Credentials**: Create a project at supabase.com
2. **Gemini API Key**: Get one from Google AI Studio
3. **Custom Domain (Optional)**: Configure in Render settings
4. **ONNX Models**: Ensure they're accessible from HuggingFace Hub

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
