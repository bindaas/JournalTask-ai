
import React from 'react';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const isDone = task.status === TaskStatus.DONE;

  return (
    <div className={`p-4 rounded-xl border bg-white shadow-sm task-card ${task.isUrgent ? 'highlight-red border-red-200' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-600">
          {task.category}
        </span>
        {task.isUrgent && (
          <span className="flex items-center text-red-600 text-[10px] font-bold uppercase animate-pulse">
            <i className="fas fa-fire-alt mr-1"></i> Urgent
          </span>
        )}
      </div>
      
      <h3 className={`text-lg font-semibold text-slate-800 ${isDone ? 'strike-through' : ''}`}>
        {task.title}
      </h3>
      
      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
        {task.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center text-xs text-slate-400">
          <i className="far fa-calendar-alt mr-1.5"></i>
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
        </div>

        {task.dependencies.length > 0 && (
          <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            <i className="fas fa-link mr-1"></i>
            {task.dependencies.length} deps
          </div>
        )}
      </div>

      {isDone && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <span className="text-emerald-500 text-xs font-medium flex items-center">
            <i className="fas fa-check-circle mr-1"></i> Completed
          </span>
        </div>
      )}
    </div>
  );
};
