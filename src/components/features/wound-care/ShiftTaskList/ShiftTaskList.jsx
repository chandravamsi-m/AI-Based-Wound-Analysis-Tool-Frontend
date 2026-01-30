import { useState, useEffect } from 'react';
import { List, User } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './ShiftTaskList.css';

function ShiftTaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'

  const fetchTasks = async () => {
    try {
      if (loading) setError(null); // Clear error if retrying
      const response = await apiClient.get('/clinical/nurse/tasks/');
      const formatted = response.data.map(t => ({
        id: t.id,
        title: t.title,
        patient: t.patient_name || 'Unknown Patient',
        assignedTo: t.assigned_to_name || 'Unassigned',
        dueTime: t.due_time,
        priority: t.priority,
        priorityColor: t.priority === 'high' ? '#FB2C36' : (t.priority === 'medium' ? '#FE9A00' : '#CAD5E2'),
        status: t.status,
        isCompleted: t.status === 'COMPLETED'
      }));
      setTasks(formatted);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Only set error if we don't have tasks to show (failed initial load)
      if (tasks.length === 0) setError('Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Optimistic UI update
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, isCompleted: newStatus === 'COMPLETED' } : t
    ));

    try {
      await apiClient.patch(`/clinical/nurse/tasks/${taskId}/`, {
        status: newStatus
      });
      // fetchTasks(); // Re-fetch to confirm sync if needed
    } catch (err) {
      console.error('Failed to update task:', err);
      fetchTasks(); // Revert on error
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
          <div className="task-item" style={{ justifyContent: 'center', color: '#64748b' }}>Loading tasks...</div>
        ) : error ? (
          <div className="task-item" style={{ justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#ef4444' }}>
            <span>{error}</span>
            <button onClick={() => { setLoading(true); fetchTasks(); }} style={{ border: 'none', background: 'none', color: '#2d62a8', fontWeight: '600', cursor: 'pointer' }}>Retry</button>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
              <div className="task-item-left">
                <div className="task-checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTaskCompletion(task.id, task.status)}
                    aria-label={`Mark task ${task.title} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
                  />
                </div>
                <div
                  className="task-priority-dot"
                  style={{ background: task.priorityColor }}
                ></div>
                <div className="task-item-content">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h4 className="task-item-title">{task.title}</h4>
                    {task.status === 'MISSED' && <span className="task-status-badge status-missed">MISSED</span>}
                  </div>
                  <p className="task-item-patient">{task.patient}</p>
                  <p className="task-item-assigned" style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={10} /> {task.assignedTo}
                  </p>
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
