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
3. **Enable APIs**: Ensure both **Google Drive API** and **Google Picker API** are enabled in the same project.
4. **Consistency**: Use an API Key and Client ID from the same Google Cloud project.

## ☁️ Deployment to Cloud Run

This project is configured for Google Cloud Run. Use the following command to deploy:

```bash
gcloud builds submit --config cloudbuild.yaml .
```
