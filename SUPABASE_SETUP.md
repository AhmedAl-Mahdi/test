# Supabase Configuration Guide

This document explains how to configure Supabase for the Care-AI application.

## Setup Instructions

### 1. Local Development

Create a `.streamlit/secrets.toml` file in the root directory with your Supabase credentials:

```toml
# Supabase Configuration
SUPABASE_URL = "https://okxbdihgnxwwfrgopbbw.supabase.co"
SUPABASE_KEY = "your-anon-public-key-here"
```

**Note:** The `.streamlit/secrets.toml` file is already in `.gitignore` to prevent accidentally committing secrets.

### 2. Production/Cloud Deployment

For Streamlit Cloud or other hosting platforms:

1. Go to your app settings
2. Navigate to "Secrets" section
3. Add the following secrets:

```toml
SUPABASE_URL = "https://okxbdihgnxwwfrgopbbw.supabase.co"
SUPABASE_KEY = "your-anon-public-key-here"
```

### 3. Required Database Tables

The application requires the following Supabase tables:

#### `medications` table
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  medication_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own medications
CREATE POLICY "Users can view their own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);
```

#### Other Required Tables
- `symptom_history` - For symptom analysis storage
- `chat_conversations` - For chatbot conversations
- `chat_messages` - For chat message storage

Refer to the existing database schema for complete table definitions.

## Current Configuration

- **Supabase Project URL:** https://okxbdihgnxwwfrgopbbw.supabase.co
- **Anon/Public Key:** Configured in secrets.toml (not committed to repo)

## Troubleshooting

### Connection Issues
If you encounter connection errors:
1. Verify your SUPABASE_URL is correct
2. Check that your SUPABASE_KEY is the anon/public key (not the service role key)
3. Ensure the secrets.toml file exists in the `.streamlit/` directory

### Authentication Issues
If users cannot log in:
1. Check that email authentication is enabled in Supabase dashboard
2. Verify Row Level Security policies are properly configured
3. Ensure the auth.users table is accessible

## Security Notes

- **Never commit the `secrets.toml` file** - it's already in `.gitignore`
- The anon/public key is safe to use client-side (it has limited permissions)
- For sensitive operations, use Row Level Security (RLS) policies
- All user data is automatically scoped to the authenticated user via RLS
