import React, { useState, useMemo } from 'react';
import { Layout, Calendar, List, Settings, ChevronRight, Share2, Plus, Users, User } from 'lucide-react';
import GanttChart from './components/GanttChart';
import TeamHub from './components/TeamHub';
import TaskModal from './components/TaskModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

const TEAM_MEMBERS = [
  { id: 'all', name: 'Project Manager', role: 'Manager' },
  { id: 'sarah', name: 'Sarah Miller', role: 'Design' },
  { id: 'john', name: 'John Doe', role: 'Development' },
  { id: 'alex', name: 'Alex Chen', role: 'DevOps' },
];

const INITIAL_TASKS = [
  { id: 1, name: 'Apply for business via Gov', start: '2026-02-24', end: '2026-03-15', progress: 100, assignee: 'john', dependencies: [] },
  { id: 2, name: 'Apply for DUNS', start: '2026-03-16', end: '2026-03-22', progress: 0, assignee: 'alex', dependencies: [1] },
  { id: 3, name: 'Re-apply for GooglePlay', start: '2026-03-23', end: '2026-03-31', progress: 0, assignee: 'alex', dependencies: [2] },
  { id: 11, name: 'Deploy App - Academic Assessor', start: '2026-04-01', end: '2026-04-05', progress: 0, assignee: 'alex', dependencies: [3] },
  { id: 4, name: 'App - academic assessor', start: '2026-02-17', end: '2026-03-10', progress: 87, assignee: 'sarah', dependencies: [] },
  { id: 5, name: 'App - Dopamine Dungeon', start: '2026-02-24', end: '2026-03-05', progress: 67, assignee: 'sarah', dependencies: [] },
  { id: 6, name: 'App - Anxiety', start: '2026-03-08', end: '2026-03-20', progress: 0, assignee: 'john', dependencies: [] },
  { id: 7, name: 'App - 4', start: '2026-03-15', end: '2026-03-25', progress: 0, assignee: 'john', dependencies: [] },
  { id: 8, name: 'App - 5', start: '2026-03-15', end: '2026-03-25', progress: 0, assignee: 'john', dependencies: [] },
  { id: 9, name: 'Build website - Programme Development', start: '2026-03-01', end: '2026-03-12', progress: 79, assignee: 'john', dependencies: [] },
  { id: 10, name: 'Build website - Software Development', start: '2026-03-05', end: '2026-03-15', progress: 0, assignee: 'john', dependencies: [] },
  { id: 12, name: 'SaaS - LMS', start: '2026-03-15', end: '2026-03-25', progress: 0, assignee: 'john', dependencies: [] },
];

function App() {
  const [activeTab, setActiveTab] = useState('team'); // Default to Team Hub
  const [viewMode, setViewMode] = useState('day');
  const [currentUser, setCurrentUser] = useState(TEAM_MEMBERS[0]); // Default to PM
  const [tasks, setTasks] = useLocalStorage('robcore-tasks', INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = useMemo(() => {
    if (currentUser.id === 'all') return tasks;
    return tasks.filter(task => task.assignee === currentUser.id);
  }, [tasks, currentUser]);

  const handleNewTaskClick = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...taskData, id: selectedTask.id } : t));
    } else {
      const newTask = { ...taskData, id: Date.now() };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setIsModalOpen(false);
  };

  const handleResetTasks = () => {
    if (window.confirm('Reset all tasks to the default screenshot sequence? Current changes will be lost.')) {
      setTasks(INITIAL_TASKS);
      localStorage.removeItem('robcore-tasks');
      window.location.reload();
    }
  };

  const moveTask = (index, direction) => {
    const newTasks = [...tasks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];
    setTasks(newTasks);
  };

  const handleMemberClick = (memberId) => {
    const member = TEAM_MEMBERS.find(m => m.id === memberId);
    if (member) {
      setCurrentUser(member);
      setActiveTab('gantt');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            ROB<span>/</span>CORE
          </div>
        </div>

        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
            <Users size={20} />
            <span>Team Hub</span>
          </button>
          <button className={`nav-item ${activeTab === 'gantt' ? 'active' : ''}`} onClick={() => setActiveTab('gantt')}>
            <Calendar size={20} />
            <span>Gantt Chart</span>
          </button>
        </nav>

        {activeTab === 'gantt' && currentUser.id === 'all' && (
          <div className="sidebar-tasks-reorder">
            <div className="sidebar-label">REORDER TASKS</div>
            <div className="mini-task-list">
              {tasks.map((task, index) => (
                <div key={task.id} className="mini-task-item">
                  <span className="truncate">{task.name}</span>
                  <div className="reorder-controls">
                    <button onClick={() => moveTask(index, 'up')} disabled={index === 0}>▲</button>
                    <button onClick={() => moveTask(index, 'down')} disabled={index === tasks.length - 1}>▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="persona-switcher">
            <div className="persona-label">VIEWING AS</div>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUser(TEAM_MEMBERS.find(m => m.id === e.target.value))}
              className="persona-select"
            >
              {TEAM_MEMBERS.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <button className="nav-item" onClick={handleResetTasks}>
            <Settings size={20} />
            <span>Reset Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <div className="header-title-group">
              <h2 className="project-title">Product Roadmap 2024</h2>
              <div className="breadcrumb">
                <span>Strategy</span>
                <ChevronRight size={14} />
                <span>Q1 Execution</span>
              </div>
            </div>
          </div>

          {/* View Switcher Centered - Only in Gantt */}
          {activeTab === 'gantt' && (
            <div className="view-switcher header-switcher glass">
              {['day', 'week', 'month'].map(mode => (
                <button
                  key={mode}
                  className={viewMode === mode ? 'active' : ''}
                  onClick={() => setViewMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="header-actions">
            <button className="btn-secondary">
              <Share2 size={18} />
              <span>Share</span>
            </button>
            <button className="btn-primary" onClick={handleNewTaskClick}>
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        <section className="chart-view">
          {activeTab === 'team' ? (
            <TeamHub
              members={TEAM_MEMBERS.filter(m => m.id !== 'all')}
              tasks={tasks}
              onMemberClick={handleMemberClick}
            />
          ) : activeTab === 'gantt' ? (
            <div className="gantt-wrapper">
              {currentUser.id !== 'all' && (
                <div className="filter-banner">
                  <User size={14} />
                  <span>Personal View: <strong>{currentUser.name}</strong></span>
                  <button onClick={() => setCurrentUser(TEAM_MEMBERS[0])}>Show All</button>
                </div>
              )}
              <GanttChart
                viewMode={viewMode}
                tasks={filteredTasks}
                onEditTask={handleEditTask}
              />
            </div>
          ) : (
            <div className="placeholder-view">
              <h3>List View Initializing...</h3>
            </div>
          )}
        </section>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        allTasks={tasks}
        teamMembers={TEAM_MEMBERS}
      />
    </div>
  );
}

export default App;
