import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type LiveStatus = 'scheduled' | 'live' | 'done' | 'cancelled';

interface LiveSession {
  id: string; topic: string; platform: 'Facebook' | 'Instagram' | 'Both';
  via: 'Direct' | 'Google Meet'; scheduledAt: string; duration: number;
  status: LiveStatus; notes: string;
}

interface LiveTrackerReportProps {
  sessions: LiveSession[];
}

export const LiveTrackerReport = forwardRef<HTMLDivElement, LiveTrackerReportProps>(({ sessions }, ref) => {
  const { i18n } = useTranslation();
  
  const now = new Date();
  const dateStr = now.toLocaleDateString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-GB', {
    hour: '2-digit', minute: '2-digit'
  });

  const isMarathi = i18n.language.startsWith('mr');
  
  const truncate = (str: string, len: number) => {
    if (!str) return '-';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const displaySessions = sessions.slice(0, 15);

  return (
    <div 
      ref={ref} 
      className="bg-white p-8 mx-auto text-slate-800"
      style={{
        width: '794px', 
        minHeight: '1123px', 
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header matching Sarkari style */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#0066cc] mb-1">
            {isMarathi ? 'लाईव्ह ट्रॅकर अहवाल' : 'Live Tracker Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'व्हिडिओ आणि बैठका' : 'Videos and Meetings'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण सेशन्स:' : 'Total Sessions:'} {sessions.length}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'प्लॅटफॉर्म' : 'Platform'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'विषय' : 'Topic'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-32">{isMarathi ? 'दिनांक व वेळ' : 'Date & Time'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'कालावधी' : 'Duration'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displaySessions.length > 0 ? displaySessions.map((session, idx) => {
            let statusText = '';
            let statusColor = '';
            
            if (session.status === 'scheduled') {
              statusText = isMarathi ? 'नियोजित' : 'Scheduled';
              statusColor = 'bg-blue-100 text-blue-700';
            } else if (session.status === 'live') {
              statusText = isMarathi ? 'लाईव्ह' : 'Live';
              statusColor = 'bg-red-100 text-red-700';
            } else if (session.status === 'done') {
              statusText = isMarathi ? 'पूर्ण' : 'Done';
              statusColor = 'bg-green-100 text-green-700';
            } else {
              statusText = isMarathi ? 'रद्द' : 'Cancelled';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const sessionDate = new Date(session.scheduledAt);
            const dateFmt = sessionDate.toLocaleDateString(isMarathi ? 'mr-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const timeFmt = sessionDate.toLocaleTimeString(isMarathi ? 'mr-IN' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

            return (
              <tr key={session.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">{session.platform}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">
                  {truncate(session.topic, 50)}
                  {session.via === 'Google Meet' && <span className="block text-[11px] text-gray-400 mt-1">via Google Meet</span>}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-600">{dateFmt}<br/><span className="text-gray-400 text-[11px]">{timeFmt}</span></td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{session.duration} {isMarathi ? 'मिनिटे' : 'mins'}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded font-medium text-[11px] ${statusColor}`}>
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                {isMarathi ? 'कोणतीही माहिती उपलब्ध नाही' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

LiveTrackerReport.displayName = 'LiveTrackerReport';
