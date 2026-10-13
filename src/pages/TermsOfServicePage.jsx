import { motion } from 'framer-motion';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsOfServicePage = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By accessing or using AI Jewellery Shop, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.',
    },
    {
      title: '2. Eligibility',
      content:
        'You must be at least 18 years old, or have permission from a parent or legal guardian, to make purchases on our platform. By using our services, you confirm that the information you provide is accurate and truthful.',
    },
    {
      title: '3. Account Responsibilities',
      content:
        'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately if you suspect unauthorized access. We are not liable for losses resulting from unauthorized use of your account.',
    },
    {
      title: '4. Product Information',
      content:
        'We strive to display accurate product images, descriptions, and prices. However, slight variations in color may occur due to screen differences. All weights and measurements are approximate. Prices are subject to change without notice.',
    },
    {
      title: '5. Orders and Payments',
      content:
        'All orders are subject to availability and confirmation. We reserve the right to cancel any order if payment cannot be verified or if fraud is suspected. Payments are processed securely via Razorpay. We do not store card details.',
    },
    {
      title: '6. Shipping and Delivery',
      content:
        'Delivery times are estimates and not guaranteed. Delays may occur due to weather, customs, or courier issues. Once shipped, the risk of loss passes to you. Full delivery policy is available on our Shipping Information page.',
    },
    {
      title: '7. Returns and Refunds',
      content:
        'Returns are accepted within 30 days of delivery, subject to our Returns Policy. Custom and personalized items are non-returnable. Refunds are processed within 5-7 business days after inspection.',
    },
    {
      title: '8. Intellectual Property',
      content:
        'All content on this website — including logos, images, text, and code — is the property of AI Jewellery Shop and is protected by copyright laws. You may not copy, reproduce, or distribute any content without written permission.',
    },
    {
      title: '9. Prohibited Activities',
      content:
        'You agree not to: (a) use the site for illegal purposes, (b) attempt to hack or disrupt the service, (c) submit false information, (d) copy or scrape content, or (e) infringe on intellectual property rights.',
    },
    {
      title: '10. Limitation of Liability',
      content:
        'AI Jewellery Shop is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the amount you paid for the specific product in question.',
    },
    {
      title: '11. Governing Law',
      content:
        'These Terms are governed by the laws of India. Any disputes will be resolved in the courts of Mumbai, Maharashtra. Both parties agree to attempt good-faith negotiation before pursuing legal action.',
    },
    {
      title: '12. Changes to Terms',
      content:
        'We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance. We recommend reviewing this page periodically.',
    },
    {
      title: '13. Contact Information',
      content:
        'For questions about these Terms, contact us at legal@aijewellery.com or write to: AI Jewellery Shop, Mumbai, Maharashtra, India.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Legal Agreement</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Terms of Service
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
          <p className="text-gray-600 leading-relaxed mb-10 text-base">
            Please read these Terms of Service carefully before using AI Jewellery Shop.
            These terms govern your access to and use of our website, products, and services.
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                className="border-l-4 border-amber-400 pl-6"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfServicePage;