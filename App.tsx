v6 import React, { useState, useEffect } from 'react';
import { EventsList } from './components/EventsList';
import { QueueStatus } from './components/QueueStatus';
import { SeatReservation } from './components/SeatReservation';
import { SchemaViewer } from './components/SchemaViewer';
import { QueueSimulator } from './components/QueueSimulator';
import { EndpointViewer } from './components/EndpointViewer';
import { ArchitectChat } from './components/ArchitectChat';
import { LayoutDashboard, Ticket, ShoppingCart, Users, Moon, Sun, Github, Database, Network, FileText } from 'lucide-react';

enum View {
  EVENTS = 'EVENTS',
  RESERVE = 'RESERVE',
  QUEUE = 'QUEUE',
  ARCHITECTURE = 'ARCHITECTURE',
  ARCH_SCHEMA = 'ARCH_SCHEMA',
  ARCH_QUEUE = 'ARCH_QUEUE',
  ARCH_API = 'ARCH_API'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.EVENTS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [userId] = useState<string>(() => {
    // Generate or retrieve user ID (in real app, this would come from auth)
    const stored = localStorage.getItem('fairtix_userId');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('fairtix_userId', newId);
    return newId;
  });
  const [isActive, setIsActive] = useState(false);
  const [showArchDropdown, setShowArchDropdown] = useState(false);

  // Toggle Dark Mode Class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check active status when event is selected
    if (selectedEventId) {
      const checkActive = async () => {
        try {
          const response = await fetch(`/api/events/${selectedEventId}/queue/active/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setIsActive(data.isActive);
          }
        } catch (error) {
          console.error('Error checking active status:', error);
        }
      };
      checkActive();
      const interval = setInterval(checkActive, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedEventId, userId]);

  const renderContent = () => {
    switch (currentView) {
      case View.RESERVE:
        if (!selectedEventId) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-700 dark:text-galaxy-dim mb-4">Please select an event first.</p>
              <button
                onClick={() => setCurrentView(View.EVENTS)}
                className="bg-black text-white px-6 py-3 rounded-full font-bold dark:bg-galaxy-pink"
              >
                Browse Events
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <QueueStatus eventId={selectedEventId} userId={userId} />
            <SeatReservation eventId={selectedEventId} userId={userId} isActive={isActive} />
          </div>
        );
      case View.QUEUE:
        if (!selectedEventId) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-700 dark:text-galaxy-dim mb-4">Please select an event first.</p>
              <button
                onClick={() => setCurrentView(View.EVENTS)}
                className="bg-black text-white px-6 py-3 rounded-full font-bold dark:bg-galaxy-pink"
              >
                Browse Events
              </button>
            </div>
          );
        }
        return <QueueStatus eventId={selectedEventId} userId={userId} />;
      case View.ARCH_SCHEMA:
        return (
          <>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView(View.ARCHITECTURE)}
                className="flex items-center gap-2 text-gray-700 dark:text-galaxy-dim hover:text-black dark:hover:text-white transition-colors mb-4"
              >
                ← Back to Architecture Overview
              </button>
              <h2 className="text-3xl font-serif font-bold text-black dark:text-white">Data Integrity</h2>
              <p className="text-gray-600 dark:text-galaxy-dim mt-2">PostgreSQL Schema & Optimistic Concurrency</p>
            </div>
            <SchemaViewer />
            <ArchitectChat context="User is looking at the PostgreSQL Database Schema and Optimistic Concurrency designs." />
          </>
        );
      case View.ARCH_QUEUE:
        return (
          <>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView(View.ARCHITECTURE)}
                className="flex items-center gap-2 text-gray-700 dark:text-galaxy-dim hover:text-black dark:hover:text-white transition-colors mb-4"
              >
                ← Back to Architecture Overview
              </button>
              <h2 className="text-3xl font-serif font-bold text-black dark:text-white">Traffic Control</h2>
              <p className="text-gray-600 dark:text-galaxy-dim mt-2">Redis Waiting Room & Queue Processing</p>
            </div>
            <QueueSimulator />
            <ArchitectChat context="User is simulating the Redis Waiting Room and Queue processing logic." />
          </>
        );
      case View.ARCH_API:
        return (
          <>
            <div className="mb-6">
              <button
                onClick={() => setCurrentView(View.ARCHITECTURE)}
                className="flex items-center gap-2 text-gray-700 dark:text-galaxy-dim hover:text-black dark:hover:text-white transition-colors mb-4"
              >
                ← Back to Architecture Overview
              </button>
              <h2 className="text-3xl font-serif font-bold text-black dark:text-white">API & Security</h2>
              <p className="text-gray-600 dark:text-galaxy-dim mt-2">REST Endpoints & Load Testing</p>
            </div>
            <EndpointViewer />
            <ArchitectChat context="User is reviewing the REST API Endpoint definitions, Anti-Scalping security layers, and k6 Load Test results." />
          </>
        );
      case View.ARCHITECTURE:
        return (
          <div className="space-y-8">
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-white border-2 border-black shadow-neo mb-6 dark:bg-dark-card dark:border-galaxy-pink dark:shadow-[0_0_15px_rgba(255,126,182,0.3)] transition-all">
                <Ticket className="w-12 h-12 text-black dark:text-galaxy-pink" />
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-neo-black dark:text-white mb-4 tracking-tight">
                FairTix Architecture
              </h1>
              <p className="text-lg text-gray-800 dark:text-galaxy-dim max-w-2xl mx-auto font-medium mb-6">
                A high-concurrency concert ticketing engine designed to handle 1,000+ simultaneous requests per seat.
                Built with C# .NET 9, PostgreSQL, Redis, and Docker.
              </p>
              
              {/* Architecture Sub-Navigation */}
              <div className="flex items-center justify-center gap-2 bg-pastel-cream border-2 border-black rounded-full px-2 py-1 shadow-neo-sm dark:bg-dark-card dark:border-dark-border dark:shadow-none max-w-fit mx-auto">
                {[
                  { id: View.ARCH_SCHEMA, label: 'Data Integrity', icon: Database },
                  { id: View.ARCH_QUEUE, label: 'Traffic Control', icon: Network },
                  { id: View.ARCH_API, label: 'API & Security', icon: FileText },
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => setCurrentView(View.ARCH_SCHEMA)}
                className="bg-pastel-cream border-2 border-black shadow-neo p-6 rounded-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group text-left dark:bg-dark-card dark:border-dark-border dark:shadow-none dark:hover:border-galaxy-purple dark:hover:bg-dark-card/80"
              >
                <div className="bg-pastel-yellow w-fit p-3 rounded-full border-2 border-black mb-4 group-hover:scale-110 transition-transform dark:bg-galaxy-purple/10 dark:border-galaxy-purple dark:p-3">
                  <Database className="w-8 h-8 text-black dark:text-galaxy-purple" />
                </div>
                <h3 className="text-xl font-serif text-black dark:text-white mb-2">Data Integrity</h3>
                <p className="text-gray-700 dark:text-galaxy-dim text-sm">PostgreSQL Schema & Optimistic Concurrency locking strategies.</p>
              </button>

              <button 
                onClick={() => setCurrentView(View.ARCH_QUEUE)}
                className="bg-pastel-cream border-2 border-black shadow-neo p-6 rounded-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group text-left dark:bg-dark-card dark:border-dark-border dark:shadow-none dark:hover:border-galaxy-pink dark:hover:bg-dark-card/80"
              >
                <div className="bg-pastel-lavender w-fit p-3 rounded-full border-2 border-black mb-4 group-hover:scale-110 transition-transform dark:bg-galaxy-pink/10 dark:border-galaxy-pink dark:p-3">
                  <Network className="w-8 h-8 text-black dark:text-galaxy-pink" />
                </div>
                <h3 className="text-xl font-serif text-black dark:text-white mb-2">Traffic Control</h3>
                <p className="text-gray-700 dark:text-galaxy-dim text-sm">Redis Waiting Room logic and user flow simulation.</p>
              </button>

              <button 
                onClick={() => setCurrentView(View.ARCH_API)}
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
      case View.EVENTS:
      default:
        return (
          <div className="space-y-8">
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-white border-2 border-black shadow-neo mb-6 dark:bg-dark-card dark:border-galaxy-pink dark:shadow-[0_0_15px_rgba(255,126,182,0.3)] transition-all">
                <Ticket className="w-12 h-12 text-black dark:text-galaxy-pink" />
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-neo-black dark:text-white mb-4 tracking-tight">
                FairTix
              </h1>
              <p className="text-lg text-gray-800 dark:text-galaxy-dim max-w-2xl mx-auto font-medium">
                High-concurrency concert ticketing system
              </p>
            </div>
            <EventsList onSelectEvent={(eventId) => {
              setSelectedEventId(eventId);
              setCurrentView(View.RESERVE);
            }} />
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
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView(View.EVENTS)}>
              <div className="mr-3 bg-black text-white p-1 rounded dark:bg-gradient-to-br dark:from-galaxy-pink dark:to-galaxy-purple dark:text-white transition-colors">
                 <Ticket className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl tracking-tight text-black dark:text-white">FairTix</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
               <div className="flex items-baseline space-x-2 bg-pastel-cream border-2 border-black rounded-full px-2 py-1 shadow-neo-sm dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-all">
                {[
                  { id: View.EVENTS, label: 'Events', icon: LayoutDashboard },
                  { id: View.RESERVE, label: 'Reserve', icon: ShoppingCart },
                  { id: View.QUEUE, label: 'Queue', icon: Users },
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
                
                {/* Architecture Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowArchDropdown(true)}
                  onMouseLeave={() => setShowArchDropdown(false)}
                >
                  <button
                    onClick={() => setCurrentView(View.ARCHITECTURE)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      currentView === View.ARCHITECTURE || currentView === View.ARCH_SCHEMA || currentView === View.ARCH_QUEUE || currentView === View.ARCH_API
                        ? 'bg-black text-white dark:bg-galaxy-pink dark:text-white dark:border-none'
                        : 'text-gray-700 hover:bg-black/10 dark:text-galaxy-dim dark:hover:text-white dark:hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Architecture
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showArchDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border-2 border-black shadow-neo rounded-xl py-2 min-w-[200px] dark:bg-dark-card dark:border-dark-border dark:shadow-none z-50">
                      <button
                        onClick={() => {
                          setCurrentView(View.ARCHITECTURE);
                          setShowArchDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-galaxy-dim dark:hover:text-white"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Overview
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView(View.ARCH_SCHEMA);
                          setShowArchDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-galaxy-dim dark:hover:text-white"
                      >
                        <Database className="w-4 h-4" />
                        Data Integrity
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView(View.ARCH_QUEUE);
                          setShowArchDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-galaxy-dim dark:hover:text-white"
                      >
                        <Network className="w-4 h-4" />
                        Traffic Control
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView(View.ARCH_API);
                          setShowArchDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black/10 dark:hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-galaxy-dim dark:hover:text-white"
                      >
                        <FileText className="w-4 h-4" />
                        API & Security
                      </button>
                    </div>
                  )}
                </div>
              </div>

               <a 
                href="https://github.com/liqi-05/ticketing-system" 
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
        <p>FairTix Ticketing System • Built with .NET 9, PostgreSQL, Redis</p>
      </footer>
    </div>
  );
};

export default App;