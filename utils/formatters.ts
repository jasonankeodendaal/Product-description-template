export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatDurationHHMMSS = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatMsToHM = (ms: number): string => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
};

export const msToDecimalHours = (ms: number): number => {
    if (ms < 0) return 0;
    return ms / (1000 * 60 * 60);
};

export const formatIsoToTime = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatIsoToDate = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatIsoToReadableDateTime = (isoString?: string): string => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateGroup = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (date.getTime() >= startOfToday.getTime()) {
        return "Today";
    }
    if (date.getTime() >= startOfYesterday.getTime()) {
        return "Yesterday";
    }

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Assuming Sunday is the start of the week
    if (date.getTime() >= startOfWeek.getTime()) {
        return "This Week";
    }
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    if (date.getTime() >= startOfLastWeek.getTime()) {
        return "Last Week";
    }

    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
        return "This Month";
    }

    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getWeekRangeText = (date: Date): string => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Saturday

    const startMonth = start.toLocaleString('default', { month: 'short' });
    const endMonth = end.toLocaleString('default', { month: 'short' });

    if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
};

export const getMonthRangeText = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const formatRelativeTime = (isoString: string): string => {
    const now = new Date();
    const past = new Date(isoString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Check if the date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (past.getTime() >= today.getTime()) {
      return past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (diffInDays === 1) return `Yesterday`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return past.toLocaleDateString();
};