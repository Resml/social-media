import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type VideoStatus = 'idea' | 'filming' | 'editing' | 'published';
type VideoFormat = 'square' | 'portrait' | 'landscape';

interface VideoEntry {
  id: string; title: string; category: string; duration: number;
  format: VideoFormat; status: VideoStatus; assignee: string; scheduledDate: string; note: string;
}

interface VideoProductionReportProps {
  videos: VideoEntry[];
}

export const VideoProductionReport = forwardRef<HTMLDivElement, VideoProductionReportProps>(({ videos }, ref) => {
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

  const toDevanagari = (numStr: string) => {
    if (!isMarathi && !isHindi) return numStr;
    const devDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return numStr.replace(/\d/g, d => devDigits[parseInt(d)]);
  };

  const translateAssignee = (name: string) => {
    if (!name) return name;
    if (isMarathi) {
      if (name === 'Harshal Vora') return 'हर्षल व्होरा';
      if (name === 'Dr. Amol Pawar') return 'डॉ. अमोल पवार';
      if (name === 'Sagar') return 'सागर';
      if (name === 'Satish Waghmare') return 'सतीश वाघमारे';
      if (name === 'Hemant') return 'हेमंत';
    } else if (isHindi) {
      if (name === 'Harshal Vora') return 'हर्षल वोरा';
      if (name === 'Dr. Amol Pawar') return 'डॉ. अमोल पवार';
      if (name === 'Sagar') return 'सागर';
      if (name === 'Satish Waghmare') return 'सतीश वाघमारे';
      if (name === 'Hemant') return 'हेमंत';
    }
    return name;
  };

  const translateCategory = (cat: string) => {
    if (!cat) return cat;
    if (isMarathi) {
      if (cat.includes('Development Work Update')) return 'विकास कार्याचे अपडेट';
      if (cat.includes('Social Issue Commentary')) return 'सामाजिक विषयावर भाष्य';
      if (cat.includes('Cultural Institution Info')) return 'सांस्कृतिक संस्था माहिती';
      if (cat.includes('Current Events Commentary')) return 'चालू घडामोडींवर भाष्य';
      if (cat.includes('Leader Decision Welcome')) return 'नेत्याच्या निर्णयाचे स्वागत';
      if (cat.includes('Motivational Ad')) return 'प्रेरक जाहिरात';
      if (cat.includes('Google Meet + FB Live Recap')) return 'गुगल मीट + फेसबुक लाईव्ह रीकॅप';
      if (cat.includes('Opposition Critique')) return 'विरोधकांवर टीका';
      if (cat.includes('Documentary (1-2 min)')) return 'माहितीपट (१-२ मिनिटे)';
      if (cat.includes('General Campaign')) return 'सामान्य मोहीम';
      // Old fallbacks
      if (cat.includes('Event/Festival Message')) return 'कार्यक्रम/सण संदेश';
      if (cat.includes('Short Reel/Trend')) return 'शॉर्ट रील/ट्रेंड';
      if (cat.includes('Interview/Testimonial')) return 'मुलाखत/प्रतिक्रिया';
    } else if (isHindi) {
      if (cat.includes('Development Work Update')) return 'विकास कार्य अपडेट';
      if (cat.includes('Social Issue Commentary')) return 'सामाजिक मुद्दे पर टिप्पणी';
      if (cat.includes('Cultural Institution Info')) return 'सांस्कृतिक संस्थान की जानकारी';
      if (cat.includes('Current Events Commentary')) return 'वर्तमान घटनाओं पर टिप्पणी';
      if (cat.includes('Leader Decision Welcome')) return 'नेता के फैसले का स्वागत';
      if (cat.includes('Motivational Ad')) return 'प्रेरक विज्ञापन';
      if (cat.includes('Google Meet + FB Live Recap')) return 'गूगल मीट + एफबी लाइव रीकैप';
      if (cat.includes('Opposition Critique')) return 'विपक्ष की आलोचना';
      if (cat.includes('Documentary (1-2 min)')) return 'वृत्तचित्र (1-2 मिनट)';
      if (cat.includes('General Campaign')) return 'सामान्य अभियान';
      // Old fallbacks
      if (cat.includes('Event/Festival Message')) return 'कार्यक्रम/त्यौहार संदेश';
      if (cat.includes('Short Reel/Trend')) return 'शॉर्ट रील/ट्रेंड';
      if (cat.includes('Interview/Testimonial')) return 'साक्षात्कार/प्रशंसापत्र';
    }
    return cat;
  };

  const translateTitle = (title: string) => {
    if (!title) return title;
    if (isMarathi) {
      if (title.includes('Ward 12 Road Work Progress')) return 'प्रभाग 12 रस्ता काम प्रगती';
      if (title.includes('Water scarcity commentary')) return 'पाणी टंचाईवर भाष्य';
      if (title.includes('Youth empowerment motivational')) return 'युवा सक्षमीकरण प्रेरणादायक';
      if (title.includes('Hospital expansion plan')) return 'रुग्णालय विस्तार योजना';
    } else if (isHindi) {
      if (title.includes('Ward 12 Road Work Progress')) return 'वार्ड 12 सड़क कार्य प्रगति';
      if (title.includes('Water scarcity commentary')) return 'पानी की कमी पर टिप्पणी';
      if (title.includes('Youth empowerment motivational')) return 'युवा सशक्तिकरण प्रेरक';
      if (title.includes('Hospital expansion plan')) return 'अस्पताल विस्तार योजना';
    }
    return title;
  };

  const displayVideos = videos.slice(0, 15);

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
            {isMarathi ? 'व्हिडिओ निर्मिती अहवाल' : isHindi ? 'वीडियो उत्पादन रिपोर्ट' : 'Video Production Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'प्रगतीपथावरील व्हिडिओ' : isHindi ? 'वीडियो पाइपलाइन ट्रैकिंग' : 'Video Pipeline Tracking'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण व्हिडिओ:' : isHindi ? 'कुल वीडियो:' : 'Total Videos:'} {toDevanagari(videos.length.toString())}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-56">{isMarathi ? 'विषय' : isHindi ? 'विषय' : 'Topic'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'कालावधी' : isHindi ? 'अवधि' : 'Duration'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'नियुक्त व्यक्ती' : isHindi ? 'असाइन किया गया व्यक्ति' : 'Assignee'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'दिनांक' : isHindi ? 'दिनांक' : 'Date'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayVideos.length > 0 ? displayVideos.map((video, idx) => {
            
            let statusText = '';
            let statusColor = '';
            
            if (video.status === 'published') {
              statusText = isMarathi ? 'प्रकाशित' : isHindi ? 'प्रकाशित' : 'Published';
              statusColor = 'bg-green-100 text-green-700';
            } else if (video.status === 'editing') {
              statusText = isMarathi ? 'एडिटिंग' : isHindi ? 'संपादन' : 'Editing';
              statusColor = 'bg-purple-100 text-purple-700';
            } else if (video.status === 'filming') {
              statusText = isMarathi ? 'शूटिंग' : isHindi ? 'फिल्मांकन' : 'Filming';
              statusColor = 'bg-blue-100 text-blue-700';
            } else {
              statusText = isMarathi ? 'कल्पना' : isHindi ? 'आइडिया' : 'Idea';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const formatMap: Record<string, string> = {
              'square': isMarathi ? 'चौरस' : isHindi ? 'वर्गाकार' : 'Square',
              'portrait': isMarathi ? 'उभा' : isHindi ? 'पोर्ट्रेट' : 'Portrait',
              'landscape': isMarathi ? 'आडवा' : isHindi ? 'लैंडस्केप' : 'Landscape'
            };

            const displayCategory = translateCategory(video.category);
            const displayFormat = formatMap[video.format] || video.format;

            const dueDate = video.scheduledDate ? new Date(video.scheduledDate).toLocaleDateString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';
            const durationText = isMarathi ? `${toDevanagari(video.duration.toString())} सेकंद` : isHindi ? `${toDevanagari(video.duration.toString())} सेकंड` : `${video.duration}s`;

            return (
              <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">
                  {toDevanagari((idx + 1).toString())}
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-700">
                  {truncate(translateTitle(video.title), 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{displayCategory} ({displayFormat})</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-600">{durationText}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{translateAssignee(video.assignee)}</td>
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

VideoProductionReport.displayName = 'VideoProductionReport';
