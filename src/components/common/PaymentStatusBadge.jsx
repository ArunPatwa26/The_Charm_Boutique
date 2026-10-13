const STATUS_MAP = {
  pending: {
    label: 'Payment Pending',
    classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  verification_pending: {
    label: 'Verifying Payment',
    classes: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500 animate-pulse',
  },
  verified: {
    label: 'Payment Verified',
    classes: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Payment Rejected',
    classes: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  refunded: {
    label: 'Refunded',
    classes: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500',
  },
};

const PaymentStatusBadge = ({ status, size = 'md' }) => {
  if (!status) return null;

  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1'
      : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.classes} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;