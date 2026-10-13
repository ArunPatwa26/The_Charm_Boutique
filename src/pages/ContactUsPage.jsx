import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    // Simulate API call (replace with real endpoint if you have one)
    setTimeout(() => {
      toast.success('Message sent! We will get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1200);
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      value: 'info@aijewellery.com',
      sub: 'We reply within 24 hours',
      href: 'mailto:info@aijewellery.com',
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      value: '+91-123-456-7890',
      sub: 'Mon–Sat, 9 AM – 8 PM IST',
      href: 'tel:+911234567890',
    },
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      value: 'Mumbai, Maharashtra, India',
      sub: 'Showroom open by appointment',
      href: null,
    },
    {
      icon: ClockIcon,
      title: 'Working Hours',
      value: 'Mon – Sat: 9 AM – 8 PM',
      sub: 'Sunday: Closed',
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-amber-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">We'd Love to Hear From You</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you have a question about our products, need help with an order,
              or just want to say hello — we're always happy to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-10">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              const Wrapper = item.href ? 'a' : 'div';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Wrapper
                    {...(item.href ? { href: item.href } : {})}
                    className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm font-medium text-gray-700 break-words">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-16">
        <div className="container-custom grid lg:grid-cols-2 gap-10">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Send us a Message
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Fill in the form below and we'll get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  'Sending...'
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Map / Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="rounded-3xl overflow-hidden shadow-lg h-80">
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.14571311404!2d72.74109951591708!3d19.082197838539545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="bg-gray-50 rounded-3xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="cursor-pointer font-medium text-gray-800 flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                    How long does shipping take?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm text-gray-500 mt-2 p-3">
                    Standard delivery takes 3–5 business days across India. Express
                    shipping is available at checkout.
                  </p>
                </details>

                <details className="group">
                  <summary className="cursor-pointer font-medium text-gray-800 flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                    What is your return policy?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm text-gray-500 mt-2 p-3">
                    We offer a 30-day return policy on all products. Items must be in
                    original condition with tags attached.
                  </p>
                </details>

                <details className="group">
                  <summary className="cursor-pointer font-medium text-gray-800 flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                    Are the products certified?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm text-gray-500 mt-2 p-3">
                    Yes, all our jewellery comes with authenticity certificates and
                    quality guarantees.
                  </p>
                </details>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;