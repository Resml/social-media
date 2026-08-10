import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface CheckItem { id: string; label: string; tip?: string; selfDone: boolean; compDone: boolean; }
interface Section  { id: string; title: string; items: CheckItem[]; open: boolean; }

interface ProfileAuditReportProps {
  sections: Section[];
}

export const ProfileAuditReport = forwardRef<HTMLDivElement, ProfileAuditReportProps>(({ sections }, ref) => {
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
  
  const allItems = sections.flatMap(s => s.items);
  const selfTotal = allItems.filter(i => i.selfDone).length;
  const total = allItems.length;
  const score = Math.round((selfTotal / total) * 100);

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
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#0066cc] mb-1">
            {isMarathi ? 'प्रोफाइल ऑडिट अहवाल' : isHindi ? 'प्रोफ़ाइल ऑडिट रिपोर्ट' : 'Profile Audit Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'स्व-मूल्यांकन आणि विश्लेषण' : isHindi ? 'स्वयं मूल्यांकन और विश्लेषण' : 'Self Assessment & Analysis'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'ऑडिट स्कोअर:' : isHindi ? 'ऑडिट स्कोर:' : 'Audit Score:'} <strong className="text-[#0066cc]">{score}%</strong></p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'ऑडिट विभाग / तपासणी' : isHindi ? 'ऑडिट अनुभाग / आइटम' : 'Audit Section / Item'}</th>
            <th className="px-4 py-4 w-24 text-center">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <tr className="bg-blue-50 border-b border-gray-200">
                <td colSpan={2} className="px-4 py-3 font-bold text-blue-900">
                  {section.title}
                </td>
              </tr>
              {section.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                    {item.label}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.selfDone ? (
                      <span className="text-green-600 font-bold">{isMarathi ? 'पूर्ण' : isHindi ? 'पूरा हुआ' : 'Done'}</span>
                    ) : (
                      <span className="text-gray-400">{isMarathi ? 'अपूर्ण' : isHindi ? 'लंबित' : 'Pending'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ProfileAuditReport.displayName = 'ProfileAuditReport';
