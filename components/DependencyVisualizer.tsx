
import React from 'react';
import { Task } from '../types';

interface DependencyVisualizerProps {
  tasks: Task[];
}

export const DependencyVisualizer: React.FC<DependencyVisualizerProps> = ({ tasks }) => {
  const dependentTasks = tasks.filter(t => t.dependencies.length > 0);

  if (dependentTasks.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 italic text-sm">
        No task dependencies detected.
      </div>
    );
  }

  return (
    <div className="p-4 overflow-x-auto">
      <div className="min-w-max flex flex-col gap-4">
        {dependentTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              {task.dependencies.map(depId => {
                const dep = tasks.find(t => t.id === depId);
                return (
                  <div key={depId} className="px-3 py-1 bg-slate-100 rounded border border-slate-200 text-xs font-medium text-slate-600">
                    {dep?.title || depId}
                  </div>
                );
              })}
            </div>
            <div className="text-slate-300">
              <i className="fas fa-long-arrow-alt-right fa-lg"></i>
            </div>
            <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-semibold text-blue-800 shadow-sm">
              {task.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
