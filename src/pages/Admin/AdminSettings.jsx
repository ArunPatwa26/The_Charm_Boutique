import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  LockClosedIcon,
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
    storeName: 'The Charm Boutique',
    storeEmail: 'info@thecharmboutique.com',
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <Cog6ToothIcon className="w-7 h-7 md:w-8 md:h-8 text-amber-500" />
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Manage your store preferences and account settings
        </p>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 inline-flex gap-1 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          GENERAL TAB
      ========================================== */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:space-y-6"
        >
          {/* Store Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-gray-900">
                  Store Information
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Basic information about your store
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('General settings saved!');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Store Name">
                  <input
                    type="text"
                    value={generalSettings.storeName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeName: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Store Email">
                  <input
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeEmail: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Store Phone">
                  <input
                    type="text"
                    value={generalSettings.storePhone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storePhone: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Store Address">
                  <input
                    type="text"
                    value={generalSettings.storeAddress}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeAddress: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Currency">
                  <select
                    value={generalSettings.currency}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        currency: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </Field>

                <Field label="Timezone">
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md text-sm"
              >
                <CheckIcon className="w-4 h-4" />
                Save Changes
              </button>
            </form>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-gray-900">
                  Your Account
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Your current admin account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'Admin'}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-lg md:text-xl font-bold flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 truncate">
                  <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] md:text-xs font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==========================================
          NOTIFICATIONS TAB
      ========================================== */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <BellIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                Choose what notifications you want to receive
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                key: 'newOrders',
                label: 'New Order Alerts',
                desc: 'Get notified when a new order is placed',
              },
              {
                key: 'orderUpdates',
                label: 'Order Status Updates',
                desc: 'Get notified when order status changes',
              },
              {
                key: 'lowStock',
                label: 'Low Stock Alerts',
                desc: 'Get notified when product stock is low',
              },
              {
                key: 'newUsers',
                label: 'New User Registrations',
                desc: 'Get notified when a new user signs up',
              },
              {
                key: 'weeklyReport',
                label: 'Weekly Summary Report',
                desc: 'Receive a weekly performance summary',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start justify-between gap-4 p-3.5 md:p-4 border border-gray-100 rounded-xl hover:bg-amber-50/30 hover:border-amber-200 transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 mt-0.5 flex-shrink-0"
                />
              </label>
            ))}
          </div>

          <div className="pt-5 mt-5 border-t border-gray-100">
            <button
              onClick={() => toast.success('Notification preferences saved!')}
              className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md text-sm"
            >
              <CheckIcon className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </motion.div>
      )}

      {/* ==========================================
          SECURITY TAB
      ========================================== */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <LockClosedIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-gray-900">
                  Security Settings
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Keep your account secure
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-start justify-between gap-4 p-3.5 md:p-4 border border-gray-100 rounded-xl hover:bg-amber-50/30 hover:border-amber-200 transition-all cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add an extra layer of security
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={security.twoFactor}
                  onChange={(e) =>
                    setSecurity({ ...security, twoFactor: e.target.checked })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 mt-0.5 flex-shrink-0"
                />
              </label>

              <label className="flex items-start justify-between gap-4 p-3.5 md:p-4 border border-gray-100 rounded-xl hover:bg-amber-50/30 hover:border-amber-200 transition-all cursor-pointer">
                <div className="flex-1 min-w-0">
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
                    setSecurity({
                      ...security,
                      loginAlerts: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400 mt-0.5 flex-shrink-0"
                />
              </label>

              <div className="p-3.5 md:p-4 border border-gray-100 rounded-xl">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Session Timeout
                </label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) =>
                    setSecurity({
                      ...security,
                      sessionTimeout: e.target.value,
                    })
                  }
                  className="w-full sm:max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white outline-none text-sm"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-gray-100">
              <button
                onClick={() => toast.success('Security settings saved!')}
                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md text-sm"
              >
                <CheckIcon className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <LockClosedIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-gray-900">
                  Change Password
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Update your account password
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Password updated successfully!');
              }}
              className="space-y-4 max-w-md"
            >
              <Field label="Current Password">
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="New Password">
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="Confirm New Password">
                <input
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm"
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

// ==========================================
// REUSABLE FIELD
// ==========================================
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white outline-none transition-all';

export default AdminSettings;