import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  QrCodeIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowUpRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import {
  getOrderById,
  submitPaymentProof,
  getPaymentProof,
} from '../services/orderService';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// CONFIG
// ==========================================
const UPI_ID = import.meta.env.VITE_UPI_ID || 'thecharm@ybl';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'The Charm Boutique';
const MAX_PROOF_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const UPIPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loadingOrder, setLoadingOrder] = useState(!location.state?.order);
  const [existingProof, setExistingProof] = useState(null);

  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  // ==========================================
  // BUILD UPI DEEP LINK
  // ==========================================
  const buildUpiLink = () => {
    if (!order) return '';
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_NAME,
      am: Number(order.total_price || 0).toFixed(2),
      cu: 'INR',
      tn: `Order ${order.order_number || orderId}`,
    });
    return `upi://pay?${params.toString()}`;
  };

  // ==========================================
  // FETCH ORDER
  // ==========================================
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId);
        if (response.success) setOrder(response.order);
      } catch (err) {
        console.error('Failed to load order:', err);
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoadingOrder(false);
      }
    };
    if (!order) fetchOrder();
  }, [orderId, order, navigate]);

  // ==========================================
  // FETCH EXISTING PROOF
  // ==========================================
  useEffect(() => {
    const fetchProof = async () => {
      try {
        const response = await getPaymentProof(orderId);
        if (response.success) {
          if (response.payment_status === 'verified') {
            toast.success('Payment already verified');
            navigate(`/payment/status/${orderId}`, { replace: true });
            return;
          }
          if (response.proof) {
            setExistingProof(response.proof);
            setSubmitted(true);
          }
        }
      } catch {
        // silent
      }
    };
    if (order) fetchProof();
  }, [orderId, order, navigate]);

  // ==========================================
  // COPY UPI ID
  // ==========================================
  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success('UPI ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // ==========================================
  // FILE HANDLING
  // ==========================================
  const handleFileChange = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, or WEBP allowed');
      return;
    }
    if (file.size > MAX_PROOF_SIZE) {
      toast.error('Screenshot must be under 3MB');
      return;
    }
    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files?.[0]);
  };

  const handleRemoveScreenshot = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ==========================================
  // SUBMIT PROOF
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Please upload your payment screenshot');
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitPaymentProof(
        orderId,
        screenshot,
        customerNote
      );
      if (!response.success) {
        throw new Error(response.message || 'Submission failed');
      }
      await clearCart();
      toast.success('Proof submitted');
      setSubmitted(true);
      setTimeout(() => {
        navigate(`/payment/status/${orderId}`);
      }, 1500);
    } catch (error) {
      console.error('Submit proof error:', error);
      toast.error(
        error.message || error.detail || 'Failed to submit payment proof'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING / NOT FOUND
  // ==========================================
  if (loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  const upiLink = buildUpiLink();
  const amount = Number(order.total_price || 0);

  // ==========================================
  // POST-SUBMISSION STATE
  // ==========================================
  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white border border-line rounded-lg p-8"
        >
          <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-cream-200">
            <ClockIcon className="w-7 h-7 text-ink-700" />
          </div>

          <p className="kicker text-center mb-3">Submitted</p>
          <h1 className="font-serif text-2xl font-bold text-ink-800 text-center mb-3">
            Verifying your payment.
          </h1>
          <p className="text-sm text-ink-600 text-center mb-8 leading-relaxed">
            We've received your proof for order{' '}
            <span className="font-medium text-ink-800">
              #{order.order_number}
            </span>
            . Our team will verify within 24 hours.
          </p>

          <div className="border border-line rounded p-4 mb-6 space-y-2.5">
            <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-3">
              What happens next
            </p>
            <Step n="1" text="Admin verifies against UPI transaction" />
            <Step n="2" text="You get an email + notification" />
            <Step n="3" text="Order is processed and shipped" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/payment/status/${orderId}`}
              className="btn-solid py-3 justify-center"
            >
              View Status
            </Link>
            <Link
              to="/orders"
              className="btn-outline py-3 justify-center"
            >
              My Orders
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // MAIN UPI PAYMENT PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-cream-100 pb-16">
      {/* HEADER */}
      <section className="border-b border-line bg-cream-100">
        <div className="container-editorial py-6 md:py-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-ink-500 hover:text-burgundy-500 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Bag
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="kicker mb-3">Payment</p>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
                Pay via UPI
              </h1>
              <p className="text-xs md:text-sm text-ink-500 mt-2">
                Order #{order.order_number}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">
                Amount to pay
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-ink-800">
                ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="container-editorial py-8 md:py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ==========================================
              LEFT — QR + UPI ID
          ========================================== */}
          <div className="space-y-5">
            <div className="bg-white border border-line rounded-lg p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-line">
                <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
                  Step 1 · Pay
                </p>
                <span className="text-[10px] uppercase tracking-wider text-ink-400">
                  Scan or tap
                </span>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded border border-line">
                  <QRCodeSVG
                    value={upiLink}
                    size={200}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#1A1A1A"
                  />
                </div>
                <p className="text-xs text-ink-500 mt-4 text-center">
                  Scan with any UPI app
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[10px] uppercase tracking-wider text-ink-400 font-medium">
                  or pay to
                </span>
                <div className="flex-1 h-px bg-line" />
              </div>

              {/* ==========================================
                  UPI ID — CLICKABLE DEEP LINK ON MOBILE
              ========================================== */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-2">
                  UPI ID
                </p>

                <div className="flex items-stretch border border-line rounded overflow-hidden">
                  {/* UPI ID — clickable link (opens UPI app on mobile) */}
                  <a
                    href={upiLink}
                    className="flex-1 flex items-center gap-3 px-4 py-3.5 min-w-0 hover:bg-cream-100 transition-colors group"
                    title="Open in UPI app"
                  >
                    <span className="text-sm font-mono font-medium text-ink-800 truncate">
                      {UPI_ID}
                    </span>
                    <ArrowUpRightIcon className="w-3.5 h-3.5 text-ink-400 group-hover:text-burgundy-500 transition-colors flex-shrink-0 ml-auto md:hidden" />
                  </a>

                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1.5 px-4 bg-cream-100 border-l border-line text-[11px] uppercase tracking-wider font-semibold text-ink-800 hover:bg-cream-200 transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Help text — explains the mobile behavior */}
                <p className="text-[11px] text-ink-500 mt-2 leading-relaxed">
                  <span className="font-medium text-ink-700">On mobile:</span>{' '}
                  tap the UPI ID above to open GPay, PhonePe, or Paytm with the
                  amount pre-filled.
                </p>
              </div>

              {/* Mobile-only primary CTA — direct link */}
              <a
                href={upiLink}
                className="md:hidden mt-5 inline-flex items-center justify-center gap-2 w-full py-3.5 bg-ink-800 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold hover:bg-burgundy-500 transition-colors"
              >
                <ArrowUpRightIcon className="w-4 h-4" />
                Open UPI App
              </a>

              {/* Info tip */}
              <div className="mt-5 p-3.5 bg-cream-100 border border-line rounded flex items-start gap-2.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-burgundy-500 flex-shrink-0 mt-0.5">
                  Tip
                </span>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Add{' '}
                  <span className="font-mono font-medium text-ink-800">
                    #{order.order_number}
                  </span>{' '}
                  in the UPI payment note for faster verification.
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              RIGHT — Upload Screenshot
          ========================================== */}
          <div className="bg-white border border-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-line">
              <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
                Step 2 · Upload Proof
              </p>
              <span className="text-[10px] uppercase tracking-wider text-ink-400">
                Required
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Upload box */}
              {!screenshot ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-line hover:border-ink-800 rounded p-8 text-center cursor-pointer transition-colors"
                >
                  <PhotoIcon className="w-9 h-9 text-ink-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-ink-800 mb-1">
                    Upload payment screenshot
                  </p>
                  <p className="text-[11px] text-ink-500">
                    Click or drag · JPG, PNG, WEBP · Max 3MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-line rounded p-4 bg-cream-100">
                  <div className="flex items-start gap-3">
                    <img
                      src={previewUrl}
                      alt="Payment proof preview"
                      className="w-16 h-16 object-cover rounded border border-line flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-xs font-medium text-ink-800 truncate">
                        {screenshot.name}
                      </p>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {(screenshot.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 hover:bg-white rounded transition-colors flex-shrink-0"
                      aria-label="Remove"
                    >
                      <XMarkIcon className="w-4 h-4 text-ink-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Optional note */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
                  Optional Note
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="e.g., Paid via PhonePe at 3:45 PM"
                  className="input-editorial resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!screenshot || submitting}
                className="btn-solid w-full py-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4" />
                    Submit for Verification
                  </>
                )}
              </button>

              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3.5 bg-cream-100 border border-line rounded">
                <ExclamationTriangleIcon className="w-4 h-4 text-ink-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-ink-600 leading-relaxed">
                  Screenshot must clearly show the{' '}
                  <span className="font-medium text-ink-800">amount</span> and{' '}
                  <span className="font-medium text-ink-800">
                    UPI reference number
                  </span>
                  . Blurry or edited screenshots will be rejected.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* ==========================================
            BOTTOM SUMMARY STRIP
        ========================================== */}
        <div className="mt-6 bg-white border border-line rounded-lg p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">
                Order Total
              </p>
              <p className="font-serif text-lg font-bold text-ink-800">
                ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">
                Items
              </p>
              <p className="text-sm font-medium text-ink-800">
                {order.items?.length || 0}{' '}
                {order.items?.length === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">
                Status
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-burgundy-500">
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy-500 animate-pulse" />
                Awaiting Payment
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// STEP ROW
// ==========================================
const Step = ({ n, text }) => (
  <div className="flex items-start gap-3">
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cream-200 text-[10px] font-bold text-ink-700 flex items-center justify-center mt-0.5">
      {n}
    </span>
    <span className="text-xs text-ink-600 leading-relaxed">{text}</span>
  </div>
);

export default UPIPaymentPage;