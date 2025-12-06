import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function CategoriesMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: ''
  });
  const [loadCategories, setLoadCategories] = useState('');
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
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableInputChange = (id, field, value) => {
    console.log(`Table input changed: id=${id}, field=${field}, value=${value}`);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleTableUpdate = async (id, updatedItem) => {
    console.log(`Updating category: id=${id}, data=`, updatedItem);

    const payload = {
      category_nm: updatedItem.categoryName || ''
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/category-update/${id}/`, payload);
      console.log('Category updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Category updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating category:', error);
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
      console.log('Validation failed: categoryName is empty');
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

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/category-create/', payload);
      console.log('Category created:', response.data);
      const newItem = {
        id: response.data.id, // Use the ID returned by the backend
        categoryName: formData.categoryName
      };
      console.log('Adding category:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
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
      console.error('Error creating category:', error);
      setModal({
        isOpen: true,
        message: `Failed to add category: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeleteCategory = (id) => {
    console.log(`Prompting to delete category: id=${id}`);
    setDeleteCategoryId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this category?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/category-delete/${id}/`);
              console.log('Category deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Category deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting category:', error);
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
      console.log('Categories fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        categoryName: item.category_nm || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} category(ies)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      setModal({
        isOpen: true,
        message: `Failed to load categories: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-[97%] mx-auto p-4 space-y-4">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      <div className="flex-1 bg-white shadow-md rounded-xl p-3 overflow-x-auto">
        <div className="w-[300px]">
          <table className="w-full table-fixed border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-[250px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Category Name</th>
                <th className="w-[50px] text-center p-2 text-sm font-semibold border border-gray-300 bg-red-100"></th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {items.map((item, index) => {
                console.log(`Rendering item ${index}:`, item);
                return (
                  <tr key={item.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-1 text-sm border border-gray-300 w-[250px] bg-gray-50">
                      <input
                        type="text"
                        value={item.categoryName || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'categoryName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, categoryName: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 w-[50px] bg-red-50">
                      <button
                        onClick={() => handleDeleteCategory(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete category"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl p-3 w-full">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleInputChange}
            placeholder="Category Name"
            className="border p-2 rounded-lg text-sm w-full max-w-[250px] focus:ring-2 focus:ring-blue-300"
            autoComplete="off"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD CATEGORY
          </button>
        </div>
      </div>
    </div>
  );
}