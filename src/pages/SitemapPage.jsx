import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  FolderIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  TruckIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

const SitemapPage = () => {
  const sections = [
    {
      title: 'Main Pages',
      icon: HomeIcon,
      color: 'from-blue-400 to-blue-500',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'Categories', href: '/categories' },
        { name: 'AI Style', href: '/products?ai=true' },
      ],
    },
    {
      title: 'Shopping',
      icon: ShoppingBagIcon,
      color: 'from-purple-400 to-pink-500',
      links: [
        { name: 'Shopping Cart', href: '/cart' },
        { name: 'Wishlist', href: '/wishlist' },
        { name: 'Checkout', href: '/checkout' },
        { name: 'Order Confirmation', href: '/order-confirmation' },
      ],
    },
    {
      title: 'My Account',
      icon: UserIcon,
      color: 'from-green-400 to-emerald-500',
      links: [
        { name: 'Profile', href: '/profile' },
        { name: 'My Orders', href: '/orders' },
        { name: 'Login', href: '/login' },
        { name: 'Register', href: '/register' },
      ],
    },
    {
      title: 'Support',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-amber-400 to-yellow-500',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Help Center', href: '/help' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'Returns Policy', href: '/returns' },
      ],
    },
    {
      title: 'Information',
      icon: InformationCircleIcon,
      color: 'from-cyan-400 to-teal-500',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Sustainability', href: '/sustainability' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Legal',
      icon: DocumentTextIcon,
      color: 'from-red-400 to-rose-500',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Sitemap', href: '/sitemap' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200 mb-6">
              <MapIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Site Navigation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Sitemap
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A complete overview of all pages on AI Jewellery Shop.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sitemap Grid */}
      <section className="py-16">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link, idx) => (
                      <li key={idx}>
                        <Link
                          to={link.href}
                          className="text-sm text-gray-600 hover:text-amber-600 transition-colors flex items-center gap-2 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-amber-400 group-hover:scale-150 transition-transform" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SitemapPage;