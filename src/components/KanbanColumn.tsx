import React from 'react';
import { Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, Status } from '../types';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

interface Props {
  status: Status;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask: (status: Status) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const KanbanColumn: React.FC<Props> = ({ status, title, color, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <div className={`kanban-col ${isOver ? 'kanban-col--over' : ''}`}>
      <div className="kanban-col__header">
        <div className="kanban-col__title-row">
          <span className="kanban-col__dot" style={{ background: color }} />
          <span className="kanban-col__title">{title}</span>
          <span className="kanban-col__count">{tasks.length}</span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onAddTask(status)}
          className="kanban-col__add-btn"
          aria-label={`Add task to ${title}`}
        />
      </div>

      <div ref={setNodeRef} className="kanban-col__body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            /* ponytail: Inline add button ceiling; upgrade to custom graphic when marketing assets provided */
            <Empty
              description={<span style={{ color: '#9ca3af', fontSize: 13 }}>No tasks in {title}</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '32px 0 16px' }}
            >
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => onAddTask(status)}
                style={{ fontSize: 12, borderRadius: 6 }}
              >
                Add task
              </Button>
            </Empty>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
