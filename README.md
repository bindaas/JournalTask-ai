# JournalTask AI - Setup & Deployment

An intelligent task management system powered by Gemini AI.

## 🚀 Local Setup

1. **Install dependencies**: `npm install`
2. **Configure API Key**: Create a `.env` file with `VITE_API_KEY=your_key_here`.
3. **Run**: `npm run dev` (Usually at `http://localhost:5173`)

## 🛠 Troubleshooting Error 400 (invalid_request)

If you see a 400 error when clicking the "Drive" button, follow these steps:

1. Copy the URL where your app is running (e.g., `http://localhost:5173` or your Cloud Run URL).
2. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
3. Find your **OAuth 2.0 Client ID**.
4. Add your URL to the **Authorized JavaScript origins** section.
5. **Wait 5-10 minutes** for Google's servers to propagate the change.
6. Refresh your application and try again.

## ☁️ Deployment to Cloud Run

This project is configured for Google Cloud Run. Use the following command to deploy:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Ensure the `Generative Language API` and `Google Drive API` are enabled in your project.
