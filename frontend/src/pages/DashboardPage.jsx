import { Link } from 'react-router-dom';
import { Stethoscope, Brain, ImagePlus, ArrowRight, Heart, Pill } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import Layout from '../components/Layout';

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
