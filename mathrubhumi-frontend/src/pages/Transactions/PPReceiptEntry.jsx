import React, { useMemo, useRef, useState } from "react";
import api from "../../utils/axiosInstance";
import Modal from "../../components/Modal";

/* ---------- tiny helpers ---------- */
const today = () => new Date().toISOString().split("T")[0];
const asInt = (v, d = null) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};
const asFloat = (v, d = null) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

/* ---------- enum maps ---------- */
const R_TYPE = {
  "Registration": 0,
  "Registration for existing PP Members": 1,
  "Installment": 2,
};
const R_TYPE_INV = Object.fromEntries(Object.entries(R_TYPE).map(([k, v]) => [v, k]));

const A_TYPE = {
  "Cash": 0,
  "Money Order": 1,
  "Cheque": 2,
  "Demand Draft": 3,
  "Cr/Dr Card": 4,
  "Digital payment": 5,
};
const A_TYPE_INV = Object.fromEntries(Object.entries(A_TYPE).map(([k, v]) => [v, k]));

export default function PPReceiptEntry() {
  const [form, setForm] = useState({
    receiptType: "Registration",
    receiptNo: "",
    cancelled: "0",
    date: today(),
    ppRegNo: "",
    bookName: "",
    copies: "",
    installments: "",
    name: "",
    address1: "",
    address2: "",
    city: "",
    pin: "",
    phone: "",
    modeOfPay: "Cash",
    amount: "",
    bank: "",
    chqdd: "",
    agent: "",
    notes: "",
  });

  // keep selected IDs from suggestions
  const [ppBookId, setPpBookId] = useState(null);
  const [ppCustomerId, setPpCustomerId] = useState(null);
  const [agentId, setAgentId] = useState(null);

  /* ---------- Modal (same pattern as Sale pages) ---------- */
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "info",
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

  /* ---------- suggestions state ---------- */
  const [showBookSuggestions, setShowBookSuggestions] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState([]);

  const [showPPCustomerSuggestions, setShowPPCustomerSuggestions] = useState(false);
  const [ppCustomerSuggestions, setPPCustomerSuggestions] = useState([]);

  const [showAgentSuggestions, setShowAgentSuggestions] = useState(false);
  const [agentSuggestions, setAgentSuggestions] = useState([]);

  /* ---------- debounce helper ---------- */
  const debounceRef = useRef(null);
  const runDebounced = (fn, delay = 250) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  };

	const isCheque = useMemo(() => {
    const chequeTypes = [
      "Cheque",
      "Demand Draft",
    ];
    return chequeTypes.includes(form.modeOfPay);
    }, [form.modeOfPay]);
  const baseInputClass = "border p-2 rounded-lg w-full text-sm";
  const inactiveClass = " bg-gray-100 text-gray-600 border-gray-200 select-none pointer-events-none";
  const commonInactiveProps = isCheque ? {} : { readOnly: true, tabIndex: -1, "aria-readonly": "true" };

  /* ---------- API fetchers ---------- */
  const fetchBooks = (q) =>
    api
      .get(`/auth/pp-books-title-search/`, { params: { q } })
      .then((r) => (Array.isArray(r.data) ? r.data : []))
      .catch(() => []);

  const fetchPPCustomers = (q) =>
    api
      .get(`/auth/pp-customers-name-search/`, { params: { q } })
      .then((r) => (Array.isArray(r.data) ? r.data : []))
      .catch(() => []);

  const fetchAgents = (q) =>
    api
      .get(`/auth/agents-name-search/`, { params: { q } })
      .then((r) => (Array.isArray(r.data) ? r.data : []))
      .catch(() => []);

  /* ---------- change handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleBookChange = (e) => {
    handleChange(e);
    setPpBookId(null);
    const q = e.target.value.trim();
    setShowBookSuggestions(!!q);
    if (!q) return setBookSuggestions([]);
    runDebounced(async () => setBookSuggestions(await fetchBooks(q)));
  };

  const handlePPCustomerChange = (e) => {
    handleChange(e);
    setPpCustomerId(null);
    const q = e.target.value.trim();
    setShowPPCustomerSuggestions(!!q);
    if (!q) return setPPCustomerSuggestions([]);
    runDebounced(async () => setPPCustomerSuggestions(await fetchPPCustomers(q)));
  };

  const handleAgentChange = (e) => {
    handleChange(e);
    setAgentId(null);
    const q = e.target.value.trim();
    setShowAgentSuggestions(!!q);
    if (!q) return setAgentSuggestions([]);
    runDebounced(async () => setAgentSuggestions(await fetchAgents(q)));
  };

  // close popover a tick after blur so clicks register
  const closeAfterBlur = (closer) => () => setTimeout(closer, 120);

  const isCancelled = useMemo(() => form.cancelled === "1", [form.cancelled]);

  /* ---------- computed: disable Receipt No + disable many fields for Installment ---------- */
  const isReceiptNoDisabled = useMemo(
    () =>
      form.receiptType === "Registration" ||
      form.receiptType === "Registration for existing PP Members",
    [form.receiptType]
  );

  const isInstallment = form.receiptType === "Installment";

  /* ---------- SAVE (calls the PL/pgSQL procedure) ---------- */
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errors = [];
    if (!form.date) errors.push("Date");
    if (!form.bookName || !ppBookId) errors.push("PP Book Name (pick from list)");
    if (!form.amount || asFloat(form.amount) <= 0) errors.push("Amount");
    if (!form.copies) errors.push("Copies");
    if (!form.installments) errors.push("Installments");
    if (!form.modeOfPay) errors.push("Mode of Pay");
    if (errors.length) {
      showModal(
        "Please fill the following fields:<br/>• " + errors.join("<br/>• "),
        "error"
      );
      return false;
    }
    return true;
  };

  const saveReceipt = async () => {
    if (!validate()) return;

    const r_type = R_TYPE[form.receiptType] ?? 0;
    const a_type = A_TYPE[form.modeOfPay] ?? 0;

    const payload = {
      company_id: 1,
      id: 1,
      receipt_no: asInt(form.receiptNo, null),
      entry_date: form.date,
      customer_id: 2,
      pp_customer_id: ppCustomerId,
      amount: asFloat(form.amount, 0),
      name: form.name,
      address1: form.address1 || null,
      address2: form.address2 || null,
      r_type,
      a_type,
      bank: form.bank || null,
      chq_dd_no: form.chqdd || null,
      reg_no: form.ppRegNo || null,
      pp_book_id: ppBookId,
      installments: form.installments || null,
      note1: form.notes || null,
      copies: asInt(form.copies, 0),
      agent_id: agentId,
      city: form.city || null,
      pin: form.pin || null,
      telephone: form.phone || null,
      exhibition_id: 0,
      user_id: null,
      pp_customer_book_id: 0,
      which: "I",
    };

    try {
      setSaving(true);
      const res = await api.post("/auth/pp-receipts-iud/", payload);
      showModal(res?.data?.message || "Receipt saved successfully.", "success");
      setForm((p) => ({ ...p, receiptNo: res?.data?.receipt_no ?? p.receiptNo }));
    } catch (e) {
      console.error(e);
      showModal(
        `Failed to save receipt: ${e?.response?.data?.error || e.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------- LOAD BY RECEIPT NO (existing) ---------- */
  const [loadReceiptNo, setLoadReceiptNo] = useState("");
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const loadReceipt = async () => {
    const rn = (loadReceiptNo || "").trim();
    if (!rn) {
      showModal("Enter a Receipt No to load.", "error");
      return;
    }
    try {
      setLoadingReceipt(true);
      const res = await api.get("/auth/pp-receipt-by-no/", { params: { receipt_no: rn } });
      const r = res.data;

      const receiptType = R_TYPE_INV[r.r_type] ?? "Registration";
      const modeOfPay = A_TYPE_INV[r.a_type] ?? "Cash";

      setForm({
        receiptType,
        receiptNo: String(r.receipt_no ?? ""),
        cancelled: "0",
        date: r.entry_date || today(),
        ppRegNo: r.reg_no || "",
        bookName: r.title || "",
        copies: r.copies != null ? String(r.copies) : "",
        installments: r.installments || "",
        name: r.pp_customer_nm || "",
        address1: r.address1 || "",
        address2: r.address2 || "",
        city: r.city || "",
        pin: r.pin || "",
        phone: r.telephone || "",
        modeOfPay,
        amount: r.amount != null ? String(r.amount) : "",
        bank: r.bank || "",
        chqdd: r.chq_dd_no || "",
        agent: r.agent_nm || "",
        notes: r.note1 || "",
      });

      setPpBookId(r.pp_book_id ?? null);
      setPpCustomerId(r.pp_customer_id ?? null);
      setAgentId(r.agent_id ?? null);

      showModal(`Receipt ${r.receipt_no} loaded successfully.`, "success");
    } catch (e) {
      console.error(e);
      showModal(
        `Failed to load receipt: ${e?.response?.data?.error || e.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setLoadingReceipt(false);
    }
  };

  /* ---------- NEW: Prefill for Installment by PP Reg. No on ENTER ---------- */
  const [prefilling, setPrefilling] = useState(false);
  const prefillFromRegNo = async () => {
    const reg = (form.ppRegNo || "").trim();
    if (!reg) {
      showModal("Enter a PP Reg. No to prefill.", "error");
      return;
    }
    if (!isInstallment) return; // strictly only for Installment mode
    try {
      setPrefilling(true);
      const res = await api.get("/auth/pp-installment-prefill/", { params: { reg_no: reg } });
      const d = res.data;

      // fill display fields
      setForm((p) => ({
        ...p,
        bookName: d.title || "",
        copies: d.copies != null ? String(d.copies) : "",
        name: d.pp_customer_nm || "",
        address1: d.address1 || "",
        address2: d.address2 || "",
        city: d.city || "",
        pin: d.pin || "",
        phone: d.telephone || "",
      }));

      // capture ids for saving
      setPpBookId(d.pp_book_id ?? null);
      setPpCustomerId(d.pp_customer_id ?? null);

      showModal("Details loaded from PP Reg. No.", "success");
    } catch (e) {
      console.error(e);
      showModal(
        `Prefill failed: ${e?.response?.data?.error || e.message || "Not found / error"}`,
        "error"
      );
    } finally {
      setPrefilling(false);
    }
  };

  const handleRegNoKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isInstallment) prefillFromRegNo();
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="flex flex-col min-h-screen w-[99%] mx-auto p-3 space-y-3">
      {/* Modal (notification popup) */}
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      {/* Header card */}
      <div className="bg-white shadow-md rounded-xl p-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Receipt Type</label>
            <select
              name="receiptType"
              value={form.receiptType}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full text-sm"
            >
              {Object.keys(R_TYPE).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col cursor-not-allowed">
            <label className="text-xs text-gray-600 mb-1">Receipt No</label>
            <input
              name="receiptNo"
              value={form.receiptNo}
              readOnly
              tabIndex={-1}                 // not focusable via keyboard
              aria-readonly="true"
              className="border p-2 rounded-lg w-full text-sm bg-gray-100 text-gray-600 border-gray-200 select-none pointer-events-none  // blocks clicks & caret"
            />
          </div>

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

          <div className="flex flex-col lg:col-span-1">
            <label className="text-xs text-gray-600 mb-1">PP Reg. No</label>
            <input
          name="ppRegNo"
              value={form.ppRegNo}
              onChange={handleChange}
              onKeyDown={handleRegNoKey}         // Enter will only act when isInstallment is true (see your handler)
              readOnly={!isInstallment}          // <- key line: read-only when NOT Installment
              aria-readonly={!isInstallment}
              className={`
                border p-2 rounded-lg w-full text-sm
                read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200
              `}
              placeholder=""
            />
          </div>

          <div className="invisible lg:col-span-3 pointer-events-none select-none" aria-hidden="true" />
        </div>
      </div>

      {/* Main form */}
      <div className="bg-white shadow-md rounded-xl p-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* PP Book Name + suggestions */}
          <div className="relative lg:col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">PP Book Name</label>
            <input
              name="bookName"
              value={form.bookName}
              onChange={handleBookChange}
              onBlur={closeAfterBlur(() => setShowBookSuggestions(false))}
              placeholder="Start typing to search…"
              className={`border p-2 rounded-lg w-full text-sm ${
                isInstallment ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              autoComplete="off"
              disabled={isInstallment}
            />
            {showBookSuggestions && !isInstallment && bookSuggestions.length > 0 && (
              <ul className="absolute z-50 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {bookSuggestions.map((row, i) => (
                  <li
                    key={`${row.id ?? i}`}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => {
                      setForm((p) => ({ ...p, bookName: row.title || "" }));
                      setPpBookId(row.id ?? null);
                      setShowBookSuggestions(false);
                    }}
                  >
                    {row.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Copies / Installments */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Copies</label>
              <input
                type="number"
                name="copies"
                value={form.copies}
                onChange={handleChange}
                className={`border p-2 rounded-lg w-full text-sm text-right ${
                  isInstallment ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={isInstallment}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Installments</label>
              <input
                name="installments"
                value={form.installments}
                onChange={handleChange}
                placeholder=""
                className="border p-2 rounded-lg w-full text-sm"
              />
            </div>
          </div>

          {/* PP Customer Name + suggestions */}
          <div className="relative lg:col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">PP Customer Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handlePPCustomerChange}
              onBlur={closeAfterBlur(() => setShowPPCustomerSuggestions(false))}
              className={`border p-2 rounded-lg w-full text-sm ${
                isCancelled ? "bg-gray-100" : "bg-white"
              } ${isInstallment ? "read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200" : ""}`}
              placeholder="Type customer name…"
              autoComplete="off"
              disabled={isInstallment}
            />
            {showPPCustomerSuggestions && !isInstallment && ppCustomerSuggestions.length > 0 && (
              <ul className="absolute z-40 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {ppCustomerSuggestions.map((m, i) => (
                  <li
                    key={`${m.id ?? i}`}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => {
                      setForm((p) => ({ ...p, name: m.pp_customer_nm || "" }));
                      setPpCustomerId(m.id ?? null);
                      setShowPPCustomerSuggestions(false);
                    }}
                  >
                    {m.pp_customer_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="invisible lg:col-span-2 pointer-events-none select-none" aria-hidden="true" />

          {/* Address 1 */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Address 1</label>
            <input
              name="address1"
              value={form.address1}
              onChange={handleChange}
              className={`border p-2 rounded-lg w-full text-sm ${
                isCancelled ? "bg-gray-100" : "bg-white"
              } ${isInstallment ? "read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200" : ""}`}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isInstallment}
            />
          </div>

          {/* Address 2 */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Address 2</label>
            <input
              name="address2"
              value={form.address2}
              onChange={handleChange}
              className={`border p-2 rounded-lg w-full text-sm ${
                isCancelled ? "bg-gray-100" : "bg-white"
              } ${isInstallment ? "read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200" : ""}`}
              placeholder=""
              disabled={isInstallment}
            />
          </div>

          {/* City + Pin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className={`border p-2 rounded-lg w-full text-sm ${
                  isCancelled ? "bg-gray-100" : "bg-white"
                } ${isInstallment ? "read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200" : ""}`}
                placeholder=""
                disabled={isInstallment}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Pin</label>
              <input
                name="pin"
                value={form.pin}
                onChange={handleChange}
                className={`border p-2 rounded-lg w-full text-sm ${
                  isCancelled ? "bg-gray-100" : "bg-white"
                } ${isInstallment ? "read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200" : ""}`}
                placeholder=""
                disabled={isInstallment}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`border p-2 rounded-lg w-full text-sm ${
                isCancelled ? "bg-gray-100" : "bg-white"
              } ${isInstallment ? "read-only:bg-gray-100 read-only:text-gray-600 read-only:border-gray-200" : ""}`}
              placeholder=""
              disabled={isInstallment}
            />
          </div>

          {/* Mode of Pay */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Mode of Pay</label>
            <select
              name="modeOfPay"
              value={form.modeOfPay}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full text-sm"
            >
              {Object.keys(A_TYPE).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Amount</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder=""
              className="border p-2 rounded-lg w-full text-sm text-right"
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>

          {/* Bank */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Bank</label>
            <input
              name="bank"
              value={form.bank}
              onChange={handleChange}
              className={baseInputClass + (isCheque ? "" : inactiveClass)}
              {...commonInactiveProps}
            />
          </div>

          {/* Chq/DD No */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Chq/DD No</label>
            <input
              name="chqdd"
              value={form.chqdd}
              onChange={handleChange}
              className={baseInputClass + (isCheque ? "" : inactiveClass)}
              {...commonInactiveProps}
            />
          </div>

          {/* Agent + suggestions */}
          <div className="relative">
            <label className="text-xs text-gray-600 mb-1 block">Agent</label>
            <input
              name="agent"
              value={form.agent}
              onChange={handleAgentChange}
              onBlur={closeAfterBlur(() => setShowAgentSuggestions(false))}
              className="border p-2 rounded-lg w-full text-sm"
              autoComplete="off"
              placeholder=""
            />
            {showAgentSuggestions && agentSuggestions.length > 0 && (
              <ul className="absolute z-40 bg-white border mt-1 w-full shadow-md rounded-lg text-sm max-h-48 overflow-y-auto">
                {agentSuggestions.map((a, i) => (
                  <li
                    key={`${a.id ?? i}`}
                    className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => {
                      setForm((p) => ({ ...p, agent: a.agent_nm || "" }));
                      setAgentId(a.id ?? null);
                      setShowAgentSuggestions(false);
                    }}
                  >
                    {a.agent_nm}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Notes */}
          <div className="lg:col-span-4">
            <label className="text-xs text-gray-600 mb-1 block">Notes</label>
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
        <div className="flex flex-wrap gap-3 items-center w-full">
          <button
            type="button"
            disabled={saving}
            className={`rounded-lg px-6 py-2 text-sm font-medium text-white ${
              saving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={saveReceipt}
            title="Calls the stored procedure to insert the receipt"
          >
            {saving ? "SAVING…" : "SAVE RECEIPT"}
          </button>

          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
            onClick={() =>
              setForm({
                receiptType: "Installment",
                receiptNo: "",
                cancelled: "0",
                date: today(),
                ppRegNo: "",
                bookName: "",
                copies: "",
                installments: "",
                name: "",
                address1: "",
                address2: "",
                city: "",
                pin: "",
                phone: "",
                modeOfPay: "Cash",
                amount: "",
                bank: "",
                chqdd: "",
                agent: "",
                notes: "",
              })
            }
          >
            NEW
          </button>

          <button
            type="button"
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
            onClick={() => window.location.reload()}
          >
            RESET
          </button>

          {/* RIGHT-SIDE: Load by Receipt No */}
          <div className="ml-auto flex items-center gap-2">
            <input
              type="number"
              value={loadReceiptNo}
              onChange={(e) => setLoadReceiptNo(e.target.value)}
              placeholder="Receipt No"
              className="border p-2 rounded-lg w-[160px] text-sm text-right"
            />
            <button
              type="button"
              className={`text-white rounded-lg px-5 py-2 text-sm font-medium ${
                loadingReceipt ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              onClick={loadReceipt}
              title="Load an existing receipt by receipt number"
              disabled={loadingReceipt}
            >
              {loadingReceipt ? "LOADING…" : "LOAD RECEIPT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
