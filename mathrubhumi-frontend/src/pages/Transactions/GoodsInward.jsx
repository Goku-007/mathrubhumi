import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';

export default function GoodsInwardPage() {
  const [items, setItems] = useState([]);
  const [goodsInwardIdToLoad, setGoodsInwardIdToLoad] = useState('');
  const [goodsInwardId, setGoodsInwardId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDotPrefixed, setIsDotPrefixed] = useState(false);
  const [isMalayalam, setIsMalayalam] = useState(false);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [supplierHighlightedIndex, setSupplierHighlightedIndex] = useState(-1);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [userHighlightedIndex, setUserHighlightedIndex] = useState(-1);
  const [branchesSuggestions, setBranchesSuggestions] = useState([]);
  const [showBranchesSuggestions, setShowBranchesSuggestions] = useState(false);
  const [branchesHighlightedIndex, setBranchesHighlightedIndex] = useState(-1);
  const [breakupSuggestions, setBreakupSuggestions] = useState([]);
  const [showBreakupSuggestions, setShowBreakupSuggestions] = useState(false);
  const [breakupHighlightedIndex, setBreakupHighlightedIndex] = useState(-1);
  const [activeBreakupNo, setActiveBreakupNo] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'info', buttons: [] });
  const [activeDiscountField, setActiveDiscountField] = useState(null);
  const [isMasterEntryOpen, setIsMasterEntryOpen] = useState(false);

  // MASTER ENTRY suggestions
  const [meSubCatSugs, setMeSubCatSugs] = useState([]);
  const [showMeSubCatSugs, setShowMeSubCatSugs] = useState(false);
  const [meSubCatHi, setMeSubCatHi] = useState(-1);

  const [meCatSugs, setMeCatSugs] = useState([]);
  const [showMeCatSugs, setShowMeCatSugs] = useState(false);
  const [meCatHi, setMeCatHi] = useState(-1);

  const [meAuthorSugs, setMeAuthorSugs] = useState([]);
  const [showMeAuthorSugs, setShowMeAuthorSugs] = useState(false);
  const [meAuthorHi, setMeAuthorHi] = useState(-1);

  const [meTranslatorSugs, setMeTranslatorSugs] = useState([]);
  const [showMeTranslatorSugs, setShowMeTranslatorSugs] = useState(false);
  const [meTranslatorHi, setMeTranslatorHi] = useState(-1);

  const [mePublisherSugs, setMePublisherSugs] = useState([]);
  const [showMePublisherSugs, setShowMePublisherSugs] = useState(false);
  const [mePublisherHi, setMePublisherHi] = useState(-1);

  const [meTitleSugs, setMeTitleSugs] = useState([]);
  const [showMeTitleSugs, setShowMeTitleSugs] = useState(false);
  const [meTitleHi, setMeTitleHi] = useState(-1);

  const [formData, setFormData] = useState({
    itemName: '',
    isbn: '',
    quantity: '',
    purchaseRate: '',
    exchangeRate: '',
    currency: 'Indian Rupees',
    tax: '',
    discount: '',
    discountAmount: '',
    titleId: '',
    currencyIndex: 0
  });

  const [masterEntryData, setMasterEntryData] = useState({
    subCategory: '',
    category: '',
    authorEngMal: '',
    translatorEngMal: '',
    publisherEngMal: '',
    titleEng: '',
    titleMal: '',
    supplier: '',
    creditCustomer: '',
    taxPercent: '',
    isbn: '',
    quantity: '',
    fValue: '',
    exchangeRate: '',
    currency: 'Indian Rupees',
    mrp: '',
    currencyIndex: 0
  });

  const [inwardMaster, setInwardMaster] = useState({
    srl_no: '',
    entry_date: new Date().toISOString().split('T')[0],
    bill_no: '',
    bill_date: new Date().toISOString().split('T')[0],
    reference: '',
    gross: '',
    nett: '',
    is_cash: 'No',
    type: '',
    notes: '',
    days: '',
    discount_percent: '',
    supplier_nm: '',
    supplier_id: '',
    user_nm: '',
    user_id: '',
    branches_nm: '',
    branches_id: '',
    breakup_nm1: '',
    breakup_id1: '',
    breakup_amt1: '',
    breakup_nm2: '',
    breakup_id2: '',
    breakup_amt2: '',
    breakup_nm3: '',
    breakup_id3: '',
    breakup_amt3: '',
    breakup_nm4: '',
    breakup_id4: '',
    breakup_amt4: ''
  });

  const showModal = (message, type = 'info', buttons = [{ label: 'OK', onClick: () => closeModal(), className: 'bg-blue-500 hover:bg-blue-600' }]) => {
    setModal({ isOpen: true, message, type, buttons });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: '', type: 'info', buttons: [] });
  };

  const decodeUnicode = (str) => {
    if (!str) return '';
    try {
      let decoded = str.replace(/\\u([0-9A-Fa-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
      decoded = decodeURIComponent(decoded.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
      console.log('Decoded title_m:', { input: str, output: decoded });
      return decoded;
    } catch (e) {
      console.error('Decode error:', { error: e.message, input: str });
      return str;
    }
  };

  const grossAmount = items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

  const netAmount = parseFloat(grossAmount) + (parseFloat(inwardMaster.breakup_amt1) || 0) + (parseFloat(inwardMaster.breakup_amt2) || 0) + (parseFloat(inwardMaster.breakup_amt3) || 0) +
                                              (parseFloat(inwardMaster.breakup_amt4) || 0);

  useEffect(() => {
    setInwardMaster(prev => ({
      ...prev,
      gross: grossAmount.toFixed(2),
      nett: netAmount.toFixed(2),
    }));
  }, [
    grossAmount, inwardMaster.breakup_amt1, inwardMaster.breakup_amt2, inwardMaster.breakup_amt3, inwardMaster.breakup_amt4]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get('/auth/currencies/');
        console.log('Currencies API response:', response.data);
        if (Array.isArray(response.data) && response.data.every(cur => cur.id !== undefined && cur.name)) {
          setCurrencies(response.data);
          const defaultCurrency = response.data.find(cur => cur.name === 'Indian Rupees') || response.data[0] || { id: 0, name: 'Indian Rupees' };
          setFormData((prev) => ({
            ...prev,
            currency: defaultCurrency.name,
            currencyIndex: defaultCurrency.id
          }));
          setMasterEntryData((prev) => ({
            ...prev,
            currency: defaultCurrency.name,
            currencyIndex: defaultCurrency.id
          }));
        } else {
          console.error('Invalid currencies data format:', response.data);
          showModal('Invalid currency data received from server', 'error');
          setCurrencies([{ id: 0, name: 'Indian Rupees' }]);
          setFormData((prev) => ({
            ...prev,
            currency: 'Indian Rupees',
            currencyIndex: 0
          }));
          setMasterEntryData((prev) => ({
            ...prev,
            currency: 'Indian Rupees',
            currencyIndex: 0
          }));
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
        showModal('Failed to load currencies. Using default currency.', 'error');
        setCurrencies([{ id: 0, name: 'Indian Rupees' }]);
        setFormData((prev) => ({
            ...prev,
            currency: 'Indian Rupees',
            currencyIndex: 0
        }));
        setMasterEntryData((prev) => ({
            ...prev,
            currency: 'Indian Rupees',
            currencyIndex: 0
        }));
      }
    };
    fetchCurrencies();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'itemName') {
      const trimmed = value.trim();
      const newIsDotPrefixed = trimmed.startsWith('.');
      setIsDotPrefixed(newIsDotPrefixed);
      setIsMalayalam(newIsDotPrefixed);
      console.log('Input change (itemName):', { value: trimmed, isDotPrefixed: newIsDotPrefixed, isMalayalam: newIsDotPrefixed });

      if (trimmed.length === 0 || (newIsDotPrefixed && trimmed.length === 1)) {
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        setFormData((prev) => ({ ...prev, purchaseRate: '', tax: '', titleId: '' }));
        setIsMalayalam(false);
      } else {
        try {
          const res = await api.get(`/auth/product-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('API response:', res.data);
          if (res.data && res.data.length > 0) {
            const decodedSuggestions = res.data.map(suggestion => ({
              ...suggestion,
              title_m: decodeUnicode(suggestion.title_m),
              raw_title_m: suggestion.raw_title_m
            }));
            console.log('Suggestions:', decodedSuggestions);
            setSuggestions(decodedSuggestions);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('Autocomplete error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
          setHighlightedIndex(-1);
        }
      }
    } else if (name === 'currency') {
      const selectedCurrency = currencies.find(cur => cur.name === value);
      setFormData((prev) => ({
        ...prev,
        currency: value,
        currencyIndex: selectedCurrency ? selectedCurrency.id : (currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0)
      }));
    }
  };

  const fetchME = async (url, query, onOk, onEmpty) => {
    if (!query || query.trim().length < 2) {
      onEmpty?.();
      return;
    }
    try {
      const res = await api.get(url + encodeURIComponent(query.trim()));
      if (Array.isArray(res.data) && res.data.length) onOk(res.data);
      else onEmpty?.();
    } catch (e) {
      console.error('ME fetch error:', e);
      onEmpty?.();
    }
  };


  const handleMasterEntryInputChange = (e) => {
    const { name, value } = e.target;

    setMasterEntryData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'currency'
        ? { currencyIndex: currencies.find(cur => cur.name === value)?.id || (currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0) }
        : {})
    }));

    // Suggestions by field
    if (name === 'subCategory') {
      fetchME('/auth/sub-category-search/?q=', value,
        (data) => { setMeSubCatSugs(data); setShowMeSubCatSugs(true); setMeSubCatHi(-1); },
        () => { setMeSubCatSugs([]); setShowMeSubCatSugs(false); setMeSubCatHi(-1); }
      );
    } else if (name === 'category') {
      fetchME('/auth/category-search/?q=', value,
        (data) => { setMeCatSugs(data); setShowMeCatSugs(true); setMeCatHi(-1); },
        () => { setMeCatSugs([]); setShowMeCatSugs(false); setMeCatHi(-1); }
      );
    } else if (name === 'authorEngMal') {
      fetchME('/auth/author-search/?q=', value,
        (data) => { setMeAuthorSugs(data); setShowMeAuthorSugs(true); setMeAuthorHi(-1); },
        () => { setMeAuthorSugs([]); setShowMeAuthorSugs(false); setMeAuthorHi(-1); }
      );
    } else if (name === 'translatorEngMal') {
      // Same API as author (as requested)
      fetchME('/auth/author-search/?q=', value,
        (data) => { setMeTranslatorSugs(data); setShowMeTranslatorSugs(true); setMeTranslatorHi(-1); },
        () => { setMeTranslatorSugs([]); setShowMeTranslatorSugs(false); setMeTranslatorHi(-1); }
      );
    } else if (name === 'publisherEngMal') {
      fetchME('/auth/publisher-search/?q=', value,
        (data) => { setMePublisherSugs(data); setShowMePublisherSugs(true); setMePublisherHi(-1); },
        () => { setMePublisherSugs([]); setShowMePublisherSugs(false); setMePublisherHi(-1); }
      );
    } else if (name === 'titleEng') {
      fetchME('/auth/title-search/?q=', value,
        (data) => { setMeTitleSugs(data); setShowMeTitleSugs(true); setMeTitleHi(-1); },
        () => { setMeTitleSugs([]); setShowMeTitleSugs(false); setMeTitleHi(-1); }
      );
    }
  };


  const handleInwardMasterChange = async (e) => {
    const { name, value } = e.target;
    setInwardMaster(prev => ({ ...prev, [name]: value }));

    if (name === 'supplier_nm') {
      const trimmed = value.trim();
      console.log('Input change (supplier_nm):', { value: trimmed });
      if (trimmed.length === 0) {
        setSupplierSuggestions([]);
        setShowSupplierSuggestions(false);
        setSupplierHighlightedIndex(-1);
      } else {
        try {
          const res = await api.get(`/auth/supplier-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('Supplier API response:', res.data);
          if (res.data && res.data.length > 0) {
            setSupplierSuggestions(res.data);
            setShowSupplierSuggestions(true);
            setSupplierHighlightedIndex(-1);
          } else {
            setSupplierSuggestions([]);
            setShowSupplierSuggestions(false);
            setSupplierHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('Supplier autocomplete error:', error);
          setSupplierSuggestions([]);
          setShowSupplierSuggestions(false);
          setSupplierHighlightedIndex(-1);
        }
      }
    } else if (name === 'user_nm') {
      const trimmed = value.trim();
      console.log('Input change (user_nm):', { value: trimmed });
      if (trimmed.length === 0) {
        setUserSuggestions([]);
        setShowUserSuggestions(false);
        setUserHighlightedIndex(-1);
      } else {
        try {
          const res = await api.get(`/auth/user-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('User API response:', res.data);
          if (res.data && res.data.length > 0) {
            setUserSuggestions(res.data);
            setShowUserSuggestions(true);
            setUserHighlightedIndex(-1);
          } else {
            setUserSuggestions([]);
            setShowUserSuggestions(false);
            setUserHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('User autocomplete error:', error);
          setUserSuggestions([]);
          setShowUserSuggestions(false);
          setUserHighlightedIndex(-1);
        }
      }
    } else if (name === 'branches_nm') {
      const trimmed = value.trim();
      console.log('Input change (branches_nm):', { value: trimmed });
      if (trimmed.length === 0) {
        setBranchesSuggestions([]);
        setShowBranchesSuggestions(false);
        setBranchesHighlightedIndex(-1);
      } else {
        try {
          const res = await api.get(`/auth/branches-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('Branches API response:', res.data);
          if (res.data && res.data.length > 0) {
            setBranchesSuggestions(res.data);
            setShowBranchesSuggestions(true);
            setBranchesHighlightedIndex(-1);
          } else {
            setBranchesSuggestions([]);
            setShowBranchesSuggestions(false);
            setBranchesHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('Branches autocomplete error:', error);
          setBranchesSuggestions([]);
          setShowBranchesSuggestions(false);
          setBranchesHighlightedIndex(-1);
        }
      }
    } else if (name.startsWith("breakup_nm")) {
      const trimmed = value.trim();
      const breakupNo = Number(name.replace("breakup_nm", ""));
      setActiveBreakupNo(breakupNo);

      if (trimmed.length === 0) {
        setBreakupSuggestions([]);
        setShowBreakupSuggestions(false);
        setBreakupHighlightedIndex(-1);
      } else {
        try {
          const res = await api.get(`/auth/breakup-search/?q=${encodeURIComponent(trimmed)}`);
          console.log('Breakup API response:', res.data);
          if (res.data && res.data.length > 0) {
            setBreakupSuggestions(res.data);
            setShowBreakupSuggestions(true);
            setBreakupHighlightedIndex(-1);
          } else {
            setBreakupSuggestions([]);
            setShowBreakupSuggestions(false);
            setBreakupHighlightedIndex(-1);
          }
        } catch (error) {
          console.error('Breakup autocomplete error:', error);
          setBreakupSuggestions([]);
          setShowBreakupSuggestions(false);
          setBreakupHighlightedIndex(-1);
        }
      }
    }
  };

  const handleKeyDown = (e, inputName) => {
    if (inputName === 'itemName' && showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
          const suggestionElement = document.getElementById(`suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleItemSuggestionClick(suggestions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
      }
    } else if (inputName === 'supplier_nm' && showSupplierSuggestions && supplierSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSupplierHighlightedIndex((prev) => {
          const newIndex = prev < supplierSuggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`supplier-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSupplierHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : supplierSuggestions.length - 1;
          const suggestionElement = document.getElementById(`supplier-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && supplierHighlightedIndex >= 0) {
        e.preventDefault();
        handleSupplierSuggestionClick(supplierSuggestions[supplierHighlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowSupplierSuggestions(false);
        setSupplierSuggestions([]);
        setSupplierHighlightedIndex(-1);
      }
    } else if (inputName === 'user_nm' && showUserSuggestions && userSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setUserHighlightedIndex((prev) => {
          const newIndex = prev < userSuggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`user-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setUserHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : userSuggestions.length - 1;
          const suggestionElement = document.getElementById(`user-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && userHighlightedIndex >= 0) {
        e.preventDefault();
        handleUserSuggestionClick(userSuggestions[userHighlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowUserSuggestions(false);
        setUserSuggestions([]);
        setUserHighlightedIndex(-1);
      }
    } else if (inputName === 'branches_nm' && showBranchesSuggestions && branchesSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBranchesHighlightedIndex((prev) => {
          const newIndex = prev < branchesSuggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`branches-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBranchesHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : branchesSuggestions.length - 1;
          const suggestionElement = document.getElementById(`branches-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && branchesHighlightedIndex >= 0) {
        e.preventDefault();
        handleBranchesSuggestionClick(branchesSuggestions[branchesHighlightedIndex]);
      } else if (e.key === 'Escape') {
        setShowBranchesSuggestions(false);
        setBranchesSuggestions([]);
        setBranchesHighlightedIndex(-1);
      }
    } else if (inputName.startsWith("breakup_nm") && showBreakupSuggestions && breakupSuggestions.length > 0) {
      const breakupNo = Number(inputName.replace("breakup_nm", ""));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBreakupHighlightedIndex((prev) => {
          const newIndex = prev < breakupSuggestions.length - 1 ? prev + 1 : 0;
          const suggestionElement = document.getElementById(`breakup-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBreakupHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : breakupSuggestions.length - 1;
          const suggestionElement = document.getElementById(`breakup-suggestion-${newIndex}`);
          if (suggestionElement) {
            suggestionElement.scrollIntoView({ block: 'nearest' });
          }
          return newIndex;
        });
      } else if (e.key === 'Enter' && breakupHighlightedIndex >= 0) {
        e.preventDefault();
        handleBreakupSuggestionClick(breakupSuggestions[breakupHighlightedIndex], breakupNo);
      } else if (e.key === 'Escape') {
        setShowBreakupSuggestions(false);
        setBreakupSuggestions([]);
        setBreakupHighlightedIndex(-1);
      } else if (inputName === 'me_subCategory' && showMeSubCatSugs && meSubCatSugs.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMeSubCatHi(p => (p < meSubCatSugs.length - 1 ? p + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMeSubCatHi(p => (p > 0 ? p - 1 : meSubCatSugs.length - 1)); }
        else if (e.key === 'Enter' && meSubCatHi >= 0) { e.preventDefault(); handleMeSubCatClick(meSubCatSugs[meSubCatHi]); }
        else if (e.key === 'Escape') { setShowMeSubCatSugs(false); setMeSubCatSugs([]); setMeSubCatHi(-1); }
      }

      // MASTER ENTRY: Category
      else if (inputName === 'me_category' && showMeCatSugs && meCatSugs.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMeCatHi(p => (p < meCatSugs.length - 1 ? p + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMeCatHi(p => (p > 0 ? p - 1 : meCatSugs.length - 1)); }
        else if (e.key === 'Enter' && meCatHi >= 0) { e.preventDefault(); handleMeCatClick(meCatSugs[meCatHi]); }
        else if (e.key === 'Escape') { setShowMeCatSugs(false); setMeCatSugs([]); setMeCatHi(-1); }
      }

      // MASTER ENTRY: Author
      else if (inputName === 'me_author' && showMeAuthorSugs && meAuthorSugs.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMeAuthorHi(p => (p < meAuthorSugs.length - 1 ? p + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMeAuthorHi(p => (p > 0 ? p - 1 : meAuthorSugs.length - 1)); }
        else if (e.key === 'Enter' && meAuthorHi >= 0) { e.preventDefault(); handleMeAuthorClick(meAuthorSugs[meAuthorHi]); }
        else if (e.key === 'Escape') { setShowMeAuthorSugs(false); setMeAuthorSugs([]); setMeAuthorHi(-1); }
      }

      // MASTER ENTRY: Translator (uses author API)
      else if (inputName === 'me_translator' && showMeTranslatorSugs && meTranslatorSugs.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMeTranslatorHi(p => (p < meTranslatorSugs.length - 1 ? p + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMeTranslatorHi(p => (p > 0 ? p - 1 : meTranslatorSugs.length - 1)); }
        else if (e.key === 'Enter' && meTranslatorHi >= 0) { e.preventDefault(); handleMeTranslatorClick(meTranslatorSugs[meTranslatorHi]); }
        else if (e.key === 'Escape') { setShowMeTranslatorSugs(false); setMeTranslatorSugs([]); setMeTranslatorHi(-1); }
      }

      // MASTER ENTRY: Publisher
      else if (inputName === 'me_publisher' && showMePublisherSugs && mePublisherSugs.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMePublisherHi(p => (p < mePublisherSugs.length - 1 ? p + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMePublisherHi(p => (p > 0 ? p - 1 : mePublisherSugs.length - 1)); }
        else if (e.key === 'Enter' && mePublisherHi >= 0) { e.preventDefault(); handleMePublisherClick(mePublisherSugs[mePublisherHi]); }
        else if (e.key === 'Escape') { setShowMePublisherSugs(false); setMePublisherSugs([]); setMePublisherHi(-1); }
      }

      // MASTER ENTRY: Title Eng
      else if (inputName === 'me_titleEng' && showMeTitleSugs && meTitleSugs.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMeTitleHi(p => (p < meTitleSugs.length - 1 ? p + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMeTitleHi(p => (p > 0 ? p - 1 : meTitleSugs.length - 1)); }
        else if (e.key === 'Enter' && meTitleHi >= 0) { e.preventDefault(); handleMeTitleClick(meTitleSugs[meTitleHi]); }
        else if (e.key === 'Escape') { setShowMeTitleSugs(false); setMeTitleSugs([]); setMeTitleHi(-1); }
      }
    }
  };

  const handleItemSuggestionClick = (suggestion) => {
    const selectedTitle = isDotPrefixed ? suggestion.title_m : (suggestion.language === 1 ? suggestion.title_m : suggestion.title);
    const isMalayalamTitle = isDotPrefixed || suggestion.language === 1;
    console.log('Suggestion selected:', { selectedTitle, isMalayalam: isMalayalamTitle, raw_title_m: suggestion.raw_title_m, language: suggestion.language });
    setFormData((prev) => ({
      ...prev,
      itemName: selectedTitle,
      purchaseRate: suggestion.rate,
      exchangeRate: suggestion.exchangeRate || '',
      tax: suggestion.tax,
      discount: '0',
      discountAmount: '0',
      titleId: suggestion.id
    }));
    setIsMalayalam(isMalayalamTitle);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setIsDotPrefixed(false);
  };

  const handleSupplierSuggestionClick = (suggestion) => {
    console.log('Supplier suggestion selected:', { supplier_nm: suggestion.supplier_nm, supplier_id: suggestion.id });
    setInwardMaster((prev) => ({
      ...prev,
      supplier_nm: suggestion.supplier_nm,
      supplier_id: suggestion.id
    }));
    setSupplierSuggestions([]);
    setShowSupplierSuggestions(false);
    setSupplierHighlightedIndex(-1);
  };

  const handleUserSuggestionClick = (suggestion) => {
    console.log('User suggestion selected:', { user_nm: suggestion.user_nm });
    setInwardMaster((prev) => ({
      ...prev,
      user_nm: suggestion.user_nm,
      user_id: suggestion.id
    }));
    setUserSuggestions([]);
    setShowUserSuggestions(false);
    setUserHighlightedIndex(-1);
  };

  const handleBranchesSuggestionClick = (suggestion) => {
    console.log('Branches suggestion selected:', { branches_nm: suggestion.branches_nm });
    setInwardMaster((prev) => ({
      ...prev,
      branches_nm: suggestion.branches_nm,
      branches_id: suggestion.id
    }));
    setBranchesSuggestions([]);
    setShowBranchesSuggestions(false);
    setBranchesHighlightedIndex(-1);
  };

  const handleBreakupSuggestionClick = (suggestion, breakupNo) => {
    console.log('Breakup suggestion selected:', { breakup_nm: suggestion.breakup_nm }, breakupNo);
    setInwardMaster((prev) => ({
      ...prev,
      [`breakup_nm${breakupNo}`]: suggestion.breakup_nm,
      [`breakup_id${breakupNo}`]: suggestion.id
    }));

    setBreakupSuggestions([]);
    setShowBreakupSuggestions(false);
    setBreakupHighlightedIndex(-1);
  };

  const handleMeSubCatClick = (row) => {
    setMasterEntryData(prev => ({ ...prev, subCategory: row.sub_category_nm }));
    setMeSubCatSugs([]); setShowMeSubCatSugs(false); setMeSubCatHi(-1);
  };

  const handleMeCatClick = (row) => {
    setMasterEntryData(prev => ({ ...prev, category: row.category_nm }));
    setMeCatSugs([]); setShowMeCatSugs(false); setMeCatHi(-1);
  };

  const handleMeAuthorClick = (row) => {
    setMasterEntryData(prev => ({ ...prev, authorEngMal: row.author_nm }));
    setMeAuthorSugs([]); setShowMeAuthorSugs(false); setMeAuthorHi(-1);
  };

  const handleMeTranslatorClick = (row) => {
    setMasterEntryData(prev => ({ ...prev, translatorEngMal: row.author_nm }));
    setMeTranslatorSugs([]); setShowMeTranslatorSugs(false); setMeTranslatorHi(-1);
  };

  const handleMePublisherClick = (row) => {
    setMasterEntryData(prev => ({ ...prev, publisherEngMal: row.publisher_nm }));
    setMePublisherSugs([]); setShowMePublisherSugs(false); setMePublisherHi(-1);
  };

  // TITLE ENG: fill many fields from joined payload
  const handleMeTitleClick = (row) => {
    setMasterEntryData(prev => ({
      ...prev,
      titleEng: row.title || '',
      titleMal: row.title_m || '',
      authorEngMal: row.author_nm || '',
      translatorEngMal: row.translator_nm || '',
      publisherEngMal: row.publisher_nm || '',
      category: row.category_nm || '',
      subCategory: row.sub_category_nm || '',
      taxPercent: (row.tax ?? '') === '' ? '' : String(row.tax),
      isbn: row.isbn || '',
      mrp: (row.rate ?? '') === '' ? '' : String(row.rate)
      // Keep currency as-is; adjust if you map language_id/currency later
    }));
    setMeTitleSugs([]); setShowMeTitleSugs(false); setMeTitleHi(-1);
  };


  const handleAddItem = () => {
    const { itemName, isbn, quantity, purchaseRate, exchangeRate, currency, tax, discount, discountAmount, titleId } = formData;
    if (!itemName || !quantity || !purchaseRate || !currency || !titleId) {
      showModal('Please fill required item details', 'error');
      return;
    }
    try {
      const qty = parseFloat(quantity);
      const rt = parseFloat(purchaseRate);
      const exRt = parseFloat(exchangeRate);
      const disc = parseFloat(discount || 0);
      const discAmt = parseFloat(discountAmount || 0);
      const tx = parseFloat(tax || 0);
      if (isNaN(qty) || isNaN(rt)) {
        showModal('Quantity and Rate must be valid numbers', 'error');
        return;
      }

      const currencyIndex = currencies.find(cur => cur.name === currency)?.id || 0;
      const value = qty * rt * exRt * (1 - disc / 100) * (1 + tx / 100);
      setItems([...items, { itemName, isbn, quantity: qty, purchaseRate: rt, exchangeRate: exRt, currency, tax: tx, discount: disc, discountAmount: discAmt, value, titleId, currencyIndex }]);
      if (disc > 0 && !activeDiscountField) {
        setActiveDiscountField('item_discount');
      }
      setFormData({
        itemName: '',
        isbn: '',
        quantity: '',
        purchaseRate: '',
        exchangeRate: '',
        currency: currencies.find(cur => cur.name === 'Indian Rupees')?.name || 'Indian Rupees',
        tax: '',
        discount: '',
        discountAmount: '',
        titleId: '',
        currencyIndex: currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0
      });
      setIsMalayalam(false);
      console.log('Item added:', { itemName, isMalayalam: false });
    } catch (error) {
      showModal('Invalid item data', 'error');
    }
  };

  const handleSubmitGoodsInward = async () => {
    try {
      const requiredFields = [
        { key: 'supplier_id', type: 'number', label: 'Supplier ID' },
        { key: 'bill_no', type: 'string', label: 'Bill No' },
        { key: 'bill_date', type: 'string', label: 'Bill Date' },
        { key: 'user_id', type: 'number', label: 'User ID' },
        { key: 'branches_id', type: 'number', label: 'Branches ID' },
      ];

      for (const field of requiredFields) {
        const value = inwardMaster[field.key];
        if (field.type === 'string') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            showModal(`Please fill the ${field.label} field`, 'error');
            return;
          }
        } else if (field.type === 'number') {
          if (value === null || value === undefined || isNaN(value)) {
            showModal(`Please fill the ${field.label} field`, 'error');
            return;
          }
        }
      }

      if (items.length === 0) {
        showModal('Please add at least one item', 'error');
        return;
      }

      const payload = {
        entry_date: inwardMaster.entry_date,
        bill_no: inwardMaster.bill_no,
        bill_date: inwardMaster.bill_date,
        gross: parseFloat(inwardMaster.gross) || 0.0,
        nett: parseFloat(inwardMaster.nett) || 0.0,
        is_cash: inwardMaster.is_cash,
        type: inwardMaster.type,
        notes: inwardMaster.notes,
        p_breakup_id1: inwardMaster.breakup_id1,
        p_breakup_amt1: inwardMaster.breakup_amt1,
        p_breakup_id2: inwardMaster.breakup_id2,
        p_breakup_amt2: inwardMaster.breakup_amt2,
        p_breakup_id3: inwardMaster.breakup_id3,
        p_breakup_amt3: inwardMaster.breakup_amt3,
        p_breakup_id4: inwardMaster.breakup_id4,
        p_breakup_amt4: inwardMaster.breakup_amt4,
        supplier_nm: inwardMaster.supplier_nm,
        supplier_id: parseInt(inwardMaster.supplier_id),
        user_id: parseInt(inwardMaster.user_id),
        branches_id: parseInt(inwardMaster.branches_id),
        items: items.map(item => ({
          itemName: item.itemName,
          isbn: item.isbn,
          quantity: parseFloat(item.quantity),
          purchaseRate: parseFloat(item.purchaseRate),
          exchangeRate: parseFloat(item.exchangeRate),
          currency: item.currency,
          tax: parseFloat(item.tax || 0),
          discount: parseFloat(item.discount || 0),
          discountAmount: parseFloat(item.discountAmount || 0),
          value: parseFloat(item.value),
          titleId: parseInt(item.titleId),
          currencyIndex: parseInt(item.currencyIndex)
        }))
      };
      console.log('Payload:', JSON.stringify(payload, null, 2));

      if (isEditMode && goodsInwardId) {
        await api.put(`/auth/goods_inward/${goodsInwardId}/`, payload);
        showModal('Goods Inward updated successfully', 'success');
      } else {
        const response = await api.post('/auth/goods_inward/', payload);
        showModal(`Purchase submitted successfully with Srl No: ${response.data.purchase_id}`, 'success');
      }

      resetForm();
    } catch (error) {
      console.error('Error details:', error.response?.data, error.response?.status, error.message);
      showModal(`Error: ${error.response?.data?.error || error.message}`, 'error');
    }
  };

  const handleLoadGoodsInward = async () => {
    if (!goodsInwardIdToLoad) {
      showModal('Please enter a Goods Inward Srl No to load', 'error');
      return;
    }
    try {
      const response = await api.get(`/auth/goods_inward/${goodsInwardIdToLoad}/`);
      const data = response.data;
      console.log('Loaded Goods Inward:', data);

      setInwardMaster({
        srl_no: data.purchase_no || '',
        entry_date: data.inward_date || new Date().toISOString().split('T')[0],
        bill_no: data.bill_no || '',
        bill_date: data.bill_date || new Date().toISOString().split('T')[0],
        reference: data.reference || '',
        gross: data.gross || '',
        nett: data.nett || '',
        is_cash: data.is_cash || 'No',
        type: data.type || '',
        notes: data.notes || '',
        days: data.days || '',
        discount_percent: data.discount_percent || '',
        supplier_nm: data.supplier_nm || '',
        supplier_id: data.supplier_id || '',
        user_nm: data.user_nm || '',
        user_id: data.user_id || '',
        branches_nm: data.branches_nm || '',
        branches_id: data.branches_id || '',
        breakup_nm1: data.p_breakup_nm1 || '',
        breakup_id1: data.p_breakup_id1 || '',
        breakup_amt1: data.p_breakup_amt1 || '',
        breakup_nm2: data.p_breakup_nm2 || '',
        breakup_id2: data.p_breakup_id2 || '',
        breakup_amt2: data.p_breakup_amt2 || '',
        breakup_nm3: data.p_breakup_nm3 || '',
        breakup_id3: data.p_breakup_id3 || '',
        breakup_amt3: data.p_breakup_amt3 || '',
        breakup_nm4: data.p_breakup_nm4 || '',
        breakup_id4: data.p_breakup_id4 || '',
        breakup_amt4: data.p_breakup_amt4 || '',
      });

      setItems(data.items.map(item => ({
        itemName: item.itemName,
        isbn: item.isbn,
        quantity: item.quantity,
        purchaseRate: item.purchaseRate,
        exchangeRate: item.exchangeRate,
        currency: item.currency,
        tax: item.tax || 0,
        discount: item.discount || 0,
        discountAmount: item.discountAmount || 0,
        value: item.value,
        titleId: item.titleId,
        currencyIndex: item.currencyIndex,
        isMalayalam: item.language === 1
      })));

      setGoodsInwardId(goodsInwardIdToLoad);
      setIsEditMode(true);
      setGoodsInwardIdToLoad('');
      showModal('Goods Inward loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading Goods Inward:', error);
      showModal(`Error: ${error.response?.data?.error || error.message}`, 'error');
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems];
      const item = { ...updatedItems[index] };
      if (field === 'currency') {
        const selectedCurrency = currencies.find(cur => cur.name === value);
        item.currency = value;
        item.currencyIndex = selectedCurrency ? selectedCurrency.id : (currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0);
      } else {
        item[field] = value;
      }
      // Recalculate value
      const qty = parseFloat(item.quantity) || 0;
      const rt = parseFloat(item.purchaseRate) || 0;
      const exRt = parseFloat(item.exchangeRate) || 1;
      const disc = parseFloat(item.discount || 0);
      const discAmt =  parseFloat(item.discountAmount || 0);
      const tx = parseFloat(item.tax || 0);
      item.value = qty * rt * exRt * (1 - disc / 100) - discAmt * (1 + tx / 100);
      updatedItems[index] = item;
      return updatedItems;
    });
  };

  const resetForm = () => {
    setInwardMaster({
      srl_no: '',
      entry_date: new Date().toISOString().split('T')[0],
      bill_no: '',
      bill_date: new Date().toISOString().split('T')[0],
      reference: '',
      gross: '',
      nett: '',
      is_cash: 'No',
      type: '',
      notes: '',
      days: '',
      discount_percent: '',
      supplier_nm: '',
      supplier_id: '',
      user_nm: '',
      user_id: '',
      branches_nm: '',
      branches_id: '',
      breakup_nm1: '',
      breakup_id1: '',
      breakup_amt1: '',
      breakup_nm2: '',
      breakup_id2: '',
      breakup_amt2: '',
      breakup_nm3: '',
      breakup_id3: '',
      breakup_amt3: '',
      breakup_nm4: '',
      breakup_id4: '',
      breakup_amt4: ''
    });
    setItems([]);
    setFormData({
      itemName: '',
      isbn: '',
      quantity: '',
      purchaseRate: '',
      exchangeRate: '',
      currency: currencies.find(cur => cur.name === 'Indian Rupees')?.name || 'Indian Rupees',
      tax: '',
      discount: '',
      discountAmount: '',
      titleId: '',
      currencyIndex: currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0
    });
    setMasterEntryData({
      subCategory: '',
      category: '',
      authorEngMal: '',
      translatorEngMal: '',
      publisherEngMal: '',
      titleEng: '',
      titleMal: '',
      supplier: '',
      creditCustomer: '',
      taxPercent: '',
      isbn: '',
      quantity: '',
      fValue: '',
      exchangeRate: '',
      currency: currencies.find(cur => cur.name === 'Indian Rupees')?.name || 'Indian Rupees',
      mrp: '',
      currencyIndex: currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0
    });
    setIsEditMode(false);
    setGoodsInwardId(null);
    setGoodsInwardIdToLoad('');
    setActiveDiscountField(null);
    setIsMalayalam(false);
    setSupplierSuggestions([]);
    setShowSupplierSuggestions(false);
    setSupplierHighlightedIndex(-1);
    setUserSuggestions([]);
    setShowUserSuggestions(false);
    setUserHighlightedIndex(-1);
    setBranchesSuggestions([]);
    setShowBranchesSuggestions(false);
    setBranchesHighlightedIndex(-1);
    setBreakupSuggestions([]);
    setShowBreakupSuggestions(false);
    setBreakupHighlightedIndex(-1);
    setIsMasterEntryOpen(false);
  };

  const handleOpenMasterEntry = () => {
    setIsMasterEntryOpen(true);
  };

  const handleCloseMasterEntry = () => {
    setIsMasterEntryOpen(false);
    setMasterEntryData({
      subCategory: '',
      category: '',
      authorEngMal: '',
      translatorEngMal: '',
      publisherEngMal: '',
      titleEng: '',
      titleMal: '',
      supplier: '',
      creditCustomer: '',
      taxPercent: '',
      isbn: '',
      quantity: '',
      fValue: '',
      exchangeRate: '',
      currency: currencies.find(cur => cur.name === 'Indian Rupees')?.name || 'Indian Rupees',
      mrp: '',
      currencyIndex: currencies.find(cur => cur.name === 'Indian Rupees')?.id || 0
    });
  };

  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

  const pageIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18M7 7l1-3h8l1 3M8 17l1 3h6l1-3" />
    </svg>
  );

  const cardClasses = "bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm";
  const inputClasses = "px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200";
  const actionButtonClasses = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200";
  const badgeClasses = "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100";
  const tableInputClasses = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white transition-all duration-200";

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 md:p-6 space-y-6">
      <Modal isOpen={modal.isOpen} message={modal.message} type={modal.type} buttons={modal.buttons} />
      <PageHeader
        icon={pageIcon}
        title="Goods Inward"
        subtitle="Capture purchase entries, adjustments, and returns"
      />
      {isMasterEntryOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">MASTER ENTRY</h2>
              <button onClick={handleCloseMasterEntry} className="text-gray-600 hover:text-gray-800">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="category"
                  value={masterEntryData.category}
                  onChange={handleMasterEntryInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'me_category')}
                  placeholder="Category"
                  className="border p-2 rounded-lg text-sm w-full"
                  autoComplete="off"
                />
                {showMeCatSugs && meCatSugs.length > 0 && masterEntryData.category.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {meCatSugs.map((row, idx) => (
                      <li
                        key={row.id}
                        id={`me-cat-${idx}`}
                        className={`px-3 py-1 cursor-pointer ${meCatHi === idx ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleMeCatClick(row)}
                      >
                        {row.category_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="subCategory"
                  value={masterEntryData.subCategory}
                  onChange={handleMasterEntryInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'me_subCategory')}
                  placeholder="Sub Category"
                  className="border p-2 rounded-lg text-sm w-full"
                  autoComplete="off"
                />
                {showMeSubCatSugs && meSubCatSugs.length > 0 && masterEntryData.subCategory.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {meSubCatSugs.map((row, idx) => (
                      <li
                        key={row.id}
                        id={`me-subcat-${idx}`}
                        className={`px-3 py-1 cursor-pointer ${meSubCatHi === idx ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleMeSubCatClick(row)}
                      >
                        {row.sub_category_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="authorEngMal"
                  value={masterEntryData.authorEngMal}
                  onChange={handleMasterEntryInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'me_author')}
                  placeholder="Author"
                  className="border p-2 rounded-lg text-sm w-full"
                  autoComplete="off"
                />
                {showMeAuthorSugs && meAuthorSugs.length > 0 && masterEntryData.authorEngMal.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {meAuthorSugs.map((row, idx) => (
                      <li
                        key={row.id}
                        id={`me-author-${idx}`}
                        className={`px-3 py-1 cursor-pointer ${meAuthorHi === idx ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleMeAuthorClick(row)}
                      >
                        {row.author_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="translatorEngMal"
                  value={masterEntryData.translatorEngMal}
                  onChange={handleMasterEntryInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'me_translator')}
                  placeholder="Translator"
                  className="border p-2 rounded-lg text-sm w-full"
                  autoComplete="off"
                />
                {showMeTranslatorSugs && meTranslatorSugs.length > 0 && masterEntryData.translatorEngMal.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {meTranslatorSugs.map((row, idx) => (
                      <li
                        key={row.id}
                        id={`me-translator-${idx}`}
                        className={`px-3 py-1 cursor-pointer ${meTranslatorHi === idx ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleMeTranslatorClick(row)}
                      >
                        {row.author_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="publisherEngMal"
                  value={masterEntryData.publisherEngMal}
                  onChange={handleMasterEntryInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'me_publisher')}
                  placeholder="Publisher"
                  className="border p-2 rounded-lg text-sm w-full"
                  autoComplete="off"
                />
                {showMePublisherSugs && mePublisherSugs.length > 0 && masterEntryData.publisherEngMal.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {mePublisherSugs.map((row, idx) => (
                      <li
                        key={row.id}
                        id={`me-publisher-${idx}`}
                        className={`px-3 py-1 cursor-pointer ${mePublisherHi === idx ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleMePublisherClick(row)}
                      >
                        {row.publisher_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative col-span-2">
                <input
                  type="text"
                  name="titleEng"
                  value={masterEntryData.titleEng}
                  onChange={handleMasterEntryInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'me_titleEng')}
                  placeholder="Title Eng"
                  className="border p-2 rounded-lg text-sm w-full"
                  autoComplete="off"
                />
                {showMeTitleSugs && meTitleSugs.length > 0 && masterEntryData.titleEng.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-64 overflow-y-auto">
                    {meTitleSugs.map((row, idx) => (
                      <li
                        key={row.id}
                        id={`me-title-${idx}`}
                        className={`px-3 py-2 cursor-pointer ${meTitleHi === idx ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleMeTitleClick(row)}
                      >
                        <div className="font-medium">{row.title}</div>
                        <div className="text-xs text-gray-600">
                          {row.author_nm ? `Author: ${row.author_nm}` : ''}{row.publisher_nm ? ` · Publisher: ${row.publisher_nm}` : ''}
                        </div>
                        {row.title_m ? <div className="text-xs text-gray-500" style={{ fontFamily: 'Noto Sans Malayalam, sans-serif' }}>{row.title_m}</div> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input
                type="text"
                name="titleMal"
                value={masterEntryData.titleMal}
                onChange={handleMasterEntryInputChange}
                placeholder="Title Mal"
                className="border p-2 rounded-lg text-sm w-full col-span-2"
                style={{ fontFamily: 'Noto Sans Malayalam, sans-serif' }}
              />
              <input
                type="number"
                name="taxPercent"
                value={masterEntryData.taxPercent}
                onChange={handleMasterEntryInputChange}
                placeholder="Tax (%)"
                className="border p-2 rounded-lg text-sm w-full"
                step="0.01"
              />
              <select
                name="Language"
                value={masterEntryData.currency}
                onChange={handleMasterEntryInputChange}
                className="border p-2 rounded-lg text-sm w-full"
              >
                <option value="" disabled>Currency</option>
                {currencies.map(cur => (
                  <option key={cur.id} value={cur.name}>{cur.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className={cardClasses}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className={badgeClasses}>Purchase details</span>
            <p className="text-xs text-gray-500">Supplier, billing, and branch information</p>
          </div>
          <p className="text-xs text-gray-500">Gross / Nett update automatically</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Srl No</span>
              <input
                type="text"
                name="srl_no"
                value={inwardMaster.srl_no}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, purchase_no: e.target.value }))}
                placeholder="Srl No"
                className={`${inputClasses} bg-gray-50 font-semibold`}
                readOnly
                step="0.01"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Entry Date</span>
              <input
                type="date"
                name="entry_date"
                value={inwardMaster.entry_date}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, entry_date: e.target.value }))}
                placeholder="Entry Date"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Bill No</span>
              <input
                type="text"
                name="bill_no"
                value={inwardMaster.bill_no}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, bill_no: e.target.value }))}
                placeholder="Bill No"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Bill Date</span>
              <input
                type="date"
                name="bill_date"
                value={inwardMaster.bill_date}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, bill_date: e.target.value }))}
                placeholder="Bill Date"
                className={inputClasses}
              />
            </div>

            <div className="relative flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">User</span>
              <input
                type="text"
                name="user_nm"
                value={inwardMaster.user_nm}
                onChange={handleInwardMasterChange}
                onKeyDown={(e) => handleKeyDown(e, 'user_nm')}
                placeholder="Search user"
                className={inputClasses}
                autoComplete="off"
              />
              {showUserSuggestions && userSuggestions.length > 0 && inwardMaster.user_nm.trim() && (
                <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                  {userSuggestions.map((user, index) => (
                    <li
                      key={user.id}
                      id={`user-suggestion-${index}`}
                      className={`px-3 py-2 cursor-pointer ${userHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                      onClick={() => handleUserSuggestionClick(user)}
                    >
                      {user.user_nm}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Gross</span>
              <input
                type="number"
                name="gross"
                value={inwardMaster.gross}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, gross: e.target.value }))}
                placeholder="Gross"
                className={`${inputClasses} bg-gray-50 text-right font-semibold`}
                readOnly
                step="0.01"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Nett</span>
              <input
                type="number"
                name="nett"
                value={inwardMaster.nett}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, nett: e.target.value }))}
                placeholder="Nett"
                className={`${inputClasses} bg-gray-50 text-right font-semibold`}
                readOnly
                step="0.01"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Cash</span>
              <select
                name="is_cash"
                value={inwardMaster.is_cash}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, is_cash: e.target.value }))}
                className={inputClasses}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Type</span>
              <select
                name="type"
                value={inwardMaster.type}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, type: e.target.value }))}
                className={inputClasses}
              >
                <option value="" disabled>Type</option>
                {["Purchase", "Return", "Consignment"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="relative flex flex-col gap-1 md:col-span-2">
              <span className="text-xs font-medium text-gray-500">Supplier</span>
              <input
                type="text"
                name="supplier_nm"
                value={inwardMaster.supplier_nm}
                onChange={handleInwardMasterChange}
                onKeyDown={(e) => handleKeyDown(e, 'supplier_nm')}
                placeholder="Supplier"
                className={inputClasses}
                autoComplete="off"
              />
              {showSupplierSuggestions && supplierSuggestions.length > 0 && inwardMaster.supplier_nm.trim() && (
                <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                  {supplierSuggestions.map((supplier, index) => (
                    <li
                      key={supplier.id}
                      id={`supplier-suggestion-${index}`}
                      className={`px-3 py-2 cursor-pointer ${supplierHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                      onClick={() => handleSupplierSuggestionClick(supplier)}
                    >
                      {supplier.supplier_nm}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Branch</span>
              <input
                type="text"
                name="branches_nm"
                value={inwardMaster.branches_nm}
                onChange={handleInwardMasterChange}
                onKeyDown={(e) => handleKeyDown(e, 'branches_nm')}
                placeholder="Branch"
                className={inputClasses}
                autoComplete="off"
              />
              {showBranchesSuggestions && branchesSuggestions.length > 0 && inwardMaster.branches_nm.trim() && (
                <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                  {branchesSuggestions.map((branches, index) => (
                    <li
                      key={branches.id}
                      id={`branches-suggestion-${index}`}
                      className={`px-3 py-2 cursor-pointer ${branchesHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                      onClick={() => handleBranchesSuggestionClick(branches)}
                    >
                      {branches.branches_nm}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs font-medium text-gray-500">Notes</span>
              <input
                type="text"
                name="notes"
                value={inwardMaster.notes}
                onChange={(e) => setInwardMaster(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className={badgeClasses}>Breakup lines</span>
              <p className="text-xs text-gray-500">Optional adjustments to purchase amount</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
              <div className="relative flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Breakup 1</span>
                <input
                  type="text"
                  name="breakup_nm1"
                  value={inwardMaster.breakup_nm1}
                  onChange={handleInwardMasterChange}
                  onKeyDown={(e) => handleKeyDown(e, 'breakup_nm1')}
                  placeholder="Breakup 1"
                  className={inputClasses}
                  autoComplete="off"
                />
                {showBreakupSuggestions && activeBreakupNo === 1 && breakupSuggestions.length > 0 && inwardMaster.breakup_nm1.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {breakupSuggestions.map((breakup, index) => (
                      <li
                        key={breakup.id}
                        id={`breakup-suggestion-${index}`}
                        className={`px-3 py-2 cursor-pointer ${breakupHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        onClick={() => handleBreakupSuggestionClick(breakup, 1)}
                      >
                        {breakup.breakup_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Amount 1</span>
                <input
                  type="number"
                  name="breakup_amt1"
                  value={inwardMaster.breakup_amt1}
                  onChange={handleInwardMasterChange}
                  placeholder="Amount 1"
                  className={`${inputClasses} text-right`}
                  step="0.01"
                />
              </div>

              <div className="relative flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Breakup 2</span>
                <input
                  type="text"
                  name="breakup_nm2"
                  value={inwardMaster.breakup_nm2}
                  onChange={handleInwardMasterChange}
                  onKeyDown={(e) => handleKeyDown(e, 'breakup_nm2')}
                  placeholder="Breakup 2"
                  className={inputClasses}
                  autoComplete="off"
                />
                {showBreakupSuggestions && activeBreakupNo === 2 && breakupSuggestions.length > 0 && inwardMaster.breakup_nm2.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {breakupSuggestions.map((breakup, index) => (
                      <li
                        key={breakup.id}
                        id={`breakup-suggestion-${index}`}
                        className={`px-3 py-2 cursor-pointer ${breakupHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        onClick={() => handleBreakupSuggestionClick(breakup, 2)}
                      >
                        {breakup.breakup_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Amount 2</span>
                <input
                  type="number"
                  name="breakup_amt2"
                  value={inwardMaster.breakup_amt2}
                  onChange={handleInwardMasterChange}
                  placeholder="Amount 2"
                  className={`${inputClasses} text-right`}
                  step="0.01"
                />
              </div>

              <div className="relative flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Breakup 3</span>
                <input
                  type="text"
                  name="breakup_nm3"
                  value={inwardMaster.breakup_nm3}
                  onChange={handleInwardMasterChange}
                  onKeyDown={(e) => handleKeyDown(e, 'breakup_nm3')}
                  placeholder="Breakup 3"
                  className={inputClasses}
                  autoComplete="off"
                />
                {showBreakupSuggestions && activeBreakupNo === 3 && breakupSuggestions.length > 0 && inwardMaster.breakup_nm3.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {breakupSuggestions.map((breakup, index) => (
                      <li
                        key={breakup.id}
                        id={`breakup-suggestion-${index}`}
                        className={`px-3 py-2 cursor-pointer ${breakupHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        onClick={() => handleBreakupSuggestionClick(breakup, 3)}
                      >
                        {breakup.breakup_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Amount 3</span>
                <input
                  type="number"
                  name="breakup_amt3"
                  value={inwardMaster.breakup_amt3}
                  onChange={handleInwardMasterChange}
                  placeholder="Amount 3"
                  className={`${inputClasses} text-right`}
                  step="0.01"
                />
              </div>

              <div className="relative flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Breakup 4</span>
                <input
                  type="text"
                  name="breakup_nm4"
                  value={inwardMaster.breakup_nm4}
                  onChange={handleInwardMasterChange}
                  onKeyDown={(e) => handleKeyDown(e, 'breakup_nm4')}
                  placeholder="Breakup 4"
                  className={inputClasses}
                  autoComplete="off"
                />
                {showBreakupSuggestions && activeBreakupNo === 4 && breakupSuggestions.length > 0 && inwardMaster.breakup_nm4.trim() && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                    {breakupSuggestions.map((breakup, index) => (
                      <li
                        key={breakup.id}
                        id={`breakup-suggestion-${index}`}
                        className={`px-3 py-2 cursor-pointer ${breakupHighlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        onClick={() => handleBreakupSuggestionClick(breakup, 4)}
                      >
                        {breakup.breakup_nm}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Amount 4</span>
                <input
                  type="number"
                  name="breakup_amt4"
                  value={inwardMaster.breakup_amt4}
                  onChange={handleInwardMasterChange}
                  placeholder="Amount 4"
                  className={`${inputClasses} text-right`}
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClasses} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className={badgeClasses}>Line items</span>
            <p className="text-xs text-gray-500">Products added to this inward</p>
          </div>
          <div className="text-sm font-semibold text-gray-700">
            Total: {totalValue.toFixed(2)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left font-semibold w-[330px]">Product</th>
                <th className="px-3 py-2 text-left font-semibold w-[110px]">I S B N</th>
                <th className="px-3 py-2 text-right font-semibold w-[70px]">Qty</th>
                <th className="px-3 py-2 text-left font-semibold w-[80px]">Curr</th>
                <th className="px-3 py-2 text-right font-semibold w-[80px]">ExRt</th>
                <th className="px-3 py-2 text-right font-semibold w-[80px]">F. Value</th>
                <th className="px-3 py-2 text-right font-semibold w-[80px]">Tax%</th>
                <th className="px-3 py-2 text-right font-semibold w-[80px]">Dis%</th>
                <th className="px-3 py-2 text-right font-semibold w-[90px]">-/+Adj</th>
                <th className="px-3 py-2 text-right font-semibold w-[100px]">Nett</th>
                <th className="px-3 py-2 text-center font-semibold w-[48px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-10 text-center text-gray-400 text-sm">
                    No items added yet. Use the form below to add lines.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        className={`${tableInputClasses} ${item.isMalayalam ? 'font-malayalam' : ''}`}
                        style={item.isMalayalam ? { fontFamily: 'Noto Sans Malayalam, sans-serif' } : {}}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.isbn}
                        onChange={(e) => handleItemChange(index, 'isbn', e.target.value)}
                        className={tableInputClasses}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={`${tableInputClasses} text-right`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.currency}
                        onChange={(e) => handleItemChange(index, 'currency', e.target.value)}
                        className={tableInputClasses}
                      >
                        <option value="" disabled>Currency</option>
                        {currencies.map(cur => (
                          <option key={cur.id} value={cur.name}>{cur.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.exchangeRate}
                        onChange={(e) => handleItemChange(index, 'exchangeRate', e.target.value)}
                        className={`${tableInputClasses} text-right`}
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.purchaseRate}
                        onChange={(e) => handleItemChange(index, 'purchaseRate', e.target.value)}
                        className={`${tableInputClasses} text-right`}
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                        className={`${tableInputClasses} text-right`}
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        className={`${tableInputClasses} text-right`}
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.discountAmount}
                        onChange={(e) => handleItemChange(index, 'discountAmount', e.target.value)}
                        className={`${tableInputClasses} text-right`}
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-gray-700">
                      {(item.value || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete item"
                        onClick={() => setItems(items.filter((_, i) => i !== index))}
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

      <div className={`${cardClasses} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className={badgeClasses}>Add item</span>
            <p className="text-xs text-gray-500">Search products and set purchase values</p>
          </div>
          <p className="hidden md:block text-xs text-gray-500">Tip: prefix with "." to search Malayalam titles</p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-[380px_130px_70px_90px_90px_90px_80px_80px_90px_1fr] gap-3 w-full overflow-x-auto">
            <div className="relative">
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, 'itemName')}
                placeholder="Item Name"
                className={`${tableInputClasses} ${isMalayalam ? 'font-malayalam' : ''}`}
                style={isMalayalam ? { fontFamily: 'Noto Sans Malayalam, sans-serif' } : {}}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && formData.itemName.trim() && (
                <ul className="absolute z-10 bg-white border border-gray-200 mt-1 w-full shadow-lg rounded-lg text-sm max-h-48 overflow-y-auto font-malayalam" style={{ fontFamily: isDotPrefixed ? 'Noto Sans Malayalam, sans-serif' : 'inherit' }}>
                  {suggestions.map((product, index) => (
                    <li
                      key={product.id}
                      id={`suggestion-${index}`}
                      className={`px-3 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                      onClick={() => handleItemSuggestionClick(product)}
                    >
                      {isDotPrefixed ? product.title_m : product.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="Isbn"
              className={tableInputClasses}
            />
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Qty"
              className={tableInputClasses}
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className={tableInputClasses}
            >
              <option value="" disabled>Currency</option>
              {currencies.map(cur => (
                <option key={cur.id} value={cur.name}>{cur.name}</option>
              ))}
            </select>
            <input
              type="number"
              name="exchangeRate"
              value={formData.exchangeRate}
              onChange={handleInputChange}
              placeholder="Exchange Rate"
              className={tableInputClasses}
            />
            <input
              type="number"
              name="purchaseRate"
              value={formData.purchaseRate}
              onChange={handleInputChange}
              placeholder="Purchase Rate"
              className={tableInputClasses}
            />
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleInputChange}
              placeholder="Tax %"
              className={tableInputClasses}
              step="0.01"
            />
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              placeholder="Disc %"
              className={tableInputClasses}
              step="0.01"
            />
            <input
              type="number"
              name="discountAmount"
              value={formData.discountAmount}
              onChange={handleInputChange}
              placeholder="Disc Amt"
              className={tableInputClasses}
              step="0.01"
            />
            <button
              onClick={handleAddItem}
              className={`${actionButtonClasses} w-full justify-center`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClasses} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className={badgeClasses}>Actions</span>
            <p className="text-xs text-gray-500">Load an inward or submit/update</p>
          </div>
        </div>

        <div className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={goodsInwardIdToLoad}
              onChange={(e) => setGoodsInwardIdToLoad(e.target.value)}
              placeholder="Enter Goods Inward ID"
              className={`${inputClasses} w-full sm:w-64`}
            />
            <button
              onClick={handleLoadGoodsInward}
              className={`${actionButtonClasses} from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700`}
            >
              Load Inward
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSubmitGoodsInward}
              className={`${actionButtonClasses} min-w-[180px]`}
            >
              {isEditMode ? 'Update Inward' : 'Submit Inward'}
            </button>
            <button
              onClick={handleOpenMasterEntry}
              className={`${actionButtonClasses} from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700`}
            >
              Master Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}