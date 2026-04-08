import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import IssueList from './components/Issues/IssueList';
import PollList from './components/Polls/PollList';
import UserManagement from './components/Admin/UserManagement';
import Analytics from './components/Analytics/Analytics';
import Settings from './components/Settings/Settings';
import Representatives from './components/Representatives/Representatives';
import Discussions from './components/Discussions/Discussions';
import Moderation from './components/Moderation/Moderation';
import RoleSelection from './components/Auth/RoleSelection';
import CitizenAuth from './components/Auth/CitizenAuth';
import PoliticianAuth from './components/Auth/PoliticianAuth';
import AdminAuth from './components/Auth/AdminAuth';
import AdminTerminal from './components/Admin/AdminTerminal';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authStep, setAuthStep] = useState('role-selection'); // 'role-selection', 'citizen-auth', 'politician-auth', 'admin-auth'

  if (!user) {
    switch (authStep) {
      case 'role-selection':
        return <RoleSelection onSelectRole={(role) => setAuthStep(`${role}-auth`)} />;
      case 'citizen-auth':
        return <CitizenAuth onBack={() => setAuthStep('role-selection')} />;
      case 'politician-auth':
        return <PoliticianAuth onBack={() => setAuthStep('role-selection')} />;
      case 'admin-auth':
        return <AdminAuth onBack={() => setAuthStep('role-selection')} />;
      default:
        return <RoleSelection onSelectRole={(role) => setAuthStep(`${role}-auth`)} />;
    }
  }

  // If user is admin, show the new Terminal instead of the standard layout
  if (user?.role === 'admin') {
    console.log("✅ Admin role detected, switching to AdminTerminal", user);
    return <AdminTerminal />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'issues':
      case 'my-issues':
        return <IssueList showMyIssues={activeTab === 'my-issues'} />;
      case 'polls':
        return <PollList />;
      case 'discussions':
        return <Discussions />;
      case 'representatives':
        return <Representatives />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'moderation':
        return <Moderation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <IssueProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </IssueProvider>
    </AuthProvider>
  );
}

export default App;