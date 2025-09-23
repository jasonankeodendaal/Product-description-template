import React from 'react';
import { View, Note, Photo, Recording, LogEntry, CalendarEvent } from '../App';
import { SiteSettings } from '../constants';
import { ClockWidget } from './widgets/ClockWidget';
import { StatWidget } from './widgets/StatWidget';
import { StorageWidget } from './widgets/StorageWidget';
import { TimesheetWidget } from './widgets/TimesheetWidget';
import { ActivityChartWidget } from './widgets/ActivityChartWidget';
import { RecentActivityWidget } from './widgets/RecentActivityWidget';
import { NotepadIcon } from './icons/NotepadIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { RecordingIcon } from './icons/RecordingIcon';
import { CalendarWidget } from './widgets/CalendarWidget';

interface HomeProps {
    onNavigate: (view: View) => void;
    notes: Note[];
    photos: Photo[];
    recordings: Recording[];
    logEntries: LogEntry[];
    onSaveLogEntry: (type: LogEntry['type']) => Promise<void>;
    siteSettings: SiteSettings;
    onOpenCalendar: () => void;
    calendarEvents: CalendarEvent[];
}

export const Home: React.FC<HomeProps> = ({ 
    onNavigate, 
    notes, 
    photos, 
    recordings, 
    logEntries, 
    onSaveLogEntry,
    siteSettings,
    onOpenCalendar,
    calendarEvents
}) => {
    
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 font-inter">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto lg:auto-rows-[160px]">
                {/* Row 1 */}
                <div className="lg:col-span-2">
                    <ClockWidget />
                </div>
                <StatWidget 
                    title="Total Notes"
                    value={notes.length.toString()}
                    icon={<NotepadIcon className="text-white w-8 h-8"/>}
                    color="from-sky-500 to-blue-600"
                />
                <StatWidget 
                    title="Total Photos"
                    value={photos.length.toString()}
                    icon={<PhotoIcon />}
                    color="from-purple-500 to-indigo-600"
                />
                
                {/* Row 2 */}
                <div className="lg:col-span-2 lg:row-span-2 h-auto lg:h-[344px]">
                    <CalendarWidget onOpenCalendar={onOpenCalendar} events={calendarEvents} />
                </div>
                <div className="lg:col-span-2">
                    <TimesheetWidget logEntries={logEntries} onSaveLogEntry={onSaveLogEntry} />
                </div>
                <div className="lg:col-span-2">
                     <StorageWidget 
                        siteSettings={siteSettings}
                        itemCounts={{
                            notes: notes.length,
                            photos: photos.length,
                            recordings: recordings.length
                        }}
                    />
                </div>
                
                {/* Row 3 */}
                <div className="lg:col-span-4 h-64">
                    <ActivityChartWidget 
                        notes={notes}
                        photos={photos}
                        recordings={recordings}
                        logEntries={logEntries}
                    />
                </div>

                 {/* Row 4 */}
                <div className="lg:col-span-3 h-auto">
                    <RecentActivityWidget
                        notes={notes}
                        photos={photos}
                        recordings={recordings}
                        onNavigate={onNavigate}
                    />
                </div>
                 <StatWidget 
                    title="Recordings"
                    value={recordings.length.toString()}
                    icon={<RecordingIcon />}
                    color="from-rose-500 to-pink-600"
                />
            </div>
        </div>
    );
};