import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Ad {
  id: string; month: string; campaign: string; spend: number;
  reach: number; clicks: number; platform: string; status: 'active'|'ended'; notes: string;
}

interface AdTrackerReportProps {
  ads: Ad[];
}

export const AdTrackerReport = forwardRef<HTMLDivElement, AdTrackerReportProps>(({ ads }, ref) => {
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

  const displayAds = ads.slice(0, 15);
  const totalSpend = ads.reduce((a, d) => a + d.spend, 0);

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
            {isMarathi ? 'जाहिरात ट्रॅकर अहवाल' : 'Ad Tracker Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'पेड मोहिमांचे विश्लेषण' : 'Paid Campaigns Analytics'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण खर्च:' : 'Total Spent:'} ₹{totalSpend.toLocaleString(isMarathi ? 'mr-IN' : 'en-US')}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'महिना' : 'Month'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'मोहीम' : 'Campaign'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'खर्च' : 'Spend'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'पोहोच' : 'Reach'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'क्लिक्स' : 'Clicks'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayAds.length > 0 ? displayAds.map((ad, idx) => {
            let statusText = '';
            let statusColor = '';
            
            if (ad.status === 'active') {
              statusText = isMarathi ? 'सक्रिय' : 'Active';
              statusColor = 'bg-green-100 text-green-700';
            } else {
              statusText = isMarathi ? 'संपली' : 'Ended';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            return (
              <tr key={ad.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">{ad.month}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">
                  {truncate(ad.campaign, 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{ad.platform}</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-600">₹{ad.spend.toLocaleString(isMarathi ? 'mr-IN' : 'en-US')}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{ad.reach.toLocaleString(isMarathi ? 'mr-IN' : 'en-US')}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{ad.clicks.toLocaleString(isMarathi ? 'mr-IN' : 'en-US')}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded font-medium text-[11px] ${statusColor}`}>
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                {isMarathi ? 'कोणतीही माहिती उपलब्ध नाही' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

AdTrackerReport.displayName = 'AdTrackerReport';
