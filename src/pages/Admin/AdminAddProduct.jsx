import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  ListBulletIcon,
  BoldIcon,
  ItalicIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { adminCreateProduct } from '../../services/productService';
import { getCategories } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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
  'Diamond',
  'Ruby',
  'Sapphire',
  'Emerald',
  'Cubic Zirconia',
  'Pearl',
  'Amethyst',
  'Topaz',
  'Opal',
  'Aquamarine',
  'Garnet',
  'Peridot',
  'Turquoise',
  'Moonstone',
  'Tanzanite',
  'None',
  'Other',
];

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showCustomGemstone, setShowCustomGemstone] = useState(false);
  const [descriptionTab, setDescriptionTab] = useState('write'); // 'write' | 'preview'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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
      custom_gemstone: '',
      weight: '',
      tags: '',
    },
  });

  const description = watch('description') || '';
  const gemstoneValue = watch('gemstone');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Watch gemstone selection to show/hide custom field
  useEffect(() => {
    if (gemstoneValue === 'Other') {
      setShowCustomGemstone(true);
    } else {
      setShowCustomGemstone(false);
      setValue('custom_gemstone', '');
    }
  }, [gemstoneValue, setValue]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Some images are larger than 5MB. Please resize them.');
      return;
    }

    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }

    setImages([...images, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // ==========================================
  // FORMAT HELPERS
  // ==========================================

  const wrapSelection = (prefix, suffix = prefix) => {
    const textarea = document.getElementById('description-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    const newText =
      description.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      description.substring(end);

    setValue('description', newText, { shouldValidate: true });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const insertLineStart = (prefix) => {
    const textarea = document.getElementById('description-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = description.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const newText =
      description.substring(0, lineStart) +
      prefix +
      description.substring(lineStart);

    setValue('description', newText, { shouldValidate: true });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length
      );
    }, 0);
  };

  const handleBold = () => wrapSelection('**', '**');
  const handleItalic = () => wrapSelection('*', '*');
  const handleBullet = () => insertLineStart('• ');
  const handleNumbered = () => insertLineStart('1. ');

  // ==========================================
  // SUBMIT
  // ==========================================

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      if (data.discount_price) formData.append('discount_price', data.discount_price);
      formData.append('category', data.category);
      formData.append('material', data.material);
      formData.append('stock', data.stock);

      // Gemstone logic — use custom if "Other" is selected
      const finalGemstone =
        data.gemstone === 'Other'
          ? data.custom_gemstone?.trim()
          : data.gemstone;

      if (finalGemstone && finalGemstone.toLowerCase() !== 'none') {
        formData.append('gemstone', finalGemstone);
      }

      if (data.weight) formData.append('weight', data.weight);
      if (data.tags) formData.append('tags', data.tags);

      // Featured options
      if (data.is_featured) formData.append('is_featured', 'true');
      if (data.is_ai_recommended) formData.append('is_ai_recommended', 'true');

      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await adminCreateProduct(formData);
      if (response.success) {
        toast.success('Product created successfully!');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Create product error:', error);
      toast.error(error?.message || 'Failed to create product');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-gray-600">Create a new product for your catalog</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ==========================================
              BASIC INFORMATION
          ========================================== */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  {...register('name')}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* ==========================================
                  DESCRIPTION WITH FORMAT TABS
              ========================================== */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>

                {/* Tab Buttons */}
                <div className="flex items-center gap-1 mb-2 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setDescriptionTab('write')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                      descriptionTab === 'write'
                        ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescriptionTab('preview')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                      descriptionTab === 'preview'
                        ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    👁 Preview
                  </button>
                </div>

                {/* WRITE TAB */}
                {descriptionTab === 'write' && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100 transition-all">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <button
                        type="button"
                        onClick={handleBold}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"
                        title="Bold (**text**)"
                      >
                        <BoldIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleItalic}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"
                        title="Italic (*text*)"
                      >
                        <ItalicIcon className="w-4 h-4" />
                      </button>

                      <div className="w-px h-5 bg-gray-300 mx-1" />

                      <button
                        type="button"
                        onClick={handleBullet}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"
                        title="Bullet point"
                      >
                        <ListBulletIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNumbered}
                        className="px-2 py-1 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900 text-sm font-semibold"
                        title="Numbered list"
                      >
                        1.
                      </button>

                      <div className="ml-auto text-[10px] text-gray-400 hidden sm:block">
                        Markdown supported
                      </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                      id="description-textarea"
                      {...register('description')}
                      rows="8"
                      className={`w-full px-4 py-3 outline-none resize-none text-sm leading-relaxed ${
                        errors.description ? 'bg-red-50/30' : 'bg-white'
                      }`}
                      placeholder={`Write a detailed description...

You can use:
• Bullet points
**Bold** text
*Italic* text

Example:
This exquisite **gold necklace** is handcrafted with:
• 18K gold plating
• Cubic zirconia stones
• Adjustable chain length`}
                    />
                  </div>
                )}

                {/* PREVIEW TAB */}
                {descriptionTab === 'preview' && (
                  <div className="border border-gray-200 rounded-xl p-4 min-h-[200px] bg-gray-50/50">
                    {description.trim() ? (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-2">
                        {renderFormattedDescription(description)}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Nothing to preview yet. Switch to the "Write" tab and start typing.
                      </p>
                    )}
                  </div>
                )}

                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ==========================================
              PRICING
          ========================================== */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('discount_price')}
                  className="input-field"
                  placeholder="0.00"
                />
                {errors.discount_price && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.discount_price.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==========================================
              PRODUCT DETAILS
          ========================================== */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material *
                </label>
                <select
                  {...register('material')}
                  className={`input-field ${errors.material ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Material</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="White Gold">White Gold</option>
                  <option value="Brass">Brass</option>
                  <option value="Stainless Steel">Stainless Steel</option>
                  <option value="Titanium">Titanium</option>
                </select>
                {errors.material && (
                  <p className="mt-1 text-sm text-red-500">{errors.material.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  {...register('stock')}
                  className={`input-field ${errors.stock ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>

              {/* ==========================================
                  GEMSTONE — WITH CUSTOM OPTION
              ========================================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemstone
                </label>
                <select
                  {...register('gemstone')}
                  className="input-field"
                >
                  <option value="">Select Gemstone</option>
                  {GEMSTONE_OPTIONS.map((gem) => (
                    <option key={gem} value={gem}>
                      {gem}
                    </option>
                  ))}
                </select>

                {/* Custom gemstone input */}
                {showCustomGemstone && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <input
                      type="text"
                      {...register('custom_gemstone')}
                      className="input-field"
                      placeholder="Enter gemstone name"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Type the custom gemstone name
                    </p>
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (grams)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('weight')}
                  className="input-field"
                  placeholder="0.00"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-500">{errors.weight.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  {...register('tags')}
                  className="input-field"
                  placeholder="e.g., necklace, gold, luxury"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              IMAGES
          ========================================== */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {images.length >= 10
                    ? 'Maximum 10 images reached'
                    : 'Click to upload images'}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP • Max 5MB each</p>
                <p className="text-xs text-gray-400 mt-1">
                  {images.length}/10 images uploaded
                </p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-full">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==========================================
              FEATURED OPTIONS
          ========================================== */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Featured Options</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_featured')}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="text-sm">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_ai_recommended')}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="text-sm">AI Recommended</span>
              </label>
            </div>
          </div>

          {/* ==========================================
              SUBMIT
          ========================================== */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
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
              className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// MARKDOWN-LIKE RENDERER
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

    // Handle bullet points
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2 ml-2">
          <span className="text-amber-500 mt-0.5">•</span>
          <span>{applyInlineFormatting(trimmed.substring(2))}</span>
        </div>
      );
      return;
    }

    // Handle numbered lists
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

    // Regular paragraph
    elements.push(
      <p key={lineIdx}>{applyInlineFormatting(trimmed)}</p>
    );
  });

  return elements;
}

function applyInlineFormatting(text) {
  // Split by bold/italic patterns, preserving them
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

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length ? parts : text;
}

export default AdminAddProduct;