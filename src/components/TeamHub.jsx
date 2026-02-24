import React, { useMemo } from 'react';
import { User, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import './TeamHub.css';

const TeamHub = ({ members, tasks, onMemberClick }) => {
    const teamStats = useMemo(() => {
        return members.map(member => {
            const memberTasks = tasks.filter(t => t.assignee === member.id);
            const completedTasks = memberTasks.filter(t => t.progress === 100).length;
            const avgProgress = memberTasks.length > 0
                ? Math.round(memberTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / memberTasks.length)
                : 0;

            // Find nearest deadline task
            const focusTask = [...memberTasks].sort((a, b) => new Date(a.end) - new Date(b.end))[0];

            return {
                ...member,
                taskCount: memberTasks.length,
                completedTasks,
                avgProgress,
                focusTask
            };
        });
    }, [members, tasks]);

    const projectCompletion = useMemo(() => {
        if (tasks.length === 0) return 0;
        return Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / tasks.length);
    }, [tasks]);

    return (
        <div className="team-hub">
            <div className="hub-header">
                <div className="project-stats">
                    <div className="stat-card glass">
                        <span className="stat-label">Project Completion</span>
                        <div className="stat-value-group">
                            <span className="stat-value">{projectCompletion}%</span>
                            <div className="mini-progress">
                                <div className="fill" style={{ width: `${projectCompletion}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <span className="stat-label">Active Team Members</span>
                        <span className="stat-value">{members.length}</span>
                    </div>
                </div>
            </div>

            <div className="team-grid">
                {teamStats.map(member => (
                    <div key={member.id} className="member-card glass" onClick={() => onMemberClick(member.id)}>
                        <div className="member-card-header">
                            <div className="avatar">
                                <User size={24} />
                            </div>
                            <div className="member-info">
                                <h4>{member.name}</h4>
                                <span className="member-role">{member.role}</span>
                            </div>
                            <div className="member-badge">
                                {member.avgProgress}% Done
                            </div>
                        </div>

                        <div className="member-workload">
                            <div className="workload-bar">
                                <div className="workload-fill" style={{ width: `${member.avgProgress}%` }}></div>
                            </div>
                            <div className="workload-labels">
                                <span>{member.completedTasks} / {member.taskCount} Tasks Complete</span>
                            </div>
                        </div>

                        {member.focusTask ? (
                            <div className="focus-task">
                                <div className="focus-header">
                                    <Clock size={14} />
                                    <span>Current Focus</span>
                                </div>
                                <div className="focus-name">{member.focusTask.name}</div>
                                <div className="focus-meta">Due {new Date(member.focusTask.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            </div>
                        ) : (
                            <div className="focus-task empty">
                                <span>No active tasks assigned.</span>
                            </div>
                        )}

                        <button className="btn-personal-gantt">
                            <span>View My Gantt</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamHub;
