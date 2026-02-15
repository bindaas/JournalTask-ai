
# JournalTask AI - Local Setup & Deployment Guide

An intelligent task management system powered by Gemini AI.

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: Version 20 or higher.
- **npm**: Usually comes with Node.js.

### 2. Installation
Open your terminal in this directory and run:
```bash
npm install
```

### 3. Configuration
Create a `.env` file in the root directory:
```env
VITE_API_KEY=YOUR_GEMINI_API_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
```
*Note: You can get your Gemini API Key from [aistudio.google.com](https://aistudio.google.com/app/apikey).*

### 4. Running the App
Start the development server:
```bash
npm run dev
```
The app will typically be available at: **`http://localhost:5173`**

---

## ☁️ Google Cloud Configuration

### Authorized JavaScript Origins
When setting up your OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1.  **For Local Dev**: Add `http://localhost:5173`
2.  **For Production**: Add your Cloud Run URL (e.g., `https://journaltask-ai-xxxxx.a.run.app`)

### Required APIs
Ensure the following APIs are enabled in your GCP project:
- **Generative Language API** (for Gemini)
- **Google Drive API** (for file importing)
- **Google Picker API** (for the file selection UI)

---

## 🛠️ Build & Deploy

### Building for Production
```bash
npm run build
```
This generates a `dist/` folder containing your static site.

### Deploying to Cloud Run
If you have the `gcloud` CLI installed:
```bash
gcloud builds submit --config cloudbuild.yaml .
```
