import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type Tag = 'Supporter' | 'Influencer' | 'Voter' | 'Activist' | 'Opponent' | 'Neutral';

interface Contact {
  id: string; name: string; location: string; interest: string;
  platform: string; phone: string; tag: Tag; note: string;
}

interface NetworkReportProps {
  contacts: Contact[];
}

export const NetworkReport = forwardRef<HTMLDivElement, NetworkReportProps>(({ contacts }, ref) => {
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

  const displayContacts = contacts.slice(0, 15);

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
            {isMarathi ? 'नेटवर्क बिल्डर अहवाल' : isHindi ? 'नेटवर्क बिल्डर रिपोर्ट' : 'Network Builder Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'संपर्क आणि स्वयंसेवक' : isHindi ? 'संपर्क और स्वयंसेवक' : 'Contacts & Volunteers'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण संपर्क:' : isHindi ? 'कुल संपर्क:' : 'Total Contacts:'} {contacts.length}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-48">{isMarathi ? 'नाव' : isHindi ? 'नाम' : 'Name'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'ठिकाण' : isHindi ? 'स्थान' : 'Location'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'स्वारस्य' : isHindi ? 'रुचि' : 'Interest'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'टॅग' : isHindi ? 'टैग' : 'Tag'}</th>
            <th className="px-4 py-4">{isMarathi ? 'संपर्क' : isHindi ? 'संपर्क जानकारी' : 'Contact Info'}</th>
          </tr>
        </thead>
        <tbody>
          {displayContacts.length > 0 ? displayContacts.map((contact, idx) => {
            
            let tagColor = 'bg-gray-100 text-gray-700';
            if (contact.tag === 'Supporter' || contact.tag === 'Voter') tagColor = 'bg-blue-100 text-blue-700';
            else if (contact.tag === 'Influencer') tagColor = 'bg-purple-100 text-purple-700';
            else if (contact.tag === 'Opponent') tagColor = 'bg-red-100 text-red-700';
            
            let translatedTag = contact.tag;
            if (isMarathi) {
              const mrMap: any = { Supporter: 'समर्थक', Influencer: 'प्रभावशाली', Voter: 'मतदार', Activist: 'कार्यकर्ता', Opponent: 'विरोधक', Neutral: 'तटस्थ' };
              translatedTag = mrMap[contact.tag] || contact.tag;
            }

            return (
              <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">{truncate(contact.name, 30)}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">{truncate(contact.location, 25)}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{truncate(contact.interest, 20)}</td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <span className={`px-2 py-1 rounded font-medium text-[11px] ${tagColor}`}>
                    {translatedTag}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-gray-600">
                  {contact.phone || '-'}
                  <span className="block text-[11px] text-gray-400 mt-1">{contact.platform}</span>
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

NetworkReport.displayName = 'NetworkReport';
