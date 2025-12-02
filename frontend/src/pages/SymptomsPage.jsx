import { useState, useEffect } from 'react';
import { Search, History, AlertCircle, CheckCircle, AlertTriangle, Home as HomeIcon, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { symptomsAPI } from '../utils/api';

export default function SymptomsPage() {
  const [activeTab, setActiveTab] = useState('check');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await symptomsAPI.getHistory();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await symptomsAPI.analyze(symptoms);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 'Immediate Care':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'Consult a Doctor':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <HomeIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStepColor = (step) => {
    switch (step) {
      case 'Immediate Care':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'Consult a Doctor':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">AI-Powered Symptom Analysis</h1>
          <p className="text-slate-400 mt-1">
            Describe your symptoms and get a preliminary analysis with suggested next steps.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-3 p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-slate-300">
            <span className="text-amber-400 font-medium">Important:</span> This tool does not provide a medical diagnosis. 
            Always consult with a healthcare professional for health concerns.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-800 p-1">
          <button
            onClick={() => setActiveTab('check')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'check'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Check Symptoms
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            View History
          </button>
        </div>

        {/* Check Symptoms Tab */}
        {activeTab === 'check' && (
          <div className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe your symptoms in detail
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., 'I have a high fever, a persistent dry cough, and I'm feeling very tired.'"
                rows={4}
                required
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="mt-4 w-full py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-6 animate-fadeIn">
                {/* Disclaimer */}
                {result.disclaimer && (
                  <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-400 font-medium">Disclaimer</p>
                    <p className="text-slate-300 text-sm mt-1">{result.disclaimer}</p>
                  </div>
                )}

                {/* Overall Assessment */}
                {result.overall_assessment && (
                  <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <p className="text-white font-medium">Overall Assessment</p>
                    <p className="text-slate-300 mt-1">{result.overall_assessment}</p>
                  </div>
                )}

                {/* Conditions */}
                {result.analysis && result.analysis.map((condition, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {condition.condition}
                    </h3>

                    {/* Probability */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Probability Score</span>
                        <span className="text-emerald-400 font-medium">{condition.probability_score}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${condition.probability_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <p className="text-slate-300 mb-4">{condition.explanation}</p>

                    {/* Next Steps */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStepColor(condition.suggested_next_steps)}`}>
                      {getStepIcon(condition.suggested_next_steps)}
                      <span className="font-medium">{condition.suggested_next_steps}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No saved analyses yet.</p>
                <p className="text-slate-500 text-sm">Use the 'Check Symptoms' tab to get started.</p>
              </div>
            ) : (
              history.map((record, index) => {
                const analysis = JSON.parse(record.analysis_result);
                const date = new Date(record.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <details 
                    key={record.id || index}
                    className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden group"
                  >
                    <summary className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                      <span className="font-medium text-white">{date}</span>
                      <span className="text-emerald-400 text-sm">Click to expand</span>
                    </summary>
                    <div className="p-4 border-t border-slate-700 space-y-4">
                      <div>
                        <p className="text-sm text-slate-400">Your Symptoms</p>
                        <p className="text-slate-300 mt-1">{record.symptoms_input}</p>
                      </div>
                      
                      {analysis.disclaimer && (
                        <div className="p-3 bg-amber-500/10 rounded-lg">
                          <p className="text-amber-400 text-sm">{analysis.disclaimer}</p>
                        </div>
                      )}

                      {analysis.overall_assessment && (
                        <div>
                          <p className="text-sm text-slate-400">Overall Assessment</p>
                          <p className="text-slate-300 mt-1">{analysis.overall_assessment}</p>
                        </div>
                      )}

                      {analysis.analysis && analysis.analysis.map((condition, idx) => (
                        <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="font-medium text-white">{condition.condition}</p>
                          <p className="text-slate-400 text-sm mt-1">{condition.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
