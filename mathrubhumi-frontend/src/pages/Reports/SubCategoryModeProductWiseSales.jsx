import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/axiosInstance';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { getSession } from '../../utils/session';
import * as XLSX from 'xlsx';

export default function SubCategoryModeProductWiseSales() {
  const { branch } = getSession();
  const branchId = branch?.id || null;

  const [formData, setFormData] = useState({
    date_from: '',
    date_to: '',
  });
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

  // Format number with comma separators and 2 decimal places
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0.00';
    const value = parseFloat(num);
    if (isNaN(value)) return '0.00';
    if (value < 0) {
      return Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '-';
    }
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format integer number
  const formatInteger = (num) => {
    if (num === null || num === undefined) return '0';
    const value = parseInt(num, 10);
    if (isNaN(value)) return '0';
    return value.toLocaleString('en-IN');
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

      const response = await api.get('/auth/reports/sub-category-mode-product-wise-sales/', {
        params: {
          branch_id: branchId,
          date_from: formData.date_from,
          date_to: formData.date_to,
        },
      });

      const data = response.data;

      if (data.report_data) {
        setReportData(data.report_data);
        setReportParams(data.parameters);
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
        <title>Sub-Category Mode Product-Wise Sales Report</title>
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
          .report-subtitle { font-size: 11px; margin-bottom: 15px; }
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
          .sub-category-header { font-weight: bold; }
          .sub-category-total td, .grand-total td {
            font-weight: bold;
            border-top: 1px solid #b5b3b3;
            border-bottom: 1px solid #b5b3b3;
            padding: 5px 6px;
          }
          .grand-total td {
            font-size: 12px;
            border-bottom: 2px double #b5b3b3;
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
    let grandQtyTotal = 0;
    let grandDiscountTotal = 0;
    let grandGrossTotal = 0;
    let grandNettTotal = 0;

    // Add header row
    excelData.push(['Sub-Category', 'Mode', 'Title', 'Quantity', 'Discount', 'Gross', 'Nett']);

    // Add data rows
    reportData.forEach(row => {
      excelData.push([
        row.sub_category_nm || '',
        row.mode || '',
        row.title || '',
        row.quantity || 0,
        row.total_discount || 0,
        row.gross_sale || 0,
        row.nett_sale || 0,
      ]);
      grandQtyTotal += row.quantity || 0;
      grandDiscountTotal += row.total_discount || 0;
      grandGrossTotal += row.gross_sale || 0;
      grandNettTotal += row.nett_sale || 0;
    });

    // Add grand total
    excelData.push(['Grand Total', '', '', grandQtyTotal, grandDiscountTotal, grandGrossTotal, grandNettTotal]);

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 22 }, // Sub-Category
      { wch: 12 }, // Mode
      { wch: 40 }, // Title
      { wch: 10 }, // Quantity
      { wch: 14 }, // Discount
      { wch: 14 }, // Gross
      { wch: 14 }, // Nett
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sub-Category Mode Product-Wise');

    // Generate filename with date range
    const filename = `Sub-Category_Mode_Product-Wise_Sales_${formData.date_from}_to_${formData.date_to}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const cardClasses = "bg-white rounded-xl shadow-sm border border-gray-200/60";
  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  // Render the report table matching JasperReports format with sub category grouping
  const renderReport = () => {
    if (!reportData || reportData.length === 0) return null;

    // Group data by sub category
    const groupedData = {};
    reportData.forEach(row => {
      const category = row.sub_category_nm || 'Unknown Sub-Category';
      if (!groupedData[category]) {
        groupedData[category] = [];
      }
      groupedData[category].push(row);
    });

    let grandQtyTotal = 0;
    let grandDiscountTotal = 0;
    let grandGrossTotal = 0;
    let grandNettTotal = 0;

    return (
      <div ref={reportRef} className="bg-white">
        {/* Report Header */}
        <div className="report-header mb-4">
          <div className="company-name text-xl font-bold">{branch?.branches_nm || 'Company'}</div>
          <div className="report-title text-base font-bold mt-2">Sub-Category Mode Product-Wise Sales</div>
          <div className="report-subtitle text-sm text-gray-600">
            From {formatDate(reportParams?.date_from)} to {formatDate(reportParams?.date_to)}
          </div>
        </div>

        {/* Report Table */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-t border-b border-gray-300">
              <th className="py-2 px-1 text-left w-20">Mode</th>
              <th className="py-2 px-1 text-left">Title</th>
              <th className="py-2 px-1 text-right w-12">Qty</th>
              <th className="py-2 px-1 text-right w-20">Discount</th>
              <th className="py-2 px-1 text-right w-20">Gross</th>
              <th className="py-2 px-1 text-right w-20">Nett</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([category, rows]) => {
              let subQtyTotal = 0;
              let subDiscountTotal = 0;
              let subGrossTotal = 0;
              let subNettTotal = 0;

              return (
                <React.Fragment key={category}>
                  {/* Sub-Category Header */}
                  <tr className="sub-category-header bg-gray-50">
                    <td colSpan={6} className="py-2 px-1 font-bold">{category}</td>
                  </tr>

                  {/* Sub-Category Items */}
                  {rows.map((row, index) => {
                    subQtyTotal += row.quantity || 0;
                    subDiscountTotal += row.total_discount || 0;
                    subGrossTotal += row.gross_sale || 0;
                    subNettTotal += row.nett_sale || 0;
                    grandQtyTotal += row.quantity || 0;
                    grandDiscountTotal += row.total_discount || 0;
                    grandGrossTotal += row.gross_sale || 0;
                    grandNettTotal += row.nett_sale || 0;

                    return (
                      <tr key={`${category}-${index}`} className="hover:bg-gray-50">
                        <td className="py-1 px-1 font-serif">{row.mode || ''}</td>
                        <td className="py-1 px-1 font-serif">{row.title || ''}</td>
                        <td className="py-1 px-1 text-right">{formatInteger(row.quantity)}</td>
                        <td className="py-1 px-1 text-right">{formatNumber(row.total_discount)}</td>
                        <td className="py-1 px-1 text-right">{formatNumber(row.gross_sale)}</td>
                        <td className="py-1 px-1 text-right">{formatNumber(row.nett_sale)}</td>
                      </tr>
                    );
                  })}

                  {/* Sub-Category Total Row */}
                  <tr className="sub-category-total border-t border-b border-gray-300">
                    <td colSpan={2} className="py-2 px-1 font-bold">Sub-Category Total</td>
                    <td className="py-2 px-1 text-right font-bold">{formatInteger(subQtyTotal)}</td>
                    <td className="py-2 px-1 text-right font-bold">{formatNumber(subDiscountTotal)}</td>
                    <td className="py-2 px-1 text-right font-bold">{formatNumber(subGrossTotal)}</td>
                    <td className="py-2 px-1 text-right font-bold">{formatNumber(subNettTotal)}</td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Grand Total Row */}
            <tr className="grand-total border-t-2 border-b-2 border-gray-400">
              <td colSpan={2} className="py-2 px-1 font-bold text-sm">Grand Total</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatInteger(grandQtyTotal)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandDiscountTotal)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandGrossTotal)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandNettTotal)}</td>
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
        title="Sub-Category Mode Product-Wise Sales"
        subtitle="Generate sub-category mode product-wise sales report"
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

              {/* Generate Button */}
              <div className="flex items-end md:col-span-2">
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
            <div className="mb-4 text-sm text-gray-600">
              Total Records: {reportData.length}
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
