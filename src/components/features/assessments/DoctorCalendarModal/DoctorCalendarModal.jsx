import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, User, Hash } from 'lucide-react';
import './DoctorCalendarModal.css';

const DoctorCalendarModal = ({ onClose, tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group tasks by "today" vs "other" for simpler visualization in this demo
  // In a real app, we'd filter tasks by the selected date
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const renderDays = () => {
    const days = [];
    // Blank days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
      const isSelected = d === selectedDay;
      const hasTasks = isToday && tasks.length > 0;

      days.push(
        <div
          key={d}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasTasks ? 'has-tasks' : ''}`}
          onClick={() => setSelectedDay(d)}
        >
          <span className="day-number">{d}</span>
          {hasTasks && <div className="task-indicator-dot"></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container calendar-modal-container">
        <div className="calendar-modal-header">
          <div className="header-title">
            <Clock size={22} className="header-icon" />
            <h2>Clinical Scheduler</h2>
          </div>
          <button className="close-btn-premium" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="calendar-modal-content">
          <div className="calendar-sidebar">
            <div className="calendar-nav">
              <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <div className="nav-controls">
                <button onClick={prevMonth}><ChevronLeft size={18} /></button>
                <button onClick={nextMonth}><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="calendar-grid-header">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="calendar-grid">
              {renderDays()}
            </div>

            <div className="calendar-stats-simple">
              <div className="stat-item">
                <span className="cal-stat-label">Total Assigned</span>
                <span className="cal-stat-value">{tasks.length}</span>
              </div>
            </div>
          </div>

          <div className="calendar-details-panel">
            <div className="details-header">
              <h3>Upcoming Assignments</h3>
              <span className="date-badge">{monthNames[currentDate.getMonth()]} {selectedDay}</span>
            </div>

            <div className="scheduled-tasks-list">
              {selectedDay === new Date().getDate() ? (
                tasks.length > 0 ? (
                  tasks.map(task => (
                    <div key={task.id} className="calendar-task-card">
                      <div className="task-time-left">{task.time}</div>
                      <div className="task-body-right">
                        <h4>{task.title}</h4>
                        <div className="task-meta-row">
                          <span className="meta-item"><User size={12} /> {task.description.split('•')[0].replace('Patient: ', '')}</span>
                          <span className="meta-item"><Hash size={12} /> {task.description.split('•')[1]?.trim() || 'Ward'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-schedule-state">
                    <p>No clinical tasks scheduled for this date.</p>
                  </div>
                )
              ) : (
                <div className="empty-schedule-state">
                  <p>Select today to view your active clinical assignments.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendarModal;
