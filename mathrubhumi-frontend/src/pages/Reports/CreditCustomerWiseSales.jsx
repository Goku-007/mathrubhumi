import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/axiosInstance';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { getSession } from '../../utils/session';
import * as XLSX from 'xlsx';

export default function CreditCustomerWiseSales() {
  const { branch } = getSession();
  const branchId = branch?.id || null;

  const [formData, setFormData] = useState({
    date_from: '',
    date_to: '',
    credit_customer_id: '',
  });
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const customerSearchTimer = useRef(null);
  const customerRequestId = useRef(0);

  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    buttons: [],
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportParams, setReportParams] = useState(null);
  const reportRef = useRef(null);
  const [reportPage, setReportPage] = useState(1);

  useEffect(() => {
    // Set default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setFormData(prev => ({
      ...prev,
      date_from: firstDay.toISOString().split('T')[0],
      date_to: lastDay.toISOString().split('T')[0],
    }));
  }, []);

  const showModal = (message, type = 'info', buttons) => {
    setModal({
      isOpen: true,
      message,
      type,
      buttons:
        buttons ||
        [{ label: 'OK', onClick: () => closeModal(), className: 'bg-blue-500 hover:bg-blue-600' }],
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: '', type: 'info', buttons: [] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchCustomerSuggestions = async (query) => {
    const requestId = ++customerRequestId.current;
    setLoadingCustomers(true);
    try {
      const response = await api.get('/auth/remittance-customer-search/', {
        params: { q: query },
      });
      if (requestId !== customerRequestId.current) return;
      const results = Array.isArray(response.data) ? response.data : [];
      setCustomerSuggestions(results);
    } catch (error) {
      if (requestId !== customerRequestId.current) return;
      setCustomerSuggestions([]);
    } finally {
      if (requestId === customerRequestId.current) {
        setLoadingCustomers(false);
      }
    }
  };

  useEffect(() => {
    if (!showCustomerSuggestions) return;
    const query = customerQuery.trim();
    if (query.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    if (customerSearchTimer.current) {
      clearTimeout(customerSearchTimer.current);
    }
    customerSearchTimer.current = setTimeout(() => {
      fetchCustomerSuggestions(query);
    }, 250);
    return () => {
      if (customerSearchTimer.current) {
        clearTimeout(customerSearchTimer.current);
      }
    };
  }, [customerQuery, showCustomerSuggestions]);

  const handleCustomerInputChange = (e) => {
    const value = e.target.value;
    setCustomerQuery(value);
    if (value.trim() !== selectedCustomerName) {
      setFormData((prev) => ({ ...prev, credit_customer_id: '' }));
      setSelectedCustomerName('');
    }
    setShowCustomerSuggestions(true);
  };

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({ ...prev, credit_customer_id: customer.id }));
    setCustomerQuery(customer.customer_nm || '');
    setSelectedCustomerName(customer.customer_nm || '');
    setShowCustomerSuggestions(false);
    setCustomerSuggestions([]);
  };

  // Format number with Indian locale
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return decimals === 0 ? '0' : '0.00';
    const value = parseFloat(num);
    if (isNaN(value)) return decimals === 0 ? '0' : '0.00';
    return value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Format date as dd/MM/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get selected customer name
  const getSelectedCustomerName = () => {
    return selectedCustomerName || customerQuery.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date_from) {
      showModal('Please select a From Date', 'error');
      return;
    }

    if (!formData.date_to) {
      showModal('Please select a To Date', 'error');
      return;
    }

    if (!formData.credit_customer_id) {
      showModal('Please select a Credit Customer', 'error');
      return;
    }

    if (!branchId) {
      showModal('Branch information not found. Please log in again.', 'error');
      return;
    }

    if (new Date(formData.date_from) > new Date(formData.date_to)) {
      showModal('From Date cannot be greater than To Date', 'error');
      return;
    }

    try {
      setLoading(true);

      const response = await api.get('/auth/reports/credit-customer-wise-sales/', {
        params: {
          branch_id: branchId,
          date_from: formData.date_from,
          date_to: formData.date_to,
          credit_customer_id: formData.credit_customer_id,
        },
      });

      const data = response.data;

      if (data.report_data) {
        setReportData(data.report_data);
        setReportParams({ ...data.parameters, credit_customer_name: getSelectedCustomerName() });
      } else {
        showModal('No data found for the selected criteria.', 'warning');
      }

    } catch (error) {
      console.error('Error generating report:', error);
      showModal(
        `Failed to generate report: ${error.response?.data?.error || error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF using browser print
  const handleExportPDF = () => {
    if (!reportRef.current) return;

    const printContent = reportRef.current.innerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credit Customer Wise Sales Report</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Times New Roman', serif;
            margin: 20px;
            font-size: 11px;
            color: #000;
          }
          .report-header { margin-bottom: 15px; }
          .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .report-title { font-size: 14px; font-weight: bold; margin-bottom: 3px; }
          .report-subtitle { font-size: 11px; margin-bottom: 6px; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th, td {
            padding: 4px 6px;
            border: none;
            vertical-align: top;
          }
          th {
            border-top: 1px solid #b5b3b3;
            border-bottom: 1px solid #b5b3b3;
            text-align: left;
            font-weight: normal;
          }
          .text-right { text-align: right; }
          .grand-total td {
            font-weight: bold;
            font-size: 12px;
            border-top: 1px solid #b5b3b3;
            border-bottom: 2px double #b5b3b3;
            padding: 5px 6px;
          }
          @media print {
            body { margin: 10px; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${printContent}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Export to Excel using xlsx library
  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0) return;

    const excelData = [];
    let grandDiscountTotal = 0;
    let grandGrossTotal = 0;
    let grandNettTotal = 0;

    // Add header row
    excelData.push(['Sale Date', 'Bill No', 'Discount', 'Gross Sale', 'Nett Sale']);

    // Add data rows
    reportData.forEach(row => {
      excelData.push([
        row.sale_date || '',
        row.bill_no || '',
        row.total_discount || 0,
        row.gross_sale || 0,
        row.nett_sale || 0,
      ]);
      grandDiscountTotal += row.total_discount || 0;
      grandGrossTotal += row.gross_sale || 0;
      grandNettTotal += row.nett_sale || 0;
    });

    // Add grand total
    excelData.push(['Grand Total', '', grandDiscountTotal, grandGrossTotal, grandNettTotal]);

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Sale Date
      { wch: 14 }, // Bill No
      { wch: 12 }, // Discount
      { wch: 14 }, // Gross Sale
      { wch: 14 }, // Nett Sale
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Credit Customer Wise Sales');

    // Generate filename with date range
    const filename = `Credit_Customer_Wise_Sales_${formData.date_from}_to_${formData.date_to}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const cardClasses = "bg-white rounded-xl shadow-sm border border-gray-200/60";
  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  useEffect(() => {
    if (reportData) {
      setReportPage(1);
    }
  }, [reportData]);

  const reportPageSize = 50;
  const reportTotal = reportData?.length || 0;
  const reportTotalPages = reportTotal > 0 ? Math.ceil(reportTotal / reportPageSize) : 1;
  const reportStart = reportTotal === 0 ? 0 : (reportPage - 1) * reportPageSize + 1;
  const reportEnd = reportTotal === 0 ? 0 : Math.min(reportTotal, reportPage * reportPageSize);

  const pagedReportData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const start = (reportPage - 1) * reportPageSize;
    return reportData.slice(start, start + reportPageSize);
  }, [reportData, reportPage]);

  const grandTotals = useMemo(() => {
    if (!reportData || reportData.length === 0) {
      return { discount: 0, gross: 0, nett: 0 };
    }
    return reportData.reduce(
      (acc, row) => ({
        discount: acc.discount + (row.total_discount || 0),
        gross: acc.gross + (row.gross_sale || 0),
        nett: acc.nett + (row.nett_sale || 0),
      }),
      { discount: 0, gross: 0, nett: 0 }
    );
  }, [reportData]);

  // Render the report table
  const renderReport = () => {
    if (!reportData || reportData.length === 0) return null;

    return (
      <div ref={reportRef} className="bg-white">
        {/* Report Header */}
        <div className="report-header mb-4">
          <div className="company-name text-xl font-bold">{branch?.branches_nm || 'Company'}</div>
          <div className="report-title text-base font-bold mt-2">Sale Register (Credit Customer-wise)</div>
          <div className="report-subtitle text-sm text-gray-800 font-semibold mb-1">
            Customer: {reportParams?.credit_customer_name || ''}
          </div>
          <div className="report-subtitle text-sm text-gray-600">
            From {formatDate(reportParams?.date_from)} to {formatDate(reportParams?.date_to)}
          </div>
        </div>

        {/* Report Table */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-t border-b border-gray-300">
              <th className="py-2 px-1 text-left w-24">Sale Date</th>
              <th className="py-2 px-1 text-left w-28">Bill No</th>
              <th className="py-2 px-1 text-right w-24">Discount</th>
              <th className="py-2 px-1 text-right w-28">Gross Sale</th>
              <th className="py-2 px-1 text-right w-28">Nett Sale</th>
            </tr>
          </thead>
          <tbody>
            {pagedReportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-1 px-1 font-serif">{formatDate(row.sale_date)}</td>
                <td className="py-1 px-1 font-serif">{row.bill_no || ''}</td>
                <td className="py-1 px-1 text-right">{formatNumber(row.total_discount)}</td>
                <td className="py-1 px-1 text-right">{formatNumber(row.gross_sale)}</td>
                <td className="py-1 px-1 text-right">{formatNumber(row.nett_sale)}</td>
              </tr>
            ))}

            {/* Grand Total Row */}
            <tr className="grand-total border-t-2 border-b-2 border-gray-400">
              <td colSpan={2} className="py-2 px-1 font-bold text-sm text-right">Grand Total</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandTotals.discount)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandTotals.gross)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandTotals.nett)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
      />

      <PageHeader
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="Credit Customer Wise Sales"
        subtitle="Generate credit customer wise sales report"
      />

      <div className="mt-6 max-w-7xl mx-auto">
        {/* Filter Form */}
        <div className={cardClasses + " p-6 mb-6"}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Date From */}
              <div>
                <label htmlFor="date_from" className={labelClasses}>
                  Date From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  value={formData.date_from}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Date To */}
              <div>
                <label htmlFor="date_to" className={labelClasses}>
                  Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date_to"
                  name="date_to"
                  value={formData.date_to}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Credit Customer - Dropdown Select */}
              <div>
                <label htmlFor="credit_customer_id" className={labelClasses}>
                  Credit Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="credit_customer_id"
                    name="credit_customer_id"
                    value={customerQuery}
                    onChange={handleCustomerInputChange}
                    onFocus={() => setShowCustomerSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 150)}
                    className={inputClasses}
                    placeholder="Type customer name"
                    autoComplete="off"
                    required
                  />
                  {showCustomerSuggestions && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                      {customerQuery.trim().length < 2 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Type at least 2 characters to search.
                        </div>
                      )}
                      {customerQuery.trim().length >= 2 && customerSuggestions.length === 0 && loadingCustomers && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Loading customers...
                        </div>
                      )}
                      {customerQuery.trim().length >= 2 && customerSuggestions.length === 0 && !loadingCustomers && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No customers found.
                        </div>
                      )}
                      {customerSuggestions.map((customer) => (
                        <button
                          type="button"
                          key={customer.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleCustomerSelect(customer);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50"
                        >
                          {customer.customer_nm}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Branch Info */}
            {branchId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Branch:</span>{' '}
                  {branch?.branches_nm || `ID: ${branchId}`}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Report Display */}
        {reportData && reportData.length > 0 && (
          <div className={cardClasses + " p-6"}>
            {/* Export Buttons */}
            <div className="flex justify-end gap-3 mb-4 print:hidden">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Export Excel
              </button>
            </div>

            {/* Records Count */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-gray-600">
              <div>
                Showing {reportStart}-{reportEnd} of {reportTotal} records
              </div>
              {reportTotalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportPage((prev) => Math.max(1, prev - 1))}
                    disabled={reportPage === 1}
                    className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {reportPage} of {reportTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReportPage((prev) => Math.min(reportTotalPages, prev + 1))}
                    disabled={reportPage === reportTotalPages}
                    className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Report Content */}
            <div className="overflow-x-auto">
              {renderReport()}
            </div>
          </div>
        )}

        {/* No Data State */}
        {reportData && reportData.length === 0 && (
          <div className={cardClasses + " p-6 text-center text-gray-500"}>
            No records found for the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
