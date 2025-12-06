// src/pages/Transactions/SaleBillReturn.jsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/axiosInstance';
import Modal from '../../components/Modal';
import { TrashIcon } from '@heroicons/react/24/solid';

/* ---------- helpers ---------- */
const asNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const money = (v) => asNum(v).toFixed(2);
const today = () => new Date().toISOString().split('T')[0];

/* Value = Qty * Rate * ExRt * (1 + Tax%/100) - DiscountAmount */
const computeValue = (qty, rate, exrt, tax, discA) => {
  const q = asNum(qty);
  const r = asNum(rate);
  const x = asNum(exrt, 1);
  const t = asNum(tax);
  const da = asNum(discA);
  return Math.max(0, q * r * x * (1 + t / 100) - da);
};

export default function SaleBillReturn() {
  /* ---------- modal (like SaleBill.jsx) ---------- */
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [],
  });
  const showModal = (
    message,
    type = 'info',
    buttons = [
      {
        label: 'OK',
        onClick: () => closeModal(),
        className: 'bg-blue-500 hover:bg-blue-600',
      },
    ]
  ) => setModal({ isOpen: true, message, type, buttons });
  const closeModal = () =>
    setModal({ isOpen: false, message: '', type: 'info', buttons: [] });

  /* ---------- header / master ---------- */
  const [header, setHeader] = useState({
    no: '',
    date: today(),
    type: 'Credit Sale',
    pay: 'Cash',
    customer: '',
    notes: '',
    disP: '',
    amt: '',
    nett: '',
    rpv: '',
    billNo: '',
  });

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));

    if (name === 'customer') {
      const trimmed = value.trim();
      setShowCustomerSuggestions(!!trimmed);
      setSelectedCustomer(value);
      setHeader((prev) => ({ ...prev, billNo: '' }));
      setBillSuggestions([]);
      setShowBillSuggestions(false);
    }
    if (name === 'billNo') {
      setShowBillSuggestions(value.trim().length > 0 && !!selectedCustomer);
    }
  };

  /* ---------- items (main table) ---------- */
  const [items, setItems] = useState([]);

  const handleItemChange = (idx, field, val) => {
    setItems((prev) => {
      const copy = [...prev];
      const it = { ...copy[idx] };

      if (['qty', 'rate', 'exrt', 'tax', 'disA'].includes(field)) {
        it[field] = asNum(val);
        it.value = computeValue(it.qty, it.rate, it.exrt, it.tax, it.disA);
      } else {
        it[field] = val;
      }
      copy[idx] = it;
      return copy;
    });
  };

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const total = useMemo(() => items.reduce((s, it) => s + asNum(it.value), 0), [items]);

  useEffect(() => {
    setHeader(prev => ({ ...prev, nett: money(total) }));
  }, [total]);

  /* ---------- suggestions: customer + bill ---------- */
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    const q = header.customer?.trim();
    if (!showCustomerSuggestions || !q) {
      setCustomerSuggestions([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await api.get('/auth/sales-rt/customers/', { params: { q } });
        if (!active) return;
        setCustomerSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCustomerSuggestions([]);
      }
    })();
    return () => { active = false; };
  }, [header.customer, showCustomerSuggestions]);

  const handleCustomerPick = (row) => {
    setHeader((prev) => ({ ...prev, customer: row.customer_nm }));
    setSelectedCustomer(row.customer_nm);
    setSelectedCustomerId(row.id ?? null);
    setShowCustomerSuggestions(false);
    setHeader((prev) => ({ ...prev, billNo: '' }));
    setBillSuggestions([]);
    setShowBillSuggestions(false);
  };

  const [billSuggestions, setBillSuggestions] = useState([]);
  const [showBillSuggestions, setShowBillSuggestions] = useState(false);

  useEffect(() => {
    const q = header.billNo?.trim();
    if (!showBillSuggestions || !q || !selectedCustomer) {
      setBillSuggestions([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await api.get('/auth/sales-rt/bills/', {
          params: { customer: selectedCustomer, q },
        });
        if (!active) return;
        setBillSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setBillSuggestions([]);
      }
    })();
    return () => { active = false; };
  }, [header.billNo, showBillSuggestions, selectedCustomer]);

  const [loading, setLoading] = useState(false);

  const handleBillPick = async (row) => {
    setHeader((prev) => ({ ...prev, billNo: row.bill_no }));
    setShowBillSuggestions(false);

    try {
      setLoading(true);
      const res = await api.get(`/auth/sales-rt/bill/${row.id}/items/`);
      const lines = Array.isArray(res.data) ? res.data : [];

      const modalRows = lines.map((it) => ({
        sale_det_id: it.id,
        purchase_det_id: it.purchase_item_id,
        title_id: it.title_id,
        product: it.title || '',
        bqty: asNum(it.quantity),
        rqty: asNum(it.r_qty || 0),
        tqty: 0,
        rate: asNum(it.rate),
        curr: it.currency_name || 'Indian Rupees',
        exrt: asNum(it.exchange_rate, 1),
        tax: asNum(it.tax),
        // keep originals for proportional recalculation
        disAFull: asNum(it.dis_a),
        valueFull: asNum(it.line_value),
        // shown values (will update when T Qty changes)
        disA: asNum(it.dis_a),
        value: asNum(it.line_value),
      }));

      setSaleModal({
        isOpen: true,
        saleId: row.id,
        billNo: row.bill_no,
        saleDate: row.sale_date,
        items: modalRows,
      });
    } catch (err) {
      console.error('Failed to load sale items:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- modal for picking return quantities ---------- */
  const [saleModal, setSaleModal] = useState({
    isOpen: false,
    saleId: null,
    billNo: '',
    saleDate: '',
    items: [],
  });

  const closeSaleModal = () => {
    setSaleModal({ isOpen: false, saleId: null, billNo: '', saleDate: '', items: [] });
  };

  // ⬇️ Recalculate Dis A and Value proportionally when T Qty changes; fix step to ±1 in input
  const updateTqty = (idx, val) => {
    setSaleModal((prev) => {
      const itemsCopy = [...prev.items];
      const row = { ...itemsCopy[idx] };

      const maxQty = Math.max(0, asNum(row.bqty) - asNum(row.rqty));
      const tqty = Math.max(0, Math.min(asNum(val), maxQty));

      // per-unit discount from the original sale line
      const perUnitDisc = asNum(row.disAFull ?? row.disA) / (asNum(row.bqty) || 1);
      const newDisA = perUnitDisc * tqty;

      row.tqty = tqty;
      row.disA = newDisA;
      row.value = computeValue(tqty, row.rate, row.exrt, row.tax, newDisA);

      itemsCopy[idx] = row;
      return { ...prev, items: itemsCopy };
    });
  };

  const addSelectedFromModal = () => {
    const selected = saleModal.items.filter((r) => asNum(r.tqty) > 0);
    if (selected.length === 0) {
      closeSaleModal();
      return;
    }
    const mapped = selected.map((r) => ({
      product: r.product,
      qty: asNum(r.tqty),
      rate: asNum(r.rate),
      curr: r.curr,
      exrt: asNum(r.exrt, 1),
      tax: asNum(r.tax),
      disA: asNum(r.disA),
      value: computeValue(asNum(r.tqty), asNum(r.rate), asNum(r.exrt, 1), asNum(r.tax), asNum(r.disA)),
      title_id: r.title_id,
      sale_det_id: r.sale_det_id,
      purchase_det_id: r.purchase_det_id,
    }));
    setItems((prev) => [...prev, ...mapped]);
    closeSaleModal();
  };

  /* ---------- load/submit/reset ---------- */
  const [saleRtIdToLoad, setSaleRtIdToLoad] = useState('');

  const loadSaleReturnById = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/auth/sales-rt/${id}/`);
      const data = res.data;

      setHeader({
        no: String(data.sales_rt_no ?? ''),
        date: data.entry_date || today(),
        type: data.s_type_label || 'Credit Sale',
        pay: data.cash_label || 'Cash',
        customer: data.cash_customer || '',
        notes: data.narration || '',
        disP: String(data.discount_p ?? ''),
        amt: String(data.discount_a ?? ''),
        nett: String(data.nett ?? ''),
        rpv: '',
        billNo: '',
      });

      const loaded = (data.items || []).map((r) => ({
        product: r.title || '',
        title_id: r.title_id,
        qty: asNum(r.quantity),
        rate: asNum(r.rate),
        curr: r.currency_name || 'Indian Rupees',
        exrt: asNum(r.exchange_rate, 1),
        tax: asNum(r.tax),
        disA: asNum(r.discount_a),
        value: asNum(r.line_value),
        sale_det_id: asNum(r.sale_det_id),
        purchase_det_id: asNum(r.purchase_det_id),
      }));
      setItems(loaded);

      showModal('Sale Return loaded successfully', 'success');
    } catch (e) {
      console.error(e);
      showModal(`Failed to load Sale Return: ${e?.response?.data?.error || e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadClick = async () => {
    const id = saleRtIdToLoad.trim();
    if (!id) {
      showModal('Enter a Sale Return ID', 'error');
      return;
    }
    await loadSaleReturnById(id);
  };

  const submitSaleReturn = async () => {
    if (!header.date) {
      showModal('Please select Date', 'error');
      return;
    }
    if (!header.customer?.trim()) {
      showModal('Please select Customer', 'error');
      return;
    }
    if (items.length === 0) {
      showModal('Please add at least one item from a bill', 'error');
      return;
    }

    const payload = {
      header,
      items: items.map((it) => ({
        title_id: it.title_id,
        qty: asNum(it.qty),
        rate: asNum(it.rate),
        tax: asNum(it.tax),
        exchange_rate: asNum(it.exrt, 1),
        discount_a: asNum(it.disA),
        line_value: asNum(it.value),
        sale_det_id: asNum(it.sale_det_id),
        purchase_det_id: asNum(it.purchase_det_id),
      })),
    };

    try {
      setLoading(true);
      const res = await api.post('/auth/sales-rt/', payload);

      showModal(`Sales return saved successfully. ID: ${res.data.id}`, 'success');

      setSaleRtIdToLoad(String(res.data.id));
      await loadSaleReturnById(String(res.data.id));
    } catch (e) {
      console.error(e);
      showModal(`Failed to submit: ${e?.response?.data?.error || e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHeader({
      no: '',
      date: today(),
      type: 'Credit Sale',
      pay: 'Cash',
      customer: '',
      notes: '',
      disP: '',
      amt: '',
      nett: '',
      rpv: '',
      billNo: '',
    });
    setCustomerSuggestions([]);
    setShowCustomerSuggestions(false);
    setSelectedCustomer('');
    setSelectedCustomerId(null);
    setBillSuggestions([]);
    setShowBillSuggestions(false);
    setSaleModal({ isOpen: false, saleId: null, billNo: '', saleDate: '', items: [] });
    setItems([]);
    setSaleRtIdToLoad('');
  };

  /* ---------- render ---------- */
  return (
    <div className="flex flex-col min-h-screen w-[99%] mx-auto p-3 space-y-3">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      )}

      {/* Upper form */}
      <div className="bg-white shadow-md rounded-xl p-3">
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-start">
          <input
            name="no"
            value={header.no}
            onChange={handleHeaderChange}
            placeholder="No."
            className="border p-2 rounded-lg w-[100px] text-sm"
          />
          <input
            type="date"
            name="date"
            value={header.date}
            onChange={handleHeaderChange}
            className="border p-2 rounded-lg w-[150px] text-sm"
          />
          <select
            name="type"
            value={header.type}
            onChange={handleHeaderChange}
            className="border p-2 rounded-lg w-[160px] text-sm"
          >
            {[
              'Credit Sale',
              'Cash Sale',
              'P P Sale',
              'Stock Transfer',
              'Approval',
              'Gift Voucher',
              'Gift Bill',
              'Cash Memo',
            ].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            name="pay"
            value={header.pay}
            onChange={handleHeaderChange}
            className="border p-2 rounded-lg w-[180px] text-sm"
          >
            {[
              'Cash',
              'Card',
              'UPI Payment',
              'N.A.',
            ].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {/* Customer with suggestions */}
          <div className="relative">
            <input
              name="customer"
              value={header.customer}
              onChange={handleHeaderChange}
              placeholder="Customer"
              className="border p-2 rounded-lg w-[420px] text-sm"
              autoComplete="off"
            />
            {showCustomerSuggestions && header.customer.trim() && (
              <ul className="absolute z-50 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {customerSuggestions.map((c, i) => (
                  <li
                    key={`${c.id || c.customer_nm}-${i}`}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleCustomerPick(c)}
                  >
                    {c.customer_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            name="notes"
            value={header.notes}
            onChange={handleHeaderChange}
            placeholder="Notes"
            className="border p-2 rounded-lg w-[320px] text-sm"
          />
          <input
            type="number"
            step="0.01"
            name="disP"
            value={header.disP}
            onChange={handleHeaderChange}
            placeholder="Dis%"
            className="border p-2 rounded-lg w-[90px] text-right"
          />
          <input
            type="number"
            step="0.01"
            name="amt"
            value={header.amt}
            onChange={handleHeaderChange}
            placeholder="Amt"
            className="border p-2 rounded-lg w-[120px] text-right"
          />
          <input
            type="number"
            step="0.01"
            name="nett"
            value={header.nett}
            onChange={handleHeaderChange}
            placeholder="Nett"
            className="border p-2 rounded-lg w-[140px] text-right bg-gray-100"
            readOnly
          />
          <input
            type="text"
            name="rpv"
            value={header.rpv}
            onChange={handleHeaderChange}
            placeholder="R/P V"
            className="border p-2 rounded-lg w-[110px] text-sm"
          />

          {/* Bill No with suggestions */}
          <div className="relative">
            <input
              type="text"
              name="billNo"
              value={header.billNo}
              onChange={handleHeaderChange}
              placeholder="Bill No"
              className="border p-2 rounded-lg w-[180px] text-sm"
              autoComplete="off"
              disabled={!selectedCustomer}
              title={!selectedCustomer ? 'Select Customer first' : ''}
            />
            {showBillSuggestions && header.billNo.trim() && selectedCustomer && (
              <ul className="absolute z-50 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {billSuggestions.map((b) => (
                  <li
                    key={`bill-${b.id}`}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleBillPick(b)}
                  >
                    <div className="font-medium">
                      {b.bill_no} - {b.sale_date}
                    </div>
                    <div className="text-xs text-gray-500">{selectedCustomer}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="flex-1 bg-white shadow-md rounded-xl p-3 overflow-y-auto">
        <table className="w-full table-auto border border-gray-300 border-collapse">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="w-[300px] text-left p-2 text-sm font-semibold border">Product</th>
              <th className="w-[70px] text-right p-2 text-sm font-semibold border">Qty</th>
              <th className="w-[100px] text-right p-2 text-sm font-semibold border">Rate</th>
              <th className="w-[90px] text-left p-2 text-sm font-semibold border">Curr</th>
              <th className="w-[90px] text-right p-2 text-sm font-semibold border">ExRt</th>
              <th className="w-[90px] text-right p-2 text-sm font-semibold border">Tax</th>
              <th className="w-[100px] text-right p-2 text-sm font-semibold border">Dis A</th>
              <th className="w-[110px] text-right p-2 text-sm font-semibold border">Value</th>
              <th className="w-[40px] p-2 text-sm font-semibold border"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-1 text-sm">
                  <input
                    value={it.product}
                    onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </td>
                <td className="p-1 text-sm">
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                    className="border p-1 rounded w-full text-right"
                  />
                </td>
                <td className="p-1 text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={it.rate}
                    onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                    className="border p-1 rounded w-full text-right"
                  />
                </td>
                <td className="p-1 text-sm">
                  <input
                    value={it.curr}
                    onChange={(e) => handleItemChange(idx, 'curr', e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </td>
                <td className="p-1 text-sm">
                  <input
                    type="number"
                    value={it.exrt}
                    onChange={(e) => handleItemChange(idx, 'exrt', e.target.value)}
                    className="border p-1 rounded w-full text-right"
                  />
                </td>
                <td className="p-1 text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={it.tax}
                    onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                    className="border p-1 rounded w-full text-right"
                  />
                </td>
                <td className="p-1 text-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={it.disA}
                    onChange={(e) => handleItemChange(idx, 'disA', e.target.value)}
                    className="border p-1 rounded w-full text-right"
                  />
                </td>
                <td className="p-1 text-sm text-right">{money(it.value)}</td>
                <td className="p-2 text-sm text-center">
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length > 0 && (
          <div className="mt-3 border-t bg-gray-50 p-2 rounded">
            <div className="text-right font-semibold text-sm">Total: {money(total)}</div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="bg-white shadow-md rounded-xl p-3 w-full">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={saleRtIdToLoad}
            onChange={(e) => setSaleRtIdToLoad(e.target.value)}
            placeholder="Sale Return ID"
            className="border p-2 rounded-lg w-[180px] text-sm"
          />
          <button
            onClick={handleLoadClick}
            className="bg-green-600 text-white rounded-lg px-6 py-2 hover:bg-green-700 text-sm font-medium"
          >
            LOAD SALE
          </button>
          <button
            onClick={submitSaleReturn}
            className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 text-sm font-medium"
          >
            SUBMIT SALE
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-600 text-white rounded-lg px-6 py-2 hover:bg-gray-700 text-sm font-medium"
          >
            RESET FORM
          </button>
        </div>
      </div>

      {/* Modal: sale items */}
      {saleModal.isOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeSaleModal} />
          <div
            className="relative bg-white rounded-xl shadow-xl w-[min(95vw,1100px)] max-h-[85vh] overflow-hidden mx-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">
                Bill: {saleModal.billNo} — {saleModal.saleDate} (Sale ID: {saleModal.saleId})
              </h2>
            </div>
            <div className="p-4 overflow-auto max-h-[65vh]">
              <table className="w-full table-auto border border-gray-300 border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold border">Product</th>
                    <th className="text-right p-2 text-xs font-semibold border">B Qty</th>
                    <th className="text-right p-2 text-xs font-semibold border">R Qty</th>
                    <th className="text-right p-2 text-xs font-semibold border">T Qty</th>
                    <th className="text-right p-2 text-xs font-semibold border">Rate</th>
                    <th className="text-left p-2 text-xs font-semibold border">Curr</th>
                    <th className="text-right p-2 text-xs font-semibold border">ExRt</th>
                    <th className="text-right p-2 text-xs font-semibold border">Tax</th>
                    <th className="text-right p-2 text-xs font-semibold border">Dis A</th>
                    <th className="text-right p-2 text-xs font-semibold border">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {saleModal.items.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center text-gray-500 py-6">
                        No items found for this bill.
                      </td>
                    </tr>
                  ) : (
                    saleModal.items.map((r, idx) => (
                      <tr key={`${r.sale_det_id}-${idx}`} className="border-t">
                        <td className="p-2 text-sm">{r.product}</td>
                        <td className="p-2 text-sm text-right">{money(r.bqty)}</td>
                        <td className="p-2 text-sm text-right">{money(r.rqty)}</td>
                        <td className="p-2 text-sm text-right">
                          <input
                            type="number"
                            className="border p-1 rounded w-[100px] text-right"
                            value={r.tqty}
                            onChange={(e) => updateTqty(idx, e.target.value)}
                            min="0"
                            max={r.bqty - r.rqty}
                            step="1" 
                          />
                        </td>
                        <td className="p-2 text-sm text-right">{money(r.rate)}</td>
                        <td className="p-2 text-sm">{r.curr}</td>
                        <td className="p-2 text-sm text-right">{money(r.exrt)}</td>
                        <td className="p-2 text-sm text-right">{money(r.tax)}</td>
                        <td className="p-2 text-sm text-right">{money(r.disA)}</td>
                        <td className="p-2 text-sm text-right">{money(r.value)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                onClick={addSelectedFromModal}
                type="button"
              >
                Add Selected Items
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                onClick={closeSaleModal}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
