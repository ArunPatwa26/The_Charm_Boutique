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
  CubeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import {
  adminGetProducts,
  adminDeleteProduct,
} from '../../services/productService';
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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error(error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setDeleting(true);
    try {
      const response = await adminDeleteProduct(selectedProduct.id);
      if (response.success) {
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
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

  const handleAddProduct = () => navigate('/admin/products/add');
  const handleEditProduct = (id) => navigate(`/admin/products/edit/${id}`);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setShowViewModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => `₹${Number(price || 0).toFixed(2)}`;

  const getDiscountPercentage = (product) => {
    if (!product.discount_price || !product.price) return 0;
    return Math.round(
      ((product.price - product.discount_price) / product.price) * 100
    );
  };

  const getStockBadge = (stock) => {
    if (stock > 10) return 'text-green-600 bg-green-50';
    if (stock > 0) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            Products
            <span className="text-xs md:text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {pagination.total} total
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg font-medium text-sm"
        >
          <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />
          Add Product
        </button>
      </div>

      {/* ==========================================
          SEARCH
      ========================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-sm transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* ==========================================
          PRODUCTS TABLE / CARDS
      ========================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 md:py-20 px-4">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CubeIcon className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              No products found
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-6">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Start adding products to your catalog'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium text-sm shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      className="border-b border-gray-100 hover:bg-amber-50/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.main_image ||
                              product.images?.[0] ||
                              'https://via.placeholder.com/50'
                            }
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                'https://via.placeholder.com/50';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                          {product.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sm text-gray-900">
                          {formatPrice(
                            product.discount_price || product.price
                          )}
                        </p>
                        {product.discount_price && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStockBadge(
                            product.stock
                          )}`}
                        >
                          {product.stock > 0
                            ? `${product.stock} left`
                            : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {product.is_featured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  className="p-4"
                >
                  <div className="flex gap-3">
                    <img
                      src={
                        product.main_image ||
                        product.images?.[0] ||
                        'https://via.placeholder.com/60'
                      }
                      alt={product.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.category_name || 'Uncategorized'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-bold text-sm text-amber-600">
                          {formatPrice(
                            product.discount_price || product.price
                          )}
                        </span>
                        {product.discount_price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStockBadge(
                            product.stock
                          )}`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : 'Out of stock'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="flex-1 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                          className="flex-1 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-4 border-t border-gray-200">
                <p className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
                  Showing{' '}
                  {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total}
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 text-xs md:text-sm font-medium">
                    Page {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==========================================
          DELETE MODAL
      ========================================== */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !deleting && setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Delete Product?
                </h3>
                <p className="text-sm text-gray-500 mb-6 break-words">
                  Are you sure you want to delete{' '}
                  <strong className="text-gray-700">
                    "{selectedProduct?.name}"
                  </strong>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          VIEW PRODUCT MODAL
      ========================================== */}
      <AnimatePresence>
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5 text-gray-700" />
              </button>

              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* LEFT: Images */}
                  <div className="bg-gray-50 p-4 md:p-6">
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

                      {getDiscountPercentage(selectedProduct) > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                          -{getDiscountPercentage(selectedProduct)}%
                        </div>
                      )}

                      {selectedProduct.images?.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === 0
                                  ? selectedProduct.images.length - 1
                                  : prev - 1
                              )
                            }
                            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                            aria-label="Previous image"
                          >
                            <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === selectedProduct.images.length - 1
                                  ? 0
                                  : prev + 1
                              )
                            }
                            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                            aria-label="Next image"
                          >
                            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {selectedProduct.images?.length > 1 && (
                      <div className="flex gap-2 mt-3 md:mt-4 overflow-x-auto pb-1">
                        {selectedProduct.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? 'border-amber-500 ring-2 ring-amber-200'
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

                  {/* RIGHT: Details */}
                  <div className="p-4 md:p-6 space-y-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                        {selectedProduct.category_name || 'Jewellery'}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h2>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i <
                              Math.floor(selectedProduct.average_rating || 4.5)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedProduct.average_rating || 4.5} (
                        {selectedProduct.num_reviews || 0} reviews)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      {selectedProduct.discount_price ? (
                        <>
                          <span className="text-2xl md:text-3xl font-bold text-amber-600">
                            {formatPrice(selectedProduct.discount_price)}
                          </span>
                          <span className="text-base md:text-lg text-gray-400 line-through">
                            {formatPrice(selectedProduct.price)}
                          </span>
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                            Save {getDiscountPercentage(selectedProduct)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl md:text-3xl font-bold text-amber-600">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      )}
                    </div>

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
                          <span className="text-sm text-red-600 font-medium">
                            Out of Stock
                          </span>
                        </>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                        Description
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-gray-100">
                      {selectedProduct.material && (
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
                            Material
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedProduct.material}
                          </p>
                        </div>
                      )}
                      {selectedProduct.gemstone && (
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
                            Gemstone
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedProduct.gemstone}
                          </p>
                        </div>
                      )}
                      {selectedProduct.weight && (
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
                            Weight
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {selectedProduct.weight} g
                          </p>
                        </div>
                      )}
                      {selectedProduct.created_at && (
                        <div>
                          <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
                            Added
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatDate(selectedProduct.created_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedProduct.tags?.length > 0 && (
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
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

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
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
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          ⭐ Featured
                        </span>
                      )}
                      {selectedProduct.is_ai_recommended && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          ✨ AI Recommended
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <TruckIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        <span className="text-[10px] md:text-xs text-gray-600">
                          Free Shipping
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        <span className="text-[10px] md:text-xs text-gray-600">
                          Secure
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ShoppingBagIcon className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        <span className="text-[10px] md:text-xs text-gray-600">
                          Easy Returns
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-4 flex gap-3 bg-white flex-shrink-0">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditProduct(selectedProduct.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-md text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Product
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 md:px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;