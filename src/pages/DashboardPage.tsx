import { useState, useMemo } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Button, Input, Select, Avatar, Dropdown, DatePicker, Drawer, Typography, Space, Popconfirm, Empty, Spin, App, Layout } from 'antd';
import dayjs from 'dayjs';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { Task, Status, Priority } from '../types';
import { useTasks } from '../hooks/useTasks';
import { filterTaskList } from '../utils/taskUtils';
import { useAuth } from '../contexts/AuthContext';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import type { TaskFormData } from '../hooks/useTasks';
import './DashboardPage.css';

const { Option } = Select;
const { Text } = Typography;
const { Header, Sider, Content } = Layout;

const COLUMNS: { status: Status; title: string; color: string }[] = [
  { status: 'backlog',     title: 'Backlog',      color: '#9ca3af' },
  { status: 'todo',        title: 'To Do',        color: '#3b82f6' },
  { status: 'in_progress', title: 'In Progress',  color: '#f59e0b' },
  { status: 'done',        title: 'Done',         color: '#22c55e' },
];

const ASSIGNEES = ['emilys', 'john', 'alice', 'bob', 'carol'];

type NavKey = 'dashboard' | 'my_tasks' | 'settings';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { message } = App.useApp();
  const { tasks, loading, addTask, updateTask, deleteTask, moveTask, reorderTasks, stats } = useTasks();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editingTask, setEditingTask]   = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [activeTask, setActiveTask]     = useState<Task | null>(null);
  const [activeNav, setActiveNav]       = useState<NavKey>('dashboard');
  const [mobileOpen, setMobileOpen]     = useState(false);

  // Filters
  const [search, setSearch]           = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStatus, setFilterStatus]   = useState<Status | ''>('');
  const [filterDueDate, setFilterDueDate] = useState('');

  const hasFilters = !!(search || filterPriority || filterAssignee || filterStatus || filterDueDate);

  const clearFilters = () => {
    setSearch(''); setFilterPriority(''); setFilterAssignee(''); setFilterStatus(''); setFilterDueDate('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredTasks = useMemo(() =>
    filterTaskList(tasks, {
      search,
      priority: filterPriority,
      assignee: activeNav === 'my_tasks' && user?.username ? user.username : filterAssignee,
      status: filterStatus,
      dueDate: filterDueDate,
    }),
    [tasks, activeNav, user?.username, search, filterPriority, filterAssignee, filterStatus, filterDueDate]
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = { backlog: [], todo: [], in_progress: [], done: [] };
    filteredTasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [filteredTasks]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === String(active.id)) ?? null);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const overId = String(over.id);
    const overIsCol = COLUMNS.some((c) => c.status === overId);
    const activeT = tasks.find((t) => t.id === String(active.id));
    if (!activeT) return;
    if (overIsCol && activeT.status !== overId) {
      moveTask(activeT.id, overId as Status);
    } else {
      const overT = tasks.find((t) => t.id === overId);
      if (overT && overT.status !== activeT.status) moveTask(activeT.id, overT.status);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;
    const overId = String(over.id);
    const overIsCol = COLUMNS.some((c) => c.status === overId);
    if (!overIsCol) {
      const activeT = tasks.find((t) => t.id === String(active.id));
      const overT   = tasks.find((t) => t.id === overId);
      if (activeT && overT) {
        const oi = tasks.findIndex((t) => t.id === activeT.id);
        const ni = tasks.findIndex((t) => t.id === overT.id);
        if (oi !== -1 && ni !== -1 && oi !== ni) {
          reorderTasks(arrayMove(tasks, oi, ni));
        }
      }
    }
  };

  const openAdd = (status: Status) => { setEditingTask(null); setDefaultStatus(status); setModalOpen(true); };
  const openEdit = (task: Task)    => { setEditingTask(task); setModalOpen(true); };

  // ponytail: In-memory notification ceiling; upgrade to error telemetry if logging backend added.
  const handleSubmit = (data: TaskFormData) => {
    try {
      if (editingTask) {
        updateTask(editingTask.id, data);
        message.success('Task updated successfully');
      } else {
        addTask(data);
        message.success('Task created successfully');
      }
    } catch {
      message.error('Failed to save task.');
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteTask(id);
      message.info('Task deleted');
    } catch {
      message.error('Failed to delete task.');
    }
  };

  const NAV_ITEMS: { key: NavKey; icon: React.ReactNode; label: string }[] = [
    { key: 'dashboard', icon: <AppstoreOutlined />,      label: 'Dashboard' },
    { key: 'my_tasks',  icon: <UnorderedListOutlined />, label: 'My Tasks'  },
    { key: 'settings',  icon: <SettingOutlined />,       label: 'Settings'  },
  ];

  const PAGE_TITLES: Record<NavKey, string> = {
    dashboard: 'Dashboard',
    my_tasks:  'My Tasks',
    settings:  'Settings',
  };

  const renderSidebar = () => (
    <>
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">K</div>
        <span className="sidebar__logo-text">KanbanFlow</span>
      </div>

      <div className="sidebar__section-label">Workspace</div>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ key, icon, label }) => (
          <div
            key={key}
            className={`sidebar__nav-item ${activeNav === key ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => { setActiveNav(key); setMobileOpen(false); }}
            role="button"
            tabIndex={0}
            aria-current={activeNav === key ? 'page' : undefined}
          >
            {icon} {label}
          </div>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__user">
          <Avatar src={user?.image} icon={<UserOutlined />} size={32} />
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.firstName} {user?.lastName}</span>
            <span className="sidebar__user-role">@{user?.username}</span>
          </div>
        </div>

        <div
          className="sidebar__nav-item sidebar__nav-logout"
          onClick={logout}
          role="button"
          tabIndex={0}
        >
          <LogoutOutlined /> Logout
        </div>
      </div>
    </>
  );

  return (
    <Layout className="dashboard">
      {/* Desktop sidebar */}
      <Sider
        className="sidebar desktop-sider"
        width={220}
        theme="light"
        trigger={null}
      >
        {renderSidebar()}
      </Sider>

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        placement="left"
        width={220}
        closable={false}
        styles={{ body: { padding: 0, background: '#fff' } }}
      >
        <div className="sidebar" style={{ position: 'static', height: '100%', display: 'flex', width: '100%' }}>
          {renderSidebar()}
        </div>
      </Drawer>

      {/* Main content */}
      <Layout className="dashboard__main">
        {/* Top header */}
        <Header className="dashboard__header">
          <div className="dashboard__header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            />
            <h1 className="dashboard__page-title">{PAGE_TITLES[activeNav]}</h1>
          </div>

          <div className="dashboard__header-right">
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: `${user?.firstName} ${user?.lastName}`, disabled: true },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Sign out', danger: true, onClick: logout },
                ],
              }}
              trigger={['click']}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '4px 6px', borderRadius: 7, transition: 'background 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar src={user?.image} icon={<UserOutlined />} size={26} />
                <Text style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{user?.firstName}</Text>
              </div>
            </Dropdown>

            {activeNav !== 'settings' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openAdd('todo')}
                className="dashboard__add-btn"
              >
                New task
              </Button>
            )}
          </div>
        </Header>

        <Content className="dashboard__content">

        {/* Stats bar */}
        {activeNav !== 'settings' && (
          <div className="dashboard__stats">
            <div className="stat-block">
              <span className="stat-block__label">Total</span>
              <span className="stat-block__value">{stats.total}</span>
            </div>
            <div className="stat-block">
              <span className="stat-block__label">
                <span className="stat-block__indicator" style={{ background: '#9ca3af' }} />
                Backlog
              </span>
              <span className="stat-block__value">{stats.backlog}</span>
            </div>
            <div className="stat-block">
              <span className="stat-block__label">
                <span className="stat-block__indicator" style={{ background: '#f59e0b' }} />
                In Progress
              </span>
              <span className="stat-block__value">{stats.inProgress}</span>
            </div>
            <div className="stat-block">
              <span className="stat-block__label">
                <span className="stat-block__indicator" style={{ background: '#22c55e' }} />
                Done
              </span>
              <span className="stat-block__value">{stats.done}</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        {activeNav !== 'settings' && (
          <div className="dashboard__toolbar">
            <Input
              className="toolbar-search"
              placeholder="Search tasks…"
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              aria-label="Search tasks"
            />
            <div className="toolbar-divider" />
            <Space size={6} wrap>
              <Select
                className="filter-select"
                placeholder="Priority"
                value={filterPriority || undefined}
                onChange={(v) => setFilterPriority(v ?? '')}
                allowClear
                aria-label="Filter by priority"
              >
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
              <Select
                className="filter-select"
                placeholder="Assignee"
                value={filterAssignee || undefined}
                onChange={(v) => setFilterAssignee(v ?? '')}
                allowClear
                aria-label="Filter by assignee"
              >
                {ASSIGNEES.map((a) => <Option key={a} value={a}>{a}</Option>)}
              </Select>
              <Select
                className="filter-select"
                placeholder="Status"
                value={filterStatus || undefined}
                onChange={(v) => setFilterStatus(v ?? '')}
                allowClear
                aria-label="Filter by status"
              >
                <Option value="backlog">Backlog</Option>
                <Option value="todo">To Do</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="done">Done</Option>
              </Select>
              <DatePicker
                className="filter-date"
                placeholder="Due before…"
                value={filterDueDate ? dayjs(filterDueDate) : null}
                onChange={(d) => setFilterDueDate(d ? d.format('YYYY-MM-DD') : '')}
                allowClear
                aria-label="Filter by due date"
              />
              {hasFilters && (
                <Button
                  className="toolbar-clear"
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </Space>
          </div>
        )}

        {/* Content area */}
        {activeNav === 'settings' ? (
          <div className="settings-panel">
            <div className="settings-panel__card">
              <div className="settings-panel__title">Profile</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <Avatar src={user?.image} icon={<UserOutlined />} size={48} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>@{user?.username} · {user?.email}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f0f0ef', paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                  Task data is stored in your browser's local storage.
                </div>
                <Popconfirm
                  title="Reset sample tasks?"
                  description="This will restore default sample tasks. Any custom modifications will be lost."
                  okText="Reset Data"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => {
                    localStorage.removeItem('kanban_tasks');
                    message.success('Sample tasks restored');
                    setTimeout(() => window.location.reload(), 300);
                  }}
                >
                  <Button danger size="small">Reset task data</Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="board-state-wrap">
            <Spin size="large" tip="Loading tasks..." />
          </div>
        ) : filteredTasks.length === 0 ? (
          /* ponytail: Static empty state ceiling; upgrade to custom graphic when asset pipeline integrated */
          <div className="board-state-wrap">
            <Empty
              image={hasFilters ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT}
              description={
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                  {hasFilters ? 'No tasks match your active filters.' : 'No tasks in this workspace yet.'}
                </span>
              }
            >
              {hasFilters ? (
                <Button onClick={clearFilters}>Clear filters</Button>
              ) : (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd('todo')}>
                  Create first task
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <div className="board-wrap">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="kanban-board__columns">
                {COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.status}
                    {...col}
                    tasks={tasksByStatus[col.status]}
                    onAddTask={openAdd}
                    onEditTask={openEdit}
                    onDeleteTask={handleDelete}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeTask && (
                  <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        )}
        </Content>
      </Layout>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        assignees={ASSIGNEES}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />
    </Layout>
  );
}
