import React, { useState } from 'react';
import { askArchitect } from '../services/geminiService';
import { Bot, Send, Loader2 } from 'lucide-react';

interface ArchitectChatProps {
  context: string;
}

export const ArchitectChat: React.FC<ArchitectChatProps> = ({ context }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const response = await askArchitect(query, context);
      setAnswer(response);
    } catch (e) {
      setAnswer("Architect is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white border-2 border-black shadow-neo rounded-xl p-6 dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-black p-2 rounded-lg dark:bg-galaxy-purple">
           <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
           <h3 className="text-lg font-serif font-bold text-black dark:text-white">Ask the Principal Architect</h3>
           <p className="text-xs text-gray-500 dark:text-galaxy-dim font-medium">Powered by Gemini 3.0 Pro (High Reasoning)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-gray-50 border-2 border-black text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder-gray-400 dark:bg-dark-bg dark:border-dark-border dark:text-white dark:focus:border-galaxy-pink dark:focus:shadow-none dark:placeholder-galaxy-dim/50"
            placeholder="e.g., Why use Redis Lists over Pub/Sub for the queue?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !query}
            className="bg-black text-white px-4 py-2 rounded-lg border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 dark:bg-galaxy-pink dark:hover:bg-galaxy-pink/80 dark:border-0 dark:shadow-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </button>
        </div>

        {answer && (
          <div className="bg-pastel-lavender/30 rounded-xl p-4 border-2 border-black dark:bg-dark-bg dark:border-galaxy-purple/50 dark:rounded-lg">
            <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-black dark:text-galaxy-dim">
                    {answer}
                </pre>
            </div>
          </div>
        )}
        
        {!answer && !loading && (
             <div className="text-xs text-gray-400 text-center dark:text-galaxy-dim/50">
                Ask about specific tradeoffs, C# implementation details, or PostgreSQL tuning.
             </div>
        )}
      </div>
    </div>
  );
};