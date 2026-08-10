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
          <p>{isMarathi ? 'एकूण लेख:' : isHindi ? 'कुल लेख:' : 'Total Articles:'} {articles.length}</p>
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
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 font-medium text-gray-700">
                  {truncate(article.title, 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{article.category}</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-600">{typeLabel}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">{article.writer}</td>
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
