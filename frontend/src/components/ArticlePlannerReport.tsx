import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type ArticleType   = 'daily-short' | 'weekly-big';
type ArticleStatus = 'idea' | 'draft' | 'published';

interface Article {
  id: string; type: ArticleType; category: string; title: string;
  writer: string; status: ArticleStatus; dueDate: string; note: string;
}

interface ArticlePlannerReportProps {
  articles: Article[];
}

export const ArticlePlannerReport = forwardRef<HTMLDivElement, ArticlePlannerReportProps>(({ articles }, ref) => {
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

  const translateWriter = (name: string) => {
    if (!name) return name;
    if (isMarathi) {
      if (name === 'Satish Waghmare') return 'सतीश वाघमारे';
      if (name === 'Sagar') return 'सागर';
      if (name === 'Hemant') return 'हेमंत';
      if (name === 'Harshal Vora') return 'हर्षल व्होरा';
      if (name === 'Dr. Amol Pawar') return 'डॉ. अमोल पवार';
    } else if (isHindi) {
      if (name === 'Satish Waghmare') return 'सतीश वाघमारे';
      if (name === 'Sagar') return 'सागर';
      if (name === 'Hemant') return 'हेमंत';
      if (name === 'Harshal Vora') return 'हर्षल वोरा';
      if (name === 'Dr. Amol Pawar') return 'डॉ. अमोल पवार';
    }
    return name;
  };

  const translateCategory = (cat: string) => {
    if (!cat) return cat;
    if (isMarathi) {
      if (cat.includes('Daily Activities')) return 'दैनिक उपक्रम / वैयक्तिक';
      if (cat.includes('State / Central')) return 'राज्य / केंद्र विरोधी टीका';
      if (cat.includes('Worker Appreciation')) return 'कार्यकर्ता कौतुक';
      if (cat.includes('Social Movements')) return 'सामाजिक चळवळी आणि कार्यक्रम';
      if (cat.includes('Demographic')) return 'लोकसंख्याशास्त्रीय समस्या';
      if (cat.includes('Ward Development')) return 'प्रभाग विकास समस्या';
      if (cat.includes('Comparative')) return 'तुलनात्मक लेख';
      if (cat.includes('Social Awareness')) return 'सामाजिक जागरूकता भाष्य';
      if (cat.includes('Political Current')) return 'राजकीय चालू घडामोडी';
      if (cat.includes('Youth Achievement')) return 'युवा यश';
      if (cat.includes('Poetry')) return 'कविता / सर्जनशील ब्रँडिंग';
      if (cat.includes('Public Useful')) return 'सार्वजनिक उपयुक्त माहिती';
      if (cat.includes('Motivational')) return 'प्रेरक';
      if (cat.includes('Development Work')) return 'विकास काम आमंत्रण';
      
      if (cat.includes('Letter to CM')) return 'मुख्यमंत्री / पक्ष नेत्यांना पत्र';
      if (cat.includes('Letter to Official')) return 'सामाजिक समस्येवर अधिकाऱ्याला पत्र';
      if (cat.includes('Ward scheme')) return 'प्रभाग योजना / आमदार निधी सूचना';
      if (cat.includes('Candidate')) return 'उमेदवार कौतुक पत्र';
      if (cat.includes('Worker-penned')) return 'आपल्या कामावर कार्यकर्त्यांचा लेख';
      if (cat.includes('Area social problems')) return 'परिसरातील सामाजिक समस्या';
      if (cat.includes('Future plans')) return 'लोकांसाठी भविष्यातील योजना';
      if (cat.includes('Personal qualities')) return 'वैयक्तिक गुण आणि वैशिष्ट्ये';
      if (cat.includes('Interview')) return 'पत्रकाराची मुलाखत';
      if (cat.includes('Thoughts on national')) return 'राष्ट्रीय कार्यक्रमावरील विचार';
      if (cat.includes('New idea')) return 'सामाजिक समस्येवर नवीन कल्पना';
      if (cat.includes('Committee')) return 'समिती / विधानसभा उपस्थिती';
      if (cat.includes('Public questions')) return 'विकास / राजकारणावरील सार्वजनिक प्रश्न';
      if (cat.includes('Analysis')) return 'विश्लेषण / मत';
    } else if (isHindi) {
      if (cat.includes('Daily Activities')) return 'दैनिक गतिविधियां';
      if (cat.includes('State / Central')) return 'विपक्ष की आलोचना';
      if (cat.includes('Worker Appreciation')) return 'कार्यकर्ता प्रशंसा';
      if (cat.includes('Social Movements')) return 'सामाजिक आंदोलन';
      if (cat.includes('Demographic')) return 'जनसांख्यिकीय मुद्दे';
      if (cat.includes('Ward Development')) return 'वार्ड विकास मुद्दे';
      if (cat.includes('Comparative')) return 'तुलनात्मक लेख';
      if (cat.includes('Social Awareness')) return 'सामाजिक जागरूकता';
      if (cat.includes('Political Current')) return 'राजनीतिक वर्तमान घटनाक्रम';
      if (cat.includes('Youth Achievement')) return 'युवा उपलब्धि';
      if (cat.includes('Poetry')) return 'कविता / रचनात्मक ब्रांडिंग';
      if (cat.includes('Public Useful')) return 'सार्वजनिक उपयोगी जानकारी';
      if (cat.includes('Motivational')) return 'प्रेरक';
      if (cat.includes('Development Work')) return 'विकास कार्य आमंत्रण';

      if (cat.includes('Letter to CM')) return 'सीएम / पार्टी नेताओं को पत्र';
      if (cat.includes('Letter to Official')) return 'अधिकारी को पत्र';
      if (cat.includes('Ward scheme')) return 'वार्ड योजना सुझाव';
      if (cat.includes('Candidate')) return 'उम्मीदवार प्रशंसा';
      if (cat.includes('Worker-penned')) return 'कार्यकर्ता द्वारा लिखा लेख';
      if (cat.includes('Area social problems')) return 'क्षेत्र की सामाजिक समस्याएं';
      if (cat.includes('Future plans')) return 'भविष्य की योजनाएं';
      if (cat.includes('Personal qualities')) return 'व्यक्तिगत गुण';
      if (cat.includes('Interview')) return 'साक्षात्कार';
      if (cat.includes('Thoughts on national')) return 'राष्ट्रीय कार्यक्रम पर विचार';
      if (cat.includes('New idea')) return 'नया विचार';
      if (cat.includes('Committee')) return 'समिति उपस्थिति';
      if (cat.includes('Public questions')) return 'सार्वजनिक प्रश्न';
      if (cat.includes('Analysis')) return 'विश्लेषण';
    }
    return cat;
  };

  const translateTitle = (title: string) => {
    if (!title) return title;
    if (isMarathi) {
      if (title.includes("Today's ward")) return "आजचे प्रभाग पाहणी अपडेट";
      if (title.includes("Student Rohan")) return "विद्यार्थी रोहनने विज्ञान ऑलिम्पियाड जिंकले";
      if (title.includes("Government job vacancies")) return "या आठवड्यातील सरकारी नोकरीच्या रिक्त जागा";
      if (title.includes("Water conservation")) return "जलसंधारण हे आपले कर्तव्य";
      if (title.includes("Letter to CM on ward")) return "प्रभागातील पाणीटंचाईबाबत मुख्यमंत्र्यांना पत्र";
      if (title.includes("Innovative plastic waste")) return "प्लास्टिक कचऱ्यावरील नाविन्यपूर्ण उपाय";
      if (title.includes("Our 5-point vision")) return "प्रभाग १२ साठी आमचे ५-सूत्री व्हिजन";
    } else if (isHindi) {
      if (title.includes("Today's ward")) return "आज का वार्ड निरीक्षण अपडेट";
      if (title.includes("Student Rohan")) return "छात्र रोहन ने विज्ञान ओलंपियाड जीता";
      if (title.includes("Government job vacancies")) return "इस सप्ताह सरकारी नौकरी की रिक्तियां";
      if (title.includes("Water conservation")) return "जल संरक्षण हमारा कर्तव्य";
      if (title.includes("Letter to CM on ward")) return "वार्ड जल संकट पर सीएम को पत्र";
      if (title.includes("Innovative plastic waste")) return "प्लास्टिक कचरे का अभिनव समाधान";
      if (title.includes("Our 5-point vision")) return "वार्ड 12 के लिए हमारा 5-सूत्रीय विजन";
    }
    return title;
  };

  const toDevanagari = (numStr: string) => {
    if (!isMarathi && !isHindi) return numStr;
    const devDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return numStr.replace(/\d/g, d => devDigits[parseInt(d)]);
  };

  const displayArticles = articles.slice(0, 15);

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
            {isMarathi ? 'लेख नियोजन अहवाल' : isHindi ? 'लेख प्लानर रिपोर्ट' : 'Article Planner Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'दैनिक आणि साप्ताहिक लेख' : isHindi ? 'दैनिक और साप्ताहिक लेख' : 'Daily & Weekly Articles'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण लेख:' : isHindi ? 'कुल लेख:' : 'Total Articles:'} {toDevanagari(articles.length.toString())}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-56">{isMarathi ? 'शीर्षक' : isHindi ? 'शीर्षक' : 'Title'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'प्रकार' : isHindi ? 'प्रकार' : 'Type'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'लेखक' : isHindi ? 'लेखक' : 'Writer'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'दिनांक' : isHindi ? 'दिनांक' : 'Date'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayArticles.length > 0 ? displayArticles.map((article, idx) => {
            
            let statusText = '';
            let statusColor = '';
            
            if (article.status === 'published') {
              statusText = isMarathi ? 'प्रकाशित' : isHindi ? 'प्रकाशित' : 'Published';
              statusColor = 'bg-green-100 text-green-700';
            } else if (article.status === 'draft') {
              statusText = isMarathi ? 'मसुदा' : isHindi ? 'ड्राफ्ट' : 'Draft';
              statusColor = 'bg-blue-100 text-blue-700';
            } else {
              statusText = isMarathi ? 'कल्पना' : isHindi ? 'आइडिया' : 'Idea';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const typeLabel = article.type === 'daily-short' ? (isMarathi ? 'दैनिक' : isHindi ? 'दैनिक' : 'Daily') : (isMarathi ? 'साप्ताहिक' : isHindi ? 'साप्ताहिक' : 'Weekly');
            const dueDate = article.dueDate ? new Date(article.dueDate).toLocaleDateString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';

            return (
              <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">
                  {toDevanagari((idx + 1).toString())}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-700">
                  {truncate(translateTitle(article.title), 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{translateCategory(article.category)}</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-600">{typeLabel}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{translateWriter(article.writer)}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{dueDate}</td>
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

ArticlePlannerReport.displayName = 'ArticlePlannerReport';
