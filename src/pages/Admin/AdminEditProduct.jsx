import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  adminUpdateProduct, 
  getProductById,
  getCategories 
} from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const productSchema = yup.object().shape({
  name: yup.string().required('Product name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  price: yup.number().required('Price is required').positive('Price must be positive'),
  discount_price: yup.number().nullable().positive('Discount price must be positive'),
  category: yup.string().required('Category is required'),
  material: yup.string().required('Material is required'),
  stock: yup.number().required('Stock is required').integer('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  gemstone: yup.string().nullable(),
  weight: yup.number().nullable().positive('Weight must be positive'),
  tags: yup.string().nullable(),
  is_active: yup.boolean(),
  is_featured: yup.boolean(),
  is_ai_recommended: yup.boolean(),
});

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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesResponse = await getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories);
      }

      // Fetch product
      const productResponse = await getProductById(id);
      if (productResponse.success) {
        const product = productResponse.product;
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
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Some images are larger than 5MB. Please resize them.');
      return;
    }

    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }

    setNewImages([...newImages, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setRemoveImages([...removeImages, imageUrl]);
    setExistingImages(existingImages.filter(img => img !== imageUrl));
  };

  const handleRemoveNewImage = (index) => {
    const newImagesCopy = [...newImages];
    newImagesCopy.splice(index, 1);
    setNewImages(newImagesCopy);

    const newPreviewsCopy = [...newImagePreviews];
    URL.revokeObjectURL(newPreviewsCopy[index]);
    newPreviewsCopy.splice(index, 1);
    setNewImagePreviews(newPreviewsCopy);
  };

  const onSubmit = async (data) => {
  // Check if there are any images
  if (existingImages.length === 0 && newImages.length === 0) {
    toast.error('Please upload at least one image');
    return;
  }

  setSubmitting(true);

  try {
    const formData = new FormData();
    
    // Basic fields
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    if (data.discount_price) {
      formData.append('discount_price', String(data.discount_price));
    }
    formData.append('category', data.category);
    formData.append('material', data.material);
    formData.append('stock', String(data.stock));
    if (data.gemstone) {
      formData.append('gemstone', data.gemstone);
    }
    if (data.weight) {
      formData.append('weight', String(data.weight));
    }
    if (data.tags) {
      formData.append('tags', data.tags);
    }
    
    // Boolean fields - convert to string
    formData.append('is_active', data.is_active ? 'true' : 'false');
    formData.append('is_featured', data.is_featured ? 'true' : 'false');
    formData.append('is_ai_recommended', data.is_ai_recommended ? 'true' : 'false');

    // Remove images - send as comma-separated string
    if (removeImages.length > 0) {
      formData.append('remove_images', removeImages.join(','));
    }

    // ✅ IMPORTANT: Append each new image with the same key
    for (let i = 0; i < newImages.length; i++) {
      formData.append('new_images', newImages[i]);
    }

    console.log('📤 Sending FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
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
    // Show the actual error message from the server
    const errorMsg = error?.detail || error?.message || 'Failed to update product';
    toast.error(errorMsg);
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
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows="4"
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your product in detail"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
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
                  <p className="mt-1 text-sm text-red-500">{errors.discount_price.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemstone
                </label>
                <select
                  {...register('gemstone')}
                  className="input-field"
                >
                  <option value="">Select Gemstone</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Ruby">Ruby</option>
                  <option value="Sapphire">Sapphire</option>
                  <option value="Emerald">Emerald</option>
                  <option value="Cubic Zirconia">Cubic Zirconia</option>
                  <option value="Pearl">Pearl</option>
                </select>
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
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gold-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageChange}
                className="hidden"
                id="image-upload"
                disabled={existingImages.length + newImages.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${existingImages.length + newImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {existingImages.length + newImages.length >= 10 
                    ? 'Maximum 10 images reached' 
                    : 'Click to upload new images'}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP • Max 5MB each</p>
                <p className="text-xs text-gray-400 mt-1">
                  {existingImages.length + newImages.length}/10 images
                </p>
              </label>
            </div>

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Options */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Status Options</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-4 h-4 text-gold-500"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('is_featured')}
                  className="w-4 h-4 text-gold-500"
                />
                <span className="text-sm">Featured Product</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('is_ai_recommended')}
                  className="w-4 h-4 text-gold-500"
                />
                <span className="text-sm">AI Recommended</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
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

export default AdminEditProduct;