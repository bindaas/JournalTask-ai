
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  category: string;
  status: TaskStatus;
  isUrgent: boolean;
  dependencies: string[]; // IDs of other tasks
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export interface ExtractionResult {
  tasks: Task[];
}
