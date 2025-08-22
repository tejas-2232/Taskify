# Google Cloud Storage Setup via Web Console

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "taskmanager-dev")
4. Note your Project ID (e.g., "taskmanager-dev-123456")

## Step 2: Enable Cloud Storage API
1. In the console, go to "APIs & Services" → "Library"
2. Search for "Cloud Storage API"
3. Click "Enable"

## Step 3: Create Storage Bucket
1. Go to "Cloud Storage" → "Buckets"
2. Click "Create Bucket"
3. Configure:
   - Name: `taskmanager-files-[YOUR-PROJECT-ID]` (must be globally unique)
   - Location: Choose your region (e.g., us-central1)
   - Storage class: Standard
   - Access control: Fine-grained
4. Click "Create"

## Step 4: Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Configure:
   - Name: `taskmanager-storage`
   - Description: "Service account for Task Manager file storage"
4. Click "Create and Continue"
5. Add role: "Storage Admin"
6. Click "Continue" → "Done"

## Step 5: Create Service Account Key
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create" - this downloads the key file
6. Save the key file as `key.json` in your project root

## Step 6: Set Bucket Permissions (Optional)
1. Go back to your bucket
2. Click "Permissions" tab
3. Click "Grant Access"
4. Add your service account email with "Storage Admin" role

## Step 7: Configure CORS (if needed for direct web uploads)
1. In bucket details, go to "Configuration" tab
2. Edit CORS configuration
3. Add:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

