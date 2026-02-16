# JournalTask AI - Setup & Deployment

An intelligent task management system powered by Gemini AI.

## 🚀 Local Setup

1. **Install dependencies**: `npm install`
2. **Configure API Key**: Create a `.env` file with `VITE_API_KEY=your_key_here`.
3. **Run**: `npm run dev` (Usually at `http://localhost:5173`)

## 🛠 Troubleshooting OAuth & Drive Errors

### Error 400 (invalid_request) or "Access Blocked"
If you see errors when clicking the "Drive" button:

1. **Origins, not Redirects**: This app uses the JavaScript popup flow. 
   - DO add your URL (e.g., `http://localhost:5173`) to **Authorized JavaScript origins**.
   - DO NOT add any **Authorized redirect URIs**. Leave that section blank.
2. **Test Users**: If your project is in "Testing" mode, go to the **OAuth consent screen** tab in the Google Cloud Console and add your email to the **Test users** list.
3. **Enable APIs**: Ensure **Generative Language API**, **Google Drive API**, and **Google Picker API** are enabled in the same project.
4. **Consistency**: Use an API Key and Client ID from the same Google Cloud project.

## ☁️ Deployment to Cloud Run

This project is configured for Google Cloud Run. 

### 1. Initial Deploy
Run the following command from your project root:
```bash
gcloud builds submit --config cloudbuild.yaml .
```

### 2. Set Environment Variables
Cloud Run needs your API Key to communicate with Gemini. After the first deployment completes:

1. Go to the [Cloud Run Console](https://console.cloud.google.com/run).
2. Select the `journaltask-ai` service.
3. Click **Edit & Deploy New Revision**.
4. Scroll to **Variables & Secrets**.
5. Add an Environment Variable:
   - Name: `API_KEY`
   - Value: `your_gemini_api_key_here`
6. Click **Deploy**.

### 3. Update OAuth Origins
Once deployed, copy your Cloud Run URL (e.g., `https://journaltask-ai-xyz.a.run.app`) and add it to your **Authorized JavaScript origins** in the GCP Credentials console.