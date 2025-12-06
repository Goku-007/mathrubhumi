// src/pages/Transactions/CreditRealisationEntry.jsx
import React, { useRef, useState } from "react";
import api from "../../utils/axiosInstance";
import Modal from "../../components/Modal";

const today = () => new Date().toISOString().split("T")[0];

// Map Mode of Pay → a_type (smallint)
const A_TYPE = {
  Cash: 0,
  "Money Order": 1,
  "Cheque (Local Cleaning)": 2,
  "DD (Local Cleaning)": 3,
  "Cr/Dr Card": 4,
  "Cheque (HO Cleaning)": 5,
  "DD (HO Cleaning)": 6,
  "Digital Payment": 7,
};
const A_TYPE_INV = Object.fromEntries(
  Object.entries(A_TYPE).map(([k, v]) => [v, k])
);

export default function CreditRealisationEntry() {
  const [form, setForm] = useState({
    receiptNo: "",
    cancelled: "0", // 0 = No, 1 = Yes
    date: today(),
    name: "",
    address: "",
    modeOfPay: "Cash",
    amount: "",
    bank: "",
    chqdd: "",
    notes: "",
  });

  // Map the selected label to its numeric code
  const modeCode = A_TYPE[form.modeOfPay] ?? -1;
  // Activate for these codes
  const MODES_ACTIVATE_BANK = new Set([2, 3, 5, 6]);
  const bankFieldsActive = MODES_ACTIVATE_BANK.has(modeCode);
  // Styles/props for inactive state
  const baseInputClass = "border p-2 rounded-lg w-full text-sm";
  const inactiveClass = " bg-gray-100 text-gray-600 border-gray-200 select-none pointer-events-none";
  const commonInactiveProps = bankFieldsActive ? {} : { readOnly: true, tabIndex: -1, "aria-readonly": "true" };

  // Keep selected customer id (from suggestions)
  const [customerId, setCustomerId] = useState(null);

  const [loadCreditNo, setLoadCreditNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- Modal (same pattern used elsewhere) ---------- */
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "info", // "info" | "success" | "error" (your Modal can style these)
    buttons: [
      {
        label: "OK",
        onClick: () => closeModal(),
        className: "bg-blue-500 hover:bg-blue-600",
      },
    ],
  });

  const showModal = (
    message,
    type = "info",
    buttons = [
      {
        label: "OK",
        onClick: () => closeModal(),
        className: "bg-blue-500 hover:bg-blue-600",
      },
    ]
  ) => setModal({ isOpen: true, message, type, buttons });

  const closeModal = () =>
    setModal({ isOpen: false, message: "", type: "info", buttons: [] });

  /* ---------- suggestions for Name (cr_customers.customer_nm) ---------- */
  const [showNameSug, setShowNameSug] = useState(false);
  const [nameSug, setNameSug] = useState([]);

  const debounceRef = useRef(null);
  const runDebounced = (fn, delay = 250) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  };

  const fetchCustomers = (q) =>
    api
      .get("/auth/customer-search/", { params: { q } })
      .then((r) => (Array.isArray(r.data) ? r.data : []))
      .catch(() => []);

  const closeAfterBlur = (closer) => () => setTimeout(closer, 120);

  const handleNameChange = (e) => {
    handleChange(e);
    setCustomerId(null); // typing again clears chosen id
    const q = e.target.value.trim();
    setShowNameSug(!!q);
    if (!q) return setNameSug([]);
    runDebounced(async () => setNameSug(await fetchCustomers(q)));
  };

  /* ---------- generic form handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      receiptNo: "",
      cancelled: "0",
      date: today(),
      name: "",
      address: "",
      modeOfPay: "Cash",
      amount: "",
      bank: "",
      chqdd: "",
      notes: "",
    });
    setCustomerId(null);
  };

  const validate = () => {
    const errs = [];
    if (!form.date) errs.push("Date");
    if (!form.name || !customerId) errs.push("Name (pick from list)");
    const amt = parseFloat(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) errs.push("Amount");
    if (!form.modeOfPay) errs.push("Mode of Pay");

    if (errs.length) {
      showModal(
        "Please fix the following:<br/>• " + errs.join("<br/>• "),
        "error"
      );
      return false;
    }
    return true;
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      entry_date: form.date,
      customer_id: customerId,
      amount: parseFloat(form.amount),
      a_type: A_TYPE[form.modeOfPay] ?? 0,
      bank: form.bank || null,
      chq_dd_no: form.chqdd || null,
      note1: form.notes || null,
      cancelled: parseInt(form.cancelled, 10) || 0,
      // address is display-only; not stored in cr_realisation
    };

    try {
      setSaving(true);
      const res = await api.post("/auth/cr-realisation-save/", payload);
      const data = res?.data || {};
      setForm((p) => ({ ...p, receiptNo: String(data.receipt_no || p.receiptNo) }));
      showModal(data.message || "Credit realisation saved.", "success");
    } catch (e) {
      console.error(e);
      showModal(
        `Save failed: ${e?.response?.data?.error || e.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- LOAD BY RECEIPT NO ---------- */
  const handleLoad = async () => {
    const rn = (loadCreditNo || "").trim();
    if (!rn) {
      showModal("Enter a Receipt No to load.", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/auth/cr-realisation-by-no/", {
        params: { receipt_no: rn },
      });
      const r = res?.data || {};
      setForm({
        receiptNo: String(r.receipt_no ?? rn),
        cancelled: String(r.cancelled ?? "0"),
        date: r.entry_date || today(),
        name: r.customer_nm || "",
        address: r.address || "",
        modeOfPay: A_TYPE_INV?.[r.a_type ?? 0] || "Cash",
        amount: r.amount != null ? String(r.amount) : "",
        bank: r.bank || "",
        chqdd: r.chq_dd_no || "",
        notes: r.note1 || "",
      });
      setCustomerId(r.customer_id ?? null);
      showModal(`Credit ${rn} loaded successfully.`, "success");
    } catch (e) {
      console.error(e);
      showModal(
        `Load failed: ${e?.response?.data?.error || e.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => window.location.reload();

  return (
    <div className="flex flex-col min-h-screen w-[99%] mx-auto p-3 space-y-3">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      {/* Main Form */}
      <div className="bg-white shadow-md rounded-xl p-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Receipt No */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Receipt No</label>
            <input
              name="receiptNo"
              value={form.receiptNo}
              readOnly
              tabIndex={-1}                 // not focusable via keyboard
              aria-readonly="true"
              className="border p-2 rounded-lg w-full text-sm bg-gray-100 text-gray-600 border-gray-200 select-none pointer-events-none"
            />
          </div>

          {/* Cancelled */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Cancelled ?</label>
            <select
              name="cancelled"
              value={form.cancelled}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full text-sm"
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full text-sm"
            />
          </div>

          {/* spacer */}
          <div className="invisible pointer-events-none select-none" aria-hidden="true" />

          {/* Name + suggestions */}
          <div className="flex flex-col lg:col-span-2 relative">
            <label className="text-xs text-gray-600 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleNameChange}
              onBlur={closeAfterBlur(() => setShowNameSug(false))}
              className="border p-2 rounded-lg w-full text-sm"
              placeholder="Start typing customer name…"
              autoComplete="off"
            />
            {showNameSug && nameSug.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {nameSug.map((c) => (
                  <li
                    key={c.id}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => {
                      setForm((p) => ({...p, name: c.customer_nm || "", address: [c.address_1, c.address_2, c.city].filter(Boolean).join(", "),}));
                      setCustomerId(c.id ?? null);
                      setShowNameSug(false);
                    }}
                  >
                    {c.customer_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Address (display-only) */}
          <div className="flex flex-col lg:col-span-2">
            <label className="text-xs text-gray-600 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              rows={2}
              readOnly
              tabIndex={-1}                 // not focusable via keyboard
              aria-readonly="true"
              className="border p-2 rounded-lg w-full text-sm bg-gray-100 text-gray-600 border-gray-200 select-none pointer-events-none"
            />
          </div>

          {/* Mode of Pay */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Mode of Pay</label>
            <select
              name="modeOfPay"
              value={form.modeOfPay}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full text-sm"
            >
              {Object.keys(A_TYPE).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="border p-2 rounded-lg w-full text-sm text-right"
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>

          {/* Bank */}
          <div className="flex flex-col lg:col-span-2">
            <label className="text-xs text-gray-600 mb-1">Bank</label>
            <input
              name="bank"
              value={form.bank}
              onChange={handleChange}
              className={baseInputClass + (bankFieldsActive ? "" : inactiveClass)}
              {...commonInactiveProps}
            />
          </div>

          {/* Chq/DD No */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Chq/DD No</label>
            <input
              name="chqdd"
              value={form.chqdd}
              onChange={handleChange}
              className={baseInputClass + (bankFieldsActive ? "" : inactiveClass)}
              {...commonInactiveProps}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col lg:col-span-3">
            <label className="text-xs text-gray-600 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="border p-2 rounded-lg w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="bg-white shadow-md rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* LEFT: Save / New / Reset */}
          <button
            type="button"
            disabled={saving}
            className={`rounded-lg px-6 py-2 text-sm font-medium text-white ${
              saving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={handleSave}
          >
            {saving ? "SAVING…" : "SAVE CREDIT REALSATION"}
          </button>

          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
            onClick={resetForm}
          >
            NEW
          </button>

          <button
            type="button"
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
            onClick={handleReset}
          >
            RESET
          </button>

          {/* RIGHT: Load by Receipt No */}
          <div className="ml-auto flex items-center gap-2">
            <input
              type="number"
              value={loadCreditNo}
              onChange={(e) => setLoadCreditNo(e.target.value)}
              placeholder="Receipt No"
              className="border p-2 rounded-lg w-[160px] text-sm text-right"
            />
            <button
              type="button"
              className={`text-white rounded-lg px-5 py-2 text-sm font-medium ${
                loading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              onClick={handleLoad}
              title="Load credit by receipt no"
              disabled={loading}
            >
              {loading ? "LOADING…" : "LOAD CREDIT REALISATION"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
