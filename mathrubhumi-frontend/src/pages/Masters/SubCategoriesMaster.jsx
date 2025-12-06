import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function SubCategoriesMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    subCategoryName: ''
  });
  const [loadSubCategories, setLoadSubCategories] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deleteSubCategoryId, setDeleteSubCategoryId] = useState(null);

  useEffect(() => {
    fetchAllSubCategories();
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
    console.log(`Updating sub-category: id=${id}, data=`, updatedItem);

    const payload = {
      sub_category_nm: updatedItem.subCategoryName || ''
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/sub-category-update/${id}/`, payload);
      console.log('Sub-category updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Sub-category updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating sub-category:', error);
      setModal({
        isOpen: true,
        message: `Failed to update sub-category: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddSubCategory = async () => {
    if (!formData.subCategoryName) {
      console.log('Validation failed: subCategoryName is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Sub Category Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      sub_category_nm: formData.subCategoryName
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/sub-category-create/', payload);
      console.log('Sub-category created:', response.data);
      const newItem = {
        id: response.data.id,
        subCategoryName: formData.subCategoryName
      };
      console.log('Adding sub-category:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Sub-category added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        subCategoryName: ''
      });
    } catch (error) {
      console.error('Error creating sub-category:', error);
      setModal({
        isOpen: true,
        message: `Failed to add sub-category: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeleteSubCategory = (id) => {
    console.log(`Prompting to delete sub-category: id=${id}`);
    setDeleteSubCategoryId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this sub-category?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/sub-category-delete/${id}/`);
              console.log('Sub-category deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Sub-category deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting sub-category:', error);
              setModal({
                isOpen: true,
                message: `Failed to delete sub-category: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeleteSubCategoryId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeleteSubCategoryId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
  };

  const fetchAllSubCategories = async () => {
    try {
      const response = await api.get(`/auth/sub-categories-master-search/`);
      console.log('Sub-categories fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        subCategoryName: item.sub_category_nm || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} sub-category(ies)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setModal({
        isOpen: true,
        message: `Failed to load sub-categories: ${error.response?.data?.error || error.message}`,
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
                <th className="w-[250px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Sub Category Name</th>
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
                        value={item.subCategoryName || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'subCategoryName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, subCategoryName: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 w-[50px] bg-red-50">
                      <button
                        onClick={() => handleDeleteSubCategory(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete sub-category"
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
          <div className="relative">
            <input
              type="text"
              name="subCategoryName"
              value={formData.subCategoryName}
              onChange={handleInputChange}
              placeholder="Sub Category Name"
              className="border p-2 rounded-lg text-sm w-[250px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleAddSubCategory}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD SUB CATEGORY
          </button>
        </div>
      </div>
    </div>
  );
}