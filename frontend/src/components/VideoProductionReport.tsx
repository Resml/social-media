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
            {isMarathi ? 'व्हिडिओ निर्मिती अहवाल' : 'Video Production Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'प्रगतीपथावरील व्हिडिओ' : 'Video Pipeline Tracking'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण व्हिडिओ:' : 'Total Videos:'} {videos.length}</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-56">{isMarathi ? 'विषय' : 'Topic'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'कालावधी' : 'Duration'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'नियुक्त व्यक्ती' : 'Assignee'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'दिनांक' : 'Date'}</th>
            <th className="px-4 py-4">{isMarathi ? 'स्थिती' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {displayVideos.length > 0 ? displayVideos.map((video, idx) => {
            
            let statusText = '';
            let statusColor = '';
            
            if (video.status === 'published') {
              statusText = isMarathi ? 'प्रकाशित' : 'Published';
              statusColor = 'bg-green-100 text-green-700';
            } else if (video.status === 'editing') {
              statusText = isMarathi ? 'एडिटिंग' : 'Editing';
              statusColor = 'bg-purple-100 text-purple-700';
            } else if (video.status === 'filming') {
              statusText = isMarathi ? 'शूटिंग' : 'Filming';
              statusColor = 'bg-blue-100 text-blue-700';
            } else {
              statusText = isMarathi ? 'कल्पना' : 'Idea';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const formatMap: Record<string, string> = {
              'square': isMarathi ? 'चौरस' : 'Square',
              'portrait': isMarathi ? 'उभा' : 'Portrait',
              'landscape': isMarathi ? 'आडवा' : 'Landscape'
            };

            const catMap: Record<string, string> = {
              'Development Work Update': isMarathi ? 'विकास कार्याचे अपडेट' : 'Development Work Update',
              'Social Issue Commentary': isMarathi ? 'सामाजिक विषयावर भाष्य' : 'Social Issue Commentary',
              'Event/Festival Message': isMarathi ? 'कार्यक्रम/सण संदेश' : 'Event/Festival Message',
              'Opposition Critique': isMarathi ? 'विरोधकांवर टीका' : 'Opposition Critique',
              'Short Reel/Trend': isMarathi ? 'शॉर्ट रील/ट्रेंड' : 'Short Reel/Trend',
              'Interview/Testimonial': isMarathi ? 'मुलाखत/प्रतिक्रिया' : 'Interview/Testimonial'
            };

            const displayCategory = catMap[video.category] || video.category;
            const displayFormat = formatMap[video.format] || video.format;

            const dueDate = video.scheduledDate ? new Date(video.scheduledDate).toLocaleDateString(isMarathi ? 'mr-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';

            const titleMap: Record<string, string> = {
              'Ward 12 Road Work Progress': isMarathi ? 'प्रभाग 12 रस्ता काम प्रगती' : 'Ward 12 Road Work Progress',
              'Water scarcity commentary': isMarathi ? 'पाणी टंचाईवर भाष्य' : 'Water scarcity commentary',
              'Youth empowerment motivational': isMarathi ? 'युवा सक्षमीकरण प्रेरणादायक' : 'Youth empowerment motivational',
              'Hospital expansion plan': isMarathi ? 'रुग्णालय विस्तार योजना' : 'Hospital expansion plan'
            };

            const displayTitle = titleMap[video.title] || video.title;

            return (
              <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-700">
                  {truncate(displayTitle, 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{displayCategory} ({displayFormat})</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-600">{video.duration}s</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{video.assignee}</td>
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
                {isMarathi ? 'कोणतीही माहिती उपलब्ध नाही' : 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

VideoProductionReport.displayName = 'VideoProductionReport';
