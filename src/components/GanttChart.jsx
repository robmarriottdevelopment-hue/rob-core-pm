import React, { useMemo, useEffect, useRef } from 'react';
import { format, subMonths, subDays, addMonths, isToday, differenceInDays, startOfDay } from 'date-fns';
import { getTimelineItems, getTaskPos, getTaskSize } from '../utils/dateUtils';
import './GanttChart.css';

const COLUMN_WIDTHS = {
    day: 40,
    week: 100,
    month: 150
};

const ROW_HEIGHT = 48;

const GanttChart = ({ viewMode, tasks, onEditTask }) => {
    const scrollContainerRef = useRef(null);
    const today = useMemo(() => startOfDay(new Date()), []);

    // Shift timeline start to provide 3 months of history
    const timelineStart = useMemo(() => subMonths(today, 3), [today]);

    const columnWidth = COLUMN_WIDTHS[viewMode];

    // Increase itemsCount to cover history + future (~6 months total)
    const itemsCount = useMemo(() => {
        if (viewMode === 'day') return 180;
        if (viewMode === 'week') return 52;
        return 24;
    }, [viewMode]);

    const timelineItems = useMemo(() => getTimelineItems(timelineStart, itemsCount, viewMode), [timelineStart, itemsCount, viewMode]);
    const chartWidth = itemsCount * columnWidth;

    const todayX = useMemo(() => {
        return getTaskPos(today, timelineStart, viewMode, columnWidth);
    }, [today, timelineStart, viewMode, columnWidth]);

    // Auto-scroll to Today with 8-day lead (matching screenshot)
    useEffect(() => {
        if (scrollContainerRef.current && todayX > 0) {
            setTimeout(() => {
                const leadDays = viewMode === 'day' ? 8 : (viewMode === 'week' ? 2 : 1);
                const scrollTarget = todayX - (leadDays * columnWidth);
                scrollContainerRef.current.scrollLeft = Math.max(0, scrollTarget);
            }, 100); // Slight delay for rendering stability
        }
    }, [viewMode, todayX, columnWidth]);

    const monthGroups = useMemo(() => {
        const groups = [];
        timelineItems.forEach((date) => {
            const monthYear = format(date, 'MMMM yyyy');
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.label === monthYear) {
                lastGroup.count++;
            } else {
                groups.push({ label: monthYear, count: 1 });
            }
        });
        return groups;
    }, [timelineItems]);

    return (
        <div className="gantt-container">
            <div className="task-sidebar">
                <div className="sidebar-column-header">
                    <span>TASK NAME</span>
                </div>
                <div className="task-rows">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="task-name-row"
                            style={{ height: ROW_HEIGHT }}
                            onClick={() => onEditTask(task)}
                        >
                            <div className="task-name-with-progress">
                                <span className="name">{task.name}</span>
                                <span className="progress-badge">{task.progress || 0}%</span>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && <div className="empty-sidebar-text">No tasks created.</div>}
                </div>
            </div>

            <div className="chart-canvas-container" ref={scrollContainerRef}>
                <div className="timeline-header-container" style={{ width: chartWidth }}>
                    <div className="month-header">
                        {monthGroups.map((group, idx) => (
                            <div
                                key={idx}
                                className="month-group"
                                style={{ width: group.count * columnWidth }}
                            >
                                {group.label}
                            </div>
                        ))}
                    </div>

                    <div className="units-header">
                        {timelineItems.map((date, idx) => (
                            <div key={idx} className={`timeline-unit ${isToday(date) ? 'today-unit' : ''}`} style={{ width: columnWidth }}>
                                {viewMode === 'day' && (
                                    <>
                                        <span className="unit-top">{format(date, 'EEE')}</span>
                                        <span className={`unit-bottom ${isToday(date) ? 'today-text' : ''}`}>{format(date, 'd')}</span>
                                    </>
                                )}
                                {viewMode === 'week' && (
                                    <>
                                        <span className="unit-top">Week</span>
                                        <span className="unit-bottom">{idx + 1}</span>
                                    </>
                                )}
                                {viewMode === 'month' && (
                                    <span className="unit-bottom" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{format(date, 'yyyy')}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-canvas" style={{ width: chartWidth, height: Math.max(tasks.length * ROW_HEIGHT, 600) }}>
                    <div className="grid-layer">
                        {timelineItems.map((_, idx) => (
                            <div key={idx} className="grid-line" style={{ left: idx * columnWidth, width: columnWidth }} />
                        ))}
                    </div>

                    {/* Today Indicator Line */}
                    {todayX >= 0 && todayX <= chartWidth && (
                        <div className="today-line" style={{ left: todayX }}>
                            <div className="today-label">TODAY</div>
                        </div>
                    )}

                    <div className="bars-layer">
                        {tasks.map((task, idx) => {
                            const left = getTaskPos(new Date(task.start), timelineStart, viewMode, columnWidth);
                            const width = getTaskSize(new Date(task.start), new Date(task.end), viewMode, columnWidth);
                            const progressWidth = (task.progress || 0);
                            const isShort = width < 120;

                            return (
                                <div
                                    key={task.id}
                                    className="task-bar-row"
                                    style={{ height: ROW_HEIGHT, top: idx * ROW_HEIGHT }}
                                >
                                    <div
                                        className={`task-bar ${isShort ? 'bar-short' : ''}`}
                                        style={{ left, width }}
                                        onClick={() => onEditTask(task)}
                                    >
                                        <div className="task-bar-progress" style={{ width: `${progressWidth}%` }}></div>
                                        <span className="task-bar-label">{task.name} <span className="label-pct">{task.progress || 0}%</span></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <svg className="links-layer" style={{ width: chartWidth, height: Math.max(tasks.length * ROW_HEIGHT, 600) }}>
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-primary)" />
                            </marker>
                        </defs>
                        {tasks.flatMap((task, idx) =>
                            task.dependencies.map(depId => {
                                const depIdx = tasks.findIndex(t => t.id === depId);
                                if (depIdx === -1) return null;

                                const fromTask = tasks[depIdx];
                                const fromX = getTaskPos(new Date(fromTask.start), timelineStart, viewMode, columnWidth) + getTaskSize(new Date(fromTask.start), new Date(fromTask.end), viewMode, columnWidth);
                                const fromY = depIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

                                const toX = getTaskPos(new Date(task.start), timelineStart, viewMode, columnWidth);
                                const toY = idx * ROW_HEIGHT + ROW_HEIGHT / 2;

                                const isBackwards = toX < fromX;
                                const strokeColor = isBackwards ? '#ff9800' : 'var(--accent-primary)';

                                // Adjust control points based on direction
                                const cp1X = isBackwards ? fromX + 15 : fromX + 30;
                                const cp2X = isBackwards ? toX - 15 : toX - 30;

                                return (
                                    <path
                                        key={`link-${depId}-${task.id}-${viewMode}`}
                                        d={`M ${fromX} ${fromY} C ${cp1X} ${fromY}, ${cp2X} ${toY}, ${toX} ${toY}`}
                                        stroke={strokeColor}
                                        strokeWidth="2"
                                        strokeDasharray={isBackwards ? "4 2" : "none"}
                                        fill="none"
                                        opacity={isBackwards ? "0.6" : "0.4"}
                                        markerEnd="url(#arrowhead)"
                                    />
                                );
                            })
                        )}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
