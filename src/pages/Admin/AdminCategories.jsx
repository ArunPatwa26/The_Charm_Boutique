import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../../services/categoryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminGetCategories({ include_inactive: true });
      if (response.success) setCategories(response.categories || []);
    } catch (error) {
      toast.error(error?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return toast.error('Category name is required');
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      if (formData.description) fd.append('description', formData.description.trim());
      if (formData.image) fd.append('image', formData.image);

      const response = editingCategory
        ? await adminUpdateCategory(editingCategory.id, fd)
        : await adminCreateCategory(fd);

      if (response.success) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        closeModal();
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to save');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await adminDeleteCategory(deleteTarget.id);
      if (response.success) {
        toast.success('Category deleted');
        setDeleteTarget(null);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to delete');
    }
  };

  // ==========================================
  // EDIT
  // ==========================================
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: null,
    });
    setImagePreview(category.image || '');
    setShowModal(true);
  };

  // ==========================================
  // IMAGE
  // ==========================================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Select a valid image');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: null });
    setImagePreview('');
    setEditingCategory(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-kicker font-semibold text-ink-500 mb-2">
            Organize
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink-800">
            Categories
          </h1>
          <p className="text-xs md:text-sm text-ink-500 mt-1.5">
            {categories.length} {categories.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="self-start sm:self-auto btn-solid"
        >
          <PlusIcon className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* ==========================================
          SEARCH
      ========================================== */}
      <div className="bg-white border border-line rounded-lg p-3 md:p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-cream-200 rounded transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-3.5 h-3.5 text-ink-500" />
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          GRID
      ========================================== */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white border border-line rounded-lg px-4">
          <FolderIcon className="w-10 h-10 text-ink-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-ink-800 mb-1">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-sm text-ink-500 mb-6">
            {searchTerm
              ? 'Try a different search'
              : 'Start by creating your first category'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="btn-solid text-xs"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Create Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              className="group"
            >
              {/* Image — square, no overlay */}
              <div className="relative aspect-square overflow-hidden rounded bg-cream-200 mb-3">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderIcon className="w-10 h-10 text-ink-300" />
                  </div>
                )}

                {/* Status dot top-right */}
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-bold ${
                    category.is_active
                      ? 'bg-ink-800 text-cream-100'
                      : 'bg-cream-100 text-ink-500 border border-line'
                  }`}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>

                {/* Hover quick actions (desktop) */}
                <div className="hidden md:flex absolute top-3 left-3 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 bg-cream-100/95 backdrop-blur-sm text-ink-700 hover:bg-ink-800 hover:text-cream-100 rounded transition-colors"
                    aria-label="Edit"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    className="p-1.5 bg-cream-100/95 backdrop-blur-sm text-ink-700 hover:bg-red-500 hover:text-white rounded transition-colors"
                    aria-label="Delete"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-sm md:text-base font-medium text-ink-800 group-hover:text-burgundy-500 transition-colors line-clamp-1">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="hidden md:block text-xs text-ink-500 line-clamp-1 mt-1">
                    {category.description}
                  </p>
                )}

                {/* Mobile quick actions */}
                <div className="flex md:hidden items-center gap-1 mt-2.5 pt-2.5 border-t border-line">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-ink-700 hover:bg-cream-100 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ==========================================
          CREATE / EDIT MODAL
      ========================================== */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 12 }}
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-md my-auto max-h-[90vh] overflow-y-auto border border-line"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <p className="text-[10px] uppercase tracking-kicker font-semibold text-ink-500 mb-1">
                    {editingCategory ? 'Edit' : 'New'}
                  </p>
                  <h3 className="font-serif text-lg font-bold text-ink-800">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-cream-100 rounded transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-4 h-4 text-ink-500" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
                    Name <span className="text-burgundy-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm"
                    placeholder="Necklaces"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-line rounded focus:border-ink-800 outline-none transition-colors text-sm resize-none"
                    placeholder="Optional short description"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">
                    Image
                  </label>
                  <div className="flex items-center gap-3">
                    {imagePreview && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 border-ink-800">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, image: null });
                            if (fileInputRef.current)
                              fileInputRef.current.value = '';
                          }}
                          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          aria-label="Remove"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label className="flex-1 px-4 py-5 border border-dashed border-line-strong hover:border-ink-800 hover:bg-cream-100 rounded cursor-pointer transition-colors text-center">
                      <PhotoIcon className="w-6 h-6 mx-auto text-ink-400 mb-1" />
                      <span className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">
                        {imagePreview ? 'Change image' : 'Upload image'}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-400 mt-2">
                    JPG · PNG · WEBP · Max 5MB
                  </p>
                </div>
              </form>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white flex gap-2 px-5 py-4 border-t border-line">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-700 hover:border-ink-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-ink-800 hover:bg-burgundy-500 text-cream-100 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-3.5 h-3.5" />
                      {editingCategory ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          DELETE MODAL
      ========================================== */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 border border-line"
            >
              <div className="text-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-ink-800 mb-2">
                  Delete this category?
                </h3>
                <p className="text-xs text-ink-500 mb-6 leading-relaxed">
                  "{deleteTarget.name}" will be permanently removed. This
                  cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 px-4 py-2.5 border border-line rounded text-[11px] uppercase tracking-wider font-semibold text-ink-700 hover:border-ink-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] uppercase tracking-wider font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;