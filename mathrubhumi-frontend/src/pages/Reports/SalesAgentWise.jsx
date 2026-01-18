import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/axiosInstance';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { getSession } from '../../utils/session';
import * as XLSX from 'xlsx';

export default function SalesAgentWise() {
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
    // Handle negative values with trailing minus
    if (value < 0) {
      return Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '-';
    }
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  // Group data by agent and then by date
  const groupByAgentAndDate = (data) => {
    const groups = {};
    data.forEach(row => {
      const agentKey = row.agent || 'Unknown';
      const dateKey = row.sale_date || 'Unknown';
      if (!groups[agentKey]) {
        groups[agentKey] = {};
      }
      if (!groups[agentKey][dateKey]) {
        groups[agentKey][dateKey] = [];
      }
      groups[agentKey][dateKey].push(row);
    });
    return groups;
  };

  // Calculate totals for a group of rows
  const calculateTotals = (rows) => {
    return rows.reduce((acc, row) => ({
      gross: acc.gross + (row.gross_sale || 0),
      discount: acc.discount + (row.total_discount || 0),
      nett: acc.nett + (row.nett_sale || 0),
    }), { gross: 0, discount: 0, nett: 0 });
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

      const response = await api.get('/auth/reports/sales-agent-wise/', {
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
        <title>Sales Agent-Wise Report</title>
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
          .agent-header { 
            font-weight: bold; 
            padding: 8px 0 4px 0;
          }
          .date-header { 
            font-weight: bold; 
            padding: 6px 0 3px 20px;
          }
          .daily-total td { 
            font-weight: bold; 
            border-top: 1px solid #b5b3b3;
            border-bottom: 1px solid #b5b3b3;
            padding: 4px 6px;
          }
          .agent-total td { 
            font-weight: bold;
            border-top: 1px solid #b5b3b3;
            border-bottom: 1px solid #b5b3b3;
            padding: 5px 6px;
          }
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

    const groupedData = groupByAgentAndDate(reportData);
    const excelData = [];
    let grandTotals = { gross: 0, discount: 0, nett: 0 };

    // Add header row
    excelData.push(['Agent', 'Sale Date', 'Sale Type', 'Gross Sale', 'Nett Sale', 'Total Discount']);

    Object.keys(groupedData).sort().forEach(agentKey => {
      const agentData = groupedData[agentKey];
      let agentTotals = { gross: 0, discount: 0, nett: 0 };

      // Add agent header
      excelData.push([agentKey, '', '', '', '', '']);

      Object.keys(agentData).sort().forEach(dateKey => {
        const rows = agentData[dateKey];
        const dailyTotals = calculateTotals(rows);

        // Add date header
        excelData.push(['', formatDate(dateKey), '', '', '', '']);

        // Add data rows
        rows.forEach(row => {
          excelData.push([
            '',
            '',
            row.sale_type || '',
            row.gross_sale || 0,
            row.nett_sale || 0,
            row.total_discount || 0,
          ]);
        });

        // Add daily total
        excelData.push(['', '', 'Daily Total', dailyTotals.gross, dailyTotals.nett, dailyTotals.discount]);
        excelData.push([]); // Empty row for spacing

        agentTotals.gross += dailyTotals.gross;
        agentTotals.discount += dailyTotals.discount;
        agentTotals.nett += dailyTotals.nett;
      });

      // Add agent total
      excelData.push(['', '', 'Agent Total', agentTotals.gross, agentTotals.nett, agentTotals.discount]);
      excelData.push([]); // Empty row for spacing

      grandTotals.gross += agentTotals.gross;
      grandTotals.discount += agentTotals.discount;
      grandTotals.nett += agentTotals.nett;
    });

    // Add grand total
    excelData.push(['', '', 'Grand Total', grandTotals.gross, grandTotals.nett, grandTotals.discount]);

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Agent
      { wch: 12 }, // Sale Date
      { wch: 15 }, // Sale Type
      { wch: 15 }, // Gross Sale
      { wch: 15 }, // Nett Sale
      { wch: 15 }, // Total Discount
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Agent-Wise');

    // Generate filename with date range
    const filename = `Sales_Agent_Wise_${formData.date_from}_to_${formData.date_to}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const cardClasses = "bg-white rounded-xl shadow-sm border border-gray-200/60";
  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  // Render the report table
  const renderReport = () => {
    if (!reportData || reportData.length === 0) return null;

    const groupedData = groupByAgentAndDate(reportData);
    const sortedAgents = Object.keys(groupedData).sort();
    let grandTotals = { gross: 0, discount: 0, nett: 0 };

    return (
      <div ref={reportRef} className="bg-white">
        {/* Report Header */}
        <div className="report-header mb-4">
          <div className="company-name text-xl font-bold">{branch?.branches_nm || 'Company'}</div>
          <div className="report-title text-base font-bold mt-2">Sales Agent-Wise</div>
          <div className="report-subtitle text-sm text-gray-600">
            Sales Agent-Wise from {formatDate(reportParams?.date_from)} to {formatDate(reportParams?.date_to)}
          </div>
        </div>

        {/* Report Table */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-t border-b border-gray-300">
              <th className="py-2 px-1 text-left w-32">Agent</th>
              <th className="py-2 px-1 text-left w-20">Sale Date</th>
              <th className="py-2 px-1 text-left w-20">Sale Type</th>
              <th className="py-2 px-1 text-right w-20">Gross Sale</th>
              <th className="py-2 px-1 text-right w-20">Nett Sale</th>
              <th className="py-2 px-1 text-right w-20">Total Discount</th>
            </tr>
          </thead>
          <tbody>
            {sortedAgents.map((agentKey, agentIndex) => {
              const agentData = groupedData[agentKey];
              const sortedDates = Object.keys(agentData).sort();
              let agentTotals = { gross: 0, discount: 0, nett: 0 };

              return (
                <React.Fragment key={agentKey}>
                  {/* Agent Header Row */}
                  <tr className="agent-header">
                    <td colSpan={6} className="py-2 font-bold text-sm">
                      {agentKey}
                    </td>
                  </tr>

                  {sortedDates.map((dateKey, dateIndex) => {
                    const rows = agentData[dateKey];
                    const dailyTotals = calculateTotals(rows);
                    agentTotals.gross += dailyTotals.gross;
                    agentTotals.discount += dailyTotals.discount;
                    agentTotals.nett += dailyTotals.nett;

                    return (
                      <React.Fragment key={`${agentKey}-${dateKey}`}>
                        {/* Date Header Row */}
                        <tr className="date-header">
                          <td colSpan={6} className="py-1 pl-5 font-bold text-xs">
                            {formatDate(dateKey)}
                          </td>
                        </tr>

                        {/* Data Rows */}
                        {rows.map((row, rowIndex) => (
                          <tr key={`${agentKey}-${dateKey}-${rowIndex}`} className="hover:bg-gray-50">
                            <td className="py-1 px-1 font-serif"></td>
                            <td className="py-1 px-1 font-serif"></td>
                            <td className="py-1 px-1 font-serif">{row.sale_type}</td>
                            <td className="py-1 px-1 text-right">{formatNumber(row.gross_sale)}</td>
                            <td className="py-1 px-1 text-right">{formatNumber(row.nett_sale)}</td>
                            <td className="py-1 px-1 text-right">{formatNumber(row.total_discount)}</td>
                          </tr>
                        ))}

                        {/* Daily Total Row */}
                        <tr className="daily-total border-t border-b border-gray-300">
                          <td colSpan={3} className="py-2 px-1 text-right font-bold">Daily Total</td>
                          <td className="py-2 px-1 text-right font-bold">{formatNumber(dailyTotals.gross)}</td>
                          <td className="py-2 px-1 text-right font-bold">{formatNumber(dailyTotals.nett)}</td>
                          <td className="py-2 px-1 text-right font-bold">{formatNumber(dailyTotals.discount)}</td>
                        </tr>

                        {/* Spacing between date groups */}
                        {dateIndex < sortedDates.length - 1 && (
                          <tr><td colSpan={6} className="py-1"></td></tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Agent Total Row */}
                  <tr className="agent-total border-t border-b border-gray-300">
                    <td colSpan={3} className="py-2 px-1 text-right font-bold">Agent Total</td>
                    <td className="py-2 px-1 text-right font-bold">{formatNumber(agentTotals.gross)}</td>
                    <td className="py-2 px-1 text-right font-bold">{formatNumber(agentTotals.nett)}</td>
                    <td className="py-2 px-1 text-right font-bold">{formatNumber(agentTotals.discount)}</td>
                  </tr>

                  {/* Spacing between agent groups */}
                  {agentIndex < sortedAgents.length - 1 && (
                    <tr><td colSpan={6} className="py-2"></td></tr>
                  )}

                  {(() => {
                    grandTotals.gross += agentTotals.gross;
                    grandTotals.discount += agentTotals.discount;
                    grandTotals.nett += agentTotals.nett;
                    return null;
                  })()}
                </React.Fragment>
              );
            })}

            {/* Grand Total Row */}
            <tr className="grand-total border-t-2 border-b-2 border-gray-400">
              <td colSpan={3} className="py-2 px-1 text-right font-bold text-sm">Grand Total</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandTotals.gross)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandTotals.nett)}</td>
              <td className="py-2 px-1 text-right font-bold text-sm">{formatNumber(grandTotals.discount)}</td>
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
        title="Sales Agent-Wise"
        subtitle="Generate sales report by agent"
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
