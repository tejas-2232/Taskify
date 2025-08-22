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
gcloud services enable storage-component.googleapis.com
gcloud services enable storage.googleapis.com
```

## Step 4: Create Storage Bucket
```bash
# Create bucket (replace PROJECT_ID and BUCKET_NAME)
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l us-central1 gs://YOUR_BUCKET_NAME

# Example:
gsutil mb -p taskmanager-dev-123 -c STANDARD -l us-central1 gs://taskmanager-files-dev
```

## Step 5: Create Service Account
```bash
# Create service account
gcloud iam service-accounts create taskmanager-storage \
    --display-name="Task Manager Storage Service Account"

# Grant storage permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:taskmanager-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=taskmanager-storage@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Step 6: Configure CORS (Optional for web uploads)
```bash
# Create cors.json file
echo '[{"origin": ["*"], "method": ["GET", "POST", "PUT", "DELETE"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json

# Apply CORS
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

