import { useState, useEffect } from 'react';
import { List, User, Heart, Camera, Clipboard, AlertCircle } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './ShiftTaskList.css';

function ShiftTaskList({ onTaskAction, refreshTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'

  const fetchTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await apiClient.get('/clinical/nurse/tasks/');
      const formatted = response.data.map(t => ({
        id: t.id,
        title: t.title,
        patient: t.patient_name || 'Unknown Patient',
        patientId: t.patient_id,
        assignedTo: t.assigned_to_name || 'Unassigned',
        dueTime: t.due_time,
        priority: t.priority,
        priorityColor: t.priority === 'HIGH' ? '#FB2C36' : (t.priority === 'MEDIUM' ? '#FE9A00' : '#CAD5E2'),
        status: t.status,
        taskType: t.task_type || 'GEN',
        isCompleted: t.status === 'COMPLETED'
      }));
      setTasks(formatted);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (tasks.length === 0) setError('Unable to sync tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchTasks(false);
    }
  }, [refreshTrigger]);

  const toggleTaskCompletion = async (e, taskId, currentStatus) => {
    e.stopPropagation(); // Avoid triggering the modal
    if (currentStatus === 'COMPLETED') return;

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', isCompleted: true } : t)
    );

    try {
      await apiClient.post(`/clinical/nurse/tasks/${taskId}/complete/`);
    } catch (err) {
      console.error('Failed to complete task:', err);
      fetchTasks(false);
    }
  };

  const handleTaskClick = (task) => {
    if (task.status === 'COMPLETED') return;

    // Dynamic Clinical Workflow Triggers
    if (onTaskAction) {
      onTaskAction(task);
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'VITALS': return <Heart size={16} color="#ef4444" />;
      case 'WOUND_CARE': return <Camera size={16} color="#2f65ac" />;
      default: return <Clipboard size={16} color="#64748b" />;
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.status === 'PENDING' || t.status === 'MISSED';
    if (filter === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="shift-task-list">
      <div className="task-list-header">
        <div className="task-list-title-wrapper">
          <List size={16} />
          <h3 className="task-list-title">SHIFT TASK LIST</h3>
        </div>
        <div className="task-list-badge">
          <span>{tasks.filter(t => t.status === 'PENDING').length} PENDING</span>
        </div>
      </div>

      <div className="task-tabs">
        <button className={`task-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`task-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        <button className={`task-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Tasks</button>
      </div>

      <div className="task-list-items">
        {loading && tasks.length === 0 ? (
          <div className="task-item" style={{ justifyContent: 'center', color: '#64748b' }}>Establishing clinical sync...</div>
        ) : error ? (
          <div className="task-item" style={{ justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#ef4444' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => fetchTasks()} style={{ border: 'none', background: 'none', color: '#2d62a8', fontWeight: '600', cursor: 'pointer' }}>Retry Sync</button>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.isCompleted ? 'completed' : ''} ${task.taskType !== 'GEN' ? 'interactive' : ''}`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="task-item-left">
                <div className="task-checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.isCompleted}
                    onChange={(e) => toggleTaskCompletion(e, task.id, task.status)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div
                  className="task-priority-dot"
                  style={{ background: task.priorityColor }}
                ></div>
                <div className="task-item-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getTaskIcon(task.taskType)}
                    <h4 className="task-item-title">{task.title}</h4>
                    {task.status === 'MISSED' && <span className="task-status-badge status-missed">MISSED</span>}
                  </div>
                  <p className="task-item-patient">{task.patient}</p>
                </div>
              </div>
              <div className="task-item-due">
                <span>{task.dueTime}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="task-item" style={{ justifyContent: 'center', color: '#94a3b8' }}>No tasks in this view.</div>
        )}
      </div>
    </div>
  );
}

export default ShiftTaskList;
