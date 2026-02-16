import React, { useState, useEffect, useMemo } from 'react';
import { JournalInput } from './components/JournalInput';
import { TaskCard } from './components/TaskCard';
import { DependencyVisualizer } from './components/DependencyVisualizer';
import { extractTasksFromJournal } from './services/geminiService';
import { Task, TaskStatus } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STORAGE_KEY_TASKS = 'journaltask_ai_tasks';
const STORAGE_KEY_JOURNAL = 'journaltask_ai_content';

const SAMPLES = [
  {
    title: "The Project Sprint",
    icon: "fa-person-running",
    color: "blue",
    content: "2024-11-01: Starting the Alpha phase. First, I need to [Design the Schema]. Once the schema is done, I can [Build the API].\n\nNote: The [Client Demo] is scheduled for Friday. It is [URGENT].",
    description: "Tests dependencies and urgency extraction."
  },
  {
    title: "Mixed Progress",
    icon: "fa-list-check",
    color: "emerald",
    content: "~~Finished the logo design~~\n~~Set up the repository~~\n\nToday's Focus: We need to [Draft the User Guide] by 2024-12-05. Also, don't forget to [Email Sarah] about the budget.",
    description: "Tests status detection (done vs todo) and dates."
  },
  {
    title: "Complex Dependencies",
    icon: "fa-network-wired",
    color: "indigo",
    content: "Monday Update:\n1. [Market Research] - Must be finished before we can [Write Strategy].\n2. [Write Strategy] - This is the blocker for [Final Presentation].\n3. [Book Meeting Room] for the presentation on Wednesday.",
    description: "Tests chained task dependencies."
  }
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journalContent, setJournalContent] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'done' | 'examples'>('all');
  const [error, setError] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const projectId = (process.env as any).GOOGLE_CLOUD_PROJECT || 'Development';

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    const savedContent = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedContent) setJournalContent(savedContent);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY_JOURNAL, journalContent);
  }, [tasks, journalContent]);

  const handleSync = async (content: string) => {
    setJournalContent(content);
    setIsSyncing(true);
    setError(null);
    try {
      const result = await extractTasksFromJournal(content);
      setTasks(result.tasks);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error("Sync Error Details:", err);
      // Attempt to parse the complex JSON error string from Gemini
      try {
        const errorJson = JSON.parse(err.message.substring(err.message.indexOf('{')));
        setError(errorJson);
      } catch {
        setError(err.message || "Failed to process journal.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const loadSample = (content: string) => {
    setJournalContent(content);
    setActiveTab('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSync(content);
  };

  const clearWorkspace = () => {
    if (window.confirm("Are you sure you want to clear all tasks and content?")) {
      setTasks([]);
      setJournalContent('');
      setError(null);
      localStorage.removeItem(STORAGE_KEY_TASKS);
      localStorage.removeItem(STORAGE_KEY_JOURNAL);
    }
  };

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks;
    if (activeTab === 'todo') return tasks.filter(t => t.status === TaskStatus.TODO);
    if (activeTab === 'done') return tasks.filter(t => t.status === TaskStatus.DONE);
    return [];
  }, [tasks, activeTab]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const pending = total - completed;
    const urgent = tasks.filter(t => t.isUrgent && t.status !== TaskStatus.DONE).length;

    const data = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#3b82f6' }
    ];

    return { total, completed, pending, urgent, chartData: data };
  }, [tasks]);

  const isGeminiBlocked = typeof error === 'object' && (error?.error?.message?.includes('blocked') || error?.error?.reason === 'API_KEY_SERVICE_BLOCKED');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <i className="fas fa-sparkles text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">JournalTask AI</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Production Ready</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {lastSyncTime && (
              <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
                Last sync: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button 
              onClick={clearWorkspace}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Clear Workspace"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white ring-2 ring-slate-100 overflow-hidden cursor-pointer hover:ring-blue-200 transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <aside className="lg:col-span-4 sticky lg:top-24 space-y-6">
            <JournalInput onSync={handleSync} isSyncing={isSyncing} initialValue={journalContent} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Productivity Stats</h3>
                <i className="fas fa-chart-line text-slate-300"></i>
              </div>
              
              {tasks.length > 0 ? (
                <>
                  <div className="h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.chartData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {stats.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-slate-800">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Done</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p>
                      <p className="text-xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">High Priority</p>
                      <p className="text-xl font-bold text-red-600">{stats.urgent}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl mb-4">
                    <i className="fas fa-chart-simple"></i>
                  </div>
                  <p className="text-slate-400 text-sm font-medium px-4">Insights will appear here once you sync your journal.</p>
                </div>
              )}
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-900 px-6 py-6 rounded-3xl shadow-lg animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <i className="fas fa-triangle-exclamation text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-xs uppercase tracking-widest text-red-600">Sync Error Detected</h3>
                    <p className="text-sm mt-2 font-medium leading-relaxed">
                      {isGeminiBlocked 
                        ? "Your Gemini API Key is working, but the 'Generative Language API' is blocked in your Google Cloud Project."
                        : (typeof error === 'string' ? error : error.error?.message || "An unknown error occurred")}
                    </p>
                    
                    {isGeminiBlocked && (
                      <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-red-100 space-y-3">
                        <p className="text-xs font-bold text-red-800">Quick Fix Steps:</p>
                        <ol className="text-[11px] space-y-2 text-slate-700 font-medium">
                          <li>1. Go to <a href="https://console.cloud.google.com/apis/library" target="_blank" className="text-blue-600 underline">GCP API Library</a>.</li>
                          <li>2. Search for <b>"Generative Language API"</b>.</li>
                          <li>3. Click <b>ENABLE</b>.</li>
                          <li>4. Wait 2 minutes and click 'Sync Workspace' again.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-xl transition-colors">
                    <i className="fas fa-times text-red-400"></i>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 pt-6 pb-0 flex border-b border-slate-100 space-x-8 overflow-x-auto no-scrollbar scroll-smooth">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative shrink-0 ${activeTab === 'all' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Workspace
                  {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('todo')}
                  className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative shrink-0 ${activeTab === 'todo' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  To-Do
                  {activeTab === 'todo' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('done')}
                  className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative shrink-0 ${activeTab === 'done' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Archive
                  {activeTab === 'done' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('examples')}
                  className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative shrink-0 ${activeTab === 'examples' ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <i className="fas fa-lightbulb mr-2"></i>
                  Examples
                  {tasks.length === 0 && activeTab !== 'examples' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>}
                  {activeTab === 'examples' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full"></div>}
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'examples' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="col-span-full mb-2">
                      <h3 className="text-xl font-black text-slate-800">Learn by Example</h3>
                      <p className="text-sm text-slate-500 mt-1">Select a scenario to see how Gemini AI analyzes and organizes tasks.</p>
                    </div>
                    {SAMPLES.map((sample, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col h-full group hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl bg-${sample.color}-100 text-${sample.color}-600 flex items-center justify-center text-lg`}>
                            <i className={`fas ${sample.icon}`}></i>
                          </div>
                          <h4 className="font-bold text-slate-900">{sample.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 font-medium italic">"{sample.description}"</p>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex-1 mb-6 font-mono text-[11px] text-slate-600 leading-relaxed overflow-hidden">
                          {sample.content.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                        <button 
                          onClick={() => loadSample(sample.content)}
                          className="w-full py-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                        >
                          Use this sample
                        </button>
                      </div>
                    ))}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-200 text-4xl mb-6 transform rotate-6 transition-transform hover:rotate-0">
                        <i className="fas fa-rocket"></i>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-[10px] animate-pulse">
                        <i className="fas fa-star"></i>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Ready to boost your workflow?</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mt-3 text-sm leading-relaxed">
                      Sync your journal entries on the left. Gemini AI will automatically find tasks, deadlines, and project links.
                    </p>
                    <button 
                      onClick={() => setActiveTab('examples')}
                      className="mt-6 text-blue-600 text-xs font-bold hover:underline"
                    >
                      Or view some examples →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-500">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center text-slate-300 italic flex flex-col items-center">
                        <i className="fas fa-clipboard-list text-3xl mb-3 opacity-20"></i>
                        <span>No entries found in this view.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {tasks.length > 0 && activeTab !== 'examples' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-sitemap text-amber-500"></i>
                    <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Dependency Pipeline</h3>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    AI Generated
                  </div>
                </div>
                <DependencyVisualizer tasks={tasks} />
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Cloud Connected: <span className="text-slate-600">{projectId}</span></span>
          </div>
          <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <a href="#" className="hover:text-blue-600">Privacy</a>
             <a href="#" className="hover:text-blue-600">Help Center</a>
             <span className="opacity-50">v1.0.5-Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
