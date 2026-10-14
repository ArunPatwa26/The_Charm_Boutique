import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  XMarkIcon,
  PhotoIcon,
  CheckIcon,
  InformationCircleIcon,
  CurrencyRupeeIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  adminUpdateProduct,
  getProductById,
  getCategories,
} from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ==========================================
// SCHEMA (unchanged)
// ==========================================
const productSchema = yup.object().shape({
  name: yup
    .string()
    .required('Product name is required')
    .min(3, 'Name must be at least 3 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Price is required')
    .positive('Price must be positive'),
  discount_price: yup
    .number()
    .transform((v, o) => (o === '' ? null : v))
    .nullable()
    .positive('Discount price must be positive'),
  category: yup.string().required('Category is required'),
  material: yup.string().required('Material is required'),
  stock: yup
    .number()
    .typeError('Stock must be a number')
    .required('Stock is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  gemstone: yup.string().nullable(),
  weight: yup
    .number()
    .transform((v, o) => (o === '' ? null : v))
    .nullable()
    .positive('Weight must be positive'),
  tags: yup.string().nullable(),
  is_active: yup.boolean(),
  is_featured: yup.boolean(),
  is_ai_recommended: yup.boolean(),
});

const MATERIALS = [
  'Gold',
  'Silver',
  'Platinum',
  'Rose Gold',
  'White Gold',
  'Brass',
];

const GEMSTONES = [
  'Diamond',
  'Ruby',
  'Sapphire',
  'Emerald',
  'Cubic Zirconia',
  'Pearl',
];

// ==========================================
// REUSABLE UI
// ==========================================
const FormSection = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:bg-white focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-amber-400 focus:ring-amber-100'
  }`;

const AdminEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category: '',
      material: '',
      stock: '',
      gemstone: '',
      weight: '',
      tags: '',
      is_active: true,
      is_featured: false,
      is_ai_recommended: false,
    },
  });

  const priceValue = watch('price');
  const discountValue = watch('discount_price');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, productRes] = await Promise.all([
          getCategories(),
          getProductById(id),
        ]);

        if (categoriesRes.success) {
          setCategories(categoriesRes.categories || []);
        }

        if (productRes.success) {
          const product = productRes.product;
          reset({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            discount_price: product.discount_price || '',
            category: product.category || '',
            material: product.material || '',
            stock: product.stock || '',
            gemstone: product.gemstone || '',
            weight: product.weight || '',
            tags: product.tags?.join(', ') || '',
            is_active:
              product.is_active !== undefined ? product.is_active : true,
            is_featured: product.is_featured || false,
            is_ai_recommended: product.is_ai_recommended || false,
          });
          setExistingImages(product.images || []);
        } else {
          toast.error('Product not found');
          navigate('/admin/products');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load product');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==========================================
  // IMAGE HANDLERS
  // ==========================================
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalid = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (invalid.length > 0) {
      toast.error('Some images exceed 5MB. Please resize them.');
      return;
    }

    const total = existingImages.length + newImages.length + files.length;
    if (total > 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }

    setNew