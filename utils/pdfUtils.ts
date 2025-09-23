import { LogEntry } from '../App';

declare var jspdf: any;

export const exportTimesheetToPDF = (logEntries: LogEntry[]) => {
    if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
        alert("PDF generation library is not loaded.");
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Timesheet and Activity Log", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);


    const tableColumn = ["Date", "Start Time", "End Time", "Task/Activity"];
    const tableRows: any[][] = [];

    const sortedEntries = [...logEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    sortedEntries.forEach(entry => {
        const entryDate = new Date(entry.timestamp).toLocaleDateString();
        let startTime = '';
        let endTime = '';
        let task = entry.task || entry.type;

        if (entry.type === 'Manual Task' && entry.startTime && entry.endTime) {
            startTime = new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            endTime = new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (entry.type === 'Clock In') {
            startTime = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (entry.type === 'Clock Out') {
            endTime = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        const row = [entryDate, startTime, endTime, task];
        tableRows.push(row);
    });
    
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`timesheet_${new Date().toISOString().split('T')[0]}.pdf`);
};
