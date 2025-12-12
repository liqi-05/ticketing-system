import React, { useState, useEffect, useRef } from 'react';
import { QueueUser, SimulationState } from '../types';
import { Users, Clock, Play, Pause, FastForward, Ticket, ShieldAlert } from 'lucide-react';

export const QueueSimulator: React.FC = () => {
  const [users, setUsers] = useState<QueueUser[]>([]);
  const [state, setState] = useState<SimulationState>(SimulationState.IDLE);
  const [rateLimitPerSec, setRateLimitPerSec] = useState(5);
  const [stats, setStats] = useState({ queued: 0, active: 0, purchased: 0 });

  const usersRef = useRef<QueueUser[]>([]);

  useEffect(() => {
    let interval: number;

    if (state === SimulationState.RUNNING) {
      interval = window.setInterval(() => {
        setUsers(prevUsers => {
          const currentActive = prevUsers.filter(u => u.status === 'active').length;
          const maxActiveSessions = 20; 
          let movedCount = 0;
          
          const newUsers = prevUsers.map(user => {
            if (user.status === 'queue' && currentActive < maxActiveSessions && movedCount < rateLimitPerSec) {
              movedCount++;
              return { ...user, status: 'active' as const };
            }
            if (user.status === 'active') {
              if (Math.random() > 0.90) return { ...user, status: 'purchased' as const };
              if (Math.random() > 0.99) return { ...user, status: 'booted' as const };
            }
            return user;
          });
          usersRef.current = newUsers;
          return newUsers;
        });
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [state, rateLimitPerSec]);

  useEffect(() => {
    setStats({
      queued: users.filter(u => u.status === 'queue').length,
      active: users.filter(u => u.status === 'active').length,
      purchased: users.filter(u => u.status === 'purchased').length,
    });
  }, [users]);

  const addTraffic = (amount: number) => {
    const newBatch: QueueUser[] = Array.from({ length: amount }).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      status: 'queue',
      entryTime: Date.now()
    }));
    setUsers(prev => [...prev, ...newBatch]);
  };

  const clearSim = () => {
    setUsers([]);
    setState(SimulationState.IDLE);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-black dark:text-galaxy-purple flex items-center gap-2">
              <Clock className="w-8 h-8" /> Redis Waiting Room Simulator
            </h2>
            <p className="text-gray-600 dark:text-galaxy-dim text-sm mt-1 font-medium">
              Visualizing the <code>LPUSH</code> (join) and <code>RPOP</code> (admit) flow.
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
             <button 
              onClick={() => addTraffic(50)}
              className="bg-purple-500 border-2 border-black text-white px-4 py-2 rounded-full shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all flex items-center gap-2 dark:bg-galaxy-purple dark:border-0 dark:shadow-none dark:hover:bg-galaxy-purple/80"
            >
              <Users className="w-4 h-4" /> Spike Traffic (+50)
            </button>
            <button 
              onClick={() => setState(state === SimulationState.RUNNING ? SimulationState.PAUSED : SimulationState.RUNNING)}
              className={`px-4 py-2 rounded-full border-2 border-black text-white shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all flex items-center gap-2 dark:border-0 dark:shadow-none ${
                state === SimulationState.RUNNING ? 'bg-amber-500 hover:bg-amber-600 dark:bg-galaxy-pink' : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500'
              }`}
            >
              {state === SimulationState.RUNNING ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {state === SimulationState.RUNNING ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={clearSim}
              className="bg-gray-200 border-2 border-black text-black px-4 py-2 rounded-full shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all dark:bg-dark-bg dark:text-white dark:border-0 dark:shadow-none dark:hover:bg-dark-bg/80"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Queue Bucket */}
          <div className="bg-red-50 border-2 border-black rounded-xl p-4 h-64 flex flex-col dark:bg-dark-bg dark:border-dark-border">
            <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2 dark:border-dark-border">
              <span className="font-mono text-sm font-bold text-red-800 dark:text-red-400">REDIS LIST: WAIT_QUEUE</span>
              <span className="bg-red-100 border border-red-300 text-red-800 text-xs px-2 py-1 rounded-full dark:bg-red-500/20 dark:border-none dark:text-red-300">{stats.queued}</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-wrap content-start gap-1 p-1">
              {users.filter(u => u.status === 'queue').map((u) => (
                <div key={u.id} className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title={`User ${u.id}`} />
              ))}
            </div>
            <div className="text-center text-xs text-red-400 font-bold mt-2 uppercase tracking-wide"> FIFO Strategy </div>
          </div>

          {/* Active Bucket */}
          <div className="bg-blue-50 border-2 border-black rounded-xl p-4 h-64 flex flex-col relative overflow-hidden dark:bg-dark-bg dark:border-galaxy-pink/50">
            {state === SimulationState.RUNNING && stats.queued > 0 && stats.active < 20 && (
                 <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-10">
                    <FastForward className="w-8 h-8 text-black dark:text-galaxy-pink animate-pulse" />
                 </div>
            )}
          
            <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2 dark:border-dark-border">
              <span className="font-mono text-sm font-bold text-blue-800 dark:text-galaxy-pink">ACTIVE SESSIONS</span>
              <span className="bg-blue-100 border border-blue-300 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-galaxy-pink dark:border-none dark:text-white">{stats.active} / 20</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-wrap content-start gap-1 p-1">
              {users.filter(u => u.status === 'active').map((u) => (
                <div key={u.id} className="w-3 h-3 rounded-sm bg-blue-500 border border-blue-700 transition-all duration-300 dark:bg-galaxy-pink dark:border-none" title={`Active ${u.id}`} />
              ))}
            </div>
             <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-bold text-blue-800 dark:text-galaxy-dim">Rate: {rateLimitPerSec}/s</span>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={rateLimitPerSec} 
                  onChange={(e) => setRateLimitPerSec(parseInt(e.target.value))}
                  className="w-24 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-dark-card dark:accent-galaxy-pink"
                />
             </div>
          </div>

          {/* Purchased Bucket */}
          <div className="bg-emerald-50 border-2 border-black rounded-xl p-4 h-64 flex flex-col dark:bg-dark-bg dark:border-dark-border">
            <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2 dark:border-dark-border">
              <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-400">ORDERS PROCESSED</span>
              <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs px-2 py-1 rounded-full dark:bg-emerald-500/20 dark:border-none dark:text-emerald-300">{stats.purchased}</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-wrap content-start gap-1 p-1">
              {users.filter(u => u.status === 'purchased').map((u) => (
                <div key={u.id} className="w-2 h-2 rounded-full bg-emerald-500" title={`Sold to ${u.id}`} />
              ))}
            </div>
            <div className="text-center text-xs text-emerald-600 font-bold mt-2 uppercase tracking-wide"> 
              DB Lock Success
            </div>
          </div>
        </div>

        <div className="bg-gray-100 border-2 border-black p-4 rounded-xl text-sm text-gray-800 font-mono shadow-neo-sm dark:bg-dark-bg dark:border-galaxy-purple/30 dark:text-galaxy-dim dark:shadow-none">
            <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 dark:text-galaxy-pink" />
                <p>
                    <strong>Logic Explained:</strong> 
                    New requests enter a Redis List. A background "Gatekeeper" worker pops N users per second (based on system load) and adds them to a Redis Set ("ActiveUsers") with a 5-minute TTL. Only users in "ActiveUsers" can call the <code>/reserve</code> endpoint.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};