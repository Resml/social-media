import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inbox } from './pages/Inbox';
import { PostSearch } from './pages/PostSearch';
import { Schedule } from './pages/Schedule';
import { Settings } from './pages/Settings';
import { CommentExporter } from './pages/CommentExporter';
import { QuickCommenter } from './pages/QuickCommenter';
import { Header } from './components/Header';
import { ContentCalendar } from './pages/ContentCalendar';
import { TeamTasks } from './pages/TeamTasks';
import { LiveTracker } from './pages/LiveTracker';
import { PollManager } from './pages/PollManager';
import { RepostReminder } from './pages/RepostReminder';
import { AdTracker } from './pages/AdTracker';
import { NetworkBuilder } from './pages/NetworkBuilder';
import { GroupsManager } from './pages/GroupsManager';
import { ProfileAudit } from './pages/ProfileAudit';
import { ArticlePlanner } from './pages/ArticlePlanner';
import { VideoProduction } from './pages/VideoProduction';
import { AIAssistant } from './pages/AIAssistant';
import { Toaster } from 'sonner';

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-screen font-sans overflow-hidden" style={{background: 'var(--slate-50)'}}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/search" element={<PostSearch />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/export" element={<CommentExporter />} />
          <Route path="/quick-comment" element={<QuickCommenter />} />
          <Route path="/content-calendar" element={<ContentCalendar />} />
          <Route path="/team-tasks" element={<TeamTasks />} />
          <Route path="/live-tracker" element={<LiveTracker />} />
          <Route path="/polls" element={<PollManager />} />
          <Route path="/reposts" element={<RepostReminder />} />
          <Route path="/ads" element={<AdTracker />} />
          <Route path="/network" element={<NetworkBuilder />} />
          <Route path="/groups" element={<GroupsManager />} />
          <Route path="/profile-audit" element={<ProfileAudit />} />
          <Route path="/articles" element={<ArticlePlanner />} />
          <Route path="/videos" element={<VideoProduction />} />
          <Route path="*" element={
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-gray-400 text-lg flex flex-col items-center gap-2">
                <span className="text-3xl">🚧</span>
                Page implementation pending for future tickets.
              </div>
            </div>
          } />
        </Routes>
      </Layout>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
