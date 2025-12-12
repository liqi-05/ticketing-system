import React, { useState, useEffect } from 'react';
import { SchemaViewer } from './components/SchemaViewer';
import { QueueSimulator } from './components/QueueSimulator';
import { EndpointViewer } from './components/EndpointViewer';
import { ArchitectChat } from './components/ArchitectChat';
import { LayoutDashboard, Database, Network, FileText, Ticket, Moon, Sun, Github } from 'lucide-react';

enum View {
  DASHBOARD = 'DASHBOARD',
  SCHEMA = 'SCHEMA',
  QUEUE = 'QUEUE',
  API = 'API'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  // Default to Light Mode (false)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Dark Mode Class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (currentView) {
      case View.SCHEMA:
        return (
          <>
            <SchemaViewer />
            <ArchitectChat context="User is looking at the PostgreSQL Database Schema and Optimistic Concurrency designs." />
          </>
        );
      case View.QUEUE:
        return (
          <>
            <QueueSimulator />
            <ArchitectChat context="User is simulating the Redis Waiting Room and Queue processing logic." />
          </>
        );
      case View.API:
        return (
          <>
            <EndpointViewer />
            <ArchitectChat context="User is reviewing the REST API Endpoint definitions, Anti-Scalping security layers, and k6 Load Test results." />
          </>
        );
      case View.DASHBOARD:
      default:
        return (
          <div className="space-y-8">
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-white border-2 border-black shadow-neo mb-6 dark:bg-dark-card dark:border-galaxy-pink dark:shadow-[0_0_15px_rgba(255,126,182,0.3)] transition-all">
                <Ticket className="w-12 h-12 text-black dark:text-galaxy-pink" />
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-neo-black dark:text-white mb-6 tracking-tight">
                FairTix Architecture
              </h1>
              <p className="text-lg text-gray-800 dark:text-galaxy-dim max-w-2xl mx-auto font-medium mb-8">
                A high-concurrency concert ticketing engine designed to handle 1,000+ simultaneous requests per seat.
                Built with C# .NET 8, PostgreSQL, Redis, and Docker.
              </p>
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-lg border-2 border-black shadow-neo hover:translate-y-1 hover:shadow-none transition-all dark:bg-galaxy-pink dark:text-white dark:border-none dark:shadow-[0_0_20px_rgba(255,126,182,0.4)] dark:hover:bg-galaxy-pink/90"
              >
                <Github className="w-5 h-5" />
                View C# Source Code
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => setCurrentView(View.SCHEMA)}
                className="bg-pastel-cream border-2 border-black shadow-neo p-6 rounded-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group text-left dark:bg-dark-card dark:border-dark-border dark:shadow-none dark:hover:border-galaxy-purple dark:hover:bg-dark-card/80"
              >
                <div className="bg-pastel-yellow w-fit p-3 rounded-full border-2 border-black mb-4 group-hover:scale-110 transition-transform dark:bg-galaxy-purple/10 dark:border-galaxy-purple dark:p-3">
                  <Database className="w-8 h-8 text-black dark:text-galaxy-purple" />
                </div>
                <h3 className="text-xl font-serif text-black dark:text-white mb-2">Data Integrity</h3>
                <p className="text-gray-700 dark:text-galaxy-dim text-sm">PostgreSQL Schema & Optimistic Concurrency locking strategies.</p>
              </button>

              <button 
                onClick={() => setCurrentView(View.QUEUE)}
                className="bg-pastel-cream border-2 border-black shadow-neo p-6 rounded-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group text-left dark:bg-dark-card dark:border-dark-border dark:shadow-none dark:hover:border-galaxy-pink dark:hover:bg-dark-card/80"
              >
                <div className="bg-pastel-lavender w-fit p-3 rounded-full border-2 border-black mb-4 group-hover:scale-110 transition-transform dark:bg-galaxy-pink/10 dark:border-galaxy-pink dark:p-3">
                  <Network className="w-8 h-8 text-black dark:text-galaxy-pink" />
                </div>
                <h3 className="text-xl font-serif text-black dark:text-white mb-2">Traffic Control</h3>
                <p className="text-gray-700 dark:text-galaxy-dim text-sm">Redis Waiting Room logic and user flow simulation.</p>
              </button>

              <button 
                onClick={() => setCurrentView(View.API)}
                className="bg-pastel-cream border-2 border-black shadow-neo p-6 rounded-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group text-left dark:bg-dark-card dark:border-dark-border dark:shadow-none dark:hover:border-white dark:hover:bg-dark-card/80"
              >
                <div className="bg-pastel-green w-fit p-3 rounded-full border-2 border-black mb-4 group-hover:scale-110 transition-transform dark:bg-white/10 dark:border-white dark:p-3">
                   <FileText className="w-8 h-8 text-black dark:text-white" />
                </div>
                <h3 className="text-xl font-serif text-black dark:text-white mb-2">API & Security</h3>
                <p className="text-gray-700 dark:text-galaxy-dim text-sm">REST Endpoints, Anti-Scalping layers, and Load Testing specs.</p>
              </button>
            </div>
            
            <ArchitectChat context="User is on the main dashboard overview of the project." />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-pastel-pink dark:bg-dark-bg transition-colors duration-500 font-sans selection:bg-black selection:text-white dark:selection:bg-galaxy-pink dark:selection:text-white">
      {/* Navigation Bar */}
      <nav className="border-b-2 border-black bg-white/90 backdrop-blur-md sticky top-0 z-50 dark:bg-dark-bg/90 dark:border-dark-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView(View.DASHBOARD)}>
              <div className="mr-3 bg-black text-white p-1 rounded dark:bg-gradient-to-br dark:from-galaxy-pink dark:to-galaxy-purple dark:text-white transition-colors">
                 <Ticket className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl tracking-tight text-black dark:text-white">FairTix<span className="text-gray-500 dark:text-galaxy-pink">.Arch</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
               <div className="flex items-baseline space-x-2 bg-pastel-cream border-2 border-black rounded-full px-2 py-1 shadow-neo-sm dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-all">
                {[
                  { id: View.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
                  { id: View.SCHEMA, label: 'Database', icon: Database },
                  { id: View.QUEUE, label: 'Waiting Room', icon: Network },
                  { id: View.API, label: 'API & Logic', icon: FileText },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      currentView === item.id
                        ? 'bg-black text-white dark:bg-galaxy-pink dark:text-white dark:border-none'
                        : 'text-gray-700 hover:bg-black/10 dark:text-galaxy-dim dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

               <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                title="View C# Backend Code"
                className="p-2 rounded-full border-2 border-black bg-white shadow-neo-sm hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all dark:bg-dark-card dark:border-galaxy-pink dark:shadow-none dark:text-galaxy-pink dark:hover:bg-dark-card/80"
              >
                <Github className="w-5 h-5" />
              </a>

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full border-2 border-black bg-white shadow-neo-sm hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all dark:bg-dark-card dark:border-galaxy-purple dark:shadow-none dark:text-galaxy-purple dark:hover:bg-dark-card/80"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-black" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      
      <footer className="border-t-2 border-black dark:border-dark-border mt-12 py-8 text-center text-gray-700 dark:text-galaxy-dim text-sm font-medium">
        <p>FairTix Engineering Design Document • Generated for Technical Review</p>
      </footer>
    </div>
  );
};

export default App;