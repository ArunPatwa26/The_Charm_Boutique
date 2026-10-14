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
import { adminCreateProduct, getCategories } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const productSchema = yup.object().shape({
  name: yup.string().required('Required').min(3, 'Min 3 characters'),
  description: yup.string().required('Required').min(10, 'Min 10 characters'),
  price: yup.number().typeError('Must be a number').required('Required').positive('Must be positive'),
  discount_price: yup.number().transform((v, o) => (o === '' ? null : v)).nullable().positive('Must be positive'),
  category: yup.string().required('Required'),
  material: yup.string().required('Required'),
  stock: yup.number().typeError('Must be a number').required('Required').integer().min(0, 'Cannot be negative'),
  gemstone: yup.string().nullable(),
  custom_gemstone: yup.string().nullable(),
  weight: yup.number().transform((v, o) => (o === '' ? null : v)).nullable().positive('Must be positive'),
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

const Section = ({ title, description, children }) => (
  <div className="bg-white border border-line rounded-lg p-5 md:p-6">
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
        {title}
      </p>
      {description && (
        <p className="text-xs text-ink-500 mt-1">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
      {label} {required && <span className="text-burgundy-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-[10px] text-ink-400 mt-1">{hint}</p>}
    {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-cream-100 border rounded text-sm transition-colors outline-none ${
    hasError
      ? 'border-red-300 focus:border-red-400'
      : 'border-line focus:border-ink-800'
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

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '', description: '', price: '', discount_price: '',
      category: '', material: '', stock: '', gemstone: '',
      custom_gemstone: '', weight: '', tags: '',
    },
  });

  const description = watch('description') || '';
  const gemstoneValue = watch('gemstone');
  const priceValue = watch('price');
  const discountPriceValue = watch('discount_price');

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) return toast.error('Some images exceed 5MB');
    if (images.length + files.length > 10) return toast.error('Maximum 10 images');

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

  const wrapSelection = (prefix, suffix = prefix) => {
    const textarea = document.getElementById('description-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end);
    const newText = description.substring(0, start) + prefix + selected + suffix + description.substring(end);
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
    const newText = description.substring(0, lineStart) + prefix + description.substring(lineStart);
    setValue('description', newText, { shouldValidate: true });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const onSubmit = async (data) => {
    if (images.length === 0) return toast.error('Please upload at least one image');
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

      const finalGemstone = data.gemstone === 'Other' ? data.custom_gemstone?.trim() : data.gemstone;
      if (finalGemstone && finalGemstone.toLowerCase() !== 'none') fd.append('gemstone', finalGemstone);
      if (data.weight) fd.append('weight', data.weight);
      if (data.tags) fd.append('tags', data.tags);
      if (data.is_featured) fd.append('is_featured', 'true');
      if (data.is_ai_recommended) fd.append('is_ai_recommended', 'true');

      images.forEach((img) => fd.append('images', img));

      const response = await adminCreateProduct(fd);
      if (response.success) {
        toast.success('Product created');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to create');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const showDiscountPreview =
    priceValue && discountPriceValue &&
    Number(discountPriceValue) > 0 &&
    Number(priceValue) > Number(discountPriceValue);

  return (
    <div className="max-w-3xl mx-auto pb-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 -ml-2 hover:bg-cream-200 rounded transition-colors"
          aria-label="Back"
        >
          <ArrowLeftIcon className="w-4 h-4 text-ink-800" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-1">
            New
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Add Product
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* BASIC */}
        <Section title="Basic Info" description="Name, category, and description">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required error={errors.name?.message}>
              <input
                {...register('name')}
                className={inputClass(!!errors.name)}
                placeholder="Rose Gold Pearl Necklace"
              />
            </Field>

            <Field label="Category" required error={errors.category?.message}>
              <select {...register('category')} className={inputClass(!!errors.category)}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Description" required error={errors.description?.message}>
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-line mb-2">
                  {[
                    { key: 'write', label: 'Write', icon: DocumentTextIcon },
                    { key: 'preview', label: 'Preview', icon: EyeIcon },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDescriptionTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider font-medium transition-colors border-b-2 ${
                        descriptionTab === tab.key
                          ? 'text-ink-800 border-ink-800'
                          : 'text-ink-500 border-transparent hover:text-ink-700'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {descriptionTab === 'write' && (
                  <div className="border border-line rounded overflow-hidden focus-within:border-ink-800 transition-colors">
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-cream-100 border-b border-line">
                      <button
                        type="button"
                        onClick={() => wrapSelection('**', '**')}
                        className="p-1.5 hover:bg-cream-200 rounded text-ink-600 transition-colors"
                        title="Bold"
                      >
                        <BoldIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => wrapSelection('*', '*')}
                        className="p-1.5 hover:bg-cream-200 rounded text-ink-600 transition-colors"
                        title="Italic"
                      >
                        <ItalicIcon className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-line mx-1" />
                      <button
                        type="button"
                        onClick={() => insertLineStart('• ')}
                        className="p-1.5 hover:bg-cream-200 rounded text-ink-600 transition-colors"
                        title="Bullet"
                      >
                        <ListBulletIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertLineStart('1. ')}
                        className="px-1.5 py-1 hover:bg-cream-200 rounded text-ink-600 text-xs font-semibold transition-colors"
                        title="Numbered"
                      >
                        1.
                      </button>
                      <span className="ml-auto text-[10px] text-ink-400 pr-2 hidden sm:block">
                        Markdown supported
                      </span>
                    </div>

                    <textarea
                      id="description-textarea"
                      {...register('description')}
                      rows="8"
                      className="w-full px-4 py-3 outline-none resize-none text-sm leading-relaxed bg-white"
                      placeholder="Describe this piece — materials, occasion, styling tips…"
                    />
                  </div>
                )}

                {descriptionTab === 'preview' && (
                  <div className="border border-line rounded p-4 min-h-[180px] bg-cream-100">
                    {description.trim() ? (
                      <div className="text-sm text-ink-700 leading-relaxed space-y-1.5">
                        {renderFormattedDescription(description)}
                      </div>
                    ) : (
                      <p className="text-sm text-ink-400 italic">
                        Nothing to preview yet.
                      </p>
                    )}
                  </div>
                )}
              </Field>
            </div>
          </div>
        </Section>

        {/* PRICING */}
        <Section title="Pricing" description="Base price and optional discount">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Price (₹)" required error={errors.price?.message}>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className={inputClass(!!errors.price)}
                placeholder="0"
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
                placeholder="0"
              />
            </Field>

            {showDiscountPreview && (
              <div className="md:col-span-2 flex items-center gap-2 text-xs bg-cream-100 border border-line text-ink-700 px-3 py-2.5 rounded">
                <SparklesIcon className="w-3.5 h-3.5 text-burgundy-500 flex-shrink-0" />
                <span>
                  Customer saves{' '}
                  <strong className="text-ink-800">
                    ₹{(Number(priceValue) - Number(discountPriceValue)).toLocaleString('en-IN')}
                  </strong>{' '}
                  (
                  {Math.round(
                    ((Number(priceValue) - Number(discountPriceValue)) / Number(priceValue)) * 100
                  )}
                  % off)
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* DETAILS */}
        <Section title="Details" description="Material, stock, gemstone, tags">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Material" required error={errors.material?.message}>
              <select {...register('material')} className={inputClass(!!errors.material)}>
                <option value="">Select Material</option>
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
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
              <select {...register('gemstone')} className={inputClass(false)}>
                <option value="">Select Gemstone</option>
                {GEMSTONE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {showCustomGemstone && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
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
                placeholder="0"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Tags" hint="Separate with commas">
                <input
                  {...register('tags')}
                  className={inputClass(false)}
                  placeholder="necklace, gold, luxury"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* IMAGES */}
        <Section
          title="Images"
          description="First image is the main one. Max 10."
        >
          <div
            onClick={() => images.length < 10 && fileInputRef.current?.click()}
            className={`border border-dashed rounded p-8 text-center transition-colors ${
              images.length >= 10
                ? 'border-line bg-cream-100 cursor-not-allowed'
                : 'border-line-strong hover:border-ink-800 hover:bg-cream-100 cursor-pointer'
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
            <PhotoIcon className="w-8 h-8 mx-auto text-ink-400 mb-2" />
            <p className="text-sm font-medium text-ink-800">
              {images.length >= 10 ? 'Maximum reached' : 'Click to upload'}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-500 mt-1">
              JPG · PNG · WEBP · Max 5MB each
            </p>
            <p className="text-xs text-burgundy-500 font-medium mt-2">
              {images.length}/10 uploaded
            </p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`relative group rounded overflow-hidden border-2 ${
                    index === 0 ? 'border-ink-800' : 'border-line'
                  }`}
                >
                  <img src={preview} alt="" className="w-full aspect-square object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                  {index === 0 ? (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-ink-800 text-cream-100 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                      Main
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMainImage(index)}
                      className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-cream-100/95 text-ink-700 hover:bg-ink-800 hover:text-cream-100 text-[9px] font-bold uppercase tracking-wider rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Set Main
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* FEATURED */}
        <Section title="Visibility" description="Control where this appears">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckBoxField label="Featured Product" hint="Show on homepage" register={register} name="is_featured" />
            <CheckBoxField label="AI Recommended" hint="Show in AI picks" register={register} name="is_ai_recommended" />
          </div>
        </Section>

        {/* SUBMIT */}
        <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 md:px-0 py-3 flex gap-2 md:bg-white md:border md:border-line md:rounded-lg md:p-4 md:backdrop-blur">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-solid py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating…
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                Create Product
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-outline py-3.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// CHECKBOX FIELD
// ==========================================
const CheckBoxField = ({ label, hint, register, name }) => (
  <label className="flex items-start gap-3 p-3.5 bg-cream-100 border border-line rounded cursor-pointer hover:border-ink-400 transition-colors">
    <input
      type="checkbox"
      {...register(name)}
      className="w-4 h-4 rounded text-ink-800 focus:ring-ink-800 mt-0.5 flex-shrink-0"
    />
    <div>
      <p className="text-sm font-medium text-ink-800">{label}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-500 mt-0.5">{hint}</p>
    </div>
  </label>
);

// ==========================================
// MARKDOWN RENDERERS
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
        <div key={lineIdx} className="flex items-start gap-2 ml-1">
          <span className="text-burgundy-500 mt-1.5 flex-shrink-0">•</span>
          <span>{applyInlineFormatting(trimmed.substring(2))}</span>
        </div>
      );
      return;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={lineIdx} className="flex items-start gap-2 ml-1">
            <span className="text-burgundy-500 font-medium min-w-[1.2rem]">{match[1]}.</span>
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
    if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={`b-${keyIdx++}`} className="font-semibold text-ink-800">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={`i-${keyIdx++}`} className="italic text-ink-700">{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
  return parts.length ? parts : text;
}

export default AdminAddProduct;