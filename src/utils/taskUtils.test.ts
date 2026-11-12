import { computeTaskStats, filterTaskList } from './taskUtils.ts';
import type { Task } from '../types/index.ts';

function assertEq(actual: unknown, expected: unknown, msg: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const sample: Task[] = [
  { id: '1', title: 'Build Login', description: 'Auth', priority: 'high', status: 'done', dueDate: '2026-11-10', assignee: 'emilys', createdAt: '', updatedAt: '' },
  { id: '2', title: 'Kanban Drag', description: 'DnD', priority: 'medium', status: 'in_progress', dueDate: '2026-11-15', assignee: 'john', createdAt: '', updatedAt: '' },
  { id: '3', title: 'Write Docs', description: 'Docs', priority: 'low', status: 'backlog', dueDate: '2026-11-20', assignee: 'emilys', createdAt: '', updatedAt: '' },
];

assertEq(computeTaskStats(sample), { total: 3, backlog: 1, todo: 0, inProgress: 1, done: 1 }, 'stats');
assertEq(computeTaskStats([]), { total: 0, backlog: 0, todo: 0, inProgress: 0, done: 0 }, 'empty stats');
assertEq(filterTaskList(sample, { search: 'login' }).length, 1, 'search title');
assertEq(filterTaskList(sample, { search: 'auth' }).length, 1, 'search description');
assertEq(filterTaskList(sample, { assignee: 'emilys', priority: 'low' }).length, 1, 'assignee+priority');
assertEq(filterTaskList(sample, { dueDate: '2026-11-15', status: 'in_progress' }).length, 1, 'due+status');
assertEq(filterTaskList(sample, { search: 'nonexistent' }).length, 0, 'empty');
assertEq(filterTaskList([], { search: 'anything' }).length, 0, 'empty list filter');

console.log('taskUtils checks passed');
