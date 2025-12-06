import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function PublisherMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contact: '',
    own: '0',
    email: '',
    address1: '',
    address2: '',
    phone: '',
    city: '',
    discount: ''
  });
  const [loadPublisher, setLoadPublisher] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });

  useEffect(() => {
    fetchAllPublishers();
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
    console.log(`Updating publisher: id=${id}, data=`, updatedItem);

    const payload = {
      id: id,
      publisher_nm: updatedItem.name || '',
      contact: updatedItem.contact || null,
      own: parseInt(updatedItem.own) || 0,
      email: updatedItem.email || null,
      address1: updatedItem.address1 || null,
      address2: updatedItem.address2 || null,
      telephone: updatedItem.phone || null,
      city: updatedItem.city || null,
      max_discount_p: parseFloat(updatedItem.discount) || 0.00
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/publisher-update/${id}/`, payload);
      console.log('Publisher updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Publisher updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating publisher:', error);
      setModal({
        isOpen: true,
        message: `Failed to update publisher: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddPublisher = async () => {
    if (!formData.code || !formData.name) {
      console.log('Validation failed: code or name is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Code and Name fields',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      id: parseInt(formData.code),
      publisher_nm: formData.name,
      contact: formData.contact || null,
      own: parseInt(formData.own) || 0,
      email: formData.email || null,
      address1: formData.address1 || null,
      address2: formData.address2 || null,
      telephone: formData.phone || null,
      city: formData.city || null,
      max_discount_p: parseFloat(formData.discount) || 0.00
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/publisher-create/', payload);
      console.log('Publisher created:', response.data);
      const newItem = {
        id: parseInt(formData.code),
        code: formData.code,
        name: formData.name,
        contact: formData.contact,
        own: formData.own,
        email: formData.email,
        address1: formData.address1,
        address2: formData.address2,
        phone: formData.phone,
        city: formData.city,
        discount: formData.discount
      };
      console.log('Adding publisher:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Publisher added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error creating publisher:', error);
      setModal({
        isOpen: true,
        message: `Failed to add publisher: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    setFormData({
      code: '',
      name: '',
      contact: '',
      own: '0',
      email: '',
      address1: '',
      address2: '',
      phone: '',
      city: '',
      discount: ''
    });
  };

  const fetchAllPublishers = async () => {
    try {
      const response = await api.get(`/auth/publisher-master-search/`);
      console.log('Publishers fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        code: item.id.toString(),
        name: item.publisher_nm || '',
        contact: item.contact || '',
        own: item.own.toString(),
        email: item.email || '',
        address1: item.address1 || '',
        address2: item.address2 || '',
        phone: item.telephone || '',
        city: item.city || '',
        discount: item.max_discount_p.toString()
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} publisher(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching publishers:', error);
      setModal({
        isOpen: true,
        message: `Failed to load publishers: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleDeletePublisher = (id) => {
    console.log(`Deleting publisher: id=${id}`);
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
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Code</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Name</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Contact</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">OWN ?</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">E-Mail</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 1</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 2</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Phone</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">City</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Dis(%)</th>
                <th className="w-[50px] text-center p-2 text-sm font-semibold border border-gray-300 bg-red-100"></th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {items.map((item, index) => {
                console.log(`Rendering item ${index}:`, item);
                return (
                  <tr key={item.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="text"
                        value={item.code || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'code', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, code: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
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
                        value={item.contact || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'contact', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, contact: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <select
                        value={item.own || '0'}
                        onChange={(e) => handleTableInputChange(item.id, 'own', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, own: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
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
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <input
                        type="text"
                        value={item.phone || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'phone', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, phone: e.target.value })}
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
                    <td className="p-1 text-sm border border-gray-300 w-[100px] bg-gray-50">
                      <input
                        type="number"
                        value={item.discount || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'discount', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, discount: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                        step="0.01"
                      />
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 w-[50px] bg-red-50">
                      <button
                        onClick={() => handleDeletePublisher(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete publisher"
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
          <div className="relative">
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Code"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative col-span-3">
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
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Contact"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <select
              name="own"
              value={formData.own}
              onChange={handleInputChange}
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
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
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              placeholder="Dis(%)"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="0.01"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleAddPublisher}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD PUBLISHER
          </button>
        </div>
      </div>
    </div>
  );
}