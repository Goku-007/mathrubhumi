import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function CreditCustomerMaster() {
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
    credit_days: '0',
    credit_limit: '0.00',
    gstin: '',
    class: '0'
  });
  const [loadCreditCustomer, setLoadCreditCustomer] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });

  useEffect(() => {
    fetchAllCreditCustomers();
  }, []);
  
  const classOptions = [
    { value: '0', label: 'Individual' },
    { value: '1', label: 'Educational Instt - School' },
    { value: '2', label: 'Educational Instt - College' },
    { value: '3', label: 'Local Library' },
    { value: '4', label: 'Local Bodies' },
    { value: '5', label: 'Commission Agents' },
    { value: '6', label: 'Agents' },
    { value: '7', label: 'Other Book Shops' },
    { value: '8', label: 'Corporate Firms' },
    { value: '9', label: 'Not Applicable' },
    { value: '10', label: 'Staff' },
    { value: '11', label: 'Freelancers' },
    { value: '12', label: 'Authors' },
    { value: '13', label: 'Section' }
  ];

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
    console.log(`Updating credit customer: id=${id}, data=`, updatedItem);

    const payload = {
      id: id,
      customer_nm: updatedItem.name || '',
      address_1: updatedItem.address1 || null,
      address_2: updatedItem.address2 || null,
      city: updatedItem.city || null,
      telephone: updatedItem.phone || null,
      email_id: updatedItem.email || null,
      debit: parseFloat(updatedItem.debit) || 0.00,
      credit: parseFloat(updatedItem.credit) || 0.00,
      credit_days: parseInt(updatedItem.credit_days) || 0,
      credit_limit: parseFloat(updatedItem.credit_limit) || 0.00,
      gstin: updatedItem.gstin || null,
      class: parseInt(updatedItem.class) || 0
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/credit-customer-update/${id}/`, payload);
      console.log('Credit customer updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Credit customer updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating credit customer:', error);
      setModal({
        isOpen: true,
        message: `Failed to update credit customer: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddCreditCustomer = async () => {
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
      customer_nm: formData.name,
      address_1: formData.address1 || null,
      address_2: formData.address2 || null,
      city: formData.city || null,
      telephone: formData.phone || null,
      email_id: formData.email || null,
      debit: parseFloat(formData.debit) || 0.00,
      credit: parseFloat(formData.credit) || 0.00,
      credit_days: parseInt(formData.credit_days) || 0,
      credit_limit: parseFloat(formData.credit_limit) || 0.00,
      gstin: formData.gstin || null,
      class: parseInt(formData.class) || 0
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/credit-customer-create/', payload);
      console.log('Credit customer created:', response.data);
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
        credit_days: formData.credit_days || '0',
        credit_limit: formData.credit_limit || '0.00',
        gstin: formData.gstin,
        class: formData.class
      };
      console.log('Adding credit customer:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Credit customer added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error creating credit customer:', error);
      setModal({
        isOpen: true,
        message: `Failed to add credit customer: ${error.response?.data?.error || error.message}`,
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
      credit_days: '0',
      credit_limit: '0.00',
      gstin: '',
      class: '0'
    });
  };

  const fetchAllCreditCustomers = async () => {
    try {
      const response = await api.get(`/auth/credit-customer-master-search/`);
      console.log('Credit customers fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        name: item.customer_nm || '',
        address1: item.address_1 || '',
        address2: item.address_2 || '',
        city: item.city || '',
        phone: item.telephone || '',
        email: item.email_id || '',
        debit: item.debit.toString(),
        credit: item.credit.toString(),
        credit_days: item.credit_days.toString(),
        credit_limit: item.credit_limit.toString(),
        gstin: item.gstin || '',
        class: item.class.toString()
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} credit customer(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching credit customers:', error);
      setModal({
        isOpen: true,
        message: `Failed to load credit customers: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleDeleteCreditCustomer = (id) => {
    console.log(`Deleting credit customer: id=${id}`);
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
        <div className="w-[1200px]">
          <table className="w-full table-fixed border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-[300px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Name</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 1</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 2</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">City</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Phone</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">E-Mail</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Debit</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Credit</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Cr Days</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Cr Limit</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">GSTIN</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Class</th>
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
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
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
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="number"
                        value={item.credit_days || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'credit_days', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, credit_days: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                        step="1"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="number"
                        value={item.credit_limit || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'credit_limit', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, credit_limit: e.target.value })}
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
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <select
                        value={item.class || '0'}
                        onChange={(e) => handleTableInputChange(item.id, 'class', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, class: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      >
                        {classOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 w-[50px] bg-red-50">
                      <button
                        onClick={() => handleDeleteCreditCustomer(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete credit customer"
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
          <div className="relative">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
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
              type="number"
              name="credit_days"
              value={formData.credit_days}
              onChange={handleInputChange}
              placeholder="Cr Days"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="1"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="credit_limit"
              value={formData.credit_limit}
              onChange={handleInputChange}
              placeholder="Cr Limit"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="0.001"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <select
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
            >
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddCreditCustomer}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[500px]"
          >
            ADD CUSTOMER
          </button>
        </div>
      </div>
    </div>
  );
}