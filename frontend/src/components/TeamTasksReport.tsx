import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

type Priority = 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'inprogress' | 'done';

interface Task {
  id: string; title: string; category: string; assignee: string;
  priority: Priority; status: TaskStatus; dueDate: string;
}

interface TeamTasksReportProps {
  tasks: Task[];
}

export const TeamTasksReport = forwardRef<HTMLDivElement, TeamTasksReportProps>(({ tasks }, ref) => {
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

  const displayTasks = tasks.slice(0, 15);
  const completedTasks = tasks.filter(t => t.status === 'done').length;

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
            {isMarathi ? 'कार्यसंघ कार्य अहवाल' : isHindi ? 'टीम टास्क रिपोर्ट' : 'Team Tasks Report'}
          </h1>
          <p className="text-lg text-gray-500">
            {isMarathi ? 'कार्यांचे वाटप आणि ट्रॅकिंग' : isHindi ? 'कार्य असाइनमेंट और ट्रैकिंग' : 'Task Assignment & Tracking'}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1 pb-1">
          <p>{isMarathi ? 'दिनांक:' : isHindi ? 'दिनांक:' : 'Date:'} {dateStr} {timeStr}</p>
          <p>{isMarathi ? 'एकूण कार्ये:' : isHindi ? 'कुल कार्य:' : 'Total Tasks:'} {tasks.length} ({completedTasks} {isMarathi ? 'पूर्ण' : isHindi ? 'पूरा हुआ' : 'Done'})</p>
        </div>
      </div>

      <div className="border-b-[3px] border-[#00aaff] mb-8 w-full"></div>

      {/* Tabular Data */}
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-300">
          <tr>
            <th className="px-3 py-4 border-r border-gray-200 w-10 text-center">{isMarathi ? 'अ. क्र.' : isHindi ? 'क्र. सं.' : 'Sr. No.'}</th>
            <th className="px-4 py-4 border-r border-gray-200 w-64">{isMarathi ? 'शीर्षक' : isHindi ? 'शीर्षक' : 'Title'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'नियुक्त व्यक्ती' : isHindi ? 'असाइन किया गया व्यक्ति' : 'Assignee'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'प्राधान्य' : isHindi ? 'प्राथमिकता' : 'Priority'}</th>
            <th className="px-4 py-4 border-r border-gray-200">{isMarathi ? 'स्थिती' : isHindi ? 'स्थिति' : 'Status'}</th>
            <th className="px-4 py-4">{isMarathi ? 'अंतिम मुदत' : isHindi ? 'अंतिम तिथि' : 'Due Date'}</th>
          </tr>
        </thead>
        <tbody>
          {displayTasks.length > 0 ? displayTasks.map((task, idx) => {
            
            // Priority formatting
            let priorityText = '';
            if (task.priority === 'high') priorityText = isMarathi ? 'उच्च' : isHindi ? 'उच्च' : 'High';
            else if (task.priority === 'medium') priorityText = isMarathi ? 'मध्यम' : isHindi ? 'मध्यम' : 'Medium';
            else priorityText = isMarathi ? 'कमी' : isHindi ? 'निम्न' : 'Low';

            // Status formatting
            let statusText = '';
            let statusColor = '';
            
            if (task.status === 'done') {
              statusText = isMarathi ? 'पूर्ण' : isHindi ? 'पूरा हुआ' : 'Done';
              statusColor = 'bg-green-100 text-green-700';
            } else if (task.status === 'inprogress') {
              statusText = isMarathi ? 'प्रगतीपथावर' : isHindi ? 'प्रगति पर' : 'In Progress';
              statusColor = 'bg-blue-100 text-blue-700';
            } else {
              statusText = isMarathi ? 'करायचे आहे' : isHindi ? 'करना है' : 'To Do';
              statusColor = 'bg-gray-100 text-gray-700';
            }

            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';

            return (
              <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-3 py-4 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-700 font-medium">
                  {truncate(task.title, 40)}
                  <span className="block text-[11px] text-gray-400 mt-1">{task.category}</span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200 font-bold text-gray-600">{task.assignee}</td>
                <td className="px-4 py-4 border-r border-gray-200 text-gray-600">
                   <span className={`font-medium ${task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-blue-600' : 'text-gray-500'}`}>
                    {priorityText}
                   </span>
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <span className={`px-2 py-1 rounded font-medium text-[11px] ${statusColor}`}>
                    {statusText}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-gray-600">
                  {dueDate}
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

TeamTasksReport.displayName = 'TeamTasksReport';
