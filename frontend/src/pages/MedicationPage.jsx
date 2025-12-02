import { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Clock, 
  Bell, 
  Check, 
  Trash2, 
  Edit2, 
  X, 
  Calendar,
  AlertCircle,
  Settings,
  Loader2,
  Package,
  AlertTriangle,
  Minus
} from 'lucide-react';
import Layout from '../components/Layout';
import { medicationsAPI } from '../utils/api';

export default function MedicationPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [lowInventoryAlerts, setLowInventoryAlerts] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    schedule: '',
    reminder_minutes_before: 15,
    notes: '',
    inventory_count: 0,
    inventory_threshold: 5
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    default_reminder_minutes: 15,
    notifications_enabled: true,
    email_reminders: false
  });

  // Load medications on mount
  useEffect(() => {
    fetchMedications();
    fetchLowInventory();
    fetchReminders();
    fetchSettings();
  }, []);

  const fetchMedications = async () => {
    try {
      const data = await medicationsAPI.getAll();
      if (data.success) {
        setMedications(data.medications.filter(m => m.is_active !== false));
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const data = await medicationsAPI.getDueReminders();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const fetchLowInventory = async () => {
    try {
      const data = await medicationsAPI.getLowInventory();
      if (data.success) {
        setLowInventoryAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Error fetching low inventory:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await medicationsAPI.getSettings();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleUpdateInventory = async (medicationId, newCount) => {
    try {
      const data = await medicationsAPI.updateInventory(medicationId, newCount);
      if (data.success) {
        setMedications(meds => 
          meds.map(m => m.id === medicationId ? { ...m, inventory_count: newCount } : m)
        );
        fetchLowInventory();
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMed) {
        const data = await medicationsAPI.update(editingMed.id, formData);
        if (data.success) {
          setMedications(meds => 
            meds.map(m => m.id === editingMed.id ? data.medication : m)
          );
          setEditingMed(null);
        }
      } else {
        const data = await medicationsAPI.add(formData);
        if (data.success) {
          setMedications(meds => [data.medication, ...meds]);
        }
      }
      
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error('Error saving medication:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    
    try {
      const data = await medicationsAPI.delete(id);
      if (data.success) {
        setMedications(meds => meds.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting medication:', err);
    }
  };

  const handleLogDose = async (medicationId) => {
    try {
      const data = await medicationsAPI.logDose(medicationId);
      if (data.success) {
        // Show success feedback and update inventory display
        alert('Dose logged successfully!');
        fetchReminders();
        fetchMedications();
        fetchLowInventory();
      }
    } catch (err) {
      console.error('Error logging dose:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const data = await medicationsAPI.updateSettings(settings);
      if (data.success) {
        setShowSettings(false);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      schedule: '',
      reminder_minutes_before: 15,
      notes: '',
      inventory_count: 0,
      inventory_threshold: 5
    });
  };

  const startEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      reminder_minutes_before: med.reminder_minutes_before,
      notes: med.notes || '',
      inventory_count: med.inventory_count || 0,
      inventory_threshold: med.inventory_threshold || 5
    });
    setShowAddForm(true);
  };

  const scheduleOptions = [
    'daily at 08:00',
    'daily at 12:00',
    'daily at 20:00',
    'every 8 hours',
    'every 12 hours',
    'morning',
    'afternoon',
    'evening',
    'bedtime',
    'twice daily'
  ];

  const reminderOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Pill className="w-8 h-8 text-emerald-400" />
              Medication Manager
            </h1>
            <p className="text-slate-400 mt-1">
              Track your medications, dosages, and set reminders
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingMed(null);
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Medication
            </button>
          </div>
        </div>

        {/* Due Reminders Banner */}
        {reminders.length > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-amber-400">Upcoming Reminders</span>
            </div>
            <div className="space-y-2">
              {reminders.map((reminder, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{reminder.medication.name}</p>
                    <p className="text-sm text-slate-400">{reminder.message}</p>
                  </div>
                  <button
                    onClick={() => handleLogDose(reminder.medication.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                  >
                    <Check className="w-4 h-4" />
                    Take Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Inventory Alerts */}
        {lowInventoryAlerts.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-medium text-red-400">Low Inventory Alert</span>
            </div>
            <div className="space-y-2">
              {lowInventoryAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium">{alert.medication.name}</p>
                    <p className="text-sm text-slate-400">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-medium">{alert.inventory_count} left</span>
                    <button
                      onClick={() => {
                        const newCount = prompt('Enter new inventory count:', alert.inventory_count);
                        if (newCount !== null) {
                          handleUpdateInventory(alert.medication.id, parseInt(newCount) || 0);
                        }
                      }}
                      className="px-3 py-1 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600"
                    >
                      Refill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
            <Pill className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Medications Added</h3>
            <p className="text-slate-400 mb-6">
              Start tracking your medications by adding your first one
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Medication
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Pill className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{med.name}</h3>
                      <p className="text-sm text-emerald-400">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(med)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{med.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Bell className="w-4 h-4" />
                    <span>Reminder: {med.reminder_minutes_before} min before</span>
                  </div>
                  
                  {/* Inventory Display */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${
                      (med.inventory_count || 0) <= (med.inventory_threshold || 5) 
                        ? 'text-red-400' 
                        : 'text-slate-400'
                    }`}>
                      <Package className="w-4 h-4" />
                      <span>Stock: {med.inventory_count || 0} doses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateInventory(med.id, Math.max(0, (med.inventory_count || 0) - 1))}
                        className="p-1 rounded hover:bg-slate-600 text-slate-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateInventory(med.id, (med.inventory_count || 0) + 1)}
                        className="p-1 rounded hover:bg-slate-600 text-slate-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {med.notes && (
                    <p className="text-slate-500 italic mt-2">{med.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleLogDose(med.id)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Log Dose Taken
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Medication Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingMed ? 'Edit Medication' : 'Add New Medication'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMed(null);
                    resetForm();
                  }}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Aspirin, Vitamin D"
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg, 2 tablets, 5ml"
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Schedule *
                  </label>
                  <select
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select schedule...</option>
                    {scheduleOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Reminder Time
                  </label>
                  <select
                    value={formData.reminder_minutes_before}
                    onChange={(e) => setFormData({ ...formData, reminder_minutes_before: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {reminderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g., Take with food, avoid alcohol"
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Inventory Section */}
                <div className="border-t border-slate-600 pt-4 mt-2">
                  <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Inventory Tracking
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        value={formData.inventory_count}
                        onChange={(e) => setFormData({ ...formData, inventory_count: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        value={formData.inventory_threshold}
                        onChange={(e) => setFormData({ ...formData, inventory_threshold: parseInt(e.target.value) || 5 })}
                        placeholder="5"
                        min="1"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    You'll be alerted when stock falls below the threshold
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingMed(null);
                      resetForm();
                    }}
                    className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {editingMed ? 'Save Changes' : 'Add Medication'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Reminder Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Default Reminder Time
                  </label>
                  <select
                    value={settings.default_reminder_minutes}
                    onChange={(e) => setSettings({ ...settings, default_reminder_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {reminderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Enable Notifications</span>
                  <button
                    onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications_enabled ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      settings.notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Email Reminders</span>
                  <button
                    onClick={() => setSettings({ ...settings, email_reminders: !settings.email_reminders })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.email_reminders ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      settings.email_reminders ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
