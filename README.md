# Backend + Supabase
### Setting up Supabase

#### 1. Create a Supabase Account

1. Visit [Supabase](https://supabase.com/) and click "Start Your Project"
2. Sign up using GitHub, Google, or email
3. Verify your email address

#### 2. Create a New Supabase Project

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose a unique project name
4. Set up your database password
5. Select your region

#### 3. Locate Project Credentials

1. Go to Project Settings (gear icon)
2. Navigate to the "API" section

##### Find SUPABASE_URL
- Look for the "Project URL"
- It looks like: `https://your-project-id.supabase.co`

##### Find SUPABASE_ANON_KEY
- Find the "anon (public)" key under "Project API Keys"

#### 4. Configure Environment Variables

Create a `.env` file in your project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** Prefix Vite environment variables with `VITE_`
- run the project using npm run dev

#### 5. Docker commands

starting the backend image on docker:
```
docker run -p 3000:3000 \
  -e REPLICATE_API_TOKEN="" \
  -e TOGETHER_API_KEY="" \
  -e GEMINI_API_KEY="" \
  -e VITE_SUPABASE_URL="" \
  -e VITE_SUPABASE_ANON_KEY="" \
  lithouse_backend

```