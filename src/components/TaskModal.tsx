import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import type { Task, Priority, Status } from '../types';
import type { TaskFormData } from '../hooks/useTasks';

const { TextArea } = Input;
const { Option } = Select;

interface Props {
  open: boolean;
  task?: Task | null;
  defaultStatus?: Status;
  assignees: string[];
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskModal: React.FC<Props> = ({ open, task, defaultStatus, assignees, onSubmit, onClose }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (task) {
        form.setFieldsValue({
          ...task,
          dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        });
      } else {
        form.resetFields();
        form.setFieldValue('status', defaultStatus ?? 'backlog');
      }
    }
  }, [open, task, defaultStatus, form]);

  // ponytail: Local submitting state ceiling; upgrade to global transaction queue if async server sync added.
  const handleFinish = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      await onSubmit({
        title: (values.title as string).trim(),
        description: (values.description as string).trim(),
        priority: values.priority as Priority,
        status: values.status as Status,
        dueDate: (values.dueDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        assignee: values.assignee as string | undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={task ? 'Edit Task' : 'Add New Task'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }} disabled={submitting}>
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, whitespace: true, message: 'Please enter a task title' },
            { max: 100, message: 'Title cannot exceed 100 characters' },
          ]}
        >
          <Input placeholder="e.g. Implement user authentication" maxLength={100} showCount />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, whitespace: true, message: 'Please enter a task description' },
            { max: 500, message: 'Description cannot exceed 500 characters' },
          ]}
        >
          <TextArea rows={3} placeholder="Describe the task and acceptance criteria..." maxLength={500} showCount />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select a priority' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select priority">
                {PRIORITY_OPTIONS.map((p) => (
                  <Option key={p.value} value={p.value}>
                    <span style={{ color: p.color, fontWeight: 600 }}>● </span>{p.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select a status' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select status">
                {STATUS_OPTIONS.map((s) => (
                  <Option key={s.value} value={s.value}>{s.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: 'Please select a due date' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="assignee" label="Assignee" style={{ flex: 1 }}>
              <Select placeholder="Assign to..." allowClear>
                {assignees.map((a) => (
                  <Option key={a} value={a}>{a}</Option>
                ))}
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
