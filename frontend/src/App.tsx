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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen font-sans" style={{background: 'var(--slate-50)'}}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {children}
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/export" element={<CommentExporter />} />
          <Route path="/quick-comment" element={<QuickCommenter />} />
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
    </Router>
  );
}

export default App;
