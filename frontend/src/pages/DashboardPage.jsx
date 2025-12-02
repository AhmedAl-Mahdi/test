import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Brain, ImagePlus, ArrowRight, Heart, Pill, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import Layout from '../components/Layout';
import { profileAPI } from '../utils/api';

const features = [
  {
    icon: Stethoscope,
    title: 'Symptom Checker',
    description: 'Get AI-powered preliminary analysis of your symptoms with suggested next steps.',
    path: '/symptoms',
    color: 'bg-blue-500',
  },
  {
    icon: Brain,
    title: 'MindWell Chatbot',
    description: 'A safe, empathetic space to express your thoughts and feelings with AI support.',
    path: '/mindwell',
    color: 'bg-purple-500',
  },
  {
    icon: ImagePlus,
    title: 'Diagnostic Imaging',
    description: 'Analyze medical images for pneumonia, breast cancer, kidney cancer, and brain tumors.',
    path: '/imaging',
    color: 'bg-emerald-500',
  },
  {
    icon: Pill,
    title: 'Medication Manager',
    description: 'Track your medications, dosages, and schedules. Get reminders for when to take your doses.',
    path: '/medications',
    color: 'bg-pink-500',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [healthTips, setHealthTips] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchHealthTips();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || healthTips.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, healthTips.length]);

  const fetchHealthTips = async () => {
    try {
      const data = await profileAPI.getHealthTips();
      if (data.success && data.tips) {
        setHealthTips(data.tips);
      }
    } catch (err) {
      // Use default tips if API fails
      setHealthTips([
        { id: 1, title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water daily.', icon: '💧' },
        { id: 2, title: 'Get Quality Sleep', description: 'Aim for 7-9 hours of sleep each night.', icon: '😴' },
        { id: 3, title: 'Move Your Body', description: '30 minutes of exercise daily improves health.', icon: '🏃' },
        { id: 4, title: 'Eat Balanced Meals', description: 'Include fruits, vegetables, and whole grains.', icon: '🥗' },
        { id: 5, title: 'Practice Mindfulness', description: 'Take 10 minutes daily for meditation.', icon: '🧘' },
      ]);
    }
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
    setIsAutoPlaying(false);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + healthTips.length) % healthTips.length);
    setIsAutoPlaying(false);
  };

  const currentTip = healthTips[currentTipIndex];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl p-6 border border-emerald-500/30">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-300">
            Your integrated health co-pilot is ready to assist you. Select a feature below to get started.
          </p>
        </div>

        {/* Health Tips Slideshow */}
        {healthTips.length > 0 && currentTip && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border-b border-amber-500/30">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-amber-400">Health Tip of the Moment</span>
              <span className="ml-auto text-sm text-amber-400/60">
                {currentTipIndex + 1} / {healthTips.length}
              </span>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={prevTip}
                  className="p-2 rounded-full bg-slate-700/50 text-white hover:bg-slate-600/50 transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex-1 text-center transition-all duration-300">
                  <span className="text-4xl mb-3 block">{currentTip.icon}</span>
                  <h3 className="text-xl font-semibold text-white mb-2">{currentTip.title}</h3>
                  <p className="text-slate-300">{currentTip.description}</p>
                </div>
                
                <button
                  onClick={nextTip}
                  className="p-2 rounded-full bg-slate-700/50 text-white hover:bg-slate-600/50 transition-colors flex-shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {healthTips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentTipIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTipIndex
                        ? 'bg-amber-400 w-6'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Info */}
        <div className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <p className="text-slate-300">
            <span className="text-blue-400 font-medium">Tip:</span> Start with the Symptom Checker to get a preliminary analysis of your symptoms.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 mb-4">{feature.description}</p>
                <div className="flex items-center text-emerald-400 group-hover:gap-2 transition-all">
                  <span className="font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Heart className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Important Disclaimer</h3>
              <p className="text-slate-400 text-sm">
                Care-AI is designed to provide preliminary health information and support. It is not a substitute 
                for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare 
                provider for any health concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
