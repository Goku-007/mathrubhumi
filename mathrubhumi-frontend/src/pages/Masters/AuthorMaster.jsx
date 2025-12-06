import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function AuthorMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contact: '',
    email: '',
    address1: '',
    address2: '',
    phone: '',
    city: ''
  });
  const [loadAuthor, setLoadAuthor] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadAuthorChange = (e) => {
    const value = e.target.value;
    console.log(`Load author input changed: ${value}`);
    setLoadAuthor(value);
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
    console.log(`Updating author: id=${id}, data=`, updatedItem);

    const payload = {
      id: id,
      author_nm: updatedItem.name || '',
      contact: updatedItem.contact || null,
      mail_id: updatedItem.email || null,
      address1: updatedItem.address1 || null,
      address2: updatedItem.address2 || null,
      telephone: updatedItem.phone || null,
      city: updatedItem.city || null
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/author-update/${id}/`, payload);
      console.log('Author updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Author updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating author:', error);
      setModal({
        isOpen: true,
        message: `Failed to update author: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddAuthor = async () => {
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
      author_nm: formData.name,
      contact: formData.contact || null,
      mail_id: formData.email || null,
      address1: formData.address1 || null,
      address2: formData.address2 || null,
      telephone: formData.phone || null,
      city: formData.city || null
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/author-create/', payload);
      console.log('Author created:', response.data);
      const newItem = {
        id: parseInt(formData.code),
        code: formData.code,
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        address1: formData.address1,
        address2: formData.address2,
        phone: formData.phone,
        city: formData.city
      };
      console.log('Adding author:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Author added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error creating author:', error);
      setModal({
        isOpen: true,
        message: `Failed to add author: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    setFormData({
      code: '',
      name: '',
      contact: '',
      email: '',
      address1: '',
      address2: '',
      phone: '',
      city: ''
    });
  };

  const handleLoadAuthor = async () => {
    if (loadAuthor.length < 2) {
      console.log('Validation failed: loadAuthor less than 2 characters');
      setModal({
        isOpen: true,
        message: 'Please enter at least 2 characters to search',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    try {
      const response = await api.get(`/auth/author-master-search/?q=${encodeURIComponent(loadAuthor)}`);
      console.log('Authors fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        code: item.id.toString(),
        name: item.author_nm || '',
        contact: item.contact || '',
        email: item.mail_id || '',
        address1: item.address1 || '',
        address2: item.address2 || '',
        phone: item.telephone || '',
        city: item.city || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} author(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching authors:', error);
      setModal({
        isOpen: true,
        message: `Failed to load authors: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleDeleteAuthor = (id) => {
    console.log(`Deleting author: id=${id}`);
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
        <div className="w-[1050px]">
          <table className="w-full table-fixed border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Code</th>
                <th className="w-[300px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Name</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Contact</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">E-Mail</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 1</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Address 2</th>
                <th className="w-[150px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Phone</th>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">City</th>
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
                    <td className="p-1 text-sm text-center border border-gray-300 w-[50px] bg-red-50">
                      <button
                        onClick={() => handleDeleteAuthor(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete author"
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
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Contact"
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
          <div className="relative col-span-2">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
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
          <button
            onClick={handleAddAuthor}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD AUTHOR
          </button>
          <div className="relative">
            <input
              type="text"
              value={loadAuthor}
              onChange={handleLoadAuthorChange}
              placeholder="LOAD AUTHOR"
              className="border p-2 rounded-lg text-sm w-full max-w-[200px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleLoadAuthor}
            className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 text-sm font-medium w-full max-w-[150px]"
          >
            LOAD AUTHOR
          </button>
        </div>
      </div>
    </div>
  );
}