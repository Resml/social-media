import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Group {
  id: string; name: string; platform: string; members: number;
  admin: string; category: string; status: 'active'|'inactive'; joinedDate: string; notes: string;
}

interface GroupsReportProps {
  groups: Group[];
}

export const GroupsReport = forwardRef<HTMLDivElement, GroupsReportProps>(({ groups }, ref) => {
  const { i18n } = useTranslation();
  
  const now = new Date();
  const dateStr = now.toLocaleDateString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(i18n.language.startsWith('mr') ? 'mr-IN' : 'en-GB', {
    hour: '2-digit', minute: '2-digit'
  });

  const isMarathi = i18n.language.startsWith('mr');
  const isHindi = i18n.language.startsWith('hi');
  
  const truncate = (str: string, len: number) => {
    if (!str) return '-';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const displayGroups = groups.slice(0, 15);
  const totalMembers = groups.reduce((acc, curr) => acc + curr.members, 0);

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
            {isMarathi ? 'गट व्यवस्थापन अहवाल' : isHindi ? 'ग्रुप मैनेजर रिपोर्ट' : 'Groups Manager Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'फेसबुक आणि व्हॉट्सॲप गट' : isHindi ? 'फेसबुक और व्हाट्सएप ग्रुप' : 'FB & WA Groups'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण सदस्य:' : isHindi ? 'कुल सदस्य:' : 'Total Members:'} {totalMembers.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-56">{isMarathi ? 'गटाचे नाव' : isHindi ? 'ग्रुप का नाम' : 'Group Name'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'वर्ग' : isHindi ? 'श्रेणी' : 'Category'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'सदस्य' : isHindi ? 'सदस्य' : 'Members'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'ॲडमिन' : isHindi ? 'एडमिन' : 'Admin'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayGroups.length > 0 ? displayGroups.map((group, idx) => {
            
            let statusText = group.status === 'active' ? (isMarathi ? 'सक्रिय' : isHindi ? 'सक्रिय' : 'Active') : (isMarathi ? 'निष्क्रिय' : isHindi ? 'निष्क्रिय' : 'Inactive');
            let statusColor = group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

            return (
              <tr key={group.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">
                  {truncate(group.name, 35)}
                  <span className="block text-[11px] text-gray-400 mt-1">{group.platform}</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">{truncate(group.category, 20)}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-blue-600">{group.members.toLocaleString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-US')}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{group.admin}</td>
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

GroupsReport.displayName = 'GroupsReport';
