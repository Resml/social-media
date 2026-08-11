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

  const translatePlatform = (platform: string) => {
    if (!platform) return isMarathi ? 'फेसबुक' : isHindi ? 'फेसबुक' : 'Facebook';
    const p = platform.toUpperCase();
    if (p.includes('FB') || p.includes('FACEBOOK')) return isMarathi ? 'फेसबुक' : isHindi ? 'फेसबुक' : 'Facebook';
    if (p.includes('INSTA')) return isMarathi ? 'इन्स्टाग्राम' : isHindi ? 'इंस्टाग्राम' : 'Instagram';
    if (p.includes('TWITTER') || p === 'X') return isMarathi ? 'ट्विटर' : isHindi ? 'ट्विटर' : 'Twitter';
    if (p.includes('LINKEDIN')) return isMarathi ? 'लिंक्डइन' : isHindi ? 'लिंक्डइन' : 'LinkedIn';
    return platform;
  };

  const translateName = (name: string) => {
    if (!name) return name;
    if (isMarathi) {
      if (name === 'Ramesh Patil') return 'रमेश पाटील';
      if (name === 'Sunita Deshmukh') return 'सुनीता देशमुख';
      if (name === 'Anil Kadam') return 'अनिल कदम';
      if (name === 'Priya Shinde') return 'प्रिया शिंदे';
      if (name === 'Vijay Mane') return 'विजय माने';
    } else if (isHindi) {
      if (name === 'Ramesh Patil') return 'रमेश पाटिल';
      if (name === 'Sunita Deshmukh') return 'सुनीता देशमुख';
      if (name === 'Anil Kadam') return 'अनिल कदम';
      if (name === 'Priya Shinde') return 'प्रिया शिंदे';
      if (name === 'Vijay Mane') return 'विजय माने';
    }
    return name;
  };

  const translateLocation = (loc: string) => {
    if (!loc) return loc;
    if (isMarathi) {
      if (loc === 'Ward 12') return 'प्रभाग १२';
      if (loc === 'Ward 14') return 'प्रभाग १४';
      if (loc === 'Ward 15') return 'प्रभाग १५';
    } else if (isHindi) {
      if (loc === 'Ward 12') return 'वार्ड 12';
      if (loc === 'Ward 14') return 'वार्ड 14';
      if (loc === 'Ward 15') return 'वार्ड 15';
    }
    return loc;
  };

  const translateInterest = (interest: string) => {
    if (!interest) return interest;
    if (isMarathi) {
      if (interest === 'Politics') return 'राजकारण';
      if (interest === 'Education') return 'शिक्षण';
      if (interest === 'Youth') return 'युवा';
      if (interest === 'Women Empowerment') return 'महिला सक्षमीकरण';
      if (interest === 'Sports') return 'क्रीडा';
    } else if (isHindi) {
      if (interest === 'Politics') return 'राजनीति';
      if (interest === 'Education') return 'शिक्षा';
      if (interest === 'Youth') return 'युवा';
      if (interest === 'Women Empowerment') return 'महिला सशक्तिकरण';
      if (interest === 'Sports') return 'खेल';
    }
    return interest;
  };

  const translateTag = (tag: string) => {
    if (isMarathi) {
      const mrMap: any = { Supporter: 'समर्थक', Influencer: 'प्रभावशाली', Voter: 'मतदार', Activist: 'कार्यकर्ता', Opponent: 'विरोधक', Neutral: 'तटस्थ' };
      return mrMap[tag] || tag;
    } else if (isHindi) {
      const hiMap: any = { Supporter: 'समर्थक', Influencer: 'प्रभावशाली', Voter: 'मतदाता', Activist: 'कार्यकर्ता', Opponent: 'विरोधी', Neutral: 'तटस्थ' };
      return hiMap[tag] || tag;
    }
    return tag;
  };

  const toDevanagari = (numStr: string) => {
    if (!isMarathi && !isHindi) return numStr;
    const devDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return numStr.replace(/\d/g, d => devDigits[parseInt(d)]);
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
          <p>{isMarathi ? 'एकूण संपर्क:' : isHindi ? 'कुल संपर्क:' : 'Total Contacts:'} {toDevanagari(contacts.length.toString())}</p>
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

            return (
              <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">
                  {isMarathi ? (idx + 1).toLocaleString('mr-IN') : isHindi ? (idx + 1).toLocaleString('hi-IN') : (idx + 1)}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-700">{truncate(translateName(contact.name), 30)}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600 font-medium">{truncate(translateLocation(contact.location), 25)}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{truncate(translateInterest(contact.interest), 20)}</td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <span className={`px-2 py-1 rounded font-medium text-[11px] ${tagColor}`}>
                    {translateTag(contact.tag)}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-gray-600">
                  {toDevanagari(contact.phone || '-')}
                  <span className="block text-[11px] text-gray-400 mt-1">{translatePlatform(contact.platform)}</span>
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
