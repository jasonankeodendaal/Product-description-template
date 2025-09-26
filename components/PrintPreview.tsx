import React, { useMemo, useState, useEffect } from 'react';
import { LogEntry } from '../App';
// FIX: SiteSettings is exported from ../constants, not ../App
import { SiteSettings } from '../constants';
import { XIcon } from './icons/XIcon';
import { PrintIcon } from './icons/PrintIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { formatMsToHM, formatIsoToTime, formatIsoToDate } from '../utils/formatters';
import { exportLogToPDF } from '../utils/pdfUtils';

interface PrintPreviewProps {
    logEntries: LogEntry[];
    onClose: () => void;
    siteSettings: SiteSettings;
}

export interface PrintableEntry {
    date: string;
    time: string;
    type: string;
    description: string;
    duration: string;
}


export const PrintPreview: React.FC<PrintPreviewProps> = ({ logEntries, onClose, siteSettings }) => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const { summary, entries } = useMemo(() => {
        const chronologicalEntries = [...logEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const hoursByDay: { [key: string]: { ms: number, taskCount: number } } = {};
        
        // Calculate durations and group by day
        let lastClockInTime: number | null = null;
        chronologicalEntries.forEach(entry => {
            const dateKey = formatIsoToDate(entry.timestamp);
            if (!hoursByDay[dateKey]) {
                hoursByDay[dateKey] = { ms: 0, taskCount: 0 };
            }

            if (entry.type === 'Manual Task' && entry.startTime && entry.endTime) {
                const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                hoursByDay[dateKey].ms += duration;
                hoursByDay[dateKey].taskCount++;
            }
            
            if (entry.type === 'Clock In') {
                lastClockInTime = new Date(entry.timestamp).getTime();
            } else if (entry.type === 'Clock Out' && lastClockInTime) {
                const duration = new Date(entry.timestamp).getTime() - lastClockInTime;
                hoursByDay[dateKey].ms += duration;
                lastClockInTime = null;
            }
        });
        
        // If still clocked in today, add time until now
        if (lastClockInTime) {
            const todayKey = formatIsoToDate(new Date().toISOString());
            if (hoursByDay[todayKey]) {
                 hoursByDay[todayKey].ms += new Date().getTime() - lastClockInTime;
            } else {
                 hoursByDay[todayKey] = { ms: new Date().getTime() - lastClockInTime, taskCount: 0 };
            }
        }

        let totalMs = 0;
        let totalTasks = 0;
        let busiestDay = 'N/A';
        let maxMs = 0;
        
        for (const dateKey in hoursByDay) {
            const dayData = hoursByDay[dateKey];
            totalMs += dayData.ms;
            totalTasks += dayData.taskCount;
            if (dayData.ms > maxMs) {
                maxMs = dayData.ms;
                busiestDay = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
            }
        }

        const totalHours = totalMs / (1000 * 60 * 60);
        const maxHours = maxMs / (1000 * 60 * 60);

        const summaryText = `During this period, you logged a total of ${totalHours.toFixed(2)} hours. Your busiest day was ${busiestDay}, where you recorded ${maxHours.toFixed(2)} hours across all activities.`;
        
        // Format all entries for display, sorted descending
        const displayEntries: PrintableEntry[] = [...logEntries]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map(entry => {
                let duration = '--';
                if (entry.type === 'Manual Task' && entry.startTime && entry.endTime) {
                    const durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                    duration = formatMsToHM(durationMs);
                }
                return {
                    date: formatIsoToDate(entry.timestamp),
                    time: formatIsoToTime(entry.timestamp),
                    type: entry.type,
                    description: entry.task || entry.type.replace(/([A-Z])/g, ' $1').trim(),
                    duration,
                };
            });

        return { summary: summaryText, entries: displayEntries };

    }, [logEntries]);
    
    const handlePrint = () => {
        window.print();
    };
    
    const handleDownload = () => {
        exportLogToPDF(summary, entries, siteSettings);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
             {/* Print Actions Toolbar */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                <button
                    onClick={handleDownload}
                    className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-sky-700 transition-colors"
                >
                    <DownloadIcon /> Download PDF
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-[var(--theme-orange)] text-black font-bold py-2 px-4 rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <PrintIcon /> Print
                </button>
                <button onClick={onClose} className="p-2 bg-[var(--theme-card-bg)] rounded-md">
                    <XIcon />
                </button>
            </div>
            
            <div id="print-content" className="bg-white text-black font-sans w-full max-w-4xl h-[90vh] overflow-y-auto p-8 shadow-2xl animate-modal-scale-in">
                {/* Header */}
                <header className="flex justify-between items-center text-sm border-b pb-4">
                    <span>{dateTime.toLocaleString()}</span>
                    <span className="font-bold">{siteSettings.companyName}</span>
                </header>

                {/* Main Content */}
                <main className="mt-8">
                    <section>
                        <h1 className="text-4xl font-bold">Activity Report</h1>
                        <p className="text-gray-600 text-lg mt-1">User: {siteSettings.userName || 'User'}</p>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-2">Work Summary</h2>
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </section>
                    
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Log Entries</h2>
                        <table className="w-full text-left text-sm table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 font-semibold w-[15%]">Date</th>
                                    <th className="p-3 font-semibold w-[15%]">Time</th>
                                    <th className="p-3 font-semibold w-[20%]">Type</th>
                                    <th className="p-3 font-semibold w-[35%]">Description</th>
                                    <th className="p-3 font-semibold w-[15%]">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="p-3">{entry.date}</td>
                                        <td className="p-3">{entry.time}</td>
                                        <td className="p-3">{entry.type}</td>
                                        <td className="p-3">{entry.description}</td>
                                        <td className="p-3">{entry.duration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {entries.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No log entries to display.</p>
                        )}
                    </section>
                </main>
                
                 {/* Footer */}
                <footer className="flex justify-between items-center text-xs text-gray-500 border-t pt-4 mt-8">
                    <span>Generated by JSTYP.me Ai tools</span>
                    <span>Page 1/1</span>
                </footer>
            </div>
             <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-content, #print-content * {
                            visibility: visible;
                        }
                        #print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: auto;
                            overflow: visible;
                            box-shadow: none;
                            border: none;
                        }
                    }
                `}
            </style>
        </div>
    );
};