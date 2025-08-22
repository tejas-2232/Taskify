# Task Manager - Full Stack Application

A modern task management application built with React, Node.js, TypeScript, and PostgreSQL. Features include CRUD operations for tasks, file upload/download capabilities, user authentication, and deployment to Google Cloud Platform.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication
- **Task Management**: Create, read, update, and delete tasks
- **File Management**: Upload and download files with Google Cloud Storage integration
- **Modern UI**: Responsive design built with React and Tailwind CSS
- **Real-time Updates**: Optimistic updates with React Query
- **Cloud Deployment**: Containerized deployment to Google Cloud Run
- **CI/CD Pipeline**: Automated deployment with GitHub Actions

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: Google Cloud Storage
- **Validation**: Joi schema validation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router
- **Forms**: React Hook Form

### DevOps
- **Containerization**: Docker & Docker Compose
- **Cloud Platform**: Google Cloud Platform
- **CI/CD**: GitHub Actions
- **Database**: Google Cloud SQL (PostgreSQL)
- **Storage**: Google Cloud Storage

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Google Cloud Platform account (for deployment)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd gcptest
```

### 2. Local Development Setup

#### Option A: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: postgresql://postgres:postgres123@localhost:5432/taskmanager

#### Option B: Manual Setup

1. **Setup Backend**
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database and other configurations
npx prisma migrate dev
npm run dev
```

2. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

Create `.env` files based on the examples:

**Backend (.env)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
GOOGLE_CLOUD_PROJECT_ID="your-gcp-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-storage-bucket"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
FRONTEND_URL="http://localhost:5173"
```

## 🐳 Docker Deployment

### Local Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View service logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Remove volumes (⚠️ This will delete database data)
docker-compose down -v
```

### Production Docker Build

```bash
# Build backend image
cd backend
docker build -t taskmanager-backend .

# Build frontend image
cd frontend
docker build -t taskmanager-frontend .
```

## ☁️ Google Cloud Deployment

### Prerequisites

1. **Google Cloud Setup**
```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

2. **Create Service Account**
```bash
# Create service account
gcloud iam service-accounts create taskmanager-sa \
    --display-name="Task Manager Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=taskmanager-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### GitHub Actions Setup

1. **Repository Secrets**

Add these secrets to your GitHub repository:

```
GCP_PROJECT_ID: your-google-cloud-project-id
GCP_SA_KEY: <contents-of-service-account-key.json>
DATABASE_URL: postgresql://username:password@/taskmanager?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
DB_PASSWORD: secure-database-password
JWT_SECRET: super-secure-jwt-secret-for-production
```

2. **Trigger Deployment**

Push to the `main` branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to Google Cloud"
git push origin main
```

### Manual Cloud Deployment

```bash
# Build and push images
./scripts/deploy.sh
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login    - Login user
GET  /api/auth/me       - Get current user
PUT  /api/auth/profile  - Update user profile
```

### Task Endpoints

```
GET    /api/tasks           - Get all tasks
GET    /api/tasks/:id       - Get single task
POST   /api/tasks           - Create new task
PUT    /api/tasks/:id       - Update task
DELETE /api/tasks/:id       - Delete task
GET    /api/tasks/stats/overview - Get task statistics
```

### File Endpoints

```
GET    /api/files              - Get all files
GET    /api/files/:id          - Get file metadata
POST   /api/files/upload       - Upload file
GET    /api/files/:id/download - Download file
DELETE /api/files/:id          - Delete file
PUT    /api/files/:id/attach/:taskId - Attach file to task
PUT    /api/files/:id/detach   - Detach file from task
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📁 Project Structure

```
gcptest/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Application entry point
│   ├── prisma/             # Database schema and migrations
│   ├── Dockerfile          # Backend container config
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile          # Frontend container config
│   └── package.json
├── .github/workflows/      # GitHub Actions CI/CD
├── docker-compose.yml      # Local development setup
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Contact the development team

## 🚀 Deployment Status

- ✅ Development Environment
- ✅ Docker Containerization  
- ✅ Google Cloud Ready
- ✅ CI/CD Pipeline
- ✅ Production Deployment

---

**Built with ❤️ using modern web technologies**
