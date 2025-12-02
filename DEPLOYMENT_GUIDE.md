# 🚀 Care-AI Deployment Guide

This guide will walk you through deploying Care-AI to the internet step by step. By the end, you'll have a fully functional website accessible from anywhere.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Step 1: Set Up Supabase](#-step-1-set-up-supabase)
3. [Step 2: Get Your Gemini API Key](#-step-2-get-your-gemini-api-key)
4. [Step 3: Prepare Your GitHub Repository](#-step-3-prepare-your-github-repository)
5. [Step 4: Create a Render Account](#-step-4-create-a-render-account)
6. [Step 5: Deploy the Backend](#-step-5-deploy-the-backend)
7. [Step 6: Deploy the Frontend](#-step-6-deploy-the-frontend)
8. [Step 7: Connect Everything Together](#-step-7-connect-everything-together)
9. [Step 8: Test Your Deployment](#-step-8-test-your-deployment)
10. [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

Before you begin, make sure you have:

- ✅ A **GitHub account** (free at [github.com](https://github.com))
- ✅ A **Supabase account** (free at [supabase.com](https://supabase.com))
- ✅ A **Google account** (for Gemini API)
- ✅ A **Render account** (free at [render.com](https://render.com))
- ✅ This repository pushed to your GitHub account

---

## 🗄️ Step 1: Set Up Supabase

Supabase handles user authentication and stores your data.

### 1.1 Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### 1.2 Create a New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `care-ai` (or any name you prefer)
   - **Database Password**: Create a strong password and **save it somewhere safe**
   - **Region**: Choose the closest to your users
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be ready

### 1.3 Create Database Tables

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste this entire SQL code:

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

-- RLS Policies for symptom_history
CREATE POLICY "Users can view own symptom history"
  ON symptom_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom history"
  ON symptom_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_messages
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
```

4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. You should see "Success" message

### 1.4 Get Your Supabase Credentials

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Configuration
3. Copy and save these values (you'll need them later):
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
   - **service_role key**: Another long string (keep this secret!)

> ⚠️ **Important**: The `service_role` key has full access to your database. Never expose it in frontend code or commit it to GitHub.

---

## 🤖 Step 2: Get Your Gemini API Key

Gemini powers the AI features in Care-AI.

### 2.1 Access Google AI Studio

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Accept the terms of service if prompted

### 2.2 Create an API Key

1. Click **"Get API key"** in the left sidebar
2. Click **"Create API key"**
3. Select **"Create API key in new project"** (or choose an existing project)
4. Copy the API key and **save it somewhere safe**

> 💡 **Tip**: The free tier of Gemini API should be sufficient for testing and small-scale use.

---

## 📂 Step 3: Prepare Your GitHub Repository

Make sure your code is on GitHub so Render can access it.

### 3.1 If you haven't pushed to GitHub yet:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### 3.2 Verify your repository structure

Your repository should have:
```
your-repo/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
├── render.yaml
└── README.md
```

---

## 🌐 Step 4: Create a Render Account

Render will host both your frontend and backend.

### 4.1 Sign Up

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) - this makes deployment easier

### 4.2 Connect GitHub

1. When prompted, authorize Render to access your GitHub
2. You can choose to give access to all repositories or select specific ones

---

## ⚙️ Step 5: Deploy the Backend

The backend is your Python FastAPI server.

### 5.1 Create a New Web Service

1. From the Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Click **"Connect"** next to your care-ai repository

### 5.2 Configure the Backend Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `care-ai-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### 5.3 Add Environment Variables

Scroll down to **"Environment Variables"** and click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your Supabase Project URL (from Step 1.4) |
| `SUPABASE_KEY` | Your Supabase service_role key (from Step 1.4) |
| `GEMINI_API_KEY` | Your Gemini API key (from Step 2.2) |
| `FRONTEND_URL` | Leave empty for now (we'll update this later) |
| `PYTHON_VERSION` | `3.11` |

### 5.4 Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (this takes 3-5 minutes)
3. Once deployed, copy your backend URL (looks like `https://care-ai-backend.onrender.com`)

> 💡 **Note**: The free tier may spin down after 15 minutes of inactivity. The first request after that will take ~30 seconds.

---

## 🎨 Step 6: Deploy the Frontend

The frontend is your React application.

### 6.1 Create a New Static Site

1. From the Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Click **"Connect"**

### 6.2 Configure the Frontend Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `care-ai-frontend` |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 6.3 Add Environment Variables

Add these environment variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL + `/api` (e.g., `https://care-ai-backend.onrender.com/api`) |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

### 6.4 Add Rewrite Rule (Important!)

1. After creation, go to your frontend service settings
2. Scroll to **"Redirect/Rewrite Rules"**
3. Add a rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

This ensures React Router works correctly.

### 6.5 Deploy

1. Click **"Create Static Site"**
2. Wait for the build to complete (2-3 minutes)
3. Copy your frontend URL (looks like `https://care-ai-frontend.onrender.com`)

---

## 🔗 Step 7: Connect Everything Together

Now let's make sure all services can communicate.

### 7.1 Update Backend FRONTEND_URL

1. Go to your **backend service** on Render
2. Click **"Environment"** in the left sidebar
3. Find `FRONTEND_URL` and click **"Edit"**
4. Set it to your frontend URL (e.g., `https://care-ai-frontend.onrender.com`)
5. Click **"Save Changes"**
6. The backend will automatically redeploy

### 7.2 Update Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Click **"Authentication"** → **"URL Configuration"**
3. Under **"Site URL"**, enter your frontend URL
4. Under **"Redirect URLs"**, add:
   - `https://care-ai-frontend.onrender.com`
   - `https://care-ai-frontend.onrender.com/*`
5. Click **"Save"**

---

## ✅ Step 8: Test Your Deployment

### 8.1 Test the Backend

1. Visit `https://your-backend-url.onrender.com/api/health`
2. You should see:
   ```json
   {
     "status": "healthy",
     "version": "1.0.0",
     "services": {...}
   }
   ```

### 8.2 Test the Frontend

1. Visit your frontend URL
2. You should see the Care-AI login page
3. Try creating a new account
4. Check your email for the verification link (from Supabase)
5. Log in and test the features

### 8.3 Test All Features

- ✅ **Symptom Checker**: Enter symptoms and get AI analysis
- ✅ **MindWell Chat**: Have a conversation with the AI
- ✅ **Imaging Hub**: Upload or use demo images
- ✅ **Notifications**: Check the bell icon

---

## 🔧 Troubleshooting

### Backend won't start

**Check the logs:**
1. Go to your backend service on Render
2. Click **"Logs"**
3. Look for error messages

**Common issues:**
- Missing environment variables → Add them in the Environment tab
- Wrong Python version → Set `PYTHON_VERSION=3.11`

### Frontend shows blank page

**Check the build logs:**
1. Go to your static site on Render
2. Click **"Events"** to see build logs

**Common issues:**
- Missing environment variables → They must start with `VITE_`
- Rewrite rule not set → Add `/* → /index.html` rewrite

### "Failed to fetch" errors

**This usually means:**
- Backend URL is wrong in frontend env vars
- Backend is still starting up (free tier cold start)
- CORS issue → Check `FRONTEND_URL` in backend env vars

### Supabase auth not working

**Check:**
- Site URL is set correctly in Supabase
- Redirect URLs include your frontend domain
- Using anon key (not service_role) in frontend

### Slow initial load

This is normal on the free tier! The first request after 15 minutes of inactivity takes ~30 seconds as the server "wakes up".

**To avoid this:**
- Upgrade to a paid Render plan
- Set up a health check ping (e.g., using UptimeRobot)

---

## 🎉 Congratulations!

Your Care-AI application is now live on the internet! Share your frontend URL with others to let them use it.

### Next Steps

- **Custom Domain**: Add your own domain in Render settings
- **Monitoring**: Set up uptime monitoring
- **Analytics**: Add Google Analytics or similar
- **Scaling**: Upgrade Render plan for more resources

---

## 📞 Need Help?

- Check the [Render Documentation](https://render.com/docs)
- Check the [Supabase Documentation](https://supabase.com/docs)
- Open an issue on this GitHub repository

---

*Happy deploying! 🚀*
