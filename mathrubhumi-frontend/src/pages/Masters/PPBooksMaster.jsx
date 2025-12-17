import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import api from '../../utils/axiosInstance';

export default function PPBooksMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    ppBookName: '',
    code: '',
    nos: '',
    faceValue: '',
    regStartDate: '',
    regEndDate: '',
    dateOfRelease: '',
    notes: '',
    closed: '0',
    ppBookFirm: '',
    ppBookFirmId: '',
    nosEx: '5000',
    productId: '0',
    inserted: '',
    modified: ''
  });
  const [titleHighlightedIndex, setTitleHighlightedIndex] = useState(-1);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [publisherHighlightedIndex, setPublisherHighlightedIndex] = useState(-1);
  const [publisherSuggestions, setPublisherSuggestions] = useState([]);
  const [showPublisherSuggestions, setShowPublisherSuggestions] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });
  const [deletePPBookId, setDeletePPBookId] = useState(null);

  useEffect(() => {
    fetchAllPPBooks();
  }, []);

  const handleKeyDown = (e, inputType) => {
    if (inputType === 'ppBookName' && showTitleSuggestions && titleSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTitleHighlightedIndex((prev) => {
          const newIndex = prev < titleSuggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`title-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTitleHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : titleSuggestions.length - 1;
          const suggestionElement = document.getElementById(`title-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && titleHighlightedIndex >= 0) {
        e.preventDefault();
        handleTitleSuggestionClick(titleSuggestions[titleHighlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowTitleSuggestions(false);
        setTitleSuggestions([]);
        setTitleHighlightedIndex(-1);
      }
    } else if (inputType === 'ppBookFirm' && showPublisherSuggestions && publisherSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPublisherHighlightedIndex((prev) => {
          const newIndex = prev < publisherSuggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`publisher-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPublisherHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : publisherSuggestions.length - 1;
          const suggestionElement = document.getElementById(`publisher-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && publisherHighlightedIndex >= 0) {
        e.preventDefault();
        handlePublisherSuggestionClick(publisherSuggestions[publisherHighlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowPublisherSuggestions(false);
        setPublisherSuggestions([]);
        setPublisherHighlightedIndex(-1);
      }
    }
  };

  const fetchAllPPBooks = async () => {
    try {
      const response = await api.get(`/auth/pp-books-master-search/?q=${encodeURIComponent()}`);
      console.log('PP books fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        ppBookName: item.pp_book_nm || '',
        code: item.code || '',
        nos: item.nos || '',
        faceValue: item.face_value || '',
        regStartDate: item.reg_start_date || '',
        regEndDate: item.reg_end_date || '',
        dateOfRelease: item.date_of_release || '',
        notes: item.notes || '',
        closed: item.closed || '',
        ppBookFirmId: item.pp_book_firm_id || '',
        ppBookFirm: item.pp_book_firm || '',
        nosEx: item.nos_ex || '5000',
        productId: item.product_id || '0',
        inserted: item.inserted || '',
        modified: item.modified || ''
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} PP book(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching PP books:', error);
      setModal({
        isOpen: true,
        message: `Failed to load PP books: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleTitleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      ppBookName: suggestion.title,
      productId: suggestion.id
    }));
    setTitleSuggestions([]);
    setShowTitleSuggestions(false);
    setTitleHighlightedIndex(-1);
  };

  const handlePublisherSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      ppBookFirm: suggestion.publisher_nm,
      ppBookFirmId: suggestion.id
    }));
    setPublisherSuggestions([]);
    setShowPublisherSuggestions(false);
    setPublisherHighlightedIndex(-1);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'ppBookName') {
      setFormData(prev => ({ ...prev, ppBookName: value, productId: '0' }));
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        setTitleSuggestions([]);
        setShowTitleSuggestions(false);
        setTitleHighlightedIndex(-1);
      } else {
        try {
          const res = await api.get(`/auth/product-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('Title API response:', res.data);
          if (res.data && res.data.length > 0) {
            setTitleSuggestions(res.data);
            setShowTitleSuggestions(true);
            setTitleHighlightedIndex(-1);
          } else {
            setTitleSuggestions([]);
            setShowTitleSuggestions(false);
            setTitleHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('Title autocomplete error:', error);
          setTitleSuggestions([]);
          setShowTitleSuggestions(false);
          setTitleHighlightedIndex(-1);
        }
      }
    } else if (name === 'ppBookFirm') {
      setFormData(prev => ({ ...prev, ppBookFirm: value, ppBookFirmId: '0' }));
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        setPublisherSuggestions([]);
        setShowPublisherSuggestions(false);
        setPublisherHighlightedIndex(-1);
      } else {
        try {
          const res = await api.get(`/auth/publisher-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('Publisher API response:', res.data);
          if (res.data && res.data.length > 0) {
            setPublisherSuggestions(res.data);
            setShowPublisherSuggestions(true);
            setPublisherHighlightedIndex(-1);
          } else {
            setPublisherSuggestions([]);
            setShowPublisherSuggestions(false);
            setPublisherHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('Publisher autocomplete error:', error);
          setPublisherSuggestions([]);
          setShowPublisherSuggestions(false);
          setPublisherHighlightedIndex(-1);
        }
      }
    }
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
    console.log(`Updating PP book: id=${id}, data=`, updatedItem);

    const payload = {
      company_id: 1,
      pp_book_nm: updatedItem.ppBookName || '',
      code: updatedItem.code || '',
      nos: updatedItem.nos ? parseInt(updatedItem.nos) : null,
      face_value: updatedItem.faceValue ? parseFloat(updatedItem.faceValue) : null,
      reg_start_date: updatedItem.regStartDate || null,
      reg_end_date: updatedItem.regEndDate || null,
      date_of_release: updatedItem.dateOfRelease || null,
      notes: updatedItem.notes || null,
      closed: Number(updatedItem.closed ?? 0),
      pp_book_firm_id: updatedItem.ppBookFirmId ? parseInt(updatedItem.ppBookFirmId) : 0,
      nos_ex: updatedItem.nosEx ? parseInt(updatedItem.nosEx) : 5000,
      product_id: updatedItem.productId ? parseInt(updatedItem.productId) : 0
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/pp-book-update/${id}/`, payload);
      console.log('PP book updated:', response.data);
      setModal({
        isOpen: true,
        message: 'PP book updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating PP book:', error);
      setModal({
        isOpen: true,
        message: `Failed to update PP book: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddPPBook = async () => {
    if (!formData.ppBookName || !formData.code || !formData.closed || !formData.ppBookFirmId) {
      console.log('Validation failed: required fields missing');
      setModal({
        isOpen: true,
        message: 'Please fill all required fields: PP Book Name, Code, Closed, PP Book Firm Id',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const payload = {
      company_id: 1,
      pp_book_nm: formData.ppBookName,
      code: formData.code,
      nos: formData.nos ? parseInt(formData.nos) : null,
      face_value: formData.faceValue ? parseFloat(formData.faceValue) : null,
      reg_start_date: formData.regStartDate || null,
      reg_end_date: formData.regEndDate || null,
      date_of_release: formData.dateOfRelease || null,
      notes: formData.notes || null,
      closed: Number(formData.closed ?? 0),
      pp_book_firm_id: parseInt(formData.ppBookFirmId),
      nos_ex: formData.nosEx ? parseInt(formData.nosEx) : 5000,
      product_id: formData.productId ? parseInt(formData.productId) : 0
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/pp-book-create/', payload);
      console.log('PP book created:', response.data);
      const newItem = {
        id: response.data.id,
        ppBookName: formData.ppBookName,
        code: formData.code,
        nos: formData.nos || '',
        faceValue: formData.faceValue || '',
        regStartDate: formData.regStartDate || '',
        regEndDate: formData.regEndDate || '',
        dateOfRelease: formData.dateOfRelease || '',
        notes: formData.notes || '',
        closed: formData.closed,
        ppBookFirmId: formData.ppBookFirmId,
        ppBookFirm: formData.ppBookFirm,
        nosEx: formData.nosEx || '5000',
        productId: formData.productId || '0',
        inserted: response.data.inserted || new Date().toISOString(),
        modified: response.data.modified || new Date().toISOString()
      };
      console.log('Adding PP book:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'PP book added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      setFormData({
        ppBookName: '',
        code: '',
        nos: '',
        faceValue: '',
        regStartDate: '',
        regEndDate: '',
        dateOfRelease: '',
        notes: '',
        closed: '',
        ppBookFirm: '',
        ppBookFirmId: '',
        nosEx: '5000',
        productId: '0',
        inserted: '',
        modified: ''
      });
    } catch (error) {
      console.error('Error creating PP book:', error);
      setModal({
        isOpen: true,
        message: `Failed to add PP book: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }
  };

  const handleDeletePPBook = (id) => {
    console.log(`Prompting to delete PP book: id=${id}`);
    setDeletePPBookId(id);
    setModal({
      isOpen: true,
      message: 'Are you sure you want to delete this PP book?',
      type: 'warning',
      buttons: [
        {
          label: 'Confirm',
          onClick: async () => {
            try {
              const response = await api.delete(`/auth/pp-book-delete/${id}/`);
              console.log('PP book deleted:', response.data);
              setItems((prev) => prev.filter((item) => item.id !== id));
              setModal({
                isOpen: true,
                message: 'PP book deleted successfully!',
                type: 'success',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            } catch (error) {
              console.error('Error deleting PP book:', error);
              setModal({
                isOpen: true,
                message: `Failed to delete PP book: ${error.response?.data?.error || error.message}`,
                type: 'error',
                buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
              });
            }
            setDeletePPBookId(null);
          },
          className: 'bg-red-500 hover:bg-red-600'
        },
        {
          label: 'Cancel',
          onClick: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            setDeletePPBookId(null);
          },
          className: 'bg-gray-500 hover:bg-gray-600'
        }
      ]
    });
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
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        title="Pre-Publication Books Master"
        subtitle="Manage pre-publication book batches"
      />

      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
        <div className="w-[1700px]">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <tr>
                <th className="w-[350px] px-4 py-3 text-left text-sm font-semibold tracking-wide">PP Book Name</th>
                <th className="w-[100px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Code</th>
                <th className="w-[50px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Nos</th>
                <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Face Value</th>
                <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Reg St Date</th>
                <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Reg Ed Date</th>
                <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Release Dt</th>
                <th className="w-[250px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Notes</th>
                <th className="w-[80px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Closed</th>
                <th className="w-[200px] px-4 py-3 text-left text-sm font-semibold tracking-wide">PP Book Firm</th>
                <th className="w-[80px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Nos Ex</th>
                <th className="w-[100px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Title</th>
                <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Inserted</th>
                <th className="w-[150px] px-4 py-3 text-left text-sm font-semibold tracking-wide">Modified</th>
                <th className="w-[50px] px-4 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => {
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.ppBookName || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'ppBookName', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, ppBookName: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.code || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'code', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, code: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="number"
                        value={item.nos || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'nos', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, nos: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="number"
                        step="0.01"
                        value={item.faceValue || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'faceValue', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, faceValue: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="date"
                        value={item.regStartDate || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'regStartDate', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, regStartDate: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="date"
                        value={item.regEndDate || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'regEndDate', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, regEndDate: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="date"
                        value={item.dateOfRelease || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'dateOfRelease', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, dateOfRelease: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'notes', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, notes: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <select
                        aria-label="Closed"
                        value={String(item.closed ?? '0')}  // keep it controlled even if undefined
                        onChange={(e) =>
                          handleTableInputChange(item.id, 'closed', e.target.value) // "0" or "1"
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          handleTableUpdate(item.id, { ...item, closed: Number(e.target.value) }) // cast to number if backend needs it
                        }
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="text"
                        value={item.ppBookFirm || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'ppBookFirm', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, ppBookFirm: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="number"
                        value={item.nosEx || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'nosEx', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, nosEx: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <input
                        type="number"
                        value={item.productId || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'productId', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, productId: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <span>{item.inserted ? new Date(item.inserted).toLocaleString() : ''}</span>
                    </td>
                    <td className="p-1 text-sm border border-gray-300 bg-gray-50">
                      <span>{item.modified ? new Date(item.modified).toLocaleString() : ''}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDeletePPBook(item.id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete PP book"
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
              name="ppBookName"
              value={formData.ppBookName}
              onChange={handleInputChange}
              placeholder="PP Book Name"
              onKeyDown={(e) => handleKeyDown(e, 'ppBookName')}
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showTitleSuggestions && titleSuggestions.length > 0 && formData.ppBookName.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {titleSuggestions.map((ppbook, index) => (
                  <li
                    key={ppbook.id}
                    id={`title-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${titleHighlightedIndex === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handleTitleSuggestionClick(ppbook)}
                  >
                    {ppbook.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
          <div className="relative">
            <input
              type="number"
              name="nos"
              value={formData.nos}
              onChange={handleInputChange}
              placeholder="Nos"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              name="faceValue"
              value={formData.faceValue}
              onChange={handleInputChange}
              placeholder="Face Value"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              name="regStartDate"
              value={formData.regStartDate}
              onChange={handleInputChange}
              placeholder="Reg Start Date"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              name="regEndDate"
              value={formData.regEndDate}
              onChange={handleInputChange}
              placeholder="Reg End Date"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              name="dateOfRelease"
              value={formData.dateOfRelease}
              onChange={handleInputChange}
              placeholder="Date Of Release"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative col-span-2">
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notes"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <select
              name="closed"
              value={formData.closed}
              onChange={handleInputChange}
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div className="relative col-span-2">
            <input
              type="text"
              name="ppBookFirm"
              value={formData.ppBookFirm}
              onChange={handleInputChange}
              placeholder="PP Book Firm"
              onKeyDown={(e) => handleKeyDown(e, 'ppBookFirm')}
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showPublisherSuggestions && publisherSuggestions.length > 0 && formData.ppBookFirm.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {publisherSuggestions.map((ppbook, index) => (
                  <li
                    key={ppbook.id}
                    id={`publisher-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${publisherHighlightedIndex === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handlePublisherSuggestionClick(ppbook)}
                  >
                    {ppbook.publisher_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              name="nosEx"
              value={formData.nosEx}
              onChange={handleInputChange}
              placeholder="Nos Ex"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              placeholder="Product Id"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleAddPPBook}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD PP BOOK
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
        <p className="text-xs text-blue-600 mt-0.5">Press Enter after editing a field to save changes instantly.</p>
      </div>
    </div>
  </div>
</div>
  );
}