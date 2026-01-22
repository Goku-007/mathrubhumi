import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/axiosInstance';

export default function CategoriesMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: ''
  });
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableInputChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleTableUpdate = async (id, updatedItem) => {
    const payload = {
      category_nm: updatedItem.categoryName || ''
    };

    try {
      await api.put(`/auth/category-update/${id}/`, payload);
      setModal({
        isOpen: true,
        message: 'Category updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      setModal({
        isOpen: true,
        message: `Failed to update category: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddCategory = async () => {
    if (!formData.categoryName) {
      setModal({
        isOpen: true,
        message: 'Please fill Category Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      category_nm: formData.categoryName
    };

    try {
      const response = await api.post('/auth/category-create/', payload);
      const newItem = {
        id: response.data.id,
        categoryName: formData.categoryName
      };
      setItems((prev) => [...prev, newItem]);
      setModal({
        isOpen: true,
        message: 'Category added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        categoryName: ''
      });
    } catch (error) {
      setModal({
        isOpen: true,
        message: `Failed to add category: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleDeleteCategory = (id) => {
    setDeleteCategoryId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this category?',
      type: 'warning',
      buttons: [
        {
          label: 'Delete',
          onClick: async () => {
            try {
              await api.delete(`/auth/category-delete/${id}/`);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Category deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              setModal({
                isOpen: true,
                message: `Failed to delete category: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeleteCategoryId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeleteCategoryId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
  };

  const fetchAllCategories = async () => {
    try {
      const response = await api.get(`/auth/categories-master-search/`);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        categoryName: item.category_nm || ''
      }));
      setItems(fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} category(ies)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      setModal({
        isOpen: true,
        message: `Failed to load categories: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  // Category icon for header
  const categoryIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 sm:p-6 flex flex-col">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      {/* Page Header */}
      <div className="flex-shrink-0">
        <PageHeader
          icon={categoryIcon}
          title="Categories Master"
          subtitle="Manage product categories"
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Table Section */}
        <div className="p-4 flex-1 min-h-0">
          <div className="h-full overflow-y-auto overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full max-w-md">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide">
                    Category Name
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-400">
                      No categories found. Add one below.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.categoryName || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'categoryName', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, categoryName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                     transition-all duration-200"
                          placeholder="Enter category name"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeleteCategory(item.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 
                                     hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete category"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Category Form */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md">
            <div className="flex-1">
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleInputChange}
                placeholder="Enter new category name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                           transition-all duration-200 input-premium"
                autoComplete="off"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 w-full sm:w-auto
                         text-white text-sm font-medium shadow-lg shadow-blue-500/25
                         hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
