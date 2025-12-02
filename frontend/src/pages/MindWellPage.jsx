import { useState, useRef, useEffect } from 'react';
import { Send, Heart, Loader2, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { chatAPI } from '../utils/api';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm MindWell, your AI support companion. How are you feeling today?",
};

export default function MindWellPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await chatAPI.sendMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        conversationId
      );

      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: 'I apologize, but I had trouble responding. Please try again.' },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'I apologize, but I had trouble responding. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">MindWell: Your Mental Health Support</h1>
          <p className="text-slate-400 mt-1">
            A safe space to express your thoughts and feelings. All conversations are private.
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex items-center gap-3 p-4 bg-pink-500/20 rounded-xl border border-pink-500/30 mb-4">
          <Heart className="w-5 h-5 text-pink-400 flex-shrink-0" />
          <p className="text-sm text-slate-300">
            This is a safe space to express your thoughts and feelings. All conversations are automatically saved privately to your account.
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-sm'
                      : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-purple-400 font-medium text-sm">MindWell</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How are you feeling today?"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Crisis Resources */}
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-300">
                <span className="text-amber-400 font-medium">In crisis?</span> If you&apos;re having thoughts of self-harm, 
                please reach out for help:
              </p>
              <p className="text-sm text-slate-400 mt-1">
                <span className="text-white">US & Canada:</span> Call or text 988 | 
                <span className="text-white ml-2">UK:</span> Call 111
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
