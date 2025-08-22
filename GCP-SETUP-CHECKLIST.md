# 🔧 GCP Setup Checklist

## ✅ What You Need to Do:

### 1. Update Environment Variables
Edit `backend/.env` file and replace:

```env
# Replace these two lines with your actual values:
GOOGLE_CLOUD_PROJECT_ID="YOUR_PROJECT_ID_HERE"
GOOGLE_CLOUD_STORAGE_BUCKET="YOUR_BUCKET_NAME_HERE"
```

**Example:**
```env
GOOGLE_CLOUD_PROJECT_ID="taskmanager-dev-123456"
GOOGLE_CLOUD_STORAGE_BUCKET="taskmanager-files-dev-123456"
```

### 2. Place Service Account Key
Copy your downloaded JSON key file to:
```
backend/credentials/service-account-key.json
```

### 3. Restart the Backend
After making changes, restart your backend server:
```bash
# Stop current backend (Ctrl+C if running)
# Then restart:
cd backend
npm run dev
```

## 🚀 What This Enables:

- ✅ **File uploads** will be stored in Google Cloud Storage
- ✅ **File downloads** will work from the cloud
- ✅ **File management** through the web interface
- ✅ **Scalable storage** that grows with your app

## 🧪 Testing File Upload:

1. Open http://localhost:5173
2. Register/Login to your account
3. Go to Files page
4. Upload a test file
5. Check your GCS bucket - the file should appear there!

## 🔧 Troubleshooting:

If you get authentication errors:
- Verify the JSON key file is in the correct location
- Check that the service account has "Storage Admin" role
- Ensure the bucket name is correct and exists

## 📁 File Structure After Setup:
```
backend/
├── credentials/
│   └── service-account-key.json  ← Your GCP key
├── .env                          ← Updated with your values
└── ...
```
