import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  DocumentTextIcon,
  EyeIcon,
  InformationCircleIcon,
  CurrencyRupeeIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  adminCreateProduct,
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
    .transform((value, originalValue) => (originalValue === '' ? null : value))
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
  custom_gemstone: yup.string().nullable(),
  weight: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .positive('Weight must be positive'),
  tags: yup.string().nullable(),
});

const GEMSTONE_OPTIONS = [
  'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Cubic Zirconia', 'Pearl',
  'Amethyst', 'Topaz', 'Opal', 'Aquamarine', 'Garnet', 'Peridot',
  'Turquoise', 'Moonstone', 'Tanzanite', 'None', 'Other',
];

const MATERIALS = [
  'Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 'Brass',
  'Stainless Steel', 'Titanium',
];

// ==========================================
// SECTION WRAPPER
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
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

// ==========================================
// FIELD WRAPPER
// ==========================================
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

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showCustomGemstone, setShowCustomGemstone] = useState(false);
  const [descriptionTab, setDescriptionTab] = useState('write');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
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
      custom_gemstone: '',
      weight: '',
      tags: '',
    },
  });

  const description = watch('description') || '';
  const gemstoneValue = watch('gemstone');
  const priceValue = watch('price');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await getCategories();
        if (response.success) setCategories(response.categories || []);
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (gemstoneValue === 'Other') {
      setShowCustomGemstone(true);
    } else {
      setShowCustomGemstone(false);
      setValue('custom_gemstone', '');
    }
  }, [gemstoneValue, setValue]);

  // ==========================================
  // IMAGE HANDLING
  // ==========================================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error('Some images exceed 5MB. Please resize them.');
      return;
    }

    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }

    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setMainImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
    setImagePreviews((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
  };

  // ==========================================
  // FORMAT HELPERS (unchanged)
  // ==========================================
  const wrapSelection = (prefix, suffix = prefix) => {
    const textarea = document.getElementById('description-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end);
    const newText =
      description.substring(0, start) + prefix + selected + suffix + description.substring(end);
    setValue('description', newText, { shouldValidate: true });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const insertLineStart = (prefix) => {
    const textarea = document.getElementById('description-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const beforeCursor = description.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const newText =
      description.substring(0, lineStart) + prefix + description.substring(lineStart);
    setValue('description', newText, { shouldValidate: true });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('description', data.description);
      fd.append('price', data.price);
      if (data.discount_price) fd.append('discount_price', data.discount_price);
      fd.append('category', data.category);
      fd.append('material', data.material);
      fd.append('stock', data.stock);

      const finalGemstone =
        data.gemstone === 'Other' ? data.custom_gemstone?.trim() : data.gemstone;
      if (finalGemstone && finalGemstone.toLowerCase() !== 'none') {
        fd.append('gemstone', finalGemstone);
      }
      if (data.weight) fd.append('weight', data.weight);
      if (data.tags) fd.append('tags', data.tags);
      if (data.is_featured) fd.append('is_featured', 'true');
      if (data.is_ai_recommended) fd.append('is_ai_recommended', 'true');

      images.forEach((img) => fd.append('images', img));

      const response = await adminCreateProduct(fd);
      if (response.success) {
        toast.success('Product created successfully!');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to create product');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

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
            Add New Product
          </h1>
          <p className="text-sm text-gray-500 truncate">
            Create a new product for your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ==========================================
            BASIC INFO
        ========================================== */}
        <FormSection
          icon={InformationCircleIcon}
          title="Basic Information"
          description="Name, category, and description of the product"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required error={errors.name?.message}>
              <input
                {...register('name')}
                className={inputClass(!!errors.name)}
                placeholder="e.g., Rose Gold Pearl Necklace"
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
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200 mb-2">
                  {[
                    { key: 'write', label: 'Write', icon: DocumentTextIcon },
                    { key: 'preview', label: 'Preview', icon: EyeIcon },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDescriptionTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        descriptionTab === tab.key
                          ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/50'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {descriptionTab === 'write' && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100 transition-all">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                      <button
                        type="button"
                        onClick={() => wrapSelection('**', '**')}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 transition-all"
                        title="Bold"
                      >
                        <BoldIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => wrapSelection('*', '*')}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 transition-all"
                        title="Italic"
                      >
                        <ItalicIcon className="w-4 h-4" />
                      </button>
                      <div className="w-px h-5 bg-gray-300 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertLineStart('• ')}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 transition-all"
                        title="Bullet"
                      >
                        <ListBulletIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertLineStart('1. ')}
                        className="px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 transition-all text-sm font-semibold"
                        title="Numbered"
                      >
                        1.
                      </button>
                      <span className="ml-auto text-[10px] text-gray-400 hidden sm:block pr-2">
                        Markdown supported
                      </span>
                    </div>

                    <textarea
                      id="description-textarea"
                      {...register('description')}
                      rows="8"
                      className="w-full px-4 py-3 outline-none resize-none text-sm leading-relaxed bg-white"
                      placeholder={`Write a detailed description...

You can use:
• Bullet points
**Bold** text
*Italic* text`}
                    />
                  </div>
                )}

                {descriptionTab === 'preview' && (
                  <div className="border border-gray-200 rounded-xl p-4 min-h-[200px] bg-gray-50/50">
                    {description.trim() ? (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-1.5">
                        {renderFormattedDescription(description)}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Nothing to preview yet. Switch to "Write" and start typing.
                      </p>
                    )}
                  </div>
                )}
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
          description="Set the base price and optional discount"
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

            {/* Live discount preview */}
            {priceValue &&
              watch('discount_price') &&
              Number(watch('discount_price')) > 0 &&
              Number(priceValue) > 0 && (
                <div className="md:col-span-2 flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl">
                  <SparklesIcon className="w-4 h-4" />
                  <span>
                    Customer saves{' '}
                    <strong>
                      ₹
                      {(
                        Number(priceValue) - Number(watch('discount_price'))
                      ).toFixed(2)}
                    </strong>{' '}
                    (
                    {Math.round(
                      ((Number(priceValue) - Number(watch('discount_price'))) /
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
          description="Material, stock, gemstone, and tags"
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
                {GEMSTONE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {showCustomGemstone && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <input
                    type="text"
                    {...register('custom_gemstone')}
                    className={inputClass(false)}
                    placeholder="Enter gemstone name"
                    autoFocus
                  />
                </motion.div>
              )}
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
              <Field label="Tags" hint="Separate multiple tags with commas">
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
          description="First image will be the main product image. Max 10 images."
        >
          <div
            onClick={() =>
              images.length < 10 && fileInputRef.current?.click()
            }
            className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-colors ${
              images.length >= 10
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={images.length >= 10}
            />
            <PhotoIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              {images.length >= 10
                ? 'Maximum 10 images reached'
                : 'Click to upload images'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP • Max 5MB each
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-2">
              {images.length}/10 uploaded
            </p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                    index === 0 ? 'border-amber-400' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-28 md:h-32 object-cover"
                  />

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-90 hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>

                  {/* Main badge / Set main */}
                  {index === 0 ? (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      MAIN
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMainImage(index)}
                      className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-white/90 backdrop-blur text-gray-700 hover:bg-amber-500 hover:text-white text-[10px] font-bold rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Set Main
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* ==========================================
            FEATURED
        ========================================== */}
        <FormSection
          icon={SparklesIcon}
          title="Featured Options"
          description="Highlight this product in special sections"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Featured Product
                </p>
                <p className="text-xs text-gray-500">
                  Show on homepage showcase
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
              <input
                type="checkbox"
                {...register('is_ai_recommended')}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  AI Recommended
                </p>
                <p className="text-xs text-gray-500">
                  Show in AI picks
                </p>
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
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                Create Product
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

// ==========================================
// MARKDOWN RENDERERS (unchanged)
// ==========================================
function renderFormattedDescription(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`sp-${lineIdx}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2 ml-2">
          <span className="text-amber-500 mt-0.5">•</span>
          <span>{applyInlineFormatting(trimmed.substring(2))}</span>
        </div>
      );
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={lineIdx} className="flex items-start gap-2 ml-2">
            <span className="text-amber-500 font-medium min-w-[1.2rem]">
              {match[1]}.
            </span>
            <span>{applyInlineFormatting(match[2])}</span>
          </div>
        );
        return;
      }
    }

    elements.push(<p key={lineIdx}>{applyInlineFormatting(trimmed)}</p>);
  });

  return elements;
}

function applyInlineFormatting(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${keyIdx++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
  return parts.length ? parts : text;
}

export default AdminAddProduct;