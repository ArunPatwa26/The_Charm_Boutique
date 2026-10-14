import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CheckIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  KeyIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ==========================================
// AVATAR URL NORMALIZER
// ==========================================
const normalizeAvatar = (url) => {
  if (!url) return null;

  // Google avatars — force valid size, strip bad suffix
  if (url.includes('googleusercontent.com')) {
    const base = url.split('=')[0];
    return `${base}=s200-c`;
  }

  // Cloudinary — auto optimize
  if (url.includes('res.cloudinary.com')) {
    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_200,h_200,c_fill/'
    );
  }

  return url;
};

// ==========================================
// USER AVATAR (local component)
// ==========================================
const UserAvatar = ({ user, size = 'sm' }) => {
  const [error, setError] = useState(false);

  const rawSrc =
    user?.avatar ||
    user?.profile_image ||
    user?.avatar_url ||
    user?.profile_pic ||
    user?.image ||
    null;

  const src = normalizeAvatar(rawSrc);

  const name =
    user?.name ||
    user?.full_name ||
    user?.username ||
    user?.given_name ||
    'Admin';

  const initial = name.charAt(0).toUpperCase();

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  // Size presets
  const sizeClass =
    size === 'xl'
      ? 'w-14 h-14 text-lg'
      : size === 'lg'
      ? 'w-11 h-11 text-base'
      : size === 'xs'
      ? 'w-8 h-8 text-xs'
      : 'w-7 h-7 text-[11px]';

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading="lazy"
        onError={() => setError(true)}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 bg-cream-200`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} rounded-full bg-ink-800 text-cream-100 flex items-center justify-center font-bold flex-shrink-0`}
    >
      {initial}
    </span>
  );
};

// ==========================================
// REUSABLE FIELD
// ==========================================
const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-[11px] uppercase tracking-wider font-semibold text-ink-500 mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-[10px] text-ink-400 mt-1.5">{hint}</p>}
  </div>
);

const inputClass =
  'w-full px-3.5 py-2.5 bg-cream-50 border border-line rounded-lg text-sm text-ink-800 placeholder:text-ink-300 focus:ring-2 focus:ring-burgundy-500/20 focus:border-burgundy-500 focus:bg-white outline-none transition-all';

// ==========================================
// TOGGLE SWITCH
// ==========================================
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-burgundy-500/30 focus:ring-offset-2 ${
      checked ? 'bg-ink-800' : 'bg-cream-200'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// ==========================================
// SECTION HEADER
// ==========================================
const SectionHeader = ({ icon: Icon, title, subtitle, accent = 'ink' }) => {
  const accentMap = {
    ink: 'bg-ink-800 text-cream-100',
    burgundy: 'bg-burgundy-500 text-cream-100',
    amber: 'bg-amber-500 text-white',
    green: 'bg-green-600 text-white',
  };
  return (
    <div className="flex items-start gap-3.5 mb-6">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          accentMap[accent] || accentMap.ink
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h2 className="font-serif text-lg font-bold text-ink-800 leading-tight">
          {title}
        </h2>
        <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
};

// ==========================================
// MAIN
// ==========================================
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

  const notificationItems = [
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
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2 flex items-center gap-1.5">
            <SparklesIcon className="w-3 h-3" />
            Configuration
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            Manage your store preferences and account security
          </p>
        </div>

        {/* ✅ FIXED — Account pill with real avatar */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-white border border-line rounded-lg">
          <UserAvatar user={user} size="xs" />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-ink-800 leading-tight truncate max-w-[140px]">
              {user?.name || 'Admin'}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-500">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          TABS
      ========================================== */}
      <div className="bg-white border border-line rounded-xl p-1.5 inline-flex gap-1 overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'text-cream-100'
                  : 'text-ink-600 hover:bg-cream-100'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 bg-ink-800 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ==========================================
          TAB CONTENT
      ========================================== */}
      <AnimatePresence mode="wait">
        {/* ==========================================
            GENERAL TAB
        ========================================== */}
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Store Info */}
            <div className="bg-white border border-line rounded-xl p-5 md:p-6">
              <SectionHeader
                icon={GlobeAltIcon}
                title="Store Information"
                subtitle="Basic details about your boutique"
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('General settings saved');
                }}
                className="space-y-5"
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
                      <option value="America/New_York">
                        America/New_York
                      </option>
                    </select>
                  </Field>
                </div>

                <div className="pt-5 border-t border-line flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-800 text-cream-100 rounded-lg hover:bg-ink-700 transition-colors font-medium text-xs uppercase tracking-wider"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Account Info */}
            <div className="bg-white border border-line rounded-xl p-5 md:p-6">
              <SectionHeader
                icon={UserIcon}
                title="Your Account"
                subtitle="Currently signed-in administrator"
              />

              <div className="flex items-center gap-4 p-4 bg-cream-50 border border-line rounded-lg">
                {/* ✅ FIXED — Large avatar with fallback */}
                <UserAvatar user={user} size="xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-800 text-sm truncate">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-ink-500 flex items-center gap-1.5 mt-0.5 truncate">
                    <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ink-800 text-cream-100 rounded-full text-[10px] uppercase tracking-wider font-semibold flex-shrink-0">
                  <ShieldCheckIcon className="w-3 h-3" />
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            NOTIFICATIONS TAB
        ========================================== */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white border border-line rounded-xl p-5 md:p-6">
              <SectionHeader
                icon={BellIcon}
                title="Notification Preferences"
                subtitle="Choose what updates you want to receive"
              />

              <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
                {notificationItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-cream-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800">
                        {item.label}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <Toggle
                      checked={notifications[item.key]}
                      onChange={(val) =>
                        setNotifications({
                          ...notifications,
                          [item.key]: val,
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="pt-5 mt-5 border-t border-line flex justify-end">
                <button
                  onClick={() =>
                    toast.success('Notification preferences saved')
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-800 text-cream-100 rounded-lg hover:bg-ink-700 transition-colors font-medium text-xs uppercase tracking-wider"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  Save Preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            SECURITY TAB
        ========================================== */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Security Settings */}
            <div className="bg-white border border-line rounded-xl p-5 md:p-6">
              <SectionHeader
                icon={LockClosedIcon}
                title="Security Settings"
                subtitle="Keep your admin account protected"
              />

              <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
                <div className="flex items-center justify-between gap-4 p-4 hover:bg-cream-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Toggle
                    checked={security.twoFactor}
                    onChange={(val) =>
                      setSecurity({ ...security, twoFactor: val })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-4 hover:bg-cream-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">
                      Login Alerts
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Toggle
                    checked={security.loginAlerts}
                    onChange={(val) =>
                      setSecurity({ ...security, loginAlerts: val })
                    }
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-3.5 h-3.5 text-ink-500" />
                    <label className="text-sm font-medium text-ink-800">
                      Session Timeout
                    </label>
                  </div>
                  <p className="text-xs text-ink-500 mb-3">
                    Automatically sign out after inactivity
                  </p>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className={`${inputClass} sm:max-w-xs`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-line flex justify-end">
                <button
                  onClick={() => toast.success('Security settings saved')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-800 text-cream-100 rounded-lg hover:bg-ink-700 transition-colors font-medium text-xs uppercase tracking-wider"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  Save Settings
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white border border-line rounded-xl p-5 md:p-6">
              <SectionHeader
                icon={KeyIcon}
                title="Change Password"
                subtitle="Update your account password regularly"
                accent="burgundy"
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Password updated successfully');
                }}
                className="space-y-4 max-w-md"
              >
                <Field label="Current Password">
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Field>
                <Field
                  label="New Password"
                  hint="Use at least 8 characters with a mix of letters and numbers"
                >
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm New Password">
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </Field>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy-500 text-cream-100 rounded-lg hover:bg-burgundy-600 transition-colors font-medium text-xs uppercase tracking-wider"
                  >
                    <KeyIcon className="w-3.5 h-3.5" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;