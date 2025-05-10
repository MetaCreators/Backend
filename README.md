# MetaCreators Backend

A Node.js backend service for MetaCreators platform, handling user management, image generation, and payment processing.

## Features

### User Management
- User registration and authentication
- Credit system for image generation
- User profile management

### Image Generation
- AI-powered image generation using Replicate API
- Image fine-tuning capabilities
- Training image management
- Generated image storage and retrieval

### Payment Processing
- Razorpay integration for payments
- Multiple subscription plans (Plus, Max, Pro)
- Credit purchase system
- Payment verification and webhook handling

### Storage
- AWS S3/DigitalOcean Spaces integration for image storage
- Presigned URL generation for secure uploads

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: AWS S3/DigitalOcean Spaces
- **Payment**: Razorpay
- **AI Services**: 
  - Google Gemini API
  - Replicate API
- **Cache**: Redis

## Architecture

```mermaid
graph TB
    subgraph Client
        Web[Web Client]
        Mobile[Mobile Client]
    end

    subgraph Backend
        API[Express API Server]
        Auth[Authentication]
        Cache[Redis Cache]
        Queue[Redis Queue]
    end

    subgraph External Services
        AI[AI Services]
        subgraph AI
            Gemini[Gemini API]
            Replicate[Replicate API]
        end
        
        Storage[Storage]
        subgraph Storage
            S3[AWS S3/DO Spaces]
        end
        
        Payment[Razorpay]
    end

    subgraph Database
        DB[(PostgreSQL)]
        subgraph DB
            Users[(Users Table)]
            Images[(Generated Images)]
            Credits[(Credit Transactions)]
        end
    end

    %% Client to Backend connections
    Web --> API
    Mobile --> API
    
    %% Backend internal connections
    API --> Auth
    API --> Cache
    API --> Queue
    
    %% Backend to External Services
    API --> AI
    API --> Storage
    API --> Payment
    
    %% Backend to Database
    API --> DB
    
    %% AI Services connections
    Gemini --> API
    Replicate --> API
    
    %% Storage connections
    S3 --> API
    
    %% Payment connections
    Payment --> API
    
    %% Database tables
    Users --> DB
    Images --> DB
    Credits --> DB

    classDef primary fill:#f9f,stroke:#333,stroke-width:2px
    classDef secondary fill:#bbf,stroke:#333,stroke-width:2px
    classDef external fill:#bfb,stroke:#333,stroke-width:2px
    classDef database fill:#fbb,stroke:#333,stroke-width:2px
    
    class Web,Mobile primary
    class API,Auth,Cache,Queue secondary
    class AI,Storage,Payment external
    class DB,Users,Images,Credits database
```

### Component Description

1. **Client Layer**
   - Web and Mobile clients interact with the backend through REST APIs
   - Handles user interface and API requests

2. **Backend Layer**
   - Express API Server: Main application server handling all requests
   - Authentication: User authentication and authorization
   - Redis Cache: Caching frequently accessed data
   - Redis Queue: Background job processing and task queues

3. **External Services**
   - AI Services:
     - Gemini API: Text generation and processing
     - Replicate API: Image generation and processing
   - Storage: AWS S3/DigitalOcean Spaces for image storage
   - Payment: Razorpay for payment processing

4. **Database Layer**
   - PostgreSQL database with Drizzle ORM
   - Tables:
     - Users: User information and credits
     - Generated Images: AI-generated image metadata
     - Credit Transactions: Credit purchase and usage history

### Data Flow

1. **User Authentication Flow**
   - Client → API → Auth → Database
   - Returns JWT token for subsequent requests

2. **Image Generation Flow**
   - Client → API → AI Services → Storage → Database
   - Updates user credits after generation

3. **Payment Flow**
   - Client → API → Razorpay → API → Database
   - Updates user credits after successful payment

4. **Background Processing**
   - API → Queue → Worker → External Services
   - Handles long-running tasks asynchronously

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Redis
- AWS/DigitalOcean account for storage
- Razorpay account
- Google Cloud account (for Gemini API)
- Replicate account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/metacreators

# Storage
DIGIOCEAN_OBJECT_ACCESS_ID=your_access_id
DIGIOCEAN_OBJECT_SECRET=your_secret_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
REPLICATE_API_KEY=your_replicate_api_key

# Payment
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Redis
REDIS_URL=redis://localhost:6379
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/metacreators-backend.git
cd metacreators-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:generate  # Generate migrations
npm run db:push     # Push migrations to database
```

4. Start the development server:
```bash
npm run dev
```

## Docker Setup

### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier management)

### Network Setup
Create a Docker network for the services:
```bash
docker network create backend_redis_worker_network
```

### Redis Container
Start Redis container:
```bash
docker run --name lithouse-redis --network backend_redis_worker_network -d -p 6379:6379 redis
```

If Redis container is not on the network, connect it manually:
```bash
docker network connect backend_redis_worker_network lithouse-redis
```

### Backend Container
Build the backend image:
```bash
docker build -t lithouse_backend .
```

Run the backend container:
```bash
docker run -d \
  --network backend_redis_worker_network \
  -p 3000:3000 \
  -e REPLICATE_API_TOKEN="your_replicate_token" \
  -e TOGETHER_API_KEY="your_together_key" \
  -e GEMINI_API_KEY="your_gemini_key" \
  -e VITE_SUPABASE_URL="your_supabase_url" \
  -e VITE_SUPABASE_ANON_KEY="your_supabase_key" \
  -e REDIS_URL="redis://lithouse-redis:6379" \
  lithouse_backend
```

### Database Access
Connect to PostgreSQL database using Docker:
```bash
docker run --rm -it postgres psql "DATABASE_URL"
```

### Docker Compose (Optional)
Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  redis:
    image: redis
    container_name: lithouse-redis
    ports:
      - "6379:6379"
    networks:
      - backend_redis_worker_network

  backend:
    build: .
    container_name: lithouse_backend
    ports:
      - "3000:3000"
    environment:
      - REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
      - TOGETHER_API_KEY=${TOGETHER_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    networks:
      - backend_redis_worker_network

networks:
  backend_redis_worker_network:
    external: true
```

Start all services:
```bash
docker-compose up -d
```

Stop all services:
```bash
docker-compose down
```

## API Endpoints

### User Management
- `POST /api/signup` - Create new user
- `POST /api/user/check` - Check if user exists
- `POST /api/user/addcredits` - Add credits to user account

### Image Generation
- `POST /api/genpersonimage` - Generate AI images
- `POST /api/imagefinetune` - Fine-tune image generation
- `GET /api/get-presignedurl-upload` - Get presigned URL for image upload
- `POST /api/training-status` - Update training status

### Payment Processing
- `POST /api/razorpay/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment and add credits

## Database Schema

### Users Table
- id (UUID, primary key)
- name (varchar)
- email (varchar, unique)
- available_credits (integer)
- totalMoneyPaidUSD (integer)
- created_at (timestamp)
- updated_at (timestamp)

### Generated Images Table
- id (UUID, primary key)
- imageId (varchar, unique)
- model_id (UUID, foreign key)
- userId (UUID, foreign key)
- cloud_url (varchar)
- replicate_url (varchar)
- prompt (text)
- status (enum)
- credits_used (integer)
- created_at (timestamp)

### Credit Transactions Table
- id (UUID, primary key)
- user_id (UUID, foreign key)
- change_amount (integer)
- reason (enum)
- created_at (timestamp)

## Subscription Plans

### Plus Plan
- Price: $16 (USD) / ₹1280 (INR)
- Features:
  - 50 AI Generation Minutes
  - 80 iStock Credits
  - 100GB Storage
  - 2 Voice Clones

### Max Plan
- Price: $27 (USD) / ₹2176 (INR)
- Features:
  - 200 AI Generation Minutes
  - 320 iStock Credits
  - 400GB Storage
  - 5 Voice Clones

### Pro Plan
- Price: $35 (USD) / ₹2800 (INR)
- Features:
  - 200 AI Generation Minutes
  - 320 iStock Credits
  - 400GB Storage
  - 5 Voice Clones

## Development

### Running Tests
```bash
npm test
```

### Database Migrations
```bash
npm run db:generate  # Generate new migration
npm run db:push     # Apply migrations
```

### Code Style
The project uses ESLint for code linting. Run:
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.