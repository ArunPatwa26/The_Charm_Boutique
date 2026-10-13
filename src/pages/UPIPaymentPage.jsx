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
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getOrderById, submitPaymentProof, getPaymentProof } from '../services/orderService';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ============================================================
// CONFIG — Read from Vite env
// ============================================================
const UPI_ID = import.meta.env.VITE_UPI_ID || 'thecharm@ybl';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'The Charm Boutique';

const MAX_PROOF_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const UPIPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  // Order state — try navigation state first (instant), then fetch if missing
  const [order, setOrder] = useState(location.state?.order || null);
  const [loadingOrder, setLoadingOrder] = useState(!location.state?.order);
  const [existingProof, setExistingProof] = useState(null);

  // Upload state
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // UI state
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  // ============================================================
  // Build UPI deep link (works on mobile — opens UPI app directly)
  // ============================================================
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

  // ============================================================
  // Fetch order if not passed via navigation state
  // ============================================================
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId);
        if (response.success) {
          setOrder(response.order);
        }
      } catch (err) {
        console.error('❌ Failed to load order:', err);
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoadingOrder(false);
      }
    };

    if (!order) {
      fetchOrder();
    }
  }, [orderId, order, navigate]);

  // ============================================================
  // Fetch existing payment proof (if user already submitted)
  // ============================================================
  useEffect(() => {
    const fetchProof = async () => {
      try {
        const response = await getPaymentProof(orderId);
        if (response.success) {
          // If payment already verified → redirect to status page
          if (response.payment_status === 'verified') {
            toast.success('Payment already verified!');
            navigate(`/payment/status/${orderId}`, { replace: true });
            return;
          }
          if (response.proof) {
            setExistingProof(response.proof);
            setSubmitted(true);
          }
        }
      } catch (err) {
        // Silent — proof may not exist yet, which is fine
      }
    };

    if (order) {
      fetchProof();
    }
  }, [orderId, order, navigate]);

  // ============================================================
  // Copy UPI ID
  // ============================================================
  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // ============================================================
  // File selection + validation
  // ============================================================
  const handleFileChange = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, or WEBP images allowed');
      return;
    }

    if (file.size > MAX_PROOF_SIZE) {
      toast.error('Screenshot must be under 3MB');
      return;
    }

    setScreenshot(file);

    // Build preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleRemoveScreenshot = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ============================================================
  // Submit payment proof
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!screenshot) {
      toast.error('Please upload your payment screenshot');
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitPaymentProof(orderId, screenshot, customerNote);

      if (!response.success) {
        throw new Error(response.message || 'Submission failed');
      }

      // Clear cart — order is now confirmed (pending verification)
      await clearCart();

      toast.success('Payment proof submitted! Awaiting verification.');
      setSubmitted(true);

      // Redirect to status page after short delay
      setTimeout(() => {
        navigate(`/payment/status/${orderId}`);
      }, 1500);
    } catch (error) {
      console.error('❌ Submit proof error:', error);
      toast.error(error.message || error.detail || 'Failed to submit payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Loading state
  // ============================================================
  if (loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const upiLink = buildUpiLink();
  const amount = Number(order.total_price || 0).toFixed(2);

  // ============================================================
  // RENDER — Post-submission state
  // ============================================================
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <ClockIcon className="w-10 h-10 text-yellow-600" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
            <p className="text-gray-600 mb-6">
              We've received your payment proof for order{' '}
              <span className="font-semibold">#{order.order_number}</span>. Our team will verify it
              within 24 hours.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                <li>Admin verifies your payment against the UPI transaction</li>
                <li>You'll receive an email + notification once confirmed</li>
                <li>Order will be processed and shipped shortly after</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Link to={`/payment/status/${orderId}`} className="btn-primary">
                View Status
              </Link>
              <Link to="/orders" className="btn-secondary">
                My Orders
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — Main UPI payment page
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Complete UPI Payment</h1>
            <p className="text-sm text-gray-600">Order #{order.order_number}</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                <CheckIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-green-600">Order Placed</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-3"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium">Pay & Upload</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-3"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Verified</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT — QR + UPI ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <QrCodeIcon className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold">Step 1: Pay ₹{amount}</h2>
            </div>

            {/* Amount highlight */}
            <div className="bg-gold-50 border-2 border-gold-200 rounded-xl p-4 mb-5 text-center">
              <p className="text-xs text-gray-600 mb-1">Amount to pay</p>
              <p className="text-3xl font-bold text-gold-600">₹{amount}</p>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center mb-5">
              <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm">
                <QRCodeSVG
                  value={upiLink}
                  size={200}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Scan with GPay, PhonePe, Paytm, or any UPI app
              </p>
            </div>

            {/* UPI ID with copy */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Or pay to this UPI ID:</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <code className="flex-1 text-sm font-mono font-semibold truncate">
                  {UPI_ID}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile deep link */}
            <a
              href={upiLink}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gold-500 text-gold-600 hover:bg-gold-50 rounded-xl font-semibold transition-colors md:hidden"
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              Open UPI App
            </a>

            {/* Reference note */}
            <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              <strong>💡 Tip:</strong> In the UPI note, mention your order number{' '}
              <span className="font-mono font-semibold">#{order.order_number}</span> for faster verification.
            </div>
          </motion.div>

          {/* RIGHT — Upload screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <PhotoIcon className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold">Step 2: Upload Screenshot</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload box */}
              {!screenshot ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-gold-400 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700 mb-1">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WEBP • Max 3MB
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
                <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={previewUrl}
                      alt="Payment proof preview"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-green-800 truncate">
                        {screenshot.name}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {(screenshot.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <XMarkIcon className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional note */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Optional note for admin (max 500 chars)
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="e.g., Paid via PhonePe at 3:45 PM"
                  className="w-full input-field resize-none text-sm"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!screenshot || submitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>

              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <ExclamationTriangleIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Make sure the screenshot clearly shows the <strong>amount</strong> and{' '}
                  <strong>UPI reference number</strong>. Blurry or edited screenshots will be rejected.
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Order summary strip */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-500">Order Total</p>
              <p className="font-bold text-lg">₹{amount}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Items</p>
              <p className="font-semibold">{order.items?.length || 0} item(s)</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Status</p>
              <p className="font-semibold text-yellow-600">Awaiting Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentPage;