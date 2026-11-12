import React from 'react';
import { Tag, Typography, Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import './TaskCard.css';

const { Text } = Typography;

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
};

const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const TODAY = new Date().toISOString().slice(0, 10);

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<Props> = ({ task, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverdue = task.status !== 'done' && Boolean(task.dueDate && task.dueDate < TODAY);

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}>
      <div className="task-card__drag-handle" {...attributes} {...listeners} aria-label="Drag task">
        ⠿
      </div>

      <div className="task-card__body">
        <div className="task-card__header">
          <div className="task-card__tags">
            <Tag className={`priority-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</Tag>
            <Tag className={`status-${task.status}`}>{STATUS_LABEL[task.status]}</Tag>
          </div>
          <div className="task-card__actions">
            <Tooltip title="Edit" mouseEnterDelay={0.5}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(task)}
                aria-label="Edit task"
              />
            </Tooltip>
            {/* ponytail: Popconfirm ceiling; upgrade to Modal.confirm if batch multi-task deletion added. */}
            <Popconfirm
              title="Delete this task?"
              description="Are you sure you want to delete this task? This action cannot be undone."
              onConfirm={() => onDelete(task.id)}
              okText="Delete"
              okButtonProps={{ danger: true, size: 'small' }}
              cancelText="Cancel"
              cancelButtonProps={{ size: 'small' }}
              placement="topRight"
            >
              <Tooltip title="Delete" mouseEnterDelay={0.5}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label="Delete task"
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>

        <Text className="task-card__title">{task.title}</Text>
        <Text className="task-card__desc" type="secondary">{task.description}</Text>

        <div className="task-card__meta">
          {task.assignee && (
            <span className="task-card__meta-item">
              <UserOutlined />
              {task.assignee}
            </span>
          )}
          <span className={`task-card__meta-item ${isOverdue ? 'task-card__meta-item--overdue' : ''}`}>
            <CalendarOutlined />
            {task.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
