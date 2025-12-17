#!/bin/bash

# List of masters that need to be updated
MASTERS=(
    "PPBooksMaster"
    "PPCustomersMaster"
    "PrivilegersMaster"
    "PublisherMaster"
    "PurchaseBreakupsMaster"
    "RoyaltyRecipientsMaster"
    "SubCategoriesMaster"
    "SupplierMaster"
    "TitleMaster"
    "CreditCustomerMaster"
)

# Base directory
BASE_DIR="/Users/vishal/projects/mathrubhumi/mathrubhumi-frontend/src/pages/Masters"

# Function to update each master
update_master() {
    local master_name=$1
    local file_path="$BASE_DIR/${master_name}.jsx"

    if [ ! -f "$file_path" ]; then
        echo "File $file_path not found, skipping..."
        return
    fi

    echo "Updating $master_name..."

    # Add PageHeader import
    sed -i '' '1s/import React/import import PageHeader from '\''..\/..\/components\/PageHeader'\'';\nimport React/' "$file_path"

    # Add icon definition (generic icon for now)
    sed -i '' '/fetchAll/a\
\
  // Icon for header\
  const masterIcon = (\
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />\
    </svg>\
  );' "$file_path"

    echo "Updated $master_name"
}

# Update all masters
for master in "${MASTERS[@]}"; do
    update_master "$master"
done

echo "All masters updated!"
