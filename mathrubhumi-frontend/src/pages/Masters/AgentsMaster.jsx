import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/axiosInstance';

export default function AgentsMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    agentName: '',
    address1: '',
    address2: '',
    city: '',
    telephone: '',
    contact: '',
    email: ''
  });
  const [loadAgents, setLoadAgents] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deleteAgentId, setDeleteAgentId] = useState(null);

    useEffect(() => {
    fetchAllAgents();
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
    console.log(`Updating agent: id=${id}, data=`, updatedItem);

    const payload = {
      agent_nm: updatedItem.agentName || '',
      address1: updatedItem.address1 || null,
      address2: updatedItem.address2 || null,
      city: updatedItem.city || null,
      telephone: updatedItem.telephone || null,
      contact: updatedItem.contact || null,
      email: updatedItem.email || null
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/agent-update/${id}/`, payload);
      console.log('Agent updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Agent updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      setModal({
        isOpen: true,
        message: `Failed to update agent: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddAgent = async () => {
    if (!formData.agentName) {
      console.log('Validation failed: agentName is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Agent Name field',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      agent_nm: formData.agentName,
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
      const response = await api.post('/auth/agent-create/', payload);
      console.log('Agent created:', response.data);
      const newItem = {
        id: response.data.id,
        agentName: formData.agentName,
        address1: formData.address1 || '',
        address2: formData.address2 || '',
        city: formData.city || '',
        telephone: formData.telephone || '',
        contact: formData.contact || '',
        email: formData.email || ''
      };
      console.log('Adding agent:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Agent added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        agentName: '',
        address1: '',
        address2: '',
        city: '',
        telephone: '',
        contact: '',
        email: ''
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      setModal({
        isOpen: true,
        message: `Failed to add agent: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeleteAgent = (id) => {
    console.log(`Prompting to delete agent: id=${id}`);
    setDeleteAgentId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this agent?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/agent-delete/${id}/`);
              console.log('Agent deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'Agent deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting agent:', error);
              setModal({
                isOpen: true,
                message: `Failed to delete agent: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeleteAgentId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeleteAgentId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
  };

  const fetchAllAgents = async () => {
    try {
      const response = await api.get(`/auth/agents-master-search/`);
      console.log('Agents fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        agentName: item.agent_nm || '',
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
        message: `Loaded ${fetchedItems.length} agent(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      setModal({
        isOpen: true,
        message: `Failed to load agents: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  // Agent icon for header
  const agentIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

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
        icon={agentIcon}
        title="Agents Master"
        subtitle="Manage agent information and contacts"
      />

      {/* Main Content Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
        {/* Table Section */}
        <div className="p-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[200px]">
                    Agent Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[150px]">
                    Address 1
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[150px]">
                    Address 2
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[100px]">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[120px]">
                    Telephone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[120px]">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide w-[200px]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                      No agents found. Add one below.
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
                          value={item.agentName || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'agentName', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, agentName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                     transition-all duration-200"
                          placeholder="Enter agent name"
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
                          placeholder="Address 1"
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
                          placeholder="Address 2"
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
                          placeholder="City"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.telephone || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'telephone', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, telephone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                     transition-all duration-200"
                          placeholder="Telephone"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.contact || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'contact', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, contact: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                     transition-all duration-200"
                          placeholder="Contact"
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
                          placeholder="Email"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeleteAgent(item.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500
                                     hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete agent"
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

        {/* Add Agent Form */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                name="agentName"
                value={formData.agentName}
                onChange={handleInputChange}
                placeholder="Enter agent name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                           transition-all duration-200 input-premium"
                autoComplete="off"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAgent()}
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
            <div>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="Telephone"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                           transition-all duration-200 input-premium"
                autoComplete="off"
              />
            </div>
            <div>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Contact"
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
                placeholder="Email address"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                           transition-all duration-200 input-premium"
                autoComplete="off"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddAgent}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600
                           text-white text-sm font-medium shadow-lg shadow-blue-500/25
                           hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Agent
              </button>
            </div>
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
            <p className="text-xs text-blue-600 mt-0.5">Press Enter after editing agent details to save changes instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}