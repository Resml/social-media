import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface PollOption { id: string; text: string; votes: number; }
interface Poll {
  id: string; question: string; options: PollOption[];
  platform: string; status: 'active' | 'closed'; createdAt: string; totalVotes: number;
}

interface PollReportProps {
  polls: Poll[];
}

export const PollReport = forwardRef<HTMLDivElement, PollReportProps>(({ polls }, ref) => {
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
    if (!platform) return isMarathi ? 'फेसबुक' : isHindi ? 'फेसबुक' : 'FB';
    const p = platform.toUpperCase();
    if (p.includes('FB') || p.includes('FACEBOOK')) return isMarathi ? 'फेसबुक' : isHindi ? 'फेसबुक' : 'FB';
    if (p.includes('INSTA')) return isMarathi ? 'इन्स्टाग्राम' : isHindi ? 'इंस्टाग्राम' : 'Instagram';
    if (p.includes('TWITTER') || p === 'X') return isMarathi ? 'ट्विटर' : isHindi ? 'ट्विटर' : 'Twitter';
    if (p.includes('LINKEDIN')) return isMarathi ? 'लिंक्डइन' : isHindi ? 'लिंक्डइन' : 'LinkedIn';
    if (p.includes('YOUTUBE')) return isMarathi ? 'यूट्यूब' : isHindi ? 'यूट्यूब' : 'YouTube';
    return platform;
  };

  const displayPolls = polls.slice(0, 15);

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
            {isMarathi ? 'मतदान अहवाल' : isHindi ? 'पोल रिपोर्ट' : 'Poll Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'जनमत चाचणी' : isHindi ? 'जनमत सर्वेक्षण' : 'Public Opinion Polls'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण मतदान:' : isHindi ? 'कुल पोल:' : 'Total Polls:'} {polls.length}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'प्लॅटफॉर्म' : isHindi ? 'प्लेटफ़ॉर्म' : 'Platform'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'प्रश्न' : isHindi ? 'प्रश्न' : 'Question'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'दिनांक' : isHindi ? 'दिनांक' : 'Date'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'एकूण मते' : isHindi ? 'कुल वोट' : 'Total Votes'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayPolls.length > 0 ? displayPolls.map((poll, idx) => {
            let statusText = isMarathi ? 'सक्रिय' : isHindi ? 'सक्रिय' : 'Active';
            let statusColor = 'bg-green-100 text-green-700';
            
            if (poll.status === 'closed') {
              statusText = isMarathi ? 'बंद' : isHindi ? 'बंद' : 'Closed';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const pollDate = new Date(poll.createdAt).toLocaleDateString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

            return (
              <tr key={poll.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">
                  {isMarathi ? (idx + 1).toLocaleString('mr-IN') : isHindi ? (idx + 1).toLocaleString('hi-IN') : (idx + 1)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">
                  {translatePlatform(poll.platform)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">
                  {truncate(poll.question, 50)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-600">{pollDate}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">
                  {poll.totalVotes.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}
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

PollReport.displayName = 'PollReport';
