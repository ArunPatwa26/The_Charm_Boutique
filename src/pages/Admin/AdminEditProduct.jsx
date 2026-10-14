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

    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setRemoveImages((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setMainExistingImage = (index) => {
    if (index === 0) return;
    setExistingImages((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
  };

  // ==========================================
  // SUBMIT (same logic as before)
  // ==========================================
  const onSubmit = async (data) => {
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      if (data.discount_price) {
        formData.append('discount_price', String(data.discount_price));
      }
      formData.append('category', data.category);
      formData.append('material', data.material);
      formData.append('stock', String(data.stock));
      if (data.gemstone) formData.append('gemstone', data.gemstone);
      if (data.weight) formData.append('weight', String(data.weight));
      if (data.tags) formData.append('tags', data.tags);

      formData.append('is_active', data.is_active ? 'true' : 'false');
      formData.append('is_featured', data.is_featured ? 'true' : 'false');
      formData.append(
        'is_ai_recommended',
        data.is_ai_recommended ? 'true' : 'false'
      );

      if (removeImages.length > 0) {
        formData.append('remove_images', removeImages.join(','));
      }

      for (let i = 0; i < newImages.length; i++) {
        formData.append('new_images', newImages[i]);
      }

      const response = await adminUpdateProduct(id, formData);
      if (response.success) {
        toast.success('Product updated successfully!');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Update product error:', error);
      toast.error(error?.detail || error?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const showDiscountPreview =
    priceValue &&
    discountValue &&
    Number(discountValue) > 0 &&
    Number(priceValue) > Number(discountValue);

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Edit Product
          </h1>
          <p className="text-sm text-gray-500 truncate">
            Update product information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ==========================================
            BASIC INFORMATION
        ========================================== */}
        <FormSection
          icon={InformationCircleIcon}
          title="Basic Information"
          description="Name, category, and description"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required error={errors.name?.message}>
              <input
                {...register('name')}
                className={inputClass(!!errors.name)}
                placeholder="Product name"
              />
            </Field>

            <Field label="Category" required error={errors.category?.message}>
              <select
                {...register('category')}
                className={inputClass(!!errors.category)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Description"
                required
                error={errors.description?.message}
              >
                <textarea
                  {...register('description')}
                  rows="4"
                  className={`${inputClass(!!errors.description)} resize-none`}
                  placeholder="Describe your product in detail"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        {/* ==========================================
            PRICING
        ========================================== */}
        <FormSection
          icon={CurrencyRupeeIcon}
          title="Pricing"
          description="Base price and optional discount"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Price (₹)" required error={errors.price?.message}>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className={inputClass(!!errors.price)}
                placeholder="0.00"
              />
            </Field>

            <Field
              label="Discount Price (₹)"
              error={errors.discount_price?.message}
              hint="Leave empty if no discount"
            >
              <input
                type="number"
                step="0.01"
                {...register('discount_price')}
                className={inputClass(!!errors.discount_price)}
                placeholder="0.00"
              />
            </Field>

            {showDiscountPreview && (
              <div className="md:col-span-2 flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl">
                <SparklesIcon className="w-4 h-4 flex-shrink-0" />
                <span>
                  Customer saves{' '}
                  <strong>
                    ₹
                    {(
                      Number(priceValue) - Number(discountValue)
                    ).toFixed(2)}
                  </strong>{' '}
                  (
                  {Math.round(
                    ((Number(priceValue) - Number(discountValue)) /
                      Number(priceValue)) *
                      100
                  )}
                  % off)
                </span>
              </div>
            )}
          </div>
        </FormSection>

        {/* ==========================================
            PRODUCT DETAILS
        ========================================== */}
        <FormSection
          icon={TagIcon}
          title="Product Details"
          description="Material, stock, gemstone, tags"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Material" required error={errors.material?.message}>
              <select
                {...register('material')}
                className={inputClass(!!errors.material)}
              >
                <option value="">Select Material</option>
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Stock" required error={errors.stock?.message}>
              <input
                type="number"
                {...register('stock')}
                className={inputClass(!!errors.stock)}
                placeholder="0"
              />
            </Field>

            <Field label="Gemstone">
              <select
                {...register('gemstone')}
                className={inputClass(false)}
              >
                <option value="">Select Gemstone</option>
                {GEMSTONES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Weight (grams)" error={errors.weight?.message}>
              <input
                type="number"
                step="0.01"
                {...register('weight')}
                className={inputClass(!!errors.weight)}
                placeholder="0.00"
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Tags"
                hint="Separate multiple tags with commas"
              >
                <input
                  {...register('tags')}
                  className={inputClass(false)}
                  placeholder="e.g., necklace, gold, luxury"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        {/* ==========================================
            IMAGES
        ========================================== */}
        <FormSection
          icon={PhotoIcon}
          title="Product Images"
          description="First image is the main product image. Max 10 total."
        >
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Current Images ({existingImages.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                      index === 0 ? 'border-amber-400' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-28 md:h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-90 hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 ? (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                        MAIN
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMainExistingImage(index)}
                        className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-white/90 backdrop-blur text-gray-700 hover:bg-amber-500 hover:text-white text-[10px] font-bold rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Set Main
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Box */}
          {existingImages.length + newImages.length < 10 && (
            <label className="block border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50/30 rounded-xl p-6 md:p-8 text-center cursor-pointer transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageChange}
                className="hidden"
              />
              <PhotoIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload new images
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP • Max 5MB each
              </p>
              <p className="text-xs text-amber-600 font-semibold mt-2">
                {existingImages.length + newImages.length}/10 uploaded
              </p>
            </label>
          )}

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-emerald-600 mb-2 uppercase tracking-wide">
                New Images ({newImagePreviews.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {newImagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border-2 border-emerald-300"
                  >
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-28 md:h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-90 hover:opacity-100"
                      aria-label="Remove"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      NEW
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remove list warning */}
          {removeImages.length > 0 && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
              <XMarkIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {removeImages.length} image
                {removeImages.length !== 1 ? 's' : ''} will be deleted on save.
              </span>
            </div>
          )}
        </FormSection>

        {/* ==========================================
            STATUS
        ========================================== */}
        <FormSection
          icon={SparklesIcon}
          title="Status & Visibility"
          description="Control how this product appears in the store"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">Visible to customers</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Featured</p>
                <p className="text-xs text-gray-500">Highlight on homepage</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
              <input
                type="checkbox"
                {...register('is_ai_recommended')}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">AI Pick</p>
                <p className="text-xs text-gray-500">Show in AI picks</p>
              </div>
            </label>
          </div>
        </FormSection>

        {/* ==========================================
            SUBMIT (sticky on mobile)
        ========================================== */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-4 md:mx-0 px-4 md:px-0 py-4 flex flex-col sm:flex-row gap-3 md:rounded-2xl md:border md:p-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                Updating...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                Update Product
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;