
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

  const handleExampleLoad = () => {
    const example = `2024-05-15:
- ~~Update the team sync calendar~~
- Prepare the Q3 Roadmap presentation [URGENT].
- Research new GCP deployment strategies.
- Need to approve the design mockups before starting front-end development.
- Buy office supplies.`;
    setContent(example);
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
      const msg = error.message.toLowerCase();
      const is400 = msg.includes('400') || msg.includes('invalid_request');
      
      let alertMsg = error.message;
      if (is400) {
        alertMsg = `Google OAuth Error: Ensure "${currentOrigin}" is whitelisted in your GCP Console under "Authorized JavaScript origins".`;
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
            className={`p-1.5 rounded transition-all relative ${showSettings ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            title="Configure Drive"
          >
            <i className="fas fa-cog"></i>
            {!isConfigured && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          <button 
            onClick={handleDriveImport}
            disabled={isLoading}
            className={`flex items-center text-[10px] font-bold px-3 py-1.5 rounded transition-all ${
              !isConfigured 
              ? 'text-slate-400 bg-slate-50 border border-slate-100' 
              : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-100'
            }`}
          >
            <i className="fab fa-google-drive mr-1.5"></i> Drive
          </button>
          <button 
            onClick={handleExampleLoad}
            disabled={isLoading}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded border border-blue-100 transition-colors"
          >
            Example
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-1">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
            Google OAuth Client ID
            {!isConfigured && <span className="text-amber-600 font-bold italic lowercase tracking-normal">setup required</span>}
          </label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="0000000-xxxx.apps.googleusercontent.com"
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button 
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900 transition-colors uppercase tracking-widest"
            >
              Save
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-white/60 rounded-lg border border-slate-100">
             <p className="text-[10px] font-bold text-slate-600 uppercase mb-2 flex items-center">
               <i className="fas fa-shield-halved mr-1.5 text-blue-400"></i> Project Switch Guide
             </p>
             <div className="mb-2 p-2 bg-blue-50/50 rounded border border-blue-100">
                <p className="text-[9px] text-blue-700 font-bold uppercase mb-1">Authorized JavaScript Origin:</p>
                <div className="flex items-center justify-between">
                   <code className="text-[10px] text-slate-600 font-mono truncate mr-2">{currentOrigin}</code>
                   <button 
                    onClick={handleCopyOrigin}
                    className="text-[9px] px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center shrink-0"
                   >
                     <i className={`fas ${copyStatus === 'copied' ? 'fa-check' : 'fa-copy'} mr-1`}></i>
                     {copyStatus === 'copied' ? 'Copied' : 'Copy'}
                   </button>
                </div>
             </div>
             <ul className="text-[9px] text-slate-500 space-y-1 list-disc pl-3">
               <li>Go to <b>APIs & Services > Credentials</b>.</li>
               <li>Edit your <b>OAuth 2.0 Client ID</b>.</li>
               <li>Paste the URL above into <b>Authorized JavaScript origins</b>.</li>
               <li>Enable <b>Drive</b>, <b>Picker</b>, and <b>Generative Language</b> APIs.</li>
             </ul>
          </div>
        </div>
      )}
      
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
        Input your daily progress. Gemini AI will automatically extract tasks, deadlines, and project links.
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
