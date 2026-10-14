import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  XMarkIcon,
  PhotoIcon,
  CheckIcon,
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

const productSchema = yup.object().shape({
  name: yup.string().required('Required').min(3, 'Min 3 chars'),
  description: yup.string().required('Required').min(10, 'Min 10 chars'),
  price: yup.number().typeError('Must be a number').required('Required').positive('Must be positive'),
  discount_price: yup.number().transform((v, o) => (o === '' ? null : v)).nullable().positive('Must be positive'),
  category: yup.string().required('Required'),
  material: yup.string().required('Required'),
  stock: yup.number().typeError('Must be a number').required('Required').integer().min(0, 'Cannot be negative'),
  gemstone: yup.string().nullable(),
  weight: yup.number().transform((v, o) => (o === '' ? null : v)).nullable().positive('Must be positive'),
  tags: yup.string().nullable(),
  is_active: yup.boolean(),
  is_featured: yup.boolean(),
  is_ai_recommended: yup.boolean(),
});

const MATERIALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold', 'Brass'];
const GEMSTONES = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Cubic Zirconia', 'Pearl'];

const Section = ({ title, description, children }) => (
  <div className="bg-white border border-line rounded-lg p-5 md:p-6">
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500">
        {title}
      </p>
      {description && <p className="text-xs text-ink-500 mt-1">{description}</p>}
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
    hasError ? 'border-red-300 focus:border-red-400' : 'border-line focus:border-ink-800'
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

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '', description: '', price: '', discount_price: '', category: '',
      material: '', stock: '', gemstone: '', weight: '', tags: '',
      is_active: true, is_featured: false, is_ai_recommended: false,
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

        if (categoriesRes.success) setCategories(categoriesRes.categories || []);

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
            is_active: product.is_active !== undefined ? product.is_active : true,
            is_featured: product.is_featured || false,
            is_ai_recommended: product.is_ai_recommended || false,
          });
          setExistingImages(product.images || []);
        } else {
          toast.error('Product not found');
          navigate('/admin/products');
        }
      } catch {
        toast.error('Failed to load product');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalid = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (invalid.length > 0) return toast.error('Some images exceed 5MB');

    const total = existingImages.length + newImages.length + files.length;
    if (total > 10) return toast.error('Maximum 10 images');

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

  const onSubmit = async (data) => {
    if (existingImages.length === 0 && newImages.length === 0) {
      return toast.error('Please upload at least one image');
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      if (data.discount_price) formData.append('discount_price', String(data.discount_price));
      formData.append('category', data.category);
      formData.append('material', data.material);
      formData.append('stock', String(data.stock));
      if (data.gemstone) formData.append('gemstone', data.gemstone);
      if (data.weight) formData.append('weight', String(data.weight));
      if (data.tags) formData.append('tags', data.tags);

      formData.append('is_active', data.is_active ? 'true' : 'false');
      formData.append('is_featured', data.is_featured ? 'true' : 'false');
      formData.append('is_ai_recommended', data.is_ai_recommended ? 'true' : 'false');

      if (removeImages.length > 0) formData.append('remove_images', removeImages.join(','));
      for (let i = 0; i < newImages.length; i++) {
        formData.append('new_images', newImages[i]);
      }

      const response = await adminUpdateProduct(id, formData);
      if (response.success) {
        toast.success('Product updated');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to update');
      }
    } catch (error) {
      toast.error(error?.detail || error?.message || 'Failed to update');
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
    priceValue && discountValue && Number(discountValue) > 0 && Number(priceValue) > Number(discountValue);

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
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-1">
            Edit
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Update Product
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* BASIC */}
        <Section title="Basic Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required error={errors.name?.message}>
              <input {...register('name')} className={inputClass(!!errors.name)} placeholder="Product name" />
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
                <textarea
                  {...register('description')}
                  rows="5"
                  className={`${inputClass(!!errors.description)} resize-none`}
                  placeholder="Describe this piece…"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* PRICING */}
        <Section title="Pricing">
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
                    ₹{(Number(priceValue) - Number(discountValue)).toLocaleString('en-IN')}
                  </strong>{' '}
                  ({Math.round(((Number(priceValue) - Number(discountValue)) / Number(priceValue)) * 100)}% off)
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* DETAILS */}
        <Section title="Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Material" required error={errors.material?.message}>
              <select {...register('material')} className={inputClass(!!errors.material)}>
                <option value="">Select Material</option>
                {MATERIALS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </Field>

            <Field label="Stock" required error={errors.stock?.message}>
              <input type="number" {...register('stock')} className={inputClass(!!errors.stock)} placeholder="0" />
            </Field>

            <Field label="Gemstone">
              <select {...register('gemstone')} className={inputClass(false)}>
                <option value="">Select Gemstone</option>
                {GEMSTONES.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
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
        <Section title="Images" description="First image is the main one. Max 10.">
          {/* Existing */}
          {existingImages.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-2">
                Current ({existingImages.length})
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={`relative group rounded overflow-hidden border-2 ${
                      index === 0 ? 'border-ink-800' : 'border-line'
                    }`}
                  >
                    <img src={image} alt="" className="w-full aspect-square object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image)}
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
                        onClick={() => setMainExistingImage(index)}
                        className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-cream-100/95 text-ink-700 hover:bg-ink-800 hover:text-cream-100 text-[9px] font-bold uppercase tracking-wider rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Set Main
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload */}
          {existingImages.length + newImages.length < 10 && (
            <label className="block border border-dashed border-line-strong hover:border-ink-800 hover:bg-cream-100 rounded p-6 text-center cursor-pointer transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleNewImageChange} className="hidden" />
              <PhotoIcon className="w-7 h-7 mx-auto text-ink-400 mb-2" />
              <p className="text-sm font-medium text-ink-800">Click to upload new images</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-500 mt-1">
                JPG · PNG · WEBP · Max 5MB
              </p>
              <p className="text-xs text-burgundy-500 font-medium mt-2">
                {existingImages.length + newImages.length}/10
              </p>
            </label>
          )}

          {/* New previews */}
          {newImagePreviews.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mb-2">
                New ({newImagePreviews.length})
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded overflow-hidden border-2 border-green-300">
                    <img src={preview} alt="" className="w-full aspect-square object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Remove"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-green-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-sm">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remove warning */}
          {removeImages.length > 0 && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded text-xs">
              <XMarkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                {removeImages.length} image{removeImages.length !== 1 ? 's' : ''} will be deleted on save
              </span>
            </div>
          )}
        </Section>

        {/* STATUS */}
        <Section title="Visibility" description="Control how this product appears">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CheckBoxField label="Active" hint="Visible to customers" register={register} name="is_active" defaultChecked />
            <CheckBoxField label="Featured" hint="Show on homepage" register={register} name="is_featured" />
            <CheckBoxField label="AI Pick" hint="Show in AI picks" register={register} name="is_ai_recommended" />
          </div>
        </Section>

        {/* SUBMIT */}
        <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 md:px-0 py-3 flex gap-2 md:bg-white md:border md:border-line md:rounded-lg md:p-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 btn-solid py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                Updating…
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Update Product
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

export default AdminEditProduct;