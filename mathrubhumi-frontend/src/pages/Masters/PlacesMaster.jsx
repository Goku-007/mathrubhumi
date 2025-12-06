import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function PlacesMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    placeName: ''
  });
  const [loadPlaces, setLoadPlaces] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deletePlaceId, setDeletePlaceId] = useState(null);

  useEffect(() => {
      fetchAllPlaces();
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
    console.log(`Updating place: id=${id}, data=`, updatedItem);

    const payload = {
      place_nm: updatedItem.placeName || ''
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/place-update/${id}/`, payload);
      console.log('Place updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Place updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating place:', error);
      setModal({
        isOpen: true,
        message: `Failed to update place: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddPlace = async () => {
    if (!formData.placeName) {
      console.log('Validation failed: placeName is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Place Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      place_nm: formData.placeName
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/place-create/', payload);
      console.log('Place created:', response.data);
      const newItem = {
        id: response.data.id,
        placeName: formData.placeName
      };
      console.log('Adding place:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Place added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        placeName: ''
      });
    } catch (error) {
      console.error('Error creating place:', error);
      setModal({
        isOpen: true,
        message: `Failed to add place: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeletePlace = (id) => {
    console.log(`Prompting to delete place: id=${id}`);
    setDeletePlaceId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this place?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/place-delete/${id}/`);
              console.log('Place deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Place deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting place:', error);
              setModal({
                isOpen: true,
                message: `Failed to delete place: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeletePlaceId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeletePlaceId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
  };

  const fetchAllPlaces = async () => {
    try {
      const response = await api.get(`/auth/places-master-search/`);
      console.log('Places fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        placeName: item.place_nm || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} place(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching places:', error);
      setModal({
        isOpen: true,
        message: `Failed to load places: ${error.response?.data?.error || error.message}`,
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
          <table className="w-full table-auto border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100 w-[200px]">Place Name</th>
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
                        value={item.placeName || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'placeName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, placeName: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm text-center border border-gray-300 bg-red-50">
                      <button
                        onClick={() => handleDeletePlace(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete place"
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
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            placeholder="Place Name"
            className="border p-2 rounded-lg text-sm w-full max-w-[220px] focus:ring-2 focus:ring-blue-300"
            autoComplete="off"
          />
          <button
            onClick={handleAddPlace}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD PLACE
          </button>
        </div>
      </div>
    </div>
  );
}