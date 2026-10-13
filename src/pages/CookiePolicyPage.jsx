import { motion } from 'framer-motion';
import { CakeIcon, Cog6ToothIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const CookiePolicyPage = () => {
  const cookieTypes = [
    {
      icon: Cog6ToothIcon,
      title: 'Essential Cookies',
      color: 'from-green-400 to-emerald-500',
      description: 'Required for the website to function properly.',
      examples: [
        'Authentication tokens (JWT)',
        'Shopping cart data',
        'Session management',
        'Security and fraud prevention',
      ],
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Cookies',
      color: 'from-blue-400 to-cyan-500',
      description: 'Help us understand how visitors use our site.',
      examples: [
        'Page views and session duration',
        'Most visited products and categories',
        'Traffic sources',
        'Device and browser information',
      ],
    },
    {
      icon: CakeIcon,
      title: 'Marketing Cookies',
      color: 'from-purple-400 to-pink-500',
      description: 'Used to show relevant advertisements and offers.',
      examples: [
        'Retargeting ads on social media',
        'Personalized product recommendations',
        'Email campaign tracking',
        'A/B testing for site improvements',
      ],
    },
  ];

  const sections = [
    {
      title: 'What Are Cookies?',
      content:
        'Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you interact with the site.',
    },
    {
      title: 'How We Use Cookies',
      content:
        'AI Jewellery Shop uses cookies to provide a smooth and personalized shopping experience. Without essential cookies, key features like login and cart would not work properly.',
    },
    {
      title: 'Third-Party Cookies',
      content:
        'We use trusted third-party services that may set their own cookies: Razorpay (payment processing), SendGrid (email notifications), Cloudinary (image delivery), and Google Analytics (usage tracking). Each has its own privacy policy.',
    },
    {
      title: 'Managing Your Cookies',
      content:
        'You can control or delete cookies through your browser settings. Most browsers allow you to block cookies or alert you when cookies are being sent. Note that disabling cookies may affect website functionality.',
    },
    {
      title: 'Cookie Retention',
      content:
        'Session cookies are deleted when you close your browser. Persistent cookies remain for up to 12 months or until you manually delete them. Essential authentication cookies expire based on your session settings.',
    },
    {
      title: 'Updates to This Policy',
      content:
        'We may update this Cookie Policy periodically to reflect changes in technology or legal requirements. Significant changes will be announced on our website.',
    },
    {
      title: 'Contact Us',
      content:
        'For questions about our use of cookies, contact us at privacy@aijewellery.com.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <CakeIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Transparency First</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Cookie Policy
            </h1>
            <p className="text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Types of Cookies We Use
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {cookieTypes.map((type, i) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{type.description}</p>
                  <ul className="space-y-1.5">
                    {type.examples.map((ex, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container-custom max-w-4xl mx-auto space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CookiePolicyPage;