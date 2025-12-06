// src/pages/Masters/TitleMaster.jsx
import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import api from '../../utils/axiosInstance';

export default function TitleMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    sapCode: '',
    tax: '',
    titleMal: '',
    location: '',
    language: '',
    isbnNo: '',
    roLevel: '',
    dnLevel: '',
    category: '',
    subCategory: '',
    author: '',
    publisher: '',
    translator: '',
    mrp: ''
  });
  const [loadItem, setLoadItem] = useState('');

  // --- Suggestions for the TOP FORM ---
  const [suggestions, setSuggestions] = useState({
    author: [],
    publisher: [],
    translator: [],
    category: [],
    subCategory: []
  });
  const [showSuggestions, setShowSuggestions] = useState({
    author: false,
    publisher: false,
    translator: false,
    category: false,
    subCategory: false
  });
  const [highlightedIndex, setHighlightedIndex] = useState({
    author: -1,
    publisher: -1,
    translator: -1,
    category: -1,
    subCategory: -1
  });

  // --- Suggestions for TABLE CELLS (per-row, per-field) ---
  // keys are `${rowId}:${field}`
  const [rowSuggestions, setRowSuggestions] = useState({});
  const [rowShowSuggestions, setRowShowSuggestions] = useState({});
  const [rowHighlightedIndex, setRowHighlightedIndex] = useState({});

  const suggestableFields = ['author', 'publisher', 'translator', 'category', 'subCategory'];
  const endpointFor = (field) => {
    if (field === 'publisher') return '/auth/publisher-search/';
    if (field === 'category') return '/auth/category-search/';
    if (field === 'subCategory') return '/auth/sub-category-search/';
    // author and translator use authors endpoint
    return '/auth/author-search/';
  };
  const labelFor = (field, row) => {
    if (field === 'publisher') return row.publisher_nm;
    if (field === 'category') return row.category_nm;
    if (field === 'subCategory') return row.sub_category_nm;
    // author or translator
    return row.author_nm;
  };

  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
  });

  /* ---------------- TOP FORM handlers ---------------- */
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (['author', 'publisher', 'translator', 'category', 'subCategory'].includes(name)) {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        setSuggestions((prev) => ({ ...prev, [name]: [] }));
        setShowSuggestions((prev) => ({ ...prev, [name]: false }));
        setHighlightedIndex((prev) => ({ ...prev, [name]: -1 }));
      } else {
        try {
          const endpoint = endpointFor(name);
          const response = await api.get(`${endpoint}?q=${encodeURIComponent(trimmed)}`);
          console.log(`Suggestions for ${name}:`, response.data);
          if (response.data && response.data.length > 0) {
            setSuggestions((prev) => ({ ...prev, [name]: response.data }));
            setShowSuggestions((prev) => ({ ...prev, [name]: true }));
            setHighlightedIndex((prev) => ({ ...prev, [name]: -1 }));
          } else {
            setSuggestions((prev) => ({ ...prev, [name]: [] }));
            setShowSuggestions((prev) => ({ ...prev, [name]: false }));
            setHighlightedIndex((prev) => ({ ...prev, [name]: -1 }));
          }
        } catch (error) {
          console.error(`Error fetching ${name} suggestions:`, error);
          setModal({
            isOpen: true,
            message: `Failed to fetch ${name} suggestions: ${error.message}`,
            type: 'error',
            buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
          });
          setSuggestions((prev) => ({ ...prev, [name]: [] }));
          setShowSuggestions((prev) => ({ ...prev, [name]: false }));
          setHighlightedIndex((prev) => ({ ...prev, [name]: -1 }));
        }
      }
    }
  };

  const handleLoadItemChange = (e) => {
    const value = e.target.value;
    console.log(`Load item input changed: ${value}`);
    setLoadItem(value);
  };

  const handleSuggestionClick = (field, suggestion) => {
    let value = '';
    if (field === 'publisher') value = suggestion.publisher_nm;
    else if (field === 'category') value = suggestion.category_nm;
    else if (field === 'subCategory') value = suggestion.sub_category_nm;
    else value = suggestion.author_nm;

    console.log(`Suggestion selected for ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
    setShowSuggestions((prev) => ({ ...prev, [field]: false }));
    setHighlightedIndex((prev) => ({ ...prev, [field]: -1 }));
  };

  const handleKeyDown = (e, field) => {
    if (showSuggestions[field] && suggestions[field].length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev[field] < suggestions[field].length - 1 ? prev[field] + 1 : 0;
          const el = document.getElementById(`${field}-suggestion-${newIndex}`);
          if (el) el.scrollIntoView({ block: 'nearest' });
          return { ...prev, [field]: newIndex };
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev[field] > 0 ? prev[field] - 1 : suggestions[field].length - 1;
          const el = document.getElementById(`${field}-suggestion-${newIndex}`);
          if (el) el.scrollIntoView({ block: 'nearest' });
          return { ...prev, [field]: newIndex };
        });
      } else if (e.key === 'Enter' && highlightedIndex[field] >= 0) {
        e.preventDefault();
        handleSuggestionClick(field, suggestions[field][highlightedIndex[field]]);
      } else if (e.key === 'Escape') {
        setShowSuggestions((prev) => ({ ...prev, [field]: false }));
        setSuggestions((prev) => ({ ...prev, [field]: [] }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: -1 }));
      }
    }
  };

  /* ---------------- TABLE handlers ---------------- */
  const handleTableInputChange = async (id, field, value) => {
    console.log(`Table input changed: id=${id}, field=${field}, value=${value}`);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Autocomplete for suggestable table fields
    if (suggestableFields.includes(field)) {
      const key = `${id}:${field}`;
      const trimmed = (value || '').trim();
      if (trimmed.length === 0) {
        setRowSuggestions((prev) => ({ ...prev, [key]: [] }));
        setRowShowSuggestions((prev) => ({ ...prev, [key]: false }));
        setRowHighlightedIndex((prev) => ({ ...prev, [key]: -1 }));
        return;
      }
      try {
        const endpoint = endpointFor(field);
        const res = await api.get(`${endpoint}?q=${encodeURIComponent(trimmed)}`);
        const arr = Array.isArray(res.data) ? res.data : [];
        setRowSuggestions((prev) => ({ ...prev, [key]: arr }));
        setRowShowSuggestions((prev) => ({ ...prev, [key]: arr.length > 0 }));
        setRowHighlightedIndex((prev) => ({ ...prev, [key]: -1 }));
      } catch (error) {
        console.error(`Error fetching suggestions for row ${id} field ${field}:`, error);
        setRowSuggestions((prev) => ({ ...prev, [key]: [] }));
        setRowShowSuggestions((prev) => ({ ...prev, [key]: false }));
        setRowHighlightedIndex((prev) => ({ ...prev, [key]: -1 }));
      }
    }
  };

  const handleRowSuggestionClick = (rowId, field, suggestion) => {
    const key = `${rowId}:${field}`;
    const value = labelFor(field, suggestion) || '';
    setItems((prev) => prev.map((it) => (it.id === rowId ? { ...it, [field]: value } : it)));
    setRowSuggestions((prev) => ({ ...prev, [key]: [] }));
    setRowShowSuggestions((prev) => ({ ...prev, [key]: false }));
    setRowHighlightedIndex((prev) => ({ ...prev, [key]: -1 }));
  };

  const handleRowKeyDown = (e, row, field) => {
    const key = `${row.id}:${field}`;
    const list = rowSuggestions[key] || [];
    const show = rowShowSuggestions[key];
    const hi = rowHighlightedIndex[key] ?? -1;

    if (show && list.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = hi < list.length - 1 ? hi + 1 : 0;
        setRowHighlightedIndex((prev) => ({ ...prev, [key]: next }));
        const el = document.getElementById(`row-sug-${key}-${next}`);
        if (el) el.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = hi > 0 ? hi - 1 : list.length - 1;
        setRowHighlightedIndex((prev) => ({ ...prev, [key]: next }));
        const el = document.getElementById(`row-sug-${key}-${next}`);
        if (el) el.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'Enter' && hi >= 0) {
        e.preventDefault();
        handleRowSuggestionClick(row.id, field, list[hi]);
        return;
      }
      if (e.key === 'Escape') {
        setRowShowSuggestions((prev) => ({ ...prev, [key]: false }));
        setRowSuggestions((prev) => ({ ...prev, [key]: [] }));
        setRowHighlightedIndex((prev) => ({ ...prev, [key]: -1 }));
        return;
      }
    }

    // If no suggestions open or none selected, Enter triggers update
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTableUpdate(row.id, { ...row, [field]: e.currentTarget.value });
    }
  };

  const handleTableUpdate = async (id, updatedItem) => {
    console.log(`Updating item: id=${id}, data=`, updatedItem);

    // Fetch IDs for author, publisher, translator, category, subCategory
    let author_id = 0, publisher_id = null, translator_id = null, category_id = 0, sub_category_id = 0;
    try {
      if (updatedItem.author) {
        const response = await api.get(`/auth/author-search/?q=${encodeURIComponent(updatedItem.author)}`);
        const author = response.data.find((item) => item.author_nm === updatedItem.author);
        author_id = author ? author.id : 0;
      }
      if (updatedItem.publisher) {
        const response = await api.get(`/auth/publisher-search/?q=${encodeURIComponent(updatedItem.publisher)}`);
        const publisher = response.data.find((item) => item.publisher_nm === updatedItem.publisher);
        publisher_id = publisher ? publisher.id : null;
      }
      if (updatedItem.translator) {
        const response = await api.get(`/auth/author-search/?q=${encodeURIComponent(updatedItem.translator)}`);
        const translator = response.data.find((item) => item.author_nm === updatedItem.translator);
        translator_id = translator ? translator.id : null;
      }
      if (updatedItem.category) {
        const response = await api.get(`/auth/category-search/?q=${encodeURIComponent(updatedItem.category)}`);
        const category = response.data.find((item) => item.category_nm === updatedItem.category);
        category_id = category ? category.id : 0;
      }
      if (updatedItem.subCategory) {
        const response = await api.get(`/auth/sub-category-search/?q=${encodeURIComponent(updatedItem.subCategory)}`);
        const subCategory = response.data.find((item) => item.sub_category_nm === updatedItem.subCategory);
        sub_category_id = subCategory ? subCategory.id : 0;
      }
    } catch (error) {
      console.error('Error fetching IDs for update:', error);
      setModal({
        isOpen: true,
        message: `Failed to fetch IDs for update: ${error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const language_id = updatedItem.language === 'English' ? 0 : updatedItem.language === 'Malayalam' ? 1 : 0;
    const location_id =
      updatedItem.location === 'Location1' ? 0 :
      updatedItem.location === 'Location2' ? 1 :
      updatedItem.location === 'Location3' ? 2 : 0;

    const payload = {
      id: id,
      title: updatedItem.title,
      author_id,
      language_id,
      title_m: updatedItem.titleMal || null,
      rate: parseFloat(updatedItem.mrp) || 0.00,
      stock: 0.000,
      tax: parseFloat(updatedItem.tax) || 0.00,
      isbn: updatedItem.isbnNo || null,
      publisher_id,
      translator_id,
      category_id,
      sub_category_id,
      ro_level: parseInt(updatedItem.roLevel) || 0,
      ro_quantity: 0,
      dn_level: parseInt(updatedItem.dnLevel) || 0,
      sap_code: updatedItem.sapCode || null,
      location_id
    };

    console.log('Update payload:', payload);

    try {
      const response = await api.put(`/auth/title-update/${id}/`, payload);
      console.log('Title updated:', response.data);
      setModal({
        isOpen: true,
        message: 'Title updated successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error updating title:', error);
      setModal({
        isOpen: true,
        message: `Failed to update title: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleAddItem = async () => {
    if (!formData.code || !formData.title) {
      console.log('Validation failed: code or title is empty');
      setModal({
        isOpen: true,
        message: 'Please fill Code and Title fields',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    // Fetch IDs for author, publisher, translator, category, subCategory
    let author_id = 0, publisher_id = null, translator_id = null, category_id = 0, sub_category_id = 0;
    try {
      if (formData.author) {
        const response = await api.get(`/auth/author-search/?q=${encodeURIComponent(formData.author)}`);
        const author = response.data.find((item) => item.author_nm === formData.author);
        author_id = author ? author.id : 0;
      }
      if (formData.publisher) {
        const response = await api.get(`/auth/publisher-search/?q=${encodeURIComponent(formData.publisher)}`);
        const publisher = response.data.find((item) => item.publisher_nm === formData.publisher);
        publisher_id = publisher ? publisher.id : null;
      }
      if (formData.translator) {
        const response = await api.get(`/auth/author-search/?q=${encodeURIComponent(formData.translator)}`);
        const translator = response.data.find((item) => item.author_nm === formData.translator);
        translator_id = translator ? translator.id : null;
      }
      if (formData.category) {
        const response = await api.get(`/auth/category-search/?q=${encodeURIComponent(formData.category)}`);
        const category = response.data.find((item) => item.category_nm === formData.category);
        category_id = category ? category.id : 0;
      }
      if (formData.subCategory) {
        const response = await api.get(`/auth/sub-category-search/?q=${encodeURIComponent(formData.subCategory)}`);
        const subCategory = response.data.find((item) => item.sub_category_nm === formData.subCategory);
        sub_category_id = subCategory ? subCategory.id : 0;
      }
    } catch (error) {
      console.error('Error fetching IDs:', error);
      setModal({
        isOpen: true,
        message: `Failed to fetch IDs: ${error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    const language_id = formData.language === 'English' ? 0 : formData.language === 'Malayalam' ? 1 : 0;
    const location_id =
      formData.location === 'Location1' ? 0 :
      formData.location === 'Location2' ? 1 :
      formData.location === 'Location3' ? 2 : 0;

    const payload = {
      id: parseInt(formData.code),
      title: formData.title,
      author_id,
      language_id,
      title_m: formData.titleMal || null,
      rate: parseFloat(formData.mrp) || 0.00,
      stock: 0.000,
      tax: parseFloat(formData.tax) || 0.00,
      isbn: formData.isbnNo || null,
      publisher_id,
      translator_id,
      category_id,
      sub_category_id,
      ro_level: parseInt(formData.roLevel) || 0,
      ro_quantity: 0,
      dn_level: parseInt(formData.dnLevel) || 0,
      sap_code: formData.sapCode || null,
      location_id
    };

    console.log('Form data on submit:', formData);
    console.log('Payload for API:', payload);

    try {
      const response = await api.post('/auth/title-create/', payload);
      console.log('Title created:', response.data);
      const newItem = {
        id: parseInt(formData.code),
        code: formData.code,
        title: formData.title,
        sapCode: formData.sapCode,
        tax: formData.tax,
        titleMal: formData.titleMal,
        location: formData.location,
        language: formData.language,
        isbnNo: formData.isbnNo,
        roLevel: formData.roLevel,
        dnLevel: formData.dnLevel,
        category: formData.category,
        subCategory: formData.subCategory,
        author: formData.author,
        publisher: formData.publisher,
        translator: formData.translator,
        mrp: formData.mrp
      };
      console.log('Adding item:', newItem);
      setItems((prev) => [...prev, newItem]);
      console.log('Current items state:', [...items, newItem]);
      setModal({
        isOpen: true,
        message: 'Title added successfully!',
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error creating title:', error);
      setModal({
        isOpen: true,
        message: `Failed to add title: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    setFormData({
      code: '',
      title: '',
      sapCode: '',
      tax: '',
      titleMal: '',
      location: '',
      language: '',
      isbnNo: '',
      roLevel: '',
      dnLevel: '',
      category: '',
      subCategory: '',
      author: '',
      publisher: '',
      translator: '',
      mrp: ''
    });
    setSuggestions({ author: [], publisher: [], translator: [], category: [], subCategory: [] });
    setShowSuggestions({ author: false, publisher: false, translator: false, category: false, subCategory: false });
    setHighlightedIndex({ author: -1, publisher: -1, translator: -1, category: -1, subCategory: -1 });
  };

  const handleLoadItem = async () => {
    if (loadItem.length < 2) {
      console.log('Validation failed: loadItem less than 2 characters');
      setModal({
        isOpen: true,
        message: 'Please enter at least 2 characters to search',
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
      return;
    }

    try {
      const response = await api.get(`/auth/title-search/?q=${encodeURIComponent(loadItem)}`);
      console.log('Titles fetched:', response.data);
      const fetchedItems = response.data.map((item) => ({
        id: item.id,
        code: item.id.toString(),
        title: item.title,
        sapCode: item.sap_code || '',
        tax: item.tax.toString(),
        titleMal: item.title_m || '',
        location: item.location_id === 0 ? 'Location1' : item.location_id === 1 ? 'Location2' : 'Location3',
        language: item.language_id === 0 ? 'English' : 'Malayalam',
        isbnNo: item.isbn || '',
        roLevel: item.ro_level.toString(),
        dnLevel: item.dn_level.toString(),
        category: item.category_nm || '',
        subCategory: item.sub_category_nm || '',
        author: item.author_nm || '',
        publisher: item.publisher_nm || '',
        translator: item.translator_nm || '',
        mrp: item.rate.toString()
      }));
      setItems(fetchedItems);
      console.log('Updated items state:', fetchedItems);
      setModal({
        isOpen: true,
        message: `Loaded ${fetchedItems.length} title(s)`,
        type: 'success',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    } catch (error) {
      console.error('Error fetching titles:', error);
      setModal({
        isOpen: true,
        message: `Failed to load titles: ${error.response?.data?.error || error.message}`,
        type: 'error',
        buttons: [{ label: 'OK', onClick: () => setModal((prev) => ({ ...prev, isOpen: false })), className: 'bg-blue-500 hover:bg-blue-600' }]
      });
    }
  };

  const handleDeleteItem = (id) => {
    console.log(`Deleting item: id=${id}`);
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
        <div className="w-[1610px]">
          <table className="w-full table-fixed border border-gray-300 border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-[100px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Code</th>
                <th className="w-[350px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Title</th>
                <th className="w-[120px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Language</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Author</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Publisher</th>
                <th className="w-[200px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Translator</th>
                <th className="w-[120px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Category</th>
                <th className="w-[175px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Sub-Category</th>
                <th className="w-[120px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">ISBN No.</th>
                <th className="w-[80px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">R O Level</th>
                <th className="w-[80px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Dn Level</th>
                <th className="w-[300px] text-left p-2 text-sm font-semibold border border-gray-300 bg-gray-100">Title (Mal)</th>
                <th className="w-[40px] text-center p-2 text-sm font-semibold border border-gray-300 bg-red-100"></th>
              </tr>
            </thead>
            <tbody className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {items.map((item, index) => {
                const keyFor = (field) => `${item.id}:${field}`;
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
                    <td className="p-1 text-sm border border-gray-300 w-[300px] bg-gray-50">
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'title', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, title: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[120px] bg-gray-50">
                      <input
                        type="text"
                        value={item.language || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'language', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, language: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>

                    {/* Author (suggestion) */}
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.author || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'author', e.target.value)}
                          onKeyDown={(e) => handleRowKeyDown(e, item, 'author')}
                          className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                          autoComplete="off"
                        />
                        {rowShowSuggestions[keyFor('author')] &&
                          (rowSuggestions[keyFor('author')] || []).length > 0 &&
                          (item.author || '').trim() && (
                            <ul className="absolute z-20 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                              {(rowSuggestions[keyFor('author')] || []).map((sug, i) => (
                                <li
                                  key={`${sug.id}-author-${i}`}
                                  id={`row-sug-${keyFor('author')}-${i}`}
                                  className={`px-3 py-1 cursor-pointer ${
                                    (rowHighlightedIndex[keyFor('author')] ?? -1) === i ? 'bg-gray-200' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleRowSuggestionClick(item.id, 'author', sug)}
                                >
                                  {sug.author_nm}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </td>

                    {/* Publisher (suggestion) */}
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.publisher || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'publisher', e.target.value)}
                          onKeyDown={(e) => handleRowKeyDown(e, item, 'publisher')}
                          className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                          autoComplete="off"
                        />
                        {rowShowSuggestions[keyFor('publisher')] &&
                          (rowSuggestions[keyFor('publisher')] || []).length > 0 &&
                          (item.publisher || '').trim() && (
                            <ul className="absolute z-20 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                              {(rowSuggestions[keyFor('publisher')] || []).map((sug, i) => (
                                <li
                                  key={`${sug.id}-publisher-${i}`}
                                  id={`row-sug-${keyFor('publisher')}-${i}`}
                                  className={`px-3 py-1 cursor-pointer ${
                                    (rowHighlightedIndex[keyFor('publisher')] ?? -1) === i ? 'bg-gray-200' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleRowSuggestionClick(item.id, 'publisher', sug)}
                                >
                                  {sug.publisher_nm}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </td>

                    {/* Translator (suggestion) */}
                    <td className="p-1 text-sm border border-gray-300 w-[150px] bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.translator || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'translator', e.target.value)}
                          onKeyDown={(e) => handleRowKeyDown(e, item, 'translator')}
                          className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                          autoComplete="off"
                        />
                        {rowShowSuggestions[keyFor('translator')] &&
                          (rowSuggestions[keyFor('translator')] || []).length > 0 &&
                          (item.translator || '').trim() && (
                            <ul className="absolute z-20 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                              {(rowSuggestions[keyFor('translator')] || []).map((sug, i) => (
                                <li
                                  key={`${sug.id}-translator-${i}`}
                                  id={`row-sug-${keyFor('translator')}-${i}`}
                                  className={`px-3 py-1 cursor-pointer ${
                                    (rowHighlightedIndex[keyFor('translator')] ?? -1) === i ? 'bg-gray-200' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleRowSuggestionClick(item.id, 'translator', sug)}
                                >
                                  {sug.author_nm}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </td>

                    {/* Category (suggestion) */}
                    <td className="p-1 text-sm border border-gray-300 w-[120px] bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.category || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'category', e.target.value)}
                          onKeyDown={(e) => handleRowKeyDown(e, item, 'category')}
                          className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                          autoComplete="off"
                        />
                        {rowShowSuggestions[keyFor('category')] &&
                          (rowSuggestions[keyFor('category')] || []).length > 0 &&
                          (item.category || '').trim() && (
                            <ul className="absolute z-20 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                              {(rowSuggestions[keyFor('category')] || []).map((sug, i) => (
                                <li
                                  key={`${sug.id}-category-${i}`}
                                  id={`row-sug-${keyFor('category')}-${i}`}
                                  className={`px-3 py-1 cursor-pointer ${
                                    (rowHighlightedIndex[keyFor('category')] ?? -1) === i ? 'bg-gray-200' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleRowSuggestionClick(item.id, 'category', sug)}
                                >
                                  {sug.category_nm}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </td>

                    {/* Sub-Category (suggestion) */}
                    <td className="p-1 text-sm border border-gray-300 w-[120px] bg-gray-50">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.subCategory || ''}
                          onChange={(e) => handleTableInputChange(item.id, 'subCategory', e.target.value)}
                          onKeyDown={(e) => handleRowKeyDown(e, item, 'subCategory')}
                          className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                          autoComplete="off"
                        />
                        {rowShowSuggestions[keyFor('subCategory')] &&
                          (rowSuggestions[keyFor('subCategory')] || []).length > 0 &&
                          (item.subCategory || '').trim() && (
                            <ul className="absolute z-20 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                              {(rowSuggestions[keyFor('subCategory')] || []).map((sug, i) => (
                                <li
                                  key={`${sug.id}-subcategory-${i}`}
                                  id={`row-sug-${keyFor('subCategory')}-${i}`}
                                  className={`px-3 py-1 cursor-pointer ${
                                    (rowHighlightedIndex[keyFor('subCategory')] ?? -1) === i ? 'bg-gray-200' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleRowSuggestionClick(item.id, 'subCategory', sug)}
                                >
                                  {sug.sub_category_nm}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </td>

                    <td className="p-1 text-sm border border-gray-300 w-[120px] bg-gray-50">
                      <input
                        type="text"
                        value={item.isbnNo || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'isbnNo', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, isbnNo: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[80px] bg-gray-50">
                      <input
                        type="number"
                        value={item.roLevel || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'roLevel', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, roLevel: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[80px] bg-gray-50">
                      <input
                        type="number"
                        value={item.dnLevel || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'dnLevel', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, dnLevel: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-1 text-sm border border-gray-300 w-[200px] bg-gray-50">
                      <input
                        type="text"
                        value={item.titleMal || ''}
                        onChange={(e) => handleTableInputChange(item.id, 'titleMal', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, { ...item, titleMal: e.target.value })}
                        className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="p-2 text-sm text-center border border-gray-300 w-[40px] bg-red-50">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete item"
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
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="sapCode"
              value={formData.sapCode}
              onChange={handleInputChange}
              placeholder="SAP Code"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              placeholder="Tax %"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="0.01"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
            >
              <option value="" disabled>Location</option>
              <option value="Location1">Location1</option>
              <option value="Location2">Location2</option>
              <option value="Location3">Location3</option>
            </select>
          </div>
          <div className="relative">
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
            >
              <option value="" disabled>Language</option>
              <option value="English">English</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </div>
          <div className="relative col-span-3">
            <input
              type="text"
              name="titleMal"
              value={formData.titleMal}
              onChange={handleInputChange}
              placeholder="Title (Mal)"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="isbnNo"
              value={formData.isbnNo}
              onChange={handleInputChange}
              placeholder="ISBN No."
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="roLevel"
              value={formData.roLevel}
              onChange={handleInputChange}
              placeholder="R O Level"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="dnLevel"
              value={formData.dnLevel}
              onChange={handleInputChange}
              placeholder="Dn Level"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>

          {/* Form suggestion inputs */}
          <div className="relative">
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'category')}
              placeholder="Category"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showSuggestions.category && suggestions.category.length > 0 && formData.category.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full max-w-[150px] shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {suggestions.category.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`category-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${highlightedIndex.category === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSuggestionClick('category', suggestion)}
                  >
                    {suggestion.category_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative col-span-2">
            <input
              type="text"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'subCategory')}
              placeholder="Sub-Category"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showSuggestions.subCategory && suggestions.subCategory.length > 0 && formData.subCategory.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full max-w-[150px] shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {suggestions.subCategory.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`subCategory-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${highlightedIndex.subCategory === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSuggestionClick('subCategory', suggestion)}
                  >
                    {suggestion.sub_category_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative col-span-2">
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'author')}
              placeholder="Author"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showSuggestions.author && suggestions.author.length > 0 && formData.author.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full max-w-[150px] shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {suggestions.author.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`author-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${highlightedIndex.author === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSuggestionClick('author', suggestion)}
                  >
                    {suggestion.author_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative col-span-2">
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'publisher')}
              placeholder="Publisher"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showSuggestions.publisher && suggestions.publisher.length > 0 && formData.publisher.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full max-w-[150px] shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {suggestions.publisher.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`publisher-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${highlightedIndex.publisher === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSuggestionClick('publisher', suggestion)}
                  >
                    {suggestion.publisher_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative col-span-2">
            <input
              type="text"
              name="translator"
              value={formData.translator}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'translator')}
              placeholder="Translator"
              className="border p-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
            {showSuggestions.translator && suggestions.translator.length > 0 && formData.translator.trim() && (
              <ul className="absolute z-10 bg-white border mt-1 w-full max-w-[150px] shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {suggestions.translator.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    id={`translator-suggestion-${index}`}
                    className={`px-3 py-1 cursor-pointer ${highlightedIndex.translator === index ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSuggestionClick('translator', suggestion)}
                  >
                    {suggestion.author_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <input
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              placeholder="MRP"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              step="0.01"
              autoComplete="off"
            />
          </div>

          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-sm font-medium w-full max-w-[150px]"
          >
            ADD TITLE
          </button>

          <div className="relative">
            <input
              type="text"
              value={loadItem}
              onChange={handleLoadItemChange}
              placeholder="Titles starting with"
              className="border p-2 rounded-lg text-sm w-full max-w-[150px] focus:ring-2 focus:ring-blue-300"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleLoadItem}
            className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 text-sm font-medium w-full max-w-[150px]"
          >
            LOAD TITLE
          </button>
        </div>
      </div>
    </div>
  );
}
