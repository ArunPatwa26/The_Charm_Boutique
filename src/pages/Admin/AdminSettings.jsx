import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  LockClosedIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  CheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'AI Jewellery Shop',
    storeEmail: 'info@aijewellery.com',
    storePhone: '+91-123-456-7890',
    storeAddress: 'Mumbai, India',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    lowStock: true,
    newUsers: false,
    weeklyReport: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: '30',
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
  ];

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    toast.success('General settings saved!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings saved!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <Cog6ToothIcon className="w-8 h-8 text-amber-500" />
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your store preferences and account settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition-all relative ${
                active
                  ? 'text-amber-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {active && (
                <motion.div
                  layoutId="settings-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================
          GENERAL TAB
      ========================== */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Store Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-amber-500" />
              Store Information
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Basic information about your store
            </p>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storeName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, storeName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Phone
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storePhone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, storePhone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storeAddress}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, storeAddress: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, currency: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md"
                >
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-amber-500" />
              Your Account
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Your current admin account details
            </p>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <EnvelopeIcon className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* =========================
          NOTIFICATIONS TAB
      ========================== */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-amber-500" />
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Choose what notifications you want to receive
          </p>

          <div className="space-y-3">
            {[
              { key: 'newOrders', label: 'New Order Alerts', desc: 'Get notified when a new order is placed' },
              { key: 'orderUpdates', label: 'Order Status Updates', desc: 'Get notified when order status changes' },
              { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when product stock is low' },
              { key: 'newUsers', label: 'New User Registrations', desc: 'Get notified when a new user signs up' },
              { key: 'weeklyReport', label: 'Weekly Summary Report', desc: 'Receive a weekly performance summary' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.key]: e.target.checked })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 mt-0.5"
                />
              </label>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={handleSaveNotifications}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md"
            >
              <CheckIcon className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </motion.div>
      )}

      {/* =========================
          SECURITY TAB
      ========================== */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-amber-500" />
              Security Settings
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Keep your account secure
            </p>

            <div className="space-y-3">
              <label className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={security.twoFactor}
                  onChange={(e) =>
                    setSecurity({ ...security, twoFactor: e.target.checked })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 mt-0.5"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    Login Alerts
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get notified of new login attempts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={security.loginAlerts}
                  onChange={(e) =>
                    setSecurity({ ...security, loginAlerts: e.target.checked })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 mt-0.5"
                />
              </label>

              <div className="p-4 border border-gray-100 rounded-xl">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) =>
                    setSecurity({ ...security, sessionTimeout: e.target.value })
                  }
                  className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={handleSaveSecurity}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md"
              >
                <CheckIcon className="w-4 h-4" />
                Save Security Settings
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <LockClosedIcon className="w-5 h-5 text-amber-500" />
              Change Password
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Update your account password
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Password updated successfully!');
              }}
              className="space-y-4 max-w-md"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium"
              >
                Update Password
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSettings;