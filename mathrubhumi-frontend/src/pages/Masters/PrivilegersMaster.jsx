import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function PrivilegersMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    privilegerName: '',
    address1: '',
    address2: '',
    city: '',
    telephone: '',
    contact: '',
    email: ''
  });
  const [loadPrivilegers, setLoadPrivilegers] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deletePrivilegerId, setDeletePrivilegerId] = useState(null);

  useEffect(() => {
    fetchAllPrivilegers();
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
    console.log(`Updating privileger: id=${id}, data=`, updatedItem);

    const payload = {
      privileger_nm: updatedItem.privilegerName || '',
      address1: updatedItem.address1 || null,
      address2: updatedItem.address2 || null,
      city: updatedItem.city || null,
      telephone: updatedItem.telephone || null,
      contact: updatedItem.contact || null,
      email: updatedItem.email || null
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/privileger-update/${id}/`, payload);
      console.log('Privileger updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Privileger updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating privileger:', error);
      setModal({
        isOpen: true,
        message: `Failed to update privileger: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddPrivileger = async () => {
    if (!formData.privilegerName) {
      console.log('Validation failed: privilegerName is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Privileger Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      privileger_nm: formData.privilegerName,
      address1: formData.address1 || null,
      address2: formData.address2 || null,
      city: formData.city || null,
      telephone: formData.telephone || null,
      contact: formData.contact || null,
      email: formData.email || null
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/privileger-create/', payload);
      console.log('Privileger created:', response.data);
      const newItem = {
        id: response.data.id,
        privilegerName: formData.privilegerName,
        address1: formData.address1 || '',
        address2: formData.address2 || '',
        city: formData.city || '',
        telephone: formData.telephone || '',
        contact: formData.contact || '',
        email: formData.email || ''
      };
      console.log('Adding privileger:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Privileger added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        privilegerName: '',
        address1: '',
        address2: '',
        city: '',
        telephone: '',
        contact: '',
        email: ''
      });
    } catch (error) {
      console.error('Error creating privileger:', error);
      setModal({
        isOpen: true,
        message: `Failed to add privileger: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeletePrivileger = (id) => {
    console.log(`Prompting to delete privileger: id=${id}`);
    setDeletePrivilegerId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this privileger?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/privileger-delete/${id}/`);
              console.log('Privileger deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Privileger deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting privileger:', error);
              setModal({
                isOpen: true,
                message: `Failed to delete privileger: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeletePrivilegerId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeletePrivilegerId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
  };

  const fetchAllPrivilegers = async () => {
    try {
      const response = await api.get(`/auth/privilegers-master-search/`);
      console.log('Privilegers fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        privilegerName: item.privileger_nm || '',
        address1: item.address1 || '',
        address2: item.address2 || '',
        city: item.city || '',
        telephone: item.telephone || '',
        contact: item.contact || '',
        email: item.email || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} privileger(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching privilegers:', error);
      setModal({
        isOpen: true,
        message: `Failed to load privilegers: ${error.response?.data?.error || error.message}`,
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
        <div className="min-w-[700px]">
          <table className="w-full table-auto border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[250px]">Privileger Name</th>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[200px]">Address 1</th>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[200px]">Address 2</th>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[100px]">City</th>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[100px]">Telephone</th>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[100px]">Contact</th>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[200px]">Email</th>
                <th className="text-center p-2 text-sm font-semibold border border-gray-300 bg-red-100 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {items.map((item, index) => {
                console.log(`Rendering item ${index}:`, item);
                return (
                  <tr key={item.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.privilegerName || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'privilegerName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, privilegerName: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.address1 || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'address1', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, address1: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.address2 || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'address2', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, address2: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.city || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'city', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, city: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.telephone || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'telephone', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, telephone: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.contact || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'contact', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, contact: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.email || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'email', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, email: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 bg-red-50">
                      <button
                        onClick={() => handleDeletePrivileger(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete privileger"
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
              name="privilegerName"
              value={formData.privilegerName}
              onChange={handleInputChange}
              placeholder="Privileger Name"
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
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="Telephone"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Contact"
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
              placeholder="Email"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleAddPrivileger}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD PRIVILEGER
          </button>
        </div>
      </div>
    </div>
  );
}