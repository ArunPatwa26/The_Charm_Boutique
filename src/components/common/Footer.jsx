import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const contactInfo = {
    email: 'thecharmboutique@gmail.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    instagram: 'https://www.instagram.com/_the.charm.boutique_/?hl=en',
  };

  const columns = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'New In', href: '/products?sort_by=newest' },
        { name: 'Categories', href: '/categories' },
        { name: 'Bestsellers', href: '/products?sort_by=rating' },
      ],
    },
    {
      title: 'Account',
      links: [
        { name: 'My Profile', href: '/profile' },
        { name: 'My Orders', href: '/orders' },
        { name: 'Wishlist', href: '/wishlist' },
        { name: 'Cart', href: '/cart' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ],
    },
  ];

  return (
    <footer className="bg-ink-800 text-cream-100">
      {/* ==========================================
          MAIN FOOTER
      ========================================== */}
      <div className="container-editorial py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* BRAND + NEWSLETTER (spans 5 on desktop) */}
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-burgundy-400 mb-4">
              The Charm Boutique
            </p>

            <h3 className="font-serif text-2xl md:text-3xl leading-tight text-cream-100 mb-4">
              Handcrafted jewellery,
              <br />
              <span className="italic text-burgundy-300">
                made for you.
              </span>
            </h3>

            <p className="text-sm text-cream-100/60 max-w-md leading-relaxed mb-6">
              Join our list for early access, exclusive drops, and styling
              stories — straight to your inbox.
            </p>

            {/* Newsletter — minimal inline form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing!');
              }}
              className="flex items-center max-w-md border-b border-cream-100/30 pb-2"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                className="flex-1 bg-transparent border-none outline-none text-sm text-cream-100 placeholder-cream-100/40"
              />
              <button
                type="submit"
                className="text-sm font-medium text-cream-100 hover:text-burgundy-300 transition-colors flex items-center gap-1 pl-3"
              >
                Subscribe
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* LINK COLUMNS (spans 5) */}
          <div className="md:col-span-5 grid grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="text-[11px] uppercase tracking-kicker font-semibold text-cream-100/50 mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-cream-100/80 hover:text-burgundy-300 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CONTACT (spans 2) */}
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-kicker font-semibold text-cream-100/50 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-cream-100/80 hover:text-burgundy-300 transition-colors break-all"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-cream-100/80 hover:text-burgundy-300 transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="text-cream-100/60">{contactInfo.location}</li>
            </ul>

            {/* Social */}
            <a
              href={contactInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm text-cream-100/80 hover:text-burgundy-300 transition-colors"
            >
              <FaInstagram className="w-4 h-4" />
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* ==========================================
          BOTTOM BAR
      ========================================== */}
      <div className="border-t border-cream-100/10">
        <div className="container-editorial py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream-100/50">
            <p>© {currentYear} The Charm Boutique. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="hover:text-cream-100 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-cream-100 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/shipping"
                className="hover:text-cream-100 transition-colors"
              >
                Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;