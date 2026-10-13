import { motion } from 'framer-motion';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon } from '@heroicons/react/24/outline';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: EyeIcon,
      title: '1. Information We Collect',
      content: [
        'Personal Information: Name, email address, phone number, shipping and billing addresses.',
        'Account Information: Encrypted password, order history, wishlist items.',
        'Payment Information: Processed securely via Razorpay. We do not store credit/debit card details.',
        'Usage Data: Pages visited, products viewed, search queries, and device information.',
        'Cookies: Small files stored on your browser to enhance your experience.',
      ],
    },
    {
      icon: ShieldCheckIcon,
      title: '2. How We Use Your Information',
      content: [
        'To process and deliver your orders accurately.',
        'To provide personalized product recommendations using our AI engine.',
        'To send order confirmations, shipping updates, and delivery notifications.',
        'To improve our website, products, and services.',
        'To detect and prevent fraud or misuse.',
        'To comply with legal obligations.',
      ],
    },
    {
      icon: LockClosedIcon,
      title: '3. How We Protect Your Information',
      content: [
        'All data transmitted is encrypted using HTTPS/TLS protocols.',
        'Passwords are hashed using bcrypt with salt — never stored in plain text.',
        'Authentication uses JSON Web Tokens (JWT) with secure signing.',
        'Payment processing is handled by Razorpay (PCI-DSS compliant).',
        'Our databases are hosted on MongoDB Atlas with encryption at rest.',
        'Access to user data is restricted to authorized personnel only.',
      ],
    },
  ];

  const otherSections = [
    {
      title: '4. Information Sharing',
      content:
        'We never sell your personal information. We only share data with trusted third parties essential to running our service — such as payment processors (Razorpay), email providers (SendGrid), and image hosts (Cloudinary). All partners adhere to strict data protection standards.',
    },
    {
      title: '5. Cookies and Tracking',
      content:
        'We use essential cookies for authentication and cart persistence. Optional analytics cookies help us understand how customers use our site. You can disable cookies in your browser settings, though some features may not work properly.',
    },
    {
      title: '6. Your Rights',
      content:
        'You have the right to access, correct, or delete your personal data. You can update your profile anytime from your account page. To request full data deletion, contact us at privacy@aijewellery.com and we will process your request within 30 days.',
    },
    {
      title: '7. Children\'s Privacy',
      content:
        'Our services are not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have done so, please contact us immediately.',
    },
    {
      title: '8. Changes to This Policy',
      content:
        'We may update this Privacy Policy periodically. Significant changes will be communicated via email or a prominent notice on our website. Continued use of our services constitutes acceptance of the updated policy.',
    },
    {
      title: '9. Contact Us',
      content:
        'For any questions about this Privacy Policy, contact us at privacy@aijewellery.com or write to us at: AI Jewellery Shop, Mumbai, Maharashtra, India.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <ShieldCheckIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Your Privacy Matters</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-10 text-base">
              At AI Jewellery Shop, we are committed to protecting your privacy and personal
              information. This Privacy Policy explains what data we collect, how we use it,
              and the measures we take to keep it safe.
            </p>

            {/* Main Sections with Icons */}
            <div className="space-y-8 mb-12">
              {sections.map((section, i) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 rounded-2xl p-6 md:p-8"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    </div>
                    <ul className="space-y-2">
                      {section.content.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>

            {/* Other Sections */}
            <div className="space-y-8">
              {otherSections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;