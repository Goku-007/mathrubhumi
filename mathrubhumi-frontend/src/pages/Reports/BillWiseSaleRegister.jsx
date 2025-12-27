import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { getSession } from '../../utils/session';

export default function BillWiseSaleRegister() {
  const { branch } = getSession();
  const branchId = branch?.id || null;

  const [saleTypes, setSaleTypes] = useState([]);
  const [formData, setFormData] = useState({
    sale_type_id: '',
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
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    fetchSaleTypes();
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

  const fetchSaleTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await api.get('/auth/sale-types/');
      const types = response.data || [];
      console.log('Loaded sale types:', types);
      setSaleTypes(types);
      if (types.length === 0) {
        showModal('No sale types found in the database. Please add sale types first.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching sale types:', error);
      showModal(
        `Failed to load sale types: ${error.response?.data?.error || error.message}`,
        'error'
      );
    } finally {
      setLoadingTypes(false);
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

  const generateHTMLReport = (reportData, params) => {
    // Get sale type name
    const selectedType = saleTypes.find(t => t.sale_typeid === parseInt(params.sale_type_id));
    const saleTypeName = selectedType ? selectedType.sale_type : `Type ${params.sale_type_id}`;
    
    // Calculate totals
    const totals = reportData.reduce((acc, row) => ({
      gross: acc.gross + (row.gross_sale || 0),
      nett: acc.nett + (row.nett_sale || 0),
      discount: acc.discount + (row.total_discount || 0),
      freight: acc.freight + (row.freight_postage || 0),
    }), { gross: 0, nett: 0, discount: 0, freight: 0 });

    return `<!DOCTYPE html>
<html>
<head>
    <title>Bill-Wise Sale Register Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        .header-info { margin: 20px 0; padding: 15px; background: #f0f9ff; border-left: 4px solid #2563eb; }
        .header-info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #2563eb; color: white; padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:hover { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { margin-top: 20px; padding: 15px; background: #f0f9ff; border-top: 2px solid #2563eb; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-weight: 600; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bill-Wise Sale Register Report</h1>
        <div class="header-info">
            <p><strong>Sale Type:</strong> ${saleTypeName}</p>
            <p><strong>Date From:</strong> ${params.date_from}</p>
            <p><strong>Date To:</strong> ${params.date_to}</p>
            <p><strong>Branch ID:</strong> ${params.branch_id}</p>
            <p><strong>Total Records:</strong> ${reportData.length}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Bill No</th>
                    <th>Sale Type</th>
                    <th>Customer</th>
                    <th class="text-right">Gross Sale</th>
                    <th class="text-right">Discount</th>
                    <th class="text-right">Freight/Postage</th>
                    <th class="text-right">Nett Sale</th>
                    <th>Notes</th>
                    <th>User</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.map(row => `
                <tr>
                    <td>${row.sale_date || ''}</td>
                    <td>${row.bill_no || ''}</td>
                    <td>${row.sale_type || ''}</td>
                    <td>${row.customer_nm || ''}</td>
                    <td class="text-right">${row.gross_sale.toFixed(2)}</td>
                    <td class="text-right">${row.total_discount.toFixed(2)}</td>
                    <td class="text-right">${row.freight_postage.toFixed(2)}</td>
                    <td class="text-right"><strong>${row.nett_sale.toFixed(2)}</strong></td>
                    <td>${(row.note_1 || '') + (row.note_2 ? ' / ' + row.note_2 : '')}</td>
                    <td>${row.user || ''}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="totals">
            <div class="totals-row">
                <span>Total Gross Sale:</span>
                <span>${totals.gross.toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>Total Discount:</span>
                <span>${totals.discount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>Total Freight/Postage:</span>
                <span>${totals.freight.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 10px; font-size: 1.1em;">
                <span>Total Nett Sale:</span>
                <span>${totals.nett.toFixed(2)}</span>
            </div>
        </div>
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data:', updated);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sale_type_id || formData.sale_type_id === '') {
      showModal('Please select a Sale Type', 'error');
      return;
    }

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
      
      // Ensure sale_type_id is converted to number
      const saleTypeId = parseInt(formData.sale_type_id, 10);
      if (isNaN(saleTypeId)) {
        showModal('Invalid Sale Type selected', 'error');
        setLoading(false);
        return;
      }

      console.log('Form data before submit:', formData);
      console.log('Submitting report with params:', {
        branch_id: branchId,
        sale_type_id: saleTypeId,
        date_from: formData.date_from,
        date_to: formData.date_to,
      });
      
      // Call the report endpoint
      // Note: If you have a JasperReports server configured, update the backend
      // endpoint to generate and return the PDF blob. Otherwise, it returns JSON parameters.
      const response = await api.get('/auth/reports/bill-wise-sale-register/', {
        params: {
          branch_id: branchId,
          sale_type_id: saleTypeId,
          date_from: formData.date_from,
          date_to: formData.date_to,
        },
      });

      // Check if response contains report data
      const data = response.data;
      
      if (data.report_data) {
        // Generate HTML report and open in new window
        const htmlReport = generateHTMLReport(data.report_data, data.parameters);
        const blob = new Blob([htmlReport], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        showModal(`Report generated successfully with ${data.total_records} records.`, 'success');
      } else if (response.data instanceof Blob) {
        // PDF blob - open in new window
        const url = window.URL.createObjectURL(response.data);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        showModal('Report generated successfully and opened in a new window.', 'success');
      } else {
        showModal('Report endpoint returned unexpected format.', 'error');
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

  const cardClasses = "bg-white rounded-xl shadow-sm border border-gray-200/60";
  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

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
        title="Bill-Wise Sale Register"
        subtitle="Generate sale register report by bill"
      />

      <div className="mt-6 max-w-3xl mx-auto">
        <div className={cardClasses + " p-6"}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sale Type Select */}
            <div>
              <label htmlFor="sale_type_id" className={labelClasses}>
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="sale_type_id"
                name="sale_type_id"
                value={formData.sale_type_id}
                onChange={handleInputChange}
                className={inputClasses}
                disabled={loadingTypes}
                required
              >
                <option value="">-- Select Sale Type --</option>
                {saleTypes.map((type) => (
                  <option key={type.sale_typeid} value={String(type.sale_typeid)}>
                    {type.sale_type || `Type ${type.sale_typeid}`}
                  </option>
                ))}
              </select>
              {loadingTypes && (
                <p className="mt-1 text-xs text-gray-500">Loading types...</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            </div>

            {/* Branch Info (Display Only) */}
            {branchId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Branch:</span>{' '}
                  {branch?.branches_nm || `ID: ${branchId}`}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || loadingTypes}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-sm hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
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
          </form>
        </div>
      </div>
    </div>
  );
}
