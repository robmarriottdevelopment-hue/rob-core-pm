import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import './TaskModal.css';

const TaskModal = ({ isOpen, onClose, onSave, onDelete, task, allTasks, teamMembers }) => {
    const [formData, setFormData] = useState({
        name: '',
        start: '',
        end: '',
        progress: 0,
        assignee: 'all',
        dependencies: []
    });

    useEffect(() => {
        if (task) {
            setFormData({
                ...task,
                progress: task.progress || 0,
                assignee: task.assignee || 'all'
            });
        } else {
            setFormData({
                name: '',
                start: new Date().toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
                progress: 0,
                assignee: 'all',
                dependencies: []
            });
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'progress' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleDependencyToggle = (id) => {
        setFormData(prev => {
            const deps = prev.dependencies.includes(id)
                ? prev.dependencies.filter(d => d !== id)
                : [...prev.dependencies, id];
            return { ...prev, dependencies: deps };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <div className="modal-header">
                    <h3>{task ? 'Edit Task' : 'New Task'}</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Task Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Design System"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="start"
                                value={formData.start}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                name="end"
                                value={formData.end}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Assignee</label>
                            <select
                                name="assignee"
                                value={formData.assignee}
                                onChange={handleChange}
                                required
                            >
                                <option value="all">Unassigned</option>
                                {teamMembers.filter(m => m.id !== 'all').map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Percentage Complete ({formData.progress}%)</label>
                            <input
                                type="range"
                                name="progress"
                                min="0"
                                max="100"
                                value={formData.progress}
                                onChange={handleChange}
                                className="progress-slider"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dependencies (Prerequisites)</label>
                        <div className="dependency-list">
                            {allTasks.filter(t => t.id !== task?.id).map(t => (
                                <label key={t.id} className="dependency-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.dependencies.includes(t.id)}
                                        onChange={() => handleDependencyToggle(t.id)}
                                    />
                                    <span>{t.name}</span>
                                </label>
                            ))}
                            {allTasks.length <= 1 && <p className="empty-text">No other tasks to link yet.</p>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        {task && (
                            <button type="button" className="btn-delete" onClick={() => onDelete(task.id)}>
                                <Trash2 size={18} />
                                <span>Delete</span>
                            </button>
                        )}
                        <div className="footer-right">
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-primary">Save Task</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
