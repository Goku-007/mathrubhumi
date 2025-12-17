import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/axiosInstance';

export default function SupplierMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    address2: '',
    city: '',
    phone: '',
    email: '',
    debit: '0.00',
    credit: '0.00',
    gstin: ''
  });
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });

  useEffect(() => {
    fetchAllSuppliers();
  }, []);

  // Supplier icon for header
  const supplierIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    console.log(`Updating supplier: id=${id}, data=`, updatedItem);

    const payload = {
      id: id,
      supplier_nm: updatedItem.name || '',
      address_1: updatedItem.address1 || null,
      address_2: updatedItem.address2 || null,
      city: updatedItem.city || null,
      telephone: updatedItem.phone || null,
      email_id: updatedItem.email || null,
      debit: parseFloat(updatedItem.debit) || 0.00,
      credit: parseFloat(updatedItem.credit) || 0.00,
      gstin: updatedItem.gstin || null
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/supplier-update/${id}/`, payload);
      console.log('Supplier updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Supplier updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      setModal({
        isOpen: true,
        message: `Failed to update supplier: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddSupplier = async () => {
    if (!formData.name) {
      console.log('Validation failed: name is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      id: parseInt(formData.id || Math.floor(Math.random() * 1000000)), // Generate random ID if not provided
      supplier_nm: formData.name,
      address_1: formData.address1 || null,
      address_2: formData.address2 || null,
      city: formData.city || null,
      telephone: formData.phone || null,
      email_id: formData.email || null,
      debit: parseFloat(formData.debit) || 0.00,
      credit: parseFloat(formData.credit) || 0.00,
      gstin: formData.gstin || null
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/supplier-create/', payload);
      console.log('Supplier created:', response.data);
      const newItem = {
        id: payload.id,
        name: formData.name,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        debit: formData.debit || '0.00',
        credit: formData.credit || '0.00',
        gstin: formData.gstin
      };
      console.log('Adding supplier:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Supplier added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      setModal({
        isOpen: true,
        message: `Failed to add supplier: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    setFormData({
      name: '',
      address1: '',
      address2: '',
      city: '',
      phone: '',
      email: '',
      debit: '0.00',
      credit: '0.00',
      gstin: ''
    });
  };

  const fetchAllSuppliers = async () => {
    try {
      const response = await api.get(`/auth/supplier-master-search/`);
      console.log('Suppliers fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        name: item.supplier_nm || '',
        address1: item.address_1 || '',
        address2: item.address_2 || '',
        city: item.city || '',
        phone: item.telephone || '',
        email: item.email_id || '',
        debit: item.debit.toString(),
        credit: item.credit.toString(),
        gstin: item.gstin || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} supplier(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setModal({
        isOpen: true,
        message: `Failed to load suppliers: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleDeleteSupplier = (id) => {
    console.log(`Deleting supplier: id=${id}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      <PageHeader icon={supplierIcon} title="Suppliers Master" subtitle="Manage supplier details" />

      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <div className="w-[1100px]">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <tr>
                    <th className="w-[300px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Name</th>
                    <th className="w-[250px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Address 1</th>
                    <th className="w-[250px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Address 2</th>
                    <th className="w-[100px] px-4 py-3 text-left text-sm font-semibold tracking-wide">City</th>
                    <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Phone</th>
                    <th className="w-[200px] px-4 py-3 text-left text-sm font-semibold tracking-wide">E-Mail</th>
                    <th className="w-[100px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Debit</th>
                    <th className="w-[100px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Credit</th>
                    <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">GSTIN</th>
                    <th className="w-[50px] px-4 py-3 text-center text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                        No suppliers found. Add one below.
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
                            value={item.name || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'name', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.address1 || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'address1', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, address1: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.address2 || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'address2', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, address2: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.city || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'city', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, city: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.phone || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'phone', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.email || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'email', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.debit || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'debit', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, debit: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                            step="0.001"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.credit || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'credit', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, credit: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                            step="0.001"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.gstin || ''}
                            onChange={(e) => handleTableInputChange(item.id, 'gstin', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, gstin: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                       transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleDeleteSupplier(item.id)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete supplier"
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

          <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  placeholder="Address 1"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  placeholder="Address 2"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="E-Mail"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="debit"
                  value={formData.debit}
                  onChange={handleInputChange}
                  placeholder="Debit"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  step="0.001"
                  autoComplete="off"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="credit"
                  value={formData.credit}
                  onChange={handleInputChange}
                  placeholder="Credit"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  step="0.001"
                  autoComplete="off"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  placeholder="GSTIN"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                             transition-all duration-200 input-premium"
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAddSupplier}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600
                             text-white text-sm font-medium shadow-lg shadow-blue-500/25
                             hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Quick Tip</p>
            <p className="text-xs text-blue-600 mt-0.5">Press Enter after editing a field to save changes instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}