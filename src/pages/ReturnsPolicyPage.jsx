import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const ReturnsPolicyPage = () => {
  const steps = [
    {
      icon: ArrowPathIcon,
      title: 'Request a Return',
      description:
        'Log in to your account and go to Orders. Click "Return" on the item you want to return.',
    },
    {
      icon: TruckIcon,
      title: 'Ship It Back',
      description:
        'Pack the item securely and use the prepaid shipping label we send you.',
    },
    {
      icon: ClockIcon,
      title: 'We Inspect',
      description:
        'Once received, our team inspects the item within 1-2 business days.',
    },
    {
      icon: CheckCircleIcon,
      title: 'Get Refunded',
      description:
        'Refund is processed within 5-7 business days to your original payment method.',
    },
  ];

  const eligible = [
    'Item is unused and in original condition',
    'Original tags, packaging, and certificates are intact',
    'Return is initiated within 30 days of delivery',
    'You have the original invoice or order number',
  ];

  const notEligible = [
    'Custom or personalized jewellery',
    'Items damaged due to misuse or accident',
    'Earrings (for hygiene reasons)',
    'Products purchased on final sale',
  ];

  const faqs = [
    {
      question: 'How long does the refund take?',
      answer:
        'Once we receive and inspect your return, refunds are processed within 5-7 business days. The amount will reflect in your original payment method depending on your bank.',
    },
    {
      question: 'Do I have to pay for return shipping?',
      answer:
        'No. We provide a prepaid shipping label for all eligible returns within India. International returns may incur shipping charges.',
    },
    {
      question: 'Can I exchange instead of returning?',
      answer:
        'Yes, we offer exchanges for a different size, color, or design within 30 days of delivery, subject to availability.',
    },
    {
      question: 'What if my item arrives damaged?',
      answer:
        'Please contact us within 48 hours of delivery with photos. We will arrange a free pickup and send a replacement or full refund immediately.',
    },
    {
      question: 'How will I know when my refund is processed?',
      answer:
        'You will receive an email and SMS notification once your refund has been initiated. You can also check the status in your Orders page.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          HERO
      ============================================ */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-amber-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <ArrowPathIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Hassle-Free Returns</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Returns & <span className="gradient-text">Refunds</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Shop with confidence. If something isn't right, we make returns simple.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          STEPS
      ============================================ */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center mb-14">
            How to Return an Item
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 mt-2">
                    <Icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          ELIGIBILITY
      ============================================ */}
      <section className="py-20">
        <div className="container-custom grid md:grid-cols-2 gap-8">
          {/* Eligible */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-green-50 border border-green-100 rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Eligible for Return
              </h3>
            </div>
            <ul className="space-y-3">
              {eligible.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not Eligible */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-red-50 border border-red-100 rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Not Eligible for Return
              </h3>
            </div>
            <ul className="space-y-3">
              {notEligible.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          REFUND TIMELINE INFO
      ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Refund Timeline
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Day 1-2</p>
                  <p className="text-sm text-gray-500">
                    We receive your return and verify the item condition.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Day 3-4</p>
                  <p className="text-sm text-gray-500">
                    Refund is initiated from our end. You'll receive a confirmation email.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Day 5-7</p>
                  <p className="text-sm text-gray-500">
                    Refund amount is credited to your original payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQS
      ============================================ */}
      <section className="py-20">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500">
              Everything you need to know about returns and refunds.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-amber-200 transition-colors"
              >
                <summary className="cursor-pointer flex items-center justify-between p-5 font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                  <span className="pr-4">{faq.question}</span>
                  <span className="text-amber-500 group-open:rotate-180 transition-transform flex-shrink-0">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA — Contact Support
      ============================================ */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Need Help with a Return?
          </h2>
          <p className="text-gray-300 mb-8">
            Our support team is here to make the process as smooth as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Contact Support
            </Link>
            <a
              href="mailto:support@aijewellery.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all"
            >
              <EnvelopeIcon className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnsPolicyPage;