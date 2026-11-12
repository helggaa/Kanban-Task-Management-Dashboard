import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Status, Priority } from '../types';
import { computeTaskStats, filterTaskList } from '../utils/taskUtils';

const STORAGE_KEY = 'kanban_tasks';

const SAMPLE_TASKS: Task[] = [
  {
    id: uuidv4(),
    title: 'Design new landing page',
    description: 'Create wireframes and high-fidelity mockups for the new marketing landing page.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-11-20',
    assignee: 'emilys',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Fix authentication bug',
    description: 'Users are getting logged out unexpectedly. Investigate token refresh logic.',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-11-15',
    assignee: 'john',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Write API documentation',
    description: 'Document all REST endpoints with request/response examples.',
    priority: 'medium',
    status: 'backlog',
    dueDate: '2026-11-30',
    assignee: 'alice',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    priority: 'medium',
    status: 'done',
    dueDate: '2026-11-10',
    assignee: 'emilys',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Conduct user interviews',
    description: 'Interview 5 existing users to gather feedback on the current dashboard UX.',
    priority: 'low',
    status: 'backlog',
    dueDate: '2026-12-05',
    assignee: 'alice',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Optimize database queries',
    description: 'Profile and optimize slow queries identified in the last performance audit.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-11-25',
    assignee: 'john',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function load(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_TASKS;
    return JSON.parse(raw);
  } catch {
    return SAMPLE_TASKS;
  }
}

function save(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export function useTasks() {
  // ponytail: Synchronous localStorage ceiling; upgrade to async state/React Query when remote DB integrated.
  const [tasks, setTasks] = useState<Task[]>(load);
  const [loading] = useState(false);

  useEffect(() => {
    save(tasks);
  }, [tasks]);

  const addTask = useCallback((data: TaskFormData) => {
    const now = new Date().toISOString();
    setTasks((prev) => [
      ...prev,
      { ...data, id: uuidv4(), createdAt: now, updatedAt: now },
    ]);
  }, []);

  const updateTask = useCallback((id: string, data: Partial<TaskFormData>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, status: Status) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const reorderTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const stats = computeTaskStats(tasks);

  const filterTasks = useCallback(
    (search: string, priority: Priority | '', assignee: string, status: Status | '', dueDate: string) =>
      filterTaskList(tasks, { search, priority, assignee, status, dueDate }),
    [tasks]
  );

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, reorderTasks, stats, filterTasks };
}
