import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle } from 'lucide-react';

interface QueueStatusProps {
  eventId: string;
  userId: string;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ eventId, userId }) => {
  const [position, setPosition] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkQueueStatus = async () => {
    setLoading(true);
    try {
      // Check queue position
      const posResponse = await fetch(`/api/events/${eventId}/queue/position/${userId}`);
      if (posResponse.ok) {
        const posData = await posResponse.json();
        setPosition(posData.position);
      }

      // Check active status
      const activeResponse = await fetch(`/api/events/${eventId}/queue/active/${userId}`);
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setIsActive(activeData.isActive);
      }
    } catch (error) {
      console.error('Error checking queue status:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinQueue = async () => {
    setLoading(true);
    // #region agent log
    console.log('[DEBUG] joinQueue called', { eventId, userId });
    // #endregion agent log
    try {
      const url = `/api/events/${eventId}/queue/join`;
      const requestBody = { userId, eventId };
      // #region agent log
      console.log('[DEBUG] Making request', { url, requestBody });
      // #endregion agent log
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      // #region agent log
      console.log('[DEBUG] Response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });
      // #endregion agent log
      
      if (response.ok) {
        const data = await response.json();
        // #region agent log
        console.log('[DEBUG] Success response', data);
        // #endregion agent log
        await checkQueueStatus();
      } else {
        const errorText = await response.text();
        // #region agent log
        console.error('[DEBUG] Error response', { status: response.status, errorText });
        // #endregion agent log
        alert(`Failed to join queue: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      // #region agent log
      console.error('[DEBUG] Exception in joinQueue', error);
      // #endregion agent log
      console.error('Error joining queue:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && userId) {
      checkQueueStatus();
      const interval = setInterval(checkQueueStatus, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [eventId, userId]);

  return (
    <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none">
      <h3 className="text-2xl font-serif font-bold text-black dark:text-white mb-4">Queue Status</h3>
      
      {isActive ? (
        <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">You're in! You can now reserve seats.</span>
        </div>
      ) : position !== null ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-600 dark:text-galaxy-dim" />
            <div>
              <p className="text-lg font-bold text-black dark:text-white">
                Position in queue: <span className="text-galaxy-pink">{position + 1}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-galaxy-dim">
                Please wait... You'll be admitted soon.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-galaxy-dim">
            <Clock className="w-4 h-4" />
            <span>Checking status automatically...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-galaxy-dim">Join the waiting room to reserve seats.</p>
          <button
            onClick={joinQueue}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-full font-bold border-2 border-black shadow-neo hover:translate-y-1 hover:shadow-none transition-all dark:bg-galaxy-pink dark:border-none dark:shadow-[0_0_20px_rgba(255,126,182,0.4)] disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Waiting Room'}
          </button>
        </div>
      )}
    </div>
  );
};

