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
      
      // Specifically detect the Policy Compliance error string
      const isPolicyError = msg.includes('policy') || msg.includes('comply') || msg.includes('secure') || msg.includes('400');
      
      if (isPolicyError) {
        setShowSettings(true);
        alert(`SECURITY BLOCK: Google has blocked this request because of a configuration mismatch.

Please check the red 'Security Audit' checklist in the settings panel.`);
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
            className={`p-2 rounded-lg transition-all relative ${showSettings ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
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
                <i className="fas fa-triangle-exclamation mr-2"></i> Security Audit Required
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Google's "Policy Compliance" error is fixed via these 3 steps:</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">1. Enter Client ID</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="0000000-xxxx.apps.googleusercontent.com"
                  className="flex-1 px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
                <button 
                  onClick={handleSaveConfig}
                  className="px-4 py-2.5 bg-red-600 text-white text-[10px] font-black rounded-xl hover:bg-red-700 transition-all uppercase"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-red-200 space-y-4 shadow-sm">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-bold border border-red-200">2</div>
                  <div className="text-[10px] text-slate-600 leading-normal">
                    <p className="font-bold text-slate-900">Add Authorized Origin</p>
                    Go to <b>Credentials</b>, edit your Client ID, and add this exact URL to <b>Authorized JavaScript origins</b>:
                    <div className="mt-2 flex items-center bg-slate-50 p-2 rounded border border-slate-200 group">
                      <code className="text-blue-600 font-mono flex-1 truncate mr-2">{currentOrigin}</code>
                      <button onClick={handleCopyOrigin} className="text-[9px] font-black text-blue-600 hover:underline">
                        {copyStatus === 'copied' ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-bold border border-red-200">3</div>
                  <div className="text-[10px] text-slate-600 leading-normal">
                    <p className="font-bold text-slate-900">Add Test User</p>
                    Go to the <b>OAuth consent screen</b> tab. Scroll to <b>Test users</b>, click <b>Add Users</b>, and type your email address.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-[10px] font-bold border border-amber-200">!</div>
                  <div className="text-[10px] text-slate-600 leading-normal italic">
                    <p className="font-bold text-amber-700 uppercase tracking-tighter">Crucial Step:</p>
                    Ensure <b>Authorized redirect URIs</b> is <u>Empty</u>. If there is a URL in that box, delete it.
                  </div>
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
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center space-y-4 z-10">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Processing...</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSync(content)}
        disabled={isLoading || !content.trim()}
        className={`mt-4 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center transition-all ${
          isLoading || !content.trim() 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
        }`}
      >
        <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2.5`}></i>
        {isLoading ? 'Processing' : 'Sync Workspace'}
      </button>
    </div>
  );
};
