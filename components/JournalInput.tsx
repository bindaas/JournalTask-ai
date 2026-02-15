import React, { useState, useEffect } from 'react';
import { pickFileFromDrive } from '../services/googleDriveService';

interface JournalInputProps {
  onSync: (content: string) => void;
  isSyncing: boolean;
  initialValue?: string;
}

export const JournalInput: React.FC<JournalInputProps> = ({ onSync, isSyncing, initialValue = '' }) => {
  const [content, setContent] = useState(initialValue);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [clientId, setClientId] = useState(localStorage.getItem('google_client_id') || '');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const isConfigured = clientId.trim().length > 10;
  const currentOrigin = window.location.origin;

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSaveConfig = () => {
    const trimmed = clientId.trim();
    localStorage.setItem('google_client_id', trimmed);
    setClientId(trimmed);
    setShowSettings(false);
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDriveImport = async () => {
    if (!isConfigured) {
      setShowSettings(true);
      return;
    }

    setIsDriveLoading(true);
    try {
      const driveContent = await pickFileFromDrive();
      if (driveContent) {
        setContent(driveContent);
        onSync(driveContent);
      }
    } catch (error: any) {
      console.error("Drive Import Error:", error);
      const msg = error.message?.toLowerCase() || '';
      
      // Detailed error detection for Policy Compliance
      const isPolicyError = msg.includes('policy') || msg.includes('secure') || msg.includes('400') || msg.includes('access blocked');
      
      let alertMsg = error.message || 'An unknown error occurred';
      if (isPolicyError) {
        alertMsg = `GOOGLE POLICY ERROR DETECTED:

1. YOUR EMAIL: Is your email added to 'Test users' in the GCP 'OAuth consent screen' tab? (Required for unverified apps)
2. ORIGIN: Is '${currentOrigin}' exactly matched in 'Authorized JavaScript origins'?
3. REDIRECTS: Is 'Authorized redirect URIs' EMPTY? (It must be empty for this app type)

See the Settings gear for the step-by-step fix.`;
        setShowSettings(true);
      }
      
      alert(alertMsg);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const isLoading = isSyncing || isDriveLoading;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <i className="fas fa-feather-pointed mr-2 text-blue-500"></i>
          Journal Context
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all relative ${showSettings ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Google Drive Config"
          >
            <i className="fas fa-cog"></i>
            {!isConfigured && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={handleDriveImport}
            disabled={isLoading}
            className={`flex items-center text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border ${
              !isConfigured 
              ? 'text-slate-400 bg-slate-50 border-slate-100' 
              : 'text-emerald-700 hover:bg-emerald-50 bg-white border-emerald-100'
            }`}
          >
            <i className="fab fa-google-drive mr-1.5"></i> Drive
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cloud Configuration</h4>
              <p className="text-[10px] text-slate-500 mt-1">Configure your Google Project to enable Drive access.</p>
            </div>
            {!isConfigured && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Setup Required</span>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Web Client ID (OAuth 2.0)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="0000000-xxxx.apps.googleusercontent.com"
                  className="flex-1 px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button 
                  onClick={handleSaveConfig}
                  className="px-4 py-2.5 bg-slate-800 text-white text-[10px] font-black rounded-xl hover:bg-slate-900 transition-all uppercase"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
              <h5 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center">
                <i className="fas fa-shield-halved mr-2"></i> Fix "Policy Compliance" Errors
              </h5>
              
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="overflow-hidden">
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Authorized JavaScript Origin:</p>
                  <code className="text-[10px] text-blue-600 font-mono block truncate">{currentOrigin}</code>
                </div>
                <button 
                  onClick={handleCopyOrigin}
                  className="shrink-0 ml-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                  <div className="text-[10px] text-slate-600 leading-normal">
                    <p className="font-bold text-slate-800">OAuth Consent Screen Tab:</p>
                    Add your email to <b className="text-blue-600">Test users</b> at the bottom of the page.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                  <div className="text-[10px] text-slate-600 leading-normal">
                    <p className="font-bold text-slate-800">Credentials Tab:</p>
                    Edit your Client ID. Paste the <b>Origin</b> (above) into <b>Authorized JavaScript origins</b>.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                  <div className="text-[10px] text-slate-600 leading-normal">
                    <p className="font-bold text-red-600">CRITICAL:</p>
                    Ensure <b>Authorized redirect URIs</b> is <b className="uppercase">Empty</b>. This app uses the popup flow.
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-[9px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-start">
                  <i className="fas fa-circle-info mr-2 mt-0.5"></i>
                  <span>Wait 5 minutes for Google's cache to clear after saving changes in the console.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
        Input your daily progress. Gemini AI will automatically extract tasks, deadlines, and dependencies.
      </p>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="e.g. 2024-10-24: Finished the API draft. Need to prepare for the client demo [URGENT] tomorrow..."
          className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm leading-relaxed"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center space-y-4 z-10 animate-in fade-in duration-300">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">
              {isDriveLoading ? 'Authenticating...' : 'Gemini AI Thinking...'}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSync(content)}
        disabled={isLoading || !content.trim()}
        className={`mt-4 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center transition-all ${
          isLoading || !content.trim() 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] shadow-blue-200/50 shadow-lg'
        }`}
      >
        <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2.5`}></i>
        {isLoading ? 'Processing' : 'Sync Workspace'}
      </button>
    </div>
  );
};
