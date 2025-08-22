# Google Cloud Setup Instructions

## Step 1: Install Google Cloud CLI

### Windows Installation:
1. Download the Google Cloud CLI installer from: https://cloud.google.com/sdk/docs/install-sdk
2. Run the installer and follow the prompts
3. Restart your terminal/PowerShell
4. Verify installation: `gcloud --version`

### Alternative: Use PowerShell to download and install
```powershell
# Download installer
Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "GoogleCloudSDKInstaller.exe"

# Run installer (this will open GUI installer)
Start-Process -FilePath "GoogleCloudSDKInstaller.exe" -Wait
```

## Step 2: Initialize and Login
```bash
# Initialize gcloud (this will open browser for login)
gcloud init

# Or login separately
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

## Step 3: Enable Required APIs
```bash
# Enable all APIs needed for the application
gcloud services enable storage-component.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## Step 4: Create Storage Bucket
```bash
# Create bucket (replace PROJECT_ID and BUCKET_NAME)
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l us-central1 gs://YOUR_BUCKET_NAME

# Example:
gsutil mb -p taskmanager-dev-123 -c STANDARD -l us-central1 gs://taskmanager-files-dev
```

## Step 5: Create Service Account for Local Development
```bash
# Create service account for local development
gcloud iam service-accounts create taskmanager-storage \
    --display-name="Task Manager Storage Service Account"

# Grant storage permissions for local development
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key for local development
gcloud iam service-accounts keys create key.json \
    --iam-account=taskmanager-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Step 6: Create Service Account for CI/CD Deployment
```bash
# Create service account for CI/CD
gcloud iam service-accounts create taskmanager-cicd \
    --display-name="Task Manager CI/CD Service Account"
```

### Required Permissions for CI/CD
Your CI/CD service account needs these roles for automated deployment:

```bash
# Cloud Run Admin - Deploy and manage Cloud Run services
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Cloud SQL Admin - Create and manage Cloud SQL instances and databases
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.admin"

# Storage Admin - Create and manage Cloud Storage buckets and objects
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Artifact Registry Administrator - Push and pull container images
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# Secret Manager Admin - Create and access secrets
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.admin"

# Service Account User - Use service accounts for Cloud Run
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Cloud Build Editor - Run Cloud Build jobs (for migrations)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"

# Service Usage Consumer - Use Google Cloud services
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/serviceusage.serviceUsageConsumer"
```

### Create CI/CD Service Account Key
```bash
# Create and download key for CI/CD (this goes to GitHub Secrets)
gcloud iam service-accounts keys create cicd-key.json \
    --iam-account=taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Step 7: Configure CORS (Optional for web uploads)
```bash
# Create cors.json file
echo '[{"origin": ["*"], "method": ["GET", "POST", "PUT", "DELETE"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json

# Apply CORS
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

## Step 8: Setup GitHub Secrets for CI/CD

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets:
1. **GCP_PROJECT_ID**: Your Google Cloud Project ID
   ```
   taskmanager-469718
   ```

2. **GCP_SA_KEY**: The entire content of `cicd-key.json` file
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "taskmanager-cicd@your-project-id.iam.gserviceaccount.com",
     ...
   }
   ```

3. **DATABASE_URL**: Production database connection string
   ```
   postgresql://username:password@/cloudsql/project:region:instance/database
   ```

4. **JWT_SECRET**: JWT signing secret for production
   ```
   your-super-secure-jwt-secret-for-production
   ```

5. **DB_PASSWORD**: Database password for Cloud SQL
   ```
   your-secure-database-password
   ```

### Security Best Practices:
- ✅ Never commit service account keys to your repository
- ✅ Use separate service accounts for local development and CI/CD
- ✅ Follow the principle of least privilege for permissions
- ✅ Regularly rotate service account keys
- ✅ Monitor service account usage in Google Cloud Console
- ✅ Use GitHub environment protection rules for production deployments

## Step 9: Verify Setup
```bash
# Test authentication
gcloud auth list

# Test project configuration
gcloud config list

# Test permissions (replace with your service account)
gcloud projects get-iam-policy YOUR_PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:taskmanager-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

## Troubleshooting

### Common Issues:
1. **Permission Denied**: Ensure all required roles are assigned to the service account
2. **API Not Enabled**: Enable all required APIs listed in Step 3
3. **Service Account Not Found**: Verify the service account was created successfully
4. **GitHub Actions Failing**: Check that the service account key JSON is valid and properly formatted in GitHub Secrets

### Useful Commands:
```bash
# List all enabled APIs
gcloud services list --enabled

# List service accounts
gcloud iam service-accounts list

# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:*taskmanager-cicd*"
```
```

The updated documentation now includes:

1. **Complete API enablement** for all required services
2. **Separate service accounts** for local development and CI/CD
3. **Detailed CI/CD permissions** with explanations for each role
4. **GitHub Secrets setup** with examples
5. **Security best practices** and recommendations
6. **Troubleshooting section** for common issues
7. **Verification steps** to ensure proper setup

This provides a comprehensive guide for setting up both local development and CI/CD deployment with proper security practices.