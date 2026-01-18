import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/axiosInstance';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { getSession } from '../../utils/session';
import * as XLSX from 'xlsx';

export default function AuthorWiseTitleSales() {
    const { branch } = getSession();
    const branchId = branch?.id || null;

    const [formData, setFormData] = useState({
        date_from: '',
        date_to: '',
        author_id: '',
    });
    const [authors, setAuthors] = useState([]);
    const [loadingAuthors, setLoadingAuthors] = useState(false);

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

        // Fetch authors for dropdown
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            setLoadingAuthors(true);
            const response = await api.get('/auth/authors-list/');
            setAuthors(response.data);
        } catch (error) {
            console.error('Error fetching authors:', error);
            showModal('Failed to load authors list.', 'error');
        } finally {
            setLoadingAuthors(false);
        }
    };

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

    // Format number with Indian locale
    const formatNumber = (num, decimals = 2) => {
        if (num === null || num === undefined) return decimals === 0 ? '0' : '0.00';
        const value = parseFloat(num);
        if (isNaN(value)) return decimals === 0 ? '0' : '0.00';
        return value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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

    // Get selected author name
    const getSelectedAuthorName = () => {
        const author = authors.find(a => String(a.id) === String(formData.author_id));
        return author?.author_nm || '';
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

        if (!formData.author_id) {
            showModal('Please select an Author', 'error');
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

            const response = await api.get('/auth/reports/author-wise-title-sales/', {
                params: {
                    branch_id: branchId,
                    date_from: formData.date_from,
                    date_to: formData.date_to,
                    author_id: formData.author_id,
                },
            });

            const data = response.data;

            if (data.report_data) {
                setReportData(data.report_data);
                setReportParams({ ...data.parameters, author_name: getSelectedAuthorName() });
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
        <title>Author-Wise Title Sales Report</title>
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
        let grandQtyTotal = 0;

        // Add header row
        excelData.push(['Title', 'Rate', 'Quantity']);

        // Add data rows
        reportData.forEach(row => {
            excelData.push([
                row.title || '',
                row.rate || 0,
                row.quantity || 0,
            ]);
            grandQtyTotal += row.quantity || 0;
        });

        // Add grand total
        excelData.push(['Grand Total', '', grandQtyTotal]);

        // Create workbook and worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 50 }, // Title
            { wch: 15 }, // Rate
            { wch: 12 }, // Quantity
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Author Wise Title Sales');

        // Generate filename with date range
        const filename = `Author_Wise_Title_Sales_${formData.date_from}_to_${formData.date_to}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const cardClasses = "bg-white rounded-xl shadow-sm border border-gray-200/60";
    const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

    // Render the report table
    const renderReport = () => {
        if (!reportData || reportData.length === 0) return null;

        let grandQtyTotal = 0;

        return (
            <div ref={reportRef} className="bg-white">
                {/* Report Header */}
                <div className="report-header mb-4">
                    <div className="company-name text-xl font-bold">{branch?.branches_nm || 'Company'}</div>
                    <div className="report-title text-base font-bold mt-2">Author-Wise Title Sales</div>
                    <div className="report-subtitle text-sm text-gray-800 font-semibold mb-1">
                        Author: {reportParams?.author_name || ''}
                    </div>
                    <div className="report-subtitle text-sm text-gray-600">
                        From {formatDate(reportParams?.date_from)} to {formatDate(reportParams?.date_to)}
                    </div>
                </div>

                {/* Report Table */}
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-t border-b border-gray-300">
                            <th className="py-2 px-1 text-left">Title</th>
                            <th className="py-2 px-1 text-right w-24">Rate</th>
                            <th className="py-2 px-1 text-right w-24">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => {
                            grandQtyTotal += row.quantity || 0;

                            return (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-1 px-1 font-serif">{row.title || ''}</td>
                                    <td className="py-1 px-1 text-right">{formatNumber(row.rate)}</td>
                                    <td className="py-1 px-1 text-right">{formatInteger(row.quantity)}</td>
                                </tr>
                            );
                        })}

                        {/* Grand Total Row */}
                        <tr className="grand-total border-t-2 border-b-2 border-gray-400">
                            <td colSpan={2} className="py-2 px-1 font-bold text-sm text-right">Grand Total</td>
                            <td className="py-2 px-1 text-right font-bold text-sm">{formatInteger(grandQtyTotal)}</td>
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
                title="Author-Wise Title Sales"
                subtitle="Generate title sales report for a specific author"
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

                            {/* Author Name - Dropdown Select */}
                            <div>
                                <label htmlFor="author_id" className={labelClasses}>
                                    Author Name <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="author_id"
                                    name="author_id"
                                    value={formData.author_id}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    required
                                    disabled={loadingAuthors}
                                >
                                    <option value="">
                                        {loadingAuthors ? 'Loading authors...' : '-- Select Author --'}
                                    </option>
                                    {authors.map((author) => (
                                        <option key={author.id} value={author.id}>
                                            {author.author_nm}
                                        </option>
                                    ))}
                                </select>
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
