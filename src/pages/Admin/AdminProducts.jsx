import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
  StarIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { adminGetProducts, adminDeleteProduct } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      };
      const response = await adminGetProducts(params);
      if (response.success) {
        setProducts(response.products || []);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error(error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const response = await adminDeleteProduct(selectedProduct.id);
      if (response.success) {
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPagination({ ...pagination, page: 1 });
    fetchProducts();
  };

  const handleAddProduct = () => {
    navigate('/admin/products/add');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // ==========================================
  // OPEN VIEW MODAL
  // ==========================================
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setShowViewModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toFixed(2)}`;
  };

  const getDiscountPercentage = (product) => {
    if (!product.discount_price || !product.price) return 0;
    return Math.round(((product.price - product.discount_price) / product.price) * 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button type="submit" className="btn-secondary">
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Start adding products to your catalog'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddProduct}
                  className="mt-4 btn-primary inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Added</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.main_image || product.images?.[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {product.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      ₹{product.discount_price || product.price}
                      {product.discount_price && (
                        <span className="text-xs text-gray-400 line-through ml-1">
                          ₹{product.price}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                        {product.stock > 0 ? product.stock : 'Out of stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {product.is_featured && (
                        <span className="ml-1 px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="View Product"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-gold-600 transition-colors rounded-lg hover:bg-gold-50"
                          title="Edit Product"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete Product"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          DELETE CONFIRMATION MODAL
      ========================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Product</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ==========================================
          VIEW PRODUCT MODAL
      ========================================== */}
      <AnimatePresence>
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-700" />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[92vh]">
                <div className="grid md:grid-cols-2">
                  {/* LEFT: Image Gallery */}
                  <div className="bg-gray-50 p-6">
                    {/* Main Image */}
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm aspect-square">
                      <img
                        src={
                          selectedProduct.images?.[selectedImageIndex] ||
                          selectedProduct.main_image ||
                          'https://via.placeholder.com/500'
                        }
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Discount Badge */}
                      {getDiscountPercentage(selectedProduct) > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                          -{getDiscountPercentage(selectedProduct)}%
                        </div>
                      )}

                      {/* Navigation Arrows */}
                      {selectedProduct.images?.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === 0 ? selectedProduct.images.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronLeftIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === selectedProduct.images.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronRightIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {selectedProduct.images?.length > 1 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        {selectedProduct.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? 'border-gold-500 ring-2 ring-gold-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${selectedProduct.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Product Details */}
                  <div className="p-6 md:p-8 space-y-5">

                    {/* Category */}
                    <div>
                      <span className="inline-block px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-semibold">
                        {selectedProduct.category_name || 'Jewellery'}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h2>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.average_rating || 4.5)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedProduct.average_rating || 4.5} ({selectedProduct.num_reviews || 0} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3">
                      {selectedProduct.discount_price ? (
                        <>
                          <span className="text-3xl font-bold text-gold-600">
                            {formatPrice(selectedProduct.discount_price)}
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(selectedProduct.price)}
                          </span>
                          <span className="text-sm text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                            Save {getDiscountPercentage(selectedProduct)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gold-600">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                      {selectedProduct.stock > 0 ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-sm text-green-600 font-medium">
                            In Stock ({selectedProduct.stock} available)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-t border-gray-100">
                      {selectedProduct.material && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Material</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedProduct.material}
                          </p>
                        </div>
                      )}
                      {selectedProduct.gemstone && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Gemstone</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedProduct.gemstone}
                          </p>
                        </div>
                      )}
                      {selectedProduct.weight && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Weight</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedProduct.weight} g
                          </p>
                        </div>
                      )}
                      {selectedProduct.created_at && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Added</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatDate(selectedProduct.created_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {selectedProduct.tags?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedProduct.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedProduct.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {selectedProduct.is_featured && (
                        <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                          ⭐ Featured
                        </span>
                      )}
                      {selectedProduct.is_ai_recommended && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          ✨ AI Recommended
                        </span>
                      )}
                    </div>

                    {/* Trust Features */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <TruckIcon className="w-5 h-5 text-gold-500" />
                        <span className="text-xs text-gray-600">Free Shipping</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ShieldCheckIcon className="w-5 h-5 text-gold-500" />
                        <span className="text-xs text-gray-600">Secure</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ShoppingBagIcon className="w-5 h-5 text-gold-500" />
                        <span className="text-xs text-gray-600">Easy Returns</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditProduct(selectedProduct.id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gold-500 to-yellow-500 text-white rounded-xl hover:from-gold-600 hover:to-yellow-600 transition-all font-medium shadow-md hover:shadow-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit Product
                      </button>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;