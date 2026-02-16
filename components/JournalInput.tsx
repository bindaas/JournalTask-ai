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
      
      const isPolicyError = msg.includes('policy') || msg.includes('comply') || msg.includes('secure') || msg.includes('400') || msg.includes('developer key') || msg.includes('blocked');
      
      if (isPolicyError) {
        setShowSettings(true);
        alert(`CONFIGURATION ERROR DETECTED: 
${error.message}

Please check the 'Security Checklist' in the settings panel (shield icon).`);
      } else {
        alert(error.message || 'An unknown error occurred');
      }
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
            className={`p-2 rounded-lg transition-all relative ${showSettings ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-shield-halved"></i>
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
        <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center">
                <i className="fas fa-triangle-exclamation mr-2"></i> Fix Configuration Errors
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 italic font-medium">Follow these steps to enable AI and Google Drive:</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-red-200 space-y-4 shadow-sm">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-bold border border-red-200">1</div>
                <div className="text-[10px] text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1 uppercase tracking-tighter">Enable APIs (Critical)</p>
                  Go to the <b>API Library</b> in Google Cloud and enable:
                  <ul className="list-disc pl-4 mt-1 font-bold text-slate-700">
                    <li>Generative Language API <span className="text-red-500">(For Gemini)</span></li>
                    <li>Google Picker API <span className="text-blue-500">(For Drive)</span></li>
                    <li>Google Drive API <span className="text-blue-500">(For Drive)</span></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold border border-blue-200">2</div>
                <div className="text-[10px] text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1 uppercase tracking-tighter">Enter Client ID</p>
                  Create a <b>Web Application</b> OAuth Client ID and paste it here:
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="...apps.googleusercontent.com"
                      className="flex-1 px-3 py-2 text-[10px] bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                    />
                    <button onClick={handleSaveConfig} className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase">Save</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold border border-blue-200">3</div>
                <div className="text-[10px] text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1 uppercase tracking-tighter">Origins {"&"} Users</p>
                  In GCP Console:
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Add <b>{currentOrigin}</b> to {"'Authorized JavaScript origins'"}.</li>
                    <li>Add your email to {"'Test users'"} on the OAuth consent screen.</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                <i className="fas fa-key text-amber-500 mt-0.5"></i>
                <div className="text-[9px] text-amber-800 leading-normal">
                  <p className="font-bold uppercase tracking-tight mb-1">Blocked API Key?</p>
                  If you see {"\"Requests to this API are blocked\""}, your key likely has <b>{"\"API Restrictions\""}</b>. Go to Credentials {"\u2192"} Your API Key {"\u2192"} Set to {"\"Don't restrict key\""} or manually add <b>Generative Language API</b>.
                </div>
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
          placeholder="e.g. 2024-10-24: Finished the API draft. Need to prepare for the client demo..."
          className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm leading-relaxed"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center space-y-4 z-10 animate-in fade-in">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Processing Context...</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSync(content)}
        disabled={isLoading || !content.trim()}
        className={`mt-4 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center transition-all ${
          isLoading || !content.trim() 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl active:scale-[0.98]'
        }`}
      >
        <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2.5`}></i>
        {isLoading ? 'Processing' : 'Sync Workspace'}
      </button>
    </div>
  );
};
