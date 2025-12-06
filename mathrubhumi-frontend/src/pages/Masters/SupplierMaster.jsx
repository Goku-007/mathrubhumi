import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
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
  const [loadSupplier, setLoadSupplier] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });

  useEffect(() => {
    fetchAllSuppliers();
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
    <div className="flex flex-col h-screen w-[97%] mx-auto p-4 space-y-4">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      <div className="flex-1 bg-white shadow-md rounded-xl p-3 overflow-x-auto">
        <div className="w-[1100px]">
          <table className="w-full table-fixed border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-[300px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Name</th>
                <th className="w-[250px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 1</th>
                <th className="w-[250px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 2</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">City</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Phone</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">E-Mail</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Debit</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Credit</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">GSTIN</th>
                <th className="w-[50px] text-center p-2 text-sm font-semibold border border-gray-300 bg-red-100"></th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {items.map((item, index) => {
                console.log(`Rendering item ${index}:`, item);
                return (
                  <tr key={item.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-1 text-sm border border-gray-300 w-[200px] bg-gray-50">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'name', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, name: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <input
                        type="text"
                        value={item.address1 || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'address1', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, address1: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <input
                        type="text"
                        value={item.address2 || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'address2', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, address2: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="text"
                        value={item.city || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'city', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, city: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <input
                        type="text"
                        value={item.phone || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'phone', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, phone: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[200px] bg-gray-50">
                      <input
                        type="text"
                        value={item.email || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'email', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, email: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="number"
                        value={item.debit || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'debit', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, debit: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                        step="0.001"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="number"
                        value={item.credit || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'credit', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, credit: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                        step="0.001"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <input
                        type="text"
                        value={item.gstin || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'gstin', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, gstin: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 w-[50px] bg-red-50">
                      <button
                        onClick={() => handleDeleteSupplier(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete supplier"
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
          <div className="relative col-span-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative col-span-2">
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleInputChange}
              placeholder="Address 1"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative col-span-2">
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleInputChange}
              placeholder="Address 2"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative col-span-2">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative col-span-2">
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="E-Mail"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="debit"
              value={formData.debit}
              onChange={handleInputChange}
              placeholder="Debit"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="0.001"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleInputChange}
              placeholder="Credit"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="0.001"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleInputChange}
              placeholder="GSTIN"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleAddSupplier}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD SUPPLIER
          </button>
        </div>
      </div>
    </div>
  );
}