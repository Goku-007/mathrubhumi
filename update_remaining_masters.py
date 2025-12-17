#!/usr/bin/env python3

import os
import re

# Masters that need to be updated
MASTERS = [
    "PPBooksMaster",
    "PPCustomersMaster",
    "PrivilegersMaster",
    "PurchaseBreakupsMaster",
    "RoyaltyRecipientsMaster",
    "SubCategoriesMaster",
    "SupplierMaster",
    "TitleMaster",
    "CreditCustomerMaster"
]

BASE_DIR = "/Users/vishal/projects/mathrubhumi/mathrubhumi-frontend/src/pages/Masters"

def update_master(master_name):
    file_path = f"{BASE_DIR}/{master_name}.jsx"

    if not os.path.exists(file_path):
        print(f"File {file_path} not found, skipping...")
        return

    print(f"Updating {master_name}...")

    with open(file_path, 'r') as f:
        content = f.read()

    # Add PageHeader import
    if 'import PageHeader' not in content:
        content = re.sub(
            r'import React.*from \'react\';',
            r'import React, { useState, useEffect } from \'react\';',
            content
        )
        content = re.sub(
            r'import Modal from \'../../components/Modal\';',
            r'import Modal from \'../../components/Modal\';\nimport PageHeader from \'../../components/PageHeader\';',
            content
        )

    # Add useEffect if not present
    if 'useEffect(()' not in content:
        # Find where to add useEffect
        pattern = r'const \[modal.*?\] = useState.*?\n  \};\n'
        replacement = r'\g<0>  const [deleteItemId, setDeleteItemId] = useState(null);\n\n  useEffect(() => {\n    fetchAllItems();\n  }, []);\n'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    # Add generic icon
    icon_definition = '''
  // Icon for header
  const masterIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );'''

    # Add icon after fetch function
    fetch_pattern = r'(const fetchAll\w+ = async \(\) => \{.*?\n  \};\n)'
    content = re.sub(fetch_pattern, r'\1' + icon_definition, content, flags=re.DOTALL)

    # Update the main layout structure - replace the return statement
    old_return_pattern = r'return \(\s*<div className="flex flex-col h-screen.*?</div>\s*\);'
    new_return = f'''  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <Modal
        isOpen={{modal.isOpen}}
        message={{modal.message}}
        type={{modal.type}}
        buttons={{modal.buttons}}
      />

      {/* Page Header */}
      <PageHeader
        icon={{masterIcon}}
        title="{master_name.replace('Master', ' Master')}"
        subtitle="Manage {master_name.lower().replace('master', '')} information"
      />

      {/* Main Content Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
        {/* Table Section */}
        <div className="p-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full max-w-md">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {{items.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-400">
                      No items found. Add one below.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={{item.id}}
                      className="hover:bg-blue-50/50 transition-colors animate-fade-in"
                      style={{{{ animationDelay: `${{index * 30}}ms` }}}}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={{item.name || ''}}
                          onChange={(e) => handleTableInputChange(item.id, 'name', e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTableUpdate(item.id, {{ ...item, name: e.target.value }})}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white
                                     transition-all duration-200"
                          placeholder="Enter name"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500
                                     hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete item"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-4">
          <div className="flex items-center gap-3 max-w-md">
            <div className="flex-1">
              <input
                type="text"
                name="name"
                value={{formData.name}}
                onChange={{handleInputChange}}
                placeholder="Enter new name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                           transition-all duration-200 input-premium"
                autoComplete="off"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <button
              onClick={{handleAddItem}}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600
                         text-white text-sm font-medium shadow-lg shadow-blue-500/25
                         hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Quick Tip</p>
            <p className="text-xs text-blue-600 mt-0.5">Press Enter after editing an item to save changes instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );'''

    # This is complex to do with regex, so I'll write the updated content back
    # For now, let's just update the imports and basic structure

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"Updated {master_name}")

def main():
    for master in MASTERS:
        try:
            update_master(master)
        except Exception as e:
            print(f"Error updating {master}: {e}")

if __name__ == "__main__":
    main()
