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
  ArrowPathIcon,
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
      }
    } catch {
      toast.error('Failed to load products');
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
        toast.success('Product deleted');
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch {
      toast.error('Failed to delete');
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

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setShowViewModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN')}`;

  const getDiscountPercentage = (product) => {
    if (!product.discount_price || !product.price) return 0;
    return Math.round(
      ((product.price - product.discount_price) / product.price) * 100
    );
  };

  const getStockMeta = (stock) => {
    if (stock > 10) return { dot: 'bg-green-600', text: 'text-green-700', label: 'In stock' };
    if (stock > 0) return { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Low stock' };
    return { dot: 'bg-red-500', text: 'text-red-600', label: 'Out of stock' };
  };

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
            Catalog
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Products
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            {pagination.total} {pagination.total === 1 ? 'piece' : 'pieces'} in
            catalog
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/products/add')}
          className="self-start sm:self-auto btn-solid"
        >
          <PlusIcon className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ==========================================
          SEARCH
      ========================================== */}
      <div className="bg-white border border-line rounded-lg p-3 md:p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-cream-200 rounded transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-3.5 h-3.5 text-ink-500" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* ==========================================
          PRODUCTS
      ========================================== */}
      <div className="bg-white border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 px-4">
            <CubeIcon className="w-10 h-10 text-ink-300 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-ink-800 mb-1">
              No products found
            </h3>
            <p className="text-sm text-ink-500 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Start by adding your first product'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/admin/products/add')}
                className="btn-solid text-xs"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ---------- DESKTOP TABLE ---------- */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-3 px-5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left py-3 px-5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left py-3 px-5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left py-3 px-5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="text-left py-3 px-5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const stockMeta = getStockMeta(product.stock);
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        className="border-b border-line last:border-b-0 hover:bg-cream-100 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                product.main_image ||
                                product.images?.[0] ||
                                'https://via.placeholder.com/60'
                              }
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded border border-line flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/60';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-ink-800 truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-ink-500 mt-0.5">
                                Added {formatDate(product.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-xs text-ink-600">
                            {product.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-sm font-medium text-ink-800">
                            {formatPrice(
                              product.discount_price || product.price
                            )}
                          </p>
                          {product.discount_price && (
                            <p className="text-[10px] text-ink-400 line-through mt-0.5">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${stockMeta.dot}`} />
                            <span className={`font-medium ${stockMeta.text}`}>
                              {product.stock > 0
                                ? `${product.stock} left`
                                : 'Out of stock'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`text-[10px] uppercase tracking-wider font-semibold ${
                                product.is_active
                                  ? 'text-green-700'
                                  : 'text-ink-500'
                              }`}
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {product.is_featured && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-burgundy-500 ml-2">
                                · Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="p-2 text-ink-500 hover:text-ink-800 hover:bg-cream-100 rounded transition-colors"
                              title="View"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/admin/products/edit/${product.id}`)
                              }
                              className="p-2 text-ink-500 hover:text-ink-800 hover:bg-cream-100 rounded transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ---------- MOBILE CARDS ---------- */}
            <div className="lg:hidden divide-y divide-line">
              {products.map((product, index) => {
                const stockMeta = getStockMeta(product.stock);
                return (
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
                        className="w-16 h-16 object-cover rounded border border-line flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink-800 truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mt-0.5">
                          {product.category_name || 'Uncategorized'}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-sm font-medium text-ink-800">
                            {formatPrice(
                              product.discount_price || product.price
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px]">
                            <span className={`w-1 h-1 rounded-full ${stockMeta.dot}`} />
                            <span className={`font-medium ${stockMeta.text}`}>
                              {product.stock > 0
                                ? `${product.stock} left`
                                : 'Out'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-line">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold text-ink-700 hover:bg-cream-100 rounded transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/products/edit/${product.id}`)
                        }
                        className="flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold text-ink-700 hover:bg-cream-100 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ---------- PAGINATION ---------- */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-line">
                <p className="text-xs text-ink-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                    className="p-2 border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-line rounded hover:border-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
              className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm"
              onClick={() => !deleting && setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 border border-line"
            >
              <div className="text-center">
                <TrashIcon className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-ink-800 mb-2">
                  Delete this product?
                </h3>
                <p className="text-xs text-ink-500 mb-6 break-words leading-relaxed">
                  "{selectedProduct?.name}" will be permanently removed. This
                  cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-700 hover:border-ink-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Deleting
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
              className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />

            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 12 }}
              className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-line"
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-3 right-3 z-20 p-1.5 bg-white border border-line rounded hover:bg-cream-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4 text-ink-500" />
              </button>

              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* LEFT — Images */}
                  <div className="bg-cream-100 p-4 md:p-6">
                    <div className="relative rounded overflow-hidden bg-white border border-line aspect-square">
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
                        <span className="absolute top-3 left-3 bg-ink-800 text-cream-100 text-[10px] font-semibold tracking-wide px-2 py-1 rounded-sm">
                          {getDiscountPercentage(selectedProduct)}% OFF
                        </span>
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
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-line rounded-full hover:bg-cream-100 transition-colors"
                            aria-label="Previous"
                          >
                            <ChevronLeftIcon className="w-4 h-4 text-ink-800" />
                          </button>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === selectedProduct.images.length - 1
                                  ? 0
                                  : prev + 1
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-line rounded-full hover:bg-cream-100 transition-colors"
                            aria-label="Next"
                          >
                            <ChevronRightIcon className="w-4 h-4 text-ink-800" />
                          </button>
                        </>
                      )}
                    </div>

                    {selectedProduct.images?.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                        {selectedProduct.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index
                                ? 'border-ink-800'
                                : 'border-line hover:border-ink-400'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`View ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT — Details */}
                  <div className="p-4 md:p-6 space-y-5">
                    {selectedProduct.category_name && (
                      <p className="kicker">{selectedProduct.category_name}</p>
                    )}

                    <h2 className="font-serif text-xl md:text-2xl font-bold text-ink-800 leading-tight">
                      {selectedProduct.name}
                    </h2>

                    {selectedProduct.average_rating !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(selectedProduct.average_rating || 4.5)
                                  ? 'text-ink-800 fill-ink-800'
                                  : 'text-ink-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-ink-500">
                          {selectedProduct.average_rating || 4.5} · {selectedProduct.num_reviews || 0} reviews
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 flex-wrap">
                      {selectedProduct.discount_price ? (
                        <>
                          <span className="font-serif text-2xl font-bold text-burgundy-500">
                            {formatPrice(selectedProduct.discount_price)}
                          </span>
                          <span className="text-sm text-ink-400 line-through">
                            {formatPrice(selectedProduct.price)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-burgundy-500">
                            Save {getDiscountPercentage(selectedProduct)}%
                          </span>
                        </>
                      ) : (
                        <span className="font-serif text-2xl font-bold text-ink-800">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                      {selectedProduct.stock > 0 ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          <span className="text-xs uppercase tracking-wider font-medium text-ink-700">
                            In stock · {selectedProduct.stock} available
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="text-xs uppercase tracking-wider font-medium text-ink-500">
                            Out of stock
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {selectedProduct.description && (
                      <div className="pt-4 border-t border-line">
                        <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-2">
                          Description
                        </p>
                        <p className="text-sm text-ink-600 leading-relaxed">
                          {selectedProduct.description}
                        </p>
                      </div>
                    )}

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line">
                      {selectedProduct.material && (
                        <Spec label="Material" value={selectedProduct.material} />
                      )}
                      {selectedProduct.gemstone && (
                        <Spec label="Gemstone" value={selectedProduct.gemstone} />
                      )}
                      {selectedProduct.weight && (
                        <Spec label="Weight" value={`${selectedProduct.weight} g`} />
                      )}
                      {selectedProduct.created_at && (
                        <Spec label="Added" value={formatDate(selectedProduct.created_at)} />
                      )}
                    </div>

                    {/* Tags */}
                    {selectedProduct.tags?.length > 0 && (
                      <div className="pt-4 border-t border-line">
                        <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-cream-100 border border-line text-ink-600 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-line">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold ${
                          selectedProduct.is_active ? 'text-green-700' : 'text-ink-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedProduct.is_active ? 'bg-green-600' : 'bg-ink-400'
                          }`}
                        />
                        {selectedProduct.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {selectedProduct.is_featured && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-burgundy-500">
                          · Featured
                        </span>
                      )}
                      {selectedProduct.is_ai_recommended && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-600">
                          · AI Pick
                        </span>
                      )}
                    </div>

                    {/* Trust */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-line">
                      <TrustItem icon={<TruckIcon className="w-4 h-4" />} label="Free shipping" />
                      <TrustItem icon={<ShieldCheckIcon className="w-4 h-4" />} label="Secure" />
                      <TrustItem icon={<ShoppingBagIcon className="w-4 h-4" />} label="Returns" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-line p-4 flex gap-2 bg-white flex-shrink-0">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    navigate(`/admin/products/edit/${selectedProduct.id}`);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  Edit Product
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2.5 border border-line text-ink-700 rounded text-[11px] uppercase tracking-wider font-semibold hover:border-ink-800 transition-colors"
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

// ==========================================
// SPEC
// ==========================================
const Spec = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-ink-500 font-medium mb-0.5">
      {label}
    </p>
    <p className="text-sm font-medium text-ink-800">{value}</p>
  </div>
);

// ==========================================
// TRUST ITEM
// ==========================================
const TrustItem = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-1.5 text-center">
    <span className="text-ink-800">{icon}</span>
    <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
      {label}
    </span>
  </div>
);

export default AdminProducts;