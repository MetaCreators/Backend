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

creating a network:
```
docker network create backend_redis_worker_network
```
start the redis container:
```
docker run --name lithouse-redis --network backend_redis_worker_network -d -p 6379:6379 redis 
```

If the lithouse-redis container is not on the backend_redis_worker_network, you can manually connect it:
```
docker network connect backend_redis_worker_network lithouse-redis
```
starting the backend image on docker on the network backend_redis_worker_network:
```
docker run -d --network backend_redis_worker_network -p 3000:3000 -e REPLICATE_API_TOKEN="" -e TOGETHER_API_KEY="" -e GEMINI_API_KEY="" -e VITE_SUPABASE_URL="" -e VITE_SUPABASE_ANON_KEY="" -e REDIS_URL="redis://lithouse-redis:6379" lithouse_backend 
```

building the image:
```
docker build -t lithouse_backend .
```