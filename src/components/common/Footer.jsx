import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // ==========================================
  // CONTACT INFO — update these with real details
  // ==========================================
  const contactInfo = {
    email: 'thecharmboutique@gmail.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    instagram: 'https://www.instagram.com/_the.charm.boutique_/?hl=en',
    whatsapp: 'https://wa.me/919876543210',
  };

  const quickLinks = [
    { name: 'Shop All', href: '/products' },
    { name: 'New Arrivals', href: '/products?sort_by=newest' },
    { name: 'Categories', href: '/categories' },
    { name: 'About Us', href: '/about' },
    { name: 'My Orders', href: '/orders' },
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container-custom py-14 relative z-10">
        {/* ================================
            MAIN GRID — 3 columns
        ================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* ================================
              BRAND
          ================================ */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold tracking-tight leading-none">
                  The Charm
                </h2>
                <p className="text-[10px] tracking-[0.28em] uppercase text-amber-500 font-semibold mt-1">
                  Boutique
                </p>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
              Handcrafted jewellery for every moment that matters. Timeless
              designs, made with love.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2.5">
              <motion.a
                href={contactInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-yellow-500 transition-all duration-300"
              >
                <FaInstagram className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
              </motion.a>

              <motion.a
                href={contactInfo.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 transition-all duration-300"
              >
                <FaWhatsapp className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
              </motion.a>
            </div>
          </div>

          {/* ================================
              QUICK LINKS
          ================================ */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-amber-500 rounded-full" />
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm hover:translate-x-1 inline-block duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================================
              CONTACT
          ================================ */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white relative inline-block">
              Get in Touch
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-amber-500 rounded-full" />
            </h3>

            <ul className="space-y-3.5">
              {/* Email */}
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
                    <EnvelopeIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 pt-1.5">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm break-all">{contactInfo.email}</p>
                  </div>
                </a>
              </li>

              {/* Phone */}
              <li>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-amber-400 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors">
                    <PhoneIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 pt-1.5">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{contactInfo.phone}</p>
                  </div>
                </a>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3 text-gray-400">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0 pt-1.5">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm">{contactInfo.location}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ================================
            BOTTOM BAR
        ================================ */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p className="text-center sm:text-left">
              © {currentYear} The Charm Boutique. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/privacy"
                className="hover:text-amber-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-amber-400 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;