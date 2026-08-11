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
    if (p.includes('GOOGLE')) return isMarathi ? 'गूगल' : isHindi ? 'गूगल' : 'Google';
    return platform;
  };

  const translateMonth = (month: string) => {
    if (!month) return month;
    if (isMarathi) {
      const mrMonths: Record<string, string> = {
        'Jan': 'जाने', 'Feb': 'फेब्रु', 'Mar': 'मार्च', 'Apr': 'एप्रि', 'May': 'मे', 'Jun': 'जून',
        'Jul': 'जुलै', 'Aug': 'ऑग', 'Sep': 'सप्टें', 'Oct': 'ऑक्टो', 'Nov': 'नोव्हें', 'Dec': 'डिसें'
      };
      return mrMonths[month.substring(0, 3)] || month;
    }
    if (isHindi) {
      const hiMonths: Record<string, string> = {
        'Jan': 'जन', 'Feb': 'फ़र', 'Mar': 'मार्च', 'Apr': 'अप्रै', 'May': 'मई', 'Jun': 'जून',
        'Jul': 'जुला', 'Aug': 'अग', 'Sep': 'सितं', 'Oct': 'अक्टू', 'Nov': 'नवं', 'Dec': 'दिसं'
      };
      return hiMonths[month.substring(0, 3)] || month;
    }
    return month;
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
            {isMarathi ? 'जाहिरात ट्रॅकर अहवाल' : isHindi ? 'विज्ञापन ट्रैकर रिपोर्ट' : 'Ad Tracker Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'पेड मोहिमांचे विश्लेषण' : isHindi ? 'सशुल्क अभियान विश्लेषण' : 'Paid Campaigns Analytics'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण खर्च:' : isHindi ? 'कुल खर्च:' : 'Total Spent:'} ₹{totalSpend.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'महिना' : isHindi ? 'महीना' : 'Month'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'मोहीम' : isHindi ? 'अभियान' : 'Campaign'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-24">{isMarathi ? 'खर्च' : isHindi ? 'खर्च' : 'Spend'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'पोहोच' : isHindi ? 'रीच' : 'Reach'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'क्लिक्स' : isHindi ? 'क्लिक्स' : 'Clicks'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayAds.length > 0 ? displayAds.map((ad, idx) => {
            let statusText = '';
            let statusColor = '';
            
            if (ad.status === 'active') {
              statusText = isMarathi ? 'सक्रिय' : isHindi ? 'सक्रिय' : 'Active';
              statusColor = 'bg-green-100 text-green-700';
            } else {
              statusText = isMarathi ? 'संपली' : isHindi ? 'समाप्त' : 'Ended';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            return (
              <tr key={ad.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">
                  {isMarathi ? (idx + 1).toLocaleString('mr-IN') : isHindi ? (idx + 1).toLocaleString('hi-IN') : (idx + 1)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">
                  {translateMonth(ad.month)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">
                  {truncate(ad.campaign, 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{translatePlatform(ad.platform)}</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-600">₹{ad.spend.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{ad.reach.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{ad.clicks.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}</td>
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
                {isMarathi ? 'कोणतीही माहिती उपलब्ध नाही' : isHindi ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

AdTrackerReport.displayName = 'AdTrackerReport';
