import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type LiveStatus = 'scheduled' | 'live' | 'done' | 'cancelled';

interface LiveSession {
  id: string; topic: string; platform: 'Facebook' | 'Instagram' | 'Both';
  via?: string;
  scheduledAt: string; duration: number;
  status: LiveStatus; notes: string;
}

interface LiveTrackerReportProps {
  sessions: LiveSession[];
}

export const LiveTrackerReport = forwardRef<HTMLDivElement, LiveTrackerReportProps>(({ sessions }, ref) => {
  const { i18n } = useTranslation();
  
  const now = new Date();
  const dateStr = now.toLocaleDateString(i18n.language.startsWith('mr') ? 'mr-IN' : i18n.language.startsWith('hi') ? 'hi-IN' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(i18n.language.startsWith('mr') ? 'mr-IN' : i18n.language.startsWith('hi') ? 'hi-IN' : 'en-GB', {
    hour: '2-digit', minute: '2-digit'
  });

  const isMarathi = i18n.language.startsWith('mr');
  const isHindi = i18n.language.startsWith('hi');
  
  const truncate = (str: string, len: number) => {
    if (!str) return '-';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const translatePlatform = (platform: string) => {
    if (!platform) return isMarathi ? 'फेसबुक' : isHindi ? 'फेसबुक' : 'Facebook';
    const p = platform.toUpperCase();
    if (p.includes('FB') || p.includes('FACEBOOK')) return isMarathi ? 'फेसबुक' : isHindi ? 'फेसबुक' : 'Facebook';
    if (p.includes('INSTA')) return isMarathi ? 'इन्स्टाग्राम' : isHindi ? 'इंस्टाग्राम' : 'Instagram';
    if (p.includes('TWITTER') || p === 'X') return isMarathi ? 'ट्विटर' : isHindi ? 'ट्विटर' : 'Twitter';
    if (p.includes('LINKEDIN')) return isMarathi ? 'लिंक्डइन' : isHindi ? 'लिंक्डइन' : 'LinkedIn';
    if (p.includes('YOUTUBE')) return isMarathi ? 'यूट्यूब' : isHindi ? 'यूट्यूब' : 'YouTube';
    if (p.includes('BOTH')) return isMarathi ? 'दोन्ही' : isHindi ? 'दोनों' : 'Both';
    return platform;
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
            {isMarathi ? 'लाईव्ह ट्रॅकर अहवाल' : isHindi ? 'लाइव ट्रैकर रिपोर्ट' : 'Live Tracker Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'व्हिडिओ आणि बैठका' : isHindi ? 'वीडियो और मीटिंग्स' : 'Videos and Meetings'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण सेशन्स:' : isHindi ? 'कुल सत्र:' : 'Total Sessions:'} {sessions.length}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'प्लॅटफॉर्म' : isHindi ? 'प्लेटफ़ॉर्म' : 'Platform'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'विषय' : isHindi ? 'विषय' : 'Topic'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-32">{isMarathi ? 'दिनांक व वेळ' : isHindi ? 'दिनांक और समय' : 'Date & Time'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'कालावधी' : isHindi ? 'अवधि' : 'Duration'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displaySessions.length > 0 ? displaySessions.map((session, idx) => {
            let statusText = '';
            let statusColor = '';
            
            if (session.status === 'scheduled') {
              statusText = isMarathi ? 'नियोजित' : isHindi ? 'शेड्यूल किया गया' : 'Scheduled';
              statusColor = 'bg-blue-100 text-blue-700';
            } else if (session.status === 'live') {
              statusText = isMarathi ? 'लाईव्ह' : isHindi ? 'लाइव' : 'Live';
              statusColor = 'bg-red-100 text-red-700';
            } else if (session.status === 'done') {
              statusText = isMarathi ? 'पूर्ण' : isHindi ? 'पूरा हुआ' : 'Done';
              statusColor = 'bg-green-100 text-green-700';
            } else {
              statusText = isMarathi ? 'रद्द' : isHindi ? 'रद्द' : 'Cancelled';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const sessionDate = new Date(session.scheduledAt);
            const dateFmt = sessionDate.toLocaleDateString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const timeFmt = sessionDate.toLocaleTimeString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

            return (
              <tr key={session.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">
                  {isMarathi ? (idx + 1).toLocaleString('mr-IN') : isHindi ? (idx + 1).toLocaleString('hi-IN') : (idx + 1)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">
                  {translatePlatform(session.platform)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">
                  {truncate(session.topic, 50)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-600">{dateFmt}<br/><span className="text-gray-400 text-[11px]">{timeFmt}</span></td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">
                  {session.duration.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')} {isMarathi ? 'मिनिटे' : isHindi ? 'मिनट' : 'mins'}
                </td>
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
                {isMarathi ? 'कोणतीही माहिती उपलब्ध नाही' : isHindi ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

LiveTrackerReport.displayName = 'LiveTrackerReport';
