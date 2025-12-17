import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/axiosInstance';

export default function PurchaseBreakupsMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    breakupName: ''
  });
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deleteBreakupId, setDeleteBreakupId] = useState(null);

  useEffect(() => {
    fetchAllPurchaseBreakups();
  }, []);

  // Icon for header
  const breakupIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

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
    console.log(`Updating purchase breakup: id=${id}, data=`, updatedItem);

    const payload = {
      breakup_nm: updatedItem.breakupName || ''
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/purchase-breakup-update/${id}/`, payload);
      console.log('Purchase breakup updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Purchase breakup updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating purchase breakup:', error);
      setModal({
        isOpen: true,
        message: `Failed to update purchase breakup: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddPurchaseBreakup = async () => {
    if (!formData.breakupName) {
      console.log('Validation failed: breakupName is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Breakup Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      breakup_nm: formData.breakupName
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/purchase-breakup-create/', payload);
      console.log('Purchase breakup created:', response.data);
      const newItem = {
        id: response.data.id,
        breakupName: formData.breakupName
      };
      console.log('Adding purchase breakup:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Purchase breakup added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        breakupName: ''
      });
    } catch (error) {
      console.error('Error creating purchase breakup:', error);
      setModal({
        isOpen: true,
        message: `Failed to add purchase breakup: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeletePurchaseBreakup = (id) => {
    console.log(`Prompting to delete purchase breakup: id=${id}`);
    setDeleteBreakupId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this purchase breakup?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/purchase-breakup-delete/${id}/`);
              console.log('Purchase breakup deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Purchase breakup deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting purchase breakup:', error);
              setModal({
                isOpen: true,
                message: `Failed to delete purchase breakup: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeleteBreakupId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeleteBreakupId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
  };

  const fetchAllPurchaseBreakups = async () => {
    try {
      const response = await api.get(`/auth/purchase-breakups-master-search/`);
      console.log('Purchase breakups fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        breakupName: item.breakup_nm || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} purchase breakup(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching purchase breakups:', error);
      setModal({
        isOpen: true,
        message: `Failed to load purchase breakups: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      {/* Page Header */}
      <PageHeader
        icon={breakupIcon}
        title="Purchase Breakups Master"
        subtitle="Manage purchase breakup names"
      />

      {/* Main Content Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
        {/* Table Section */}
        <div className="p-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full max-w-md">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide">
                    Breakup Name
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
                      No purchase breakups found. Add one below.
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
                          value={item.breakupName || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'breakupName', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, breakupName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                     transition-all duration-200"
                          placeholder="Enter breakup name"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeletePurchaseBreakup(item.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500
                                     hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete purchase breakup"
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

        {/* Add Breakup Form */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4">
          <div className="flex items-center gap-3 max-w-md">
            <div className="flex-1">
              <input
                type="text"
                name="breakupName"
                value={formData.breakupName}
                onChange={handleInputChange}
                placeholder="Enter new breakup name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                           transition-all duration-200 input-premium"
                autoComplete="off"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPurchaseBreakup()}
              />
            </div>
            <button
              onClick={handleAddPurchaseBreakup}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600
                         text-white text-sm font-medium shadow-lg shadow-blue-500/25
                         hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Breakup
            </button>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Quick Tip</p>
            <p className="text-xs text-blue-600 mt-0.5">Press Enter after editing a breakup name to save changes instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}