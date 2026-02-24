import {
    format,
    addDays,
    addWeeks,
    addMonths,
    differenceInCalendarDays,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    parseISO
} from 'date-fns';

/**
 * Ensures a date is safely parsed from either a string or a Date object.
 * ISO strings (YYYY-MM-DD) are parsed as local time to avoid UTC offsets.
 */
const safeParse = (date) => {
    if (date instanceof Date) return date;
    if (typeof date === 'string' && date.includes('-')) {
        return parseISO(date);
    }
    return new Date(date);
};

export const getTimelineItems = (startDate, count, mode) => {
    const items = [];
    const start = safeParse(startDate);
    for (let i = 0; i < count; i++) {
        let date;
        if (mode === 'day') date = addDays(start, i);
        else if (mode === 'week') date = addWeeks(start, i);
        else if (mode === 'month') date = addMonths(start, i);
        items.push(date);
    }
    return items;
};

export const getTaskPos = (taskStart, timelineStart, mode, columnWidth) => {
    const start = safeParse(taskStart);
    const timeline = safeParse(timelineStart);

    // Use CalendarDays to ignore time/timezone shifts
    const diffDays = differenceInCalendarDays(start, timeline);

    if (mode === 'day') {
        return diffDays * columnWidth;
    } else if (mode === 'week') {
        return (diffDays / 7) * columnWidth;
    } else if (mode === 'month') {
        // Approximate days in month for positioning
        return (diffDays / 30.44) * columnWidth;
    }
    return 0;
};

export const getTaskSize = (taskStart, taskEnd, mode, columnWidth) => {
    const start = safeParse(taskStart);
    const end = safeParse(taskEnd);

    const diffDays = differenceInCalendarDays(end, start) + 1;

    if (mode === 'day') {
        return diffDays * columnWidth;
    } else if (mode === 'week') {
        return (diffDays / 7) * columnWidth;
    } else if (mode === 'month') {
        return (diffDays / 30.44) * columnWidth;
    }
    return 0;
};
