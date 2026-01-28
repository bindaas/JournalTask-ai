
import React, { useState, useEffect } from 'react';

interface JournalInputProps {
  onSync: (content: string) => void;
  isSyncing: boolean;
  initialValue?: string;
}

export const JournalInput: React.FC<JournalInputProps> = ({ onSync, isSyncing, initialValue = '' }) => {
  const [content, setContent] = useState(initialValue);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleExampleLoad = () => {
    const example = `2024-05-15:
- ~~Update the team sync calendar~~
- Prepare the Q3 Roadmap presentation [URGENT].
- Research new GCP deployment strategies.
- Need to approve the design mockups before starting front-end development.
- Buy office supplies.`;
    setContent(example);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <i className="fas fa-feather-pointed mr-2 text-blue-500"></i>
          Journal Context
        </h2>
        <button 
          onClick={handleExampleLoad}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors"
        >
          Try Example
        </button>
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        AI will analyze your text to extract tasks, dates, and dependencies.
      </p>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? List your progress and upcoming tasks..."
          className="w-full h-56 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm leading-relaxed"
        />
        {isSyncing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center space-y-3 z-10">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">AI Thinking...</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSync(content)}
        disabled={isSyncing || !content.trim()}
        className={`mt-4 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center transition-all ${
          isSyncing || !content.trim() 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] shadow-blue-200/50 shadow-md'
        }`}
      >
        <i className={`fas ${isSyncing ? 'fa-circle-notch fa-spin' : 'fa-magic'} mr-2`}></i>
        {isSyncing ? 'Processing Journal...' : 'Update Workspace'}
      </button>

      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center text-[10px] text-slate-400 uppercase font-bold">
          <i className="fas fa-lock mr-1.5"></i>
          Securely Handled
        </div>
        <div className="flex items-center text-[10px] text-slate-400 uppercase font-bold">
          <i className="fas fa-bolt mr-1.5 text-amber-400"></i>
          Gemini 3 Pro
        </div>
      </div>
    </div>
  );
};
