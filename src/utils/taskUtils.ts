import type { Priority, Status, Task } from '../types';

export interface TaskFilters {
  search?: string;
  priority?: Priority | '';
  assignee?: string;
  status?: Status | '';
  dueDate?: string;
}

export function computeTaskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === 'backlog').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
}

export function filterTaskList(tasks: Task[], filters: TaskFilters): Task[] {
  const { search = '', priority = '', assignee = '', status = '', dueDate = '' } = filters;
  const q = search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q) && !(t.description && t.description.toLowerCase().includes(q))) {
      return false;
    }
    if (priority && t.priority !== priority) return false;
    if (assignee && t.assignee !== assignee) return false;
    if (status && t.status !== status) return false;
    if (dueDate && (!t.dueDate || t.dueDate > dueDate)) return false;
    return true;
  });
}
