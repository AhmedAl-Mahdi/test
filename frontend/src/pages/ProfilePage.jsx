import { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  Edit2, 
  X, 
  Loader2,
  Mail,
  Calendar,
  Ruler,
  Scale,
  Heart,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { profileAPI } from '../utils/api';
import { useAuth } from '../components/AuthContext';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profile, setProfile] = useState({
    display_name: '',
    email: user?.email || '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    blood_type: '',
    allergies: '',
    medical_conditions: ''
  });
  
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.get();
      if (data.success && data.profile) {
        const profileData = {
          display_name: data.profile.display_name || '',
          email: data.profile.email || user?.email || '',
          age: data.profile.age || '',
          gender: data.profile.gender || '',
          height_cm: data.profile.height_cm || '',
          weight_kg: data.profile.weight_kg || '',
          blood_type: data.profile.blood_type || '',
          allergies: data.profile.allergies || '',
          medical_conditions: data.profile.medical_conditions || ''
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const data = await profileAPI.update(profile);
      if (data.success) {
        setOriginalProfile(profile);
        setEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  const calculateBMI = () => {
    if (profile.height_cm && profile.weight_kg) {
      const heightM = profile.height_cm / 100;
      const bmi = profile.weight_kg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <User className="w-8 h-8 text-emerald-400" />
              My Profile
            </h1>
            <p className="text-slate-400 mt-1">
              Manage your personal information and health details
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <Heart className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Personal Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Display Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white py-2">{profile.display_name || '-'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              {editing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white py-2">{profile.email || user?.email || '-'}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Age
              </label>
              {editing ? (
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : '' })}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white py-2">{profile.age ? `${profile.age} years` : '-'}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Gender
              </label>
              {editing ? (
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <p className="text-white py-2">{profile.gender || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-400" />
            Health Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Ruler className="w-4 h-4 inline mr-1" />
                Height (cm)
              </label>
              {editing ? (
                <input
                  type="number"
                  value={profile.height_cm}
                  onChange={(e) => setProfile({ ...profile, height_cm: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder="e.g., 175"
                  min="50"
                  max="300"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white py-2">{profile.height_cm ? `${profile.height_cm} cm` : '-'}</p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Scale className="w-4 h-4 inline mr-1" />
                Weight (kg)
              </label>
              {editing ? (
                <input
                  type="number"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder="e.g., 70"
                  min="20"
                  max="500"
                  step="0.1"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-white py-2">{profile.weight_kg ? `${profile.weight_kg} kg` : '-'}</p>
              )}
            </div>

            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Blood Type
              </label>
              {editing ? (
                <select
                  value={profile.blood_type}
                  onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select blood type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : (
                <p className="text-white py-2">{profile.blood_type || '-'}</p>
              )}
            </div>

            {/* BMI Display */}
            {bmi && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  BMI (calculated)
                </label>
                <div className="flex items-center gap-3 py-2">
                  <span className="text-white text-xl font-semibold">{bmi}</span>
                  <span className={`px-2 py-1 rounded text-sm ${bmiCategory.color} bg-slate-700`}>
                    {bmiCategory.label}
                  </span>
                </div>
              </div>
            )}

            {/* Allergies */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Allergies
              </label>
              {editing ? (
                <textarea
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  placeholder="List any allergies (e.g., penicillin, peanuts)"
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              ) : (
                <p className="text-white py-2">{profile.allergies || 'None specified'}</p>
              )}
            </div>

            {/* Medical Conditions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Medical Conditions
              </label>
              {editing ? (
                <textarea
                  value={profile.medical_conditions}
                  onChange={(e) => setProfile({ ...profile, medical_conditions: e.target.value })}
                  placeholder="List any medical conditions (e.g., diabetes, hypertension)"
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              ) : (
                <p className="text-white py-2">{profile.medical_conditions || 'None specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
          <p className="text-sm text-slate-300">
            <span className="text-blue-400 font-medium">Privacy:</span> Your health information is stored securely and is only used to personalize your Care-AI experience. 
            We never share your data with third parties.
          </p>
        </div>
      </div>
    </Layout>
  );
}
