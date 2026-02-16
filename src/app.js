/**
 * Cricket Academy Membership Manager
 * Main application entry point
 */

// Application State
const appState = {
    paymentRecords: [],
    players: [],
    membershipCampaigns: [],
    currentFilter: 'all',
    currentCampaignFilter: 'all',
    currentSort: { column: 'playerName', direction: 'asc' },
    isLoading: false,
    errorMessage: null
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Cricket Academy Membership Manager initialized');
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize default membership plans
    initializeDefaultPlans();
    
    // Render initial UI state
    updateRecordCount();
    updateFilterCounts();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // File upload
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Upload label keyboard support
    const uploadLabel = document.querySelector('.upload-label');
    if (uploadLabel) {
        uploadLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            handleFilterChange(filter);
        });
        
        // Keyboard support for filter buttons
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const filter = e.target.dataset.filter;
                handleFilterChange(filter);
            }
        });
    });
    
    // Campaign filter dropdown
    const campaignFilter = document.getElementById('campaignFilter');
    if (campaignFilter) {
        campaignFilter.addEventListener('change', (e) => {
            handleCampaignFilterChange(e.target.value);
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Table sorting
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    tableHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.currentTarget.dataset.sort;
            handleSortChange(column);
        });
        
        // Keyboard support for sorting
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const column = e.currentTarget.dataset.sort;
                handleSortChange(column);
            }
        });
    });
    
    // Modal close
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', closePaymentHistoryModal);
        
        // Keyboard support for modal close
        closeModal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closePaymentHistoryModal();
            }
        });
    }
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('paymentHistoryModal');
        if (e.target === modal) {
            closePaymentHistoryModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('paymentHistoryModal');
            if (modal && modal.classList.contains('show')) {
                closePaymentHistoryModal();
            }
        }
    });
}

/**
 * Initialize default membership plans
 */
function initializeDefaultPlans() {
    // Start with empty plans - they will be auto-detected from uploaded files
    appState.membershipCampaigns = [];
}

/**
 * Handle file upload
 */
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('File selected:', file.name);
    
    // Validate file format
    if (!isValidExcelFile(file)) {
        addNotification('error', 'Invalid File Format', 'Please upload an Excel file (.xlsx or .xls)');
        // Reset file input
        event.target.value = '';
        return;
    }
    
    // Check file size (warn if > 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        addNotification('warning', 'Large File', `Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB). Processing may take a moment...`);
    }
    
    // Show loading indicator
    showLoading('Processing file...');
    
    try {
        // Parse the Excel file
        const paymentRecords = await parseExcelFile(file);
        
        // Hide loading indicator
        hideLoading();
        
        if (paymentRecords.length === 0) {
            addNotification('error', 'No Records Found', 'No valid payment records found in the file. Please check that the file contains payment data with the required columns.');
            event.target.value = '';
            return;
        }
        
        // Directly process records without preview
        const incompleteCount = paymentRecords.filter(r => !r.isComplete).length;
        const completeCount = paymentRecords.length - incompleteCount;
        
        // Add notifications for incomplete records
        if (incompleteCount > 0) {
            addNotification('warning', 'Incomplete Records', `Found ${incompleteCount} incomplete record(s) with missing required fields. These records will be excluded from analysis. ${completeCount} complete record(s) will be processed.`);
        }
        
        // Add success notification
        addNotification('success', 'Import Successful', `Successfully imported ${completeCount} payment record(s) from ${file.name}`);
        
        // Process the records
        processPaymentRecords(paymentRecords);
        
    } catch (error) {
        console.error('Error parsing file:', error);
        hideLoading();
        
        // Provide specific error messages based on error type
        if (error.message && error.message.includes('Unsupported file')) {
            addNotification('error', 'Unsupported Format', 'Unsupported file format. Please ensure the file is a valid Excel file (.xlsx or .xls).');
        } else if (error.message && error.message.includes('encrypted')) {
            addNotification('error', 'Encrypted File', 'Cannot read encrypted or password-protected Excel files. Please remove password protection and try again.');
        } else {
            addNotification('error', 'Parse Error', 'Failed to parse Excel file. The file may be corrupted, empty, or in an unsupported format. Please check the file and try again.');
        }
        
        event.target.value = '';
    }
}

/**
 * Process payment records (after duplicate handling)
 */
function processPaymentRecords(paymentRecords, duplicateInfo = null) {
    // Store payment records
    storePaymentRecords(paymentRecords);
    
    // Store duplicate information if provided
    if (duplicateInfo && duplicateInfo.hasDuplicates) {
        appState.duplicateInfo = duplicateInfo;
    }
    
    // Auto-detect and add new membership plans from the uploaded file
    autoDetectMembershipCampaigns(paymentRecords);
    
    // Count incomplete records
    const incompleteCount = paymentRecords.filter(r => !r.isComplete).length;
    const completeCount = paymentRecords.length - incompleteCount;
    
    // Show warning for incomplete records
    if (incompleteCount > 0) {
        showWarning(`Found ${incompleteCount} incomplete record(s) with missing required fields. These records will be excluded from analysis. ${completeCount} complete record(s) will be processed.`);
    }
    
    // Check if we have any complete records to analyze
    if (completeCount === 0) {
        showError('No complete payment records found. All records are missing required fields (payer name, payment amount, payment date, or membership plan).');
        return;
    }
    
    // Analyze payments and create player records
    const players = analyzePayments(paymentRecords, appState.membershipCampaigns);
    
    if (players.length === 0) {
        showError('Unable to create player records from the payment data. Please check that the file contains valid payment information.');
        return;
    }
    
    storePlayers(players);
    
    // Show success message with summary
    const unknownPlanCount = players.filter(p => p.hasUnknownPlan).length;
    let successMessage = `✓ File processed successfully: ${completeCount} payment record(s) analyzed, ${players.length} player(s) identified`;
    
    if (incompleteCount > 0) {
        successMessage += ` (${incompleteCount} incomplete record(s) excluded)`;
    }
    
    showSuccess(successMessage);
    
    console.log('Parsed payment records:', paymentRecords);
    console.log('Analyzed players:', appState.players);
    
    // Render the table with player data
    renderTable();
    updateRecordCount();
    renderCampaignFilter();
}

/**
 * Auto-detect unique membership plans from payment records and add them
 * @param {Array} paymentRecords - Payment records to analyze
 */
function autoDetectMembershipCampaigns(paymentRecords) {
    // Extract unique membership plan names from complete records
    const uniquePlanNames = new Set();
    
    for (const record of paymentRecords) {
        if (record.isComplete && record.membershipCampaign) {
            uniquePlanNames.add(record.membershipCampaign);
        }
    }
    
    // Check which plans are new (not already in appState.membershipCampaigns)
    const existingPlanNames = new Set(appState.membershipCampaigns.map(p => p.name));
    const newPlans = [];
    
    for (const planName of uniquePlanNames) {
        if (!existingPlanNames.has(planName)) {
            // Add new plan with default duration of 30 days
            const newPlan = {
                name: planName,
                durationDays: 30,  // Default duration
                autoDetected: true
            };
            appState.membershipCampaigns.push(newPlan);
            newPlans.push(newPlan);
        }
    }
    
    // Log detected plans to console for debugging
    if (newPlans.length > 0) {
        console.log('Auto-detected membership plans:', newPlans.map(p => `${p.name} (${p.durationDays} days)`).join(', '));
    }
}

/**
 * Validate that the file is a valid Excel file
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file has .xlsx or .xls extension
 */
function isValidExcelFile(file) {
    if (!file || !file.name) {
        return false;
    }
    
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
}

/**
 * Parse Excel file and extract payment records
 * @param {File} file - The Excel file to parse
 * @returns {Promise<PaymentRecord[]>} - Array of payment records
 */
async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first worksheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Extract payment records from worksheet
                const paymentRecords = extractPaymentRecords(worksheet);
                
                resolve(paymentRecords);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Extract payment records from worksheet
 * @param {Object} worksheet - SheetJS worksheet object
 * @returns {PaymentRecord[]} - Array of payment records
 */
function extractPaymentRecords(worksheet) {
    // Convert worksheet to JSON with header row
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    if (rawData.length === 0) {
        return [];
    }
    
    // Detect column mappings from headers
    const columnMapping = detectColumnMapping(Object.keys(rawData[0]));
    
    // Map each row to a PaymentRecord
    const paymentRecords = rawData.map(row => {
        const record = {
            payerName: extractField(row, columnMapping.payerName),
            playerName: extractField(row, columnMapping.playerName),
            paymentAmount: extractAmount(row, columnMapping.paymentAmount),
            paymentDate: extractDate(row, columnMapping.paymentDate),
            membershipCampaign: extractField(row, columnMapping.membershipCampaign),
            ticketDetails: extractField(row, columnMapping.ticketDetails),
            recurringStatus: extractField(row, columnMapping.recurringStatus),
            dateOfBirth: extractDate(row, columnMapping.dateOfBirth),
            isComplete: false,
            rawData: row
        };
        
        // Validate record completeness
        record.isComplete = validateRecord(record);
        
        return record;
    });
    
    // Filter out completely empty rows
    return paymentRecords.filter(record => 
        record.payerName || record.paymentAmount || record.paymentDate || record.membershipCampaign
    );
}

/**
 * Detect column mapping from Excel headers
 * @param {string[]} headers - Array of column headers from Excel
 * @returns {Object} - Mapping of field names to column headers
 */
function detectColumnMapping(headers) {
    const mapping = {
        payerName: null,
        playerName: null,
        paymentAmount: null,
        paymentDate: null,
        membershipCampaign: null,
        ticketDetails: null,
        recurringStatus: null,
        dateOfBirth: null
    };
    
    // Normalize headers for comparison
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Detect payer name column
    const payerPatterns = ['payer name', 'name', 'donor name', 'payer', 'donor', 'guardian name', 'guardian'];
    mapping.payerName = findMatchingHeader(normalizedHeaders, headers, payerPatterns);
    
    // Detect player name column
    const playerPatterns = ['player name', 'student name', 'beneficiary', 'player', 'student', 'child name'];
    mapping.playerName = findMatchingHeader(normalizedHeaders, headers, playerPatterns);
    
    // Detect payment amount column
    const amountPatterns = ['amount', 'payment amount', 'total', 'price', 'payment'];
    mapping.paymentAmount = findMatchingHeader(normalizedHeaders, headers, amountPatterns);
    
    // Detect payment date column
    const datePatterns = ['date', 'payment date', 'transaction date', 'created at', 'timestamp'];
    mapping.paymentDate = findMatchingHeader(normalizedHeaders, headers, datePatterns);
    
    // Detect membership plan column
    const planPatterns = ['campaign', 'program', 'plan', 'item', 'membership plan', 'membership', 'product'];
    mapping.membershipCampaign = findMatchingHeader(normalizedHeaders, headers, planPatterns);
    
    // Detect ticket details column
    const detailsPatterns = ['details', 'ticket details', 'description', 'notes', 'ticket', 'info'];
    mapping.ticketDetails = findMatchingHeader(normalizedHeaders, headers, detailsPatterns);
    
    // Detect recurring status column
    const recurringPatterns = ['recurring status', 'recurring', 'subscription status', 'recurrence'];
    mapping.recurringStatus = findMatchingHeader(normalizedHeaders, headers, recurringPatterns);
    
    // Detect date of birth column
    const dobPatterns = ['date of birth', 'dob', 'birth date', 'birthdate', 'birthday'];
    mapping.dateOfBirth = findMatchingHeader(normalizedHeaders, headers, dobPatterns);
    
    return mapping;
}

/**
 * Find matching header from patterns
 * @param {string[]} normalizedHeaders - Lowercase headers
 * @param {string[]} originalHeaders - Original headers
 * @param {string[]} patterns - Patterns to match
 * @returns {string|null} - Matching header or null
 */
function findMatchingHeader(normalizedHeaders, originalHeaders, patterns) {
    for (const pattern of patterns) {
        const index = normalizedHeaders.findIndex(h => h.includes(pattern) || pattern.includes(h));
        if (index !== -1) {
            return originalHeaders[index];
        }
    }
    return null;
}

/**
 * Extract field value from row
 * @param {Object} row - Row data
 * @param {string|null} columnName - Column name to extract
 * @returns {string|null} - Extracted value
 */
function extractField(row, columnName) {
    if (!columnName || !row[columnName]) {
        return null;
    }
    
    const value = row[columnName];
    
    // Handle different value types
    if (typeof value === 'string') {
        return value.trim() || null;
    }
    
    return value ? String(value).trim() : null;
}

/**
 * Extract and parse payment amount
 * @param {Object} row - Row data
 * @param {string|null} columnName - Column name to extract
 * @returns {number} - Parsed amount or 0
 */
function extractAmount(row, columnName) {
    if (!columnName || !row[columnName]) {
        return 0;
    }
    
    let value = row[columnName];
    
    // Handle string amounts (e.g., "$100.00", "100,00")
    if (typeof value === 'string') {
        // Remove currency symbols and whitespace
        value = value.replace(/[$€£¥,\s]/g, '');
    }
    
    const amount = parseFloat(value);
    return isNaN(amount) ? 0 : amount;
}

/**
 * Extract and parse payment date
 * @param {Object} row - Row data
 * @param {string|null} columnName - Column name to extract
 * @returns {Date|null} - Parsed date or null
 */
function extractDate(row, columnName) {
    if (!columnName || !row[columnName]) {
        return null;
    }
    
    const value = row[columnName];
    
    // Handle Excel date serial numbers
    if (typeof value === 'number') {
        // Excel dates are days since 1900-01-01
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
        return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle string dates
    if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle Date objects
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    
    return null;
}

/**
 * Validate that a payment record has all required fields
 * @param {Object} record - Payment record to validate
 * @returns {boolean} - True if all required fields are present
 */
function validateRecord(record) {
    // Required fields: payerName, paymentAmount, paymentDate, membershipCampaign
    return !!(
        record.payerName &&
        record.paymentAmount > 0 &&
        record.paymentDate &&
        record.membershipCampaign
    );
}

/**
 * Handle filter change
 */
function handleFilterChange(filter) {
    appState.currentFilter = filter;
    
    // Update active button and ARIA attributes
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    });
    
    // Re-render table
    renderTable();
    updateRecordCount();
    updateFilterCounts();
}

/**
 * Handle campaign filter change
 */
function handleCampaignFilterChange(campaignName) {
    appState.currentCampaignFilter = campaignName;
    
    // Re-render table
    renderTable();
    updateRecordCount();
    updateFilterCounts();
}

/**
 * Handle sort change
 */
function handleSortChange(column) {
    // Toggle direction if same column, otherwise default to ascending
    if (appState.currentSort.column === column) {
        appState.currentSort.direction = appState.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        appState.currentSort.column = column;
        appState.currentSort.direction = 'asc';
    }
    
    // Update header styling and ARIA attributes
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        th.removeAttribute('aria-sort');
        if (th.dataset.sort === column) {
            th.classList.add(`sorted-${appState.currentSort.direction}`);
            th.setAttribute('aria-sort', appState.currentSort.direction === 'asc' ? 'ascending' : 'descending');
        } else {
            th.setAttribute('aria-sort', 'none');
        }
    });
    
    // Re-render table
    renderTable();
}

/**
 * Handle export
 */
function handleExport() {
    try {
        // Get filtered and sorted players
        const filteredPlayers = getFilteredPlayers();
        const sortedPlayers = sortPlayers(filteredPlayers);
        
        if (sortedPlayers.length === 0) {
            showWarning('No data to export. Please upload a file and ensure there are members to display.');
            return;
        }
        
        // Show loading indicator
        showLoading('Generating Excel file...');
        
        // Generate Excel file
        const blob = generateExport(sortedPlayers, appState.currentFilter);
        
        // Hide loading indicator
        hideLoading();
        
        // Trigger download
        const filterLabel = appState.currentFilter === 'all' ? 'all' : appState.currentFilter;
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `membership-export-${filterLabel}-${timestamp}.xlsx`;
        
        triggerDownload(blob, filename);
        
        showSuccess(`✓ Successfully exported ${sortedPlayers.length} member(s) to ${filename}`);
    } catch (error) {
        console.error('Export error:', error);
        hideLoading();
        showError('Failed to export data. Please try again. If the problem persists, try filtering to a smaller dataset.');
    }
}

/**
 * Render campaign filter dropdown
 */
function renderCampaignFilter() {
    const campaignFilter = document.getElementById('campaignFilter');
    if (!campaignFilter) return;
    
    // Get unique campaigns from current players
    const uniqueCampaigns = new Set();
    appState.players.forEach(player => {
        if (player.membershipCampaign) {
            uniqueCampaigns.add(player.membershipCampaign);
        }
    });
    
    // Sort campaigns alphabetically
    const sortedCampaigns = Array.from(uniqueCampaigns).sort();
    
    // Build options HTML
    let optionsHTML = '<option value="all">All Campaigns</option>';
    sortedCampaigns.forEach(campaign => {
        const selected = appState.currentCampaignFilter === campaign ? 'selected' : '';
        optionsHTML += `<option value="${campaign}" ${selected}>${campaign}</option>`;
    });
    
    campaignFilter.innerHTML = optionsHTML;
}

/**
 * Render members table
 */
function renderTable() {
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    // Get filtered players
    const filteredPlayers = getFilteredPlayers();

    if (filteredPlayers.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No members to display</td></tr>';
        return;
    }

    // Sort players
    const sortedPlayers = sortPlayers(filteredPlayers);

    // Status icons mapping - using colored dots
    const statusIcons = {
        'active': '🟢',
        'expiring_soon': '⏰',
        'lapsed': '🔴',
        'annual_fee': '💰'
    };

    // Render rows - single row per player with plan tag in ticket details
    tbody.innerHTML = sortedPlayers.map((player, index) => {
        const unknownPlanWarning = player.hasUnknownPlan ? ' ⚠️' : '';
        const expiryDisplay = player.expiryDate ? formatDate(player.expiryDate) : 'Unknown';
        const rowClass = player.hasUnknownPlan ? 'class="unknown-campaign"' : '';
        const ariaLabel = `${player.playerName}, ${player.status} membership. Click for payment history.`;
        const ticketDetailsDisplay = player.ticketDetails || 'N/A';
        const guardianName = player.guardianName || 'N/A';
        const dateOfBirth = player.dateOfBirth ? formatDate(player.dateOfBirth) : 'N/A';
        const statusIcon = statusIcons[player.status] || '•';

        return `
        <tr 
            onclick="showPaymentHistory('${player.playerName.replace(/'/g, "\\'")}')" 
            onkeydown="handleRowKeydown(event, '${player.playerName.replace(/'/g, "\\'")}')"
            ${rowClass}
            tabindex="0"
            role="row"
            aria-label="${ariaLabel}">
            <td role="cell" class="status-icon-cell" title="${formatStatus(player.status)}">${statusIcon}</td>
            <td role="cell">
                <div class="player-name-cell">
                    ${player.playerName}
                    <span class="info-bubble" aria-label="Guardian: ${guardianName}, Date of Birth: ${dateOfBirth}">
                        i
                        <span class="tooltip">
                            <strong>Guardian:</strong> ${guardianName}<br>
                            <strong>DOB:</strong> ${dateOfBirth}
                        </span>
                    </span>
                </div>
            </td>
            <td role="cell">
                <div class="ticket-details-cell">
                    <div class="ticket-details-text">${ticketDetailsDisplay}</div>
                    <div class="campaign-tag-inline">
                        <span class="campaign-tag">${player.membershipCampaign}${unknownPlanWarning}</span>
                    </div>
                </div>
            </td>
            <td role="cell">${formatDate(player.lastPaymentDate)}</td>
            <td role="cell">${player.lastPaymentAmount.toFixed(2)}</td>
            <td role="cell">${expiryDisplay}</td>
        </tr>
        `;
    }).join('');
    
    // Update filter counts
    updateFilterCounts();
}

/**
 * Handle keyboard navigation on table rows
 */
function handleRowKeydown(event, playerName) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showPaymentHistory(playerName);
    }
}

/**
 * Get filtered players based on current filter
 */
function getFilteredPlayers() {
    let filtered = appState.players;
    
    // Apply status filter
    if (appState.currentFilter !== 'all') {
        filtered = filtered.filter(player => player.status === appState.currentFilter);
    }
    
    // Apply plan filter
    if (appState.currentCampaignFilter !== 'all') {
        filtered = filtered.filter(player => player.membershipCampaign === appState.currentCampaignFilter);
    }
    
    return filtered;
}

/**
 * Sort players based on current sort settings
 */
function sortPlayers(players) {
    const { column, direction } = appState.currentSort;
    const multiplier = direction === 'asc' ? 1 : -1;
    
    return [...players].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle dates
        if (aVal instanceof Date && bVal instanceof Date) {
            return (aVal - bVal) * multiplier;
        }
        
        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return (aVal - bVal) * multiplier;
        }
        
        // Handle strings
        return String(aVal).localeCompare(String(bVal)) * multiplier;
    });
}

/**
 * Update record count display
 */
function updateRecordCount() {
    const total = appState.players.length;
    const filtered = getFilteredPlayers().length;
    
    // Update record count display if element exists
    const recordCount = document.getElementById('recordCount');
    if (recordCount) {
        if (total === 0) {
            recordCount.textContent = 'No records';
        } else if (appState.currentFilter === 'all') {
            recordCount.textContent = `${total} total members`;
        } else {
            recordCount.textContent = `${filtered} of ${total} members`;
        }
    }
    
    // Enable/disable export button (always run this, even if recordCount doesn't exist)
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.disabled = total === 0;
    }
}

/**
 * Update filter button counts
 */
function updateFilterCounts() {
    const players = appState.players;
    
    // Count players by status
    const counts = {
        all: players.length,
        active: players.filter(p => p.status === 'active').length,
        expiring_soon: players.filter(p => p.status === 'expiring_soon').length,
        lapsed: players.filter(p => p.status === 'lapsed').length,
        annual_fee: players.filter(p => p.status === 'annual_fee').length
    };
    
    // Update button text with counts
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const filter = btn.dataset.filter;
        const count = counts[filter] || 0;
        
        // Get the base label
        let label = '';
        switch(filter) {
            case 'all':
                label = 'All Members';
                break;
            case 'active':
                label = 'Active';
                break;
            case 'expiring_soon':
                label = 'Expiring Soon';
                break;
            case 'lapsed':
                label = 'Lapsed';
                break;
            case 'annual_fee':
                label = 'Annual Fee';
                break;
        }
        
        // Update button text with count
        btn.textContent = `${label} (${count})`;
    });
}

/**
 * Show payment history for a player
 */
/**
 * Show payment history for a player
 */
function showPaymentHistory(playerName) {
    const player = appState.players.find(p => p.playerName === playerName);
    if (!player) return;

    const modal = document.getElementById('paymentHistoryModal');
    const content = document.getElementById('paymentHistoryContent');
    
    // Check if there are duplicates
    const hasDuplicates = player.duplicatePayments && player.duplicatePayments.length > 0;
    
    let duplicatesSection = '';
    if (hasDuplicates) {
        duplicatesSection = `
            <div style="margin-top: 20px; padding: 15px; background-color: #fff; border: 2px solid #000; margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px;">⚠️ Duplicate Payments Detected</h4>
                <p style="margin-bottom: 15px; color: #000;">Found ${player.duplicatePayments.length} group(s) of duplicate payments for this player:</p>
                ${player.duplicatePayments.map((group, idx) => {
                    const firstPayment = group.payments[0].payment;
                    return `
                        <div style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-left: 3px solid #000;">
                            <strong>Duplicate Group ${idx + 1}</strong><br>
                            <strong>Date:</strong> ${formatDate(firstPayment.paymentDate)}<br>
                            <strong>Amount:</strong> ${firstPayment.paymentAmount.toFixed(2)}<br>
                            <strong>Plan:</strong> ${firstPayment.membershipCampaign}<br>
                            <strong>Occurrences:</strong> ${group.payments.length} times
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    content.innerHTML = `
        <h3>${player.playerName}</h3>
        <p><strong>Guardian:</strong> ${player.guardianName}</p>
        <p><strong>Date of Birth:</strong> ${player.dateOfBirth ? formatDate(player.dateOfBirth) : 'N/A'}</p>
        <p><strong>Total Payments:</strong> ${player.totalPayments}</p>
        <p><strong>Total Amount Paid:</strong> ${player.totalAmountPaid.toFixed(2)}</p>
        
        ${duplicatesSection}
        
        <h4>Payment History</h4>
        <table role="table" aria-label="Payment history for ${player.playerName}">
            <thead>
                <tr>
                    <th role="columnheader">Date</th>
                    <th role="columnheader">Amount</th>
                    <th role="columnheader">Plan</th>
                    <th role="columnheader">Ticket Details</th>
                </tr>
            </thead>
            <tbody>
                ${player.paymentHistory.map(payment => `
                    <tr role="row">
                        <td role="cell">${formatDate(payment.paymentDate)}</td>
                        <td role="cell">${payment.paymentAmount.toFixed(2)}</td>
                        <td role="cell">${payment.membershipCampaign}</td>
                        <td role="cell">${payment.ticketDetails || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Focus on close button for accessibility
    setTimeout(() => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    }, 100);
}

/**
 * Close payment history modal
 */
function closePaymentHistoryModal() {
    const modal = document.getElementById('paymentHistoryModal');
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('uploadStatus');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status-message';
        }, 5000);
    }
}

/**
 * Show error message
 */
function showError(message) {
    showStatus(`❌ ${message}`, 'error');
}

/**
 * Show success message
 */
function showSuccess(message) {
    showStatus(message, 'success');
}

/**
 * Show warning message
 */
function showWarning(message) {
    showStatus(`⚠️ ${message}`, 'warning');
}

/**
 * Show info message
 */
function showInfo(message) {
    showStatus(`ℹ️ ${message}`, 'info');
}

/**
 * Show loading indicator
 */
function showLoading(message = 'Loading...') {
    const statusDiv = document.getElementById('uploadStatus');
    if (!statusDiv) return;
    
    appState.isLoading = true;
    statusDiv.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <span>${message}</span>
        </div>
    `;
    statusDiv.className = 'status-message loading';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    appState.isLoading = false;
    const statusDiv = document.getElementById('uploadStatus');
    if (!statusDiv) return;
    
    // Only clear if it's still showing loading
    if (statusDiv.classList.contains('loading')) {
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
    }
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (!date) return 'N/A';
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format status for display
 */
function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Membership Analyzer Functions

/**
 * Analyze payments and create player records
 * @param {Array} records - Payment records
 * @param {Array} plans - Membership plans
 * @returns {Array} - Array of player records
 */
function analyzePayments(records, plans) {
    // Filter only complete records for analysis
    const completeRecords = records.filter(r => r.isComplete);

    if (completeRecords.length === 0) {
        return [];
    }

    // Group payments by player
    const playerPaymentsMap = groupPaymentsByPlayer(completeRecords);

    // Create player records from grouped payments
    const players = [];

    for (const [playerKey, payments] of playerPaymentsMap.entries()) {
        const player = createPlayerRecord(playerKey, payments, plans);
        if (player) {
            players.push(player);
        }
    }

    return players;
}

/**
 * Group payment records by player
 * @param {Array} records - Payment records
 * @returns {Map} - Map of player identifier to payment records
 */
function groupPaymentsByPlayer(records) {
    const playerPaymentsMap = new Map();
    
    for (const record of records) {
        // Use player name if available, otherwise use payer (guardian) name
        const playerIdentifier = record.playerName || record.payerName;
        
        if (!playerIdentifier) {
            continue; // Skip records without any identifier
        }
        
        // Get or create array for this player
        if (!playerPaymentsMap.has(playerIdentifier)) {
            playerPaymentsMap.set(playerIdentifier, []);
        }
        
        playerPaymentsMap.get(playerIdentifier).push(record);
    }
    
    return playerPaymentsMap;
}

/**
 * Create a player record from grouped payments
 * @param {string} playerIdentifier - Player name or guardian name
 * @param {Array} payments - All payments for this player
 * @param {Array} plans - Membership plans
 * @returns {Object} - Player record
 */
function createPlayerRecord(playerIdentifier, payments, plans) {
    if (!payments || payments.length === 0) {
        return null;
    }

    // Sort payments by date (most recent first)
    const sortedPayments = [...payments].sort((a, b) => b.paymentDate - a.paymentDate);

    // Get the most recent payment
    const mostRecentPayment = sortedPayments[0];

    // Determine player name and guardian name
    // If the first payment has a player name, use it; otherwise the identifier is both player and guardian
    const hasPlayerName = mostRecentPayment.playerName !== null;
    const playerName = hasPlayerName ? mostRecentPayment.playerName : playerIdentifier;
    const guardianName = hasPlayerName ? mostRecentPayment.payerName : playerIdentifier;
    const dateOfBirth = mostRecentPayment.dateOfBirth || null;

    // Check if membership plan is known
    const plan = plans.find(p => p.name === mostRecentPayment.membershipCampaign);
    const hasUnknownPlan = !plan;

    // Calculate expiry date based on most recent payment
    const expiryDate = calculateExpiryDate(mostRecentPayment, plans);

    // Determine membership status (pass membership plan and recurringStatus for annual fee detection)
    const status = determineMembershipStatus(expiryDate, mostRecentPayment.membershipCampaign, mostRecentPayment.recurringStatus);

    // Calculate days until expiry (positive if active, negative if lapsed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate totals
    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce((sum, p) => sum + p.paymentAmount, 0);

    // Sort payment history chronologically (oldest to newest for display)
    const paymentHistory = [...payments].sort((a, b) => a.paymentDate - b.paymentDate);
    
    // Detect duplicates within this player's payment history
    const duplicatePayments = detectPlayerDuplicates(paymentHistory);

    return {
        playerName,
        guardianName,
        dateOfBirth,
        membershipCampaign: mostRecentPayment.membershipCampaign,
        ticketDetails: mostRecentPayment.ticketDetails || 'N/A',
        lastPaymentDate: mostRecentPayment.paymentDate,
        lastPaymentAmount: mostRecentPayment.paymentAmount,
        expiryDate,
        status,
        daysUntilExpiry,
        totalPayments,
        totalAmountPaid,
        paymentHistory,
        duplicatePayments,  // Store duplicate payment information
        hasUnknownPlan  // Flag for unknown membership plan
    };
}

/**
 * Detect duplicate payments within a player's payment history
 * @param {Array} payments - Player's payment history
 * @returns {Array} - Array of duplicate groups
 */
function detectPlayerDuplicates(payments) {
    const duplicateGroups = [];
    const seen = new Map();
    
    for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const key = createDuplicateKey(payment);
        
        if (!key) continue;
        
        if (seen.has(key)) {
            // This is a duplicate
            const originalIndex = seen.get(key);
            
            // Check if we already have a group for this duplicate
            let group = duplicateGroups.find(g => g.payments.some(p => p.index === originalIndex));
            
            if (group) {
                // Add to existing group
                group.payments.push({ index: i, payment });
            } else {
                // Create new group
                duplicateGroups.push({
                    key,
                    payments: [
                        { index: originalIndex, payment: payments[originalIndex] },
                        { index: i, payment }
                    ]
                });
            }
        } else {
            // First occurrence
            seen.set(key, i);
        }
    }
    
    return duplicateGroups;
}

/**
 * Calculate expiry date for a payment
 * @param {Object} payment - Payment record
 * @param {Array} plans - Membership plans
 * @returns {Date|null} - Expiry date or null if plan not found or annual fee
 */
function calculateExpiryDate(payment, plans) {
    if (!payment || !payment.paymentDate || !payment.membershipCampaign) {
        return null;
    }
    
    // Check if this is an annual fee (one-time payment) based on recurringStatus field
    // If recurringStatus is blank/null/empty, it's an annual fee
    if (!payment.recurringStatus || payment.recurringStatus.trim() === '') {
        return null; // Annual fees don't expire
    }
    
    // Find the matching plan
    const plan = plans.find(p => p.name === payment.membershipCampaign);
    
    if (!plan || !plan.durationDays) {
        return null;
    }
    
    // Calculate expiry date: payment date + plan duration
    const expiryDate = new Date(payment.paymentDate);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
    
    return expiryDate;
}

/**
 * Determine membership status based on expiry date
 * @param {Date|null} expiryDate - Expiry date
 * @param {string} membershipCampaign - Membership plan name
 * @param {string} recurringStatus - Recurring status from Excel (blank for annual fees)
 * @returns {string} - Status: 'active', 'expiring_soon', 'lapsed', or 'annual_fee'
 */
function determineMembershipStatus(expiryDate, membershipCampaign = '', recurringStatus = '') {
    // Check if this is a one-time payment (annual fee) - no expiry date
    if (!expiryDate) {
        // If recurringStatus is blank/null/empty, it's an annual fee
        if (!recurringStatus || recurringStatus.trim() === '') {
            return 'annual_fee';
        }
        return 'lapsed';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'lapsed';
    } else if (daysUntilExpiry <= 7) {
        return 'expiring_soon';
    } else {
        return 'active';
    }
}

// Import Preview Functions

/**
 * Show import preview modal before final import
 * @param {Array} paymentRecords - Parsed payment records
 * @param {Event} fileInputEvent - File input event (to reset if needed)
 */
function showImportPreview(paymentRecords, fileInputEvent) {
    // Analyze the records for preview
    const totalRecords = paymentRecords.length;
    const completeRecords = paymentRecords.filter(r => r.isComplete);
    const incompleteRecords = paymentRecords.filter(r => !r.isComplete);
    const completeCount = completeRecords.length;
    const incompleteCount = incompleteRecords.length;
    
    // Check for unknown membership plans
    const planNames = new Set(appState.membershipCampaigns.map(p => p.name));
    const unknownPlans = new Set();
    const recordsWithUnknownPlans = [];
    
    for (const record of completeRecords) {
        if (record.membershipCampaign && !planNames.has(record.membershipCampaign)) {
            unknownPlans.add(record.membershipCampaign);
            recordsWithUnknownPlans.push(record);
        }
    }
    
    // Detect duplicates
    const duplicateInfo = detectDuplicates(paymentRecords);
    
    // Build warnings array
    const warnings = [];
    
    if (incompleteCount > 0) {
        warnings.push({
            type: 'warning',
            icon: '⚠️',
            message: `${incompleteCount} incomplete record(s) with missing required fields will be excluded from analysis.`
        });
    }
    
    if (unknownPlans.size > 0) {
        const planList = Array.from(unknownPlans).join(', ');
        warnings.push({
            type: 'warning',
            icon: '⚠️',
            message: `${unknownPlans.size} unknown membership plan(s) found: "${planList}". ${recordsWithUnknownPlans.length} record(s) affected. Expiry dates cannot be calculated for these records.`
        });
    }
    
    if (duplicateInfo.hasDuplicates) {
        warnings.push({
            type: 'info',
            icon: 'ℹ️',
            message: `${duplicateInfo.totalDuplicates} duplicate payment(s) detected in ${duplicateInfo.duplicateGroups.length} group(s). You'll be able to choose how to handle them after confirming import.`
        });
    }
    
    if (completeCount === 0) {
        warnings.push({
            type: 'error',
            icon: '❌',
            message: 'No complete payment records found. All records are missing required fields. Import cannot proceed.'
        });
    }
    
    // Create preview table HTML (show first 10 records as sample)
    const sampleRecords = paymentRecords.slice(0, 10);
    const previewTableHTML = `
        <div class="preview-table-container">
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Payer Name</th>
                        <th>Player Name</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Plan</th>
                    </tr>
                </thead>
                <tbody>
                    ${sampleRecords.map(record => {
                        const statusIcon = record.isComplete ? '✓' : '⚠️';
                        const statusClass = record.isComplete ? 'complete' : 'incomplete';
                        const unknownPlanClass = record.isComplete && !planNames.has(record.membershipCampaign) ? 'unknown-campaign' : '';
                        
                        return `
                            <tr class="${statusClass} ${unknownPlanClass}">
                                <td class="status-cell">${statusIcon}</td>
                                <td>${record.payerName || '<em>Missing</em>'}</td>
                                <td>${record.playerName || '<em>N/A</em>'}</td>
                                <td>${record.paymentAmount > 0 ? record.paymentAmount.toFixed(2) : '<em>Missing</em>'}</td>
                                <td>${record.paymentDate ? formatDate(record.paymentDate) : '<em>Missing</em>'}</td>
                                <td>${record.membershipCampaign || '<em>Missing</em>'}</td>
                            </tr>
                        `;
                    }).join('')}
                    ${totalRecords > 10 ? `
                        <tr class="more-records">
                            <td colspan="6"><em>... and ${totalRecords - 10} more record(s)</em></td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
    
    // Create modal HTML
    const modalHTML = `
        <div id="previewModal" class="modal show">
            <div class="modal-content preview-modal">
                <h2>📋 Import Preview</h2>
                
                <div class="preview-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total Records:</span>
                        <span class="summary-value">${totalRecords}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Complete Records:</span>
                        <span class="summary-value complete">${completeCount}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Incomplete Records:</span>
                        <span class="summary-value ${incompleteCount > 0 ? 'warning' : ''}">${incompleteCount}</span>
                    </div>
                </div>
                
                ${warnings.length > 0 ? `
                    <div class="preview-warnings">
                        <h3>Warnings & Information</h3>
                        ${warnings.map(w => `
                            <div class="preview-warning ${w.type}">
                                <span class="warning-icon">${w.icon}</span>
                                <span class="warning-message">${w.message}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="preview-section">
                    <h3>Record Preview ${totalRecords > 10 ? '(First 10 records)' : ''}</h3>
                    ${previewTableHTML}
                    <div class="preview-legend">
                        <span class="legend-item"><span class="legend-icon complete">✓</span> Complete record</span>
                        <span class="legend-item"><span class="legend-icon incomplete">⚠️</span> Incomplete record (will be excluded)</span>
                    </div>
                </div>
                
                <div class="preview-actions">
                    ${completeCount > 0 ? `
                        <button id="confirmImportBtn" class="btn btn-primary">
                            Confirm Import (${completeCount} record${completeCount !== 1 ? 's' : ''})
                        </button>
                    ` : ''}
                    <button id="cancelImportBtn" class="btn btn-tertiary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const existingModal = document.getElementById('previewModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners
    const confirmBtn = document.getElementById('confirmImportBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            closePreviewModal();
            
            // Check for duplicates and proceed accordingly
            if (duplicateInfo.hasDuplicates) {
                showDuplicateNotification(duplicateInfo, paymentRecords, fileInputEvent);
            } else {
                processPaymentRecords(paymentRecords);
            }
        });
    }
    
    document.getElementById('cancelImportBtn').addEventListener('click', () => {
        closePreviewModal();
        fileInputEvent.target.value = '';
        showInfo('Import cancelled. No data was imported.');
    });
}

/**
 * Close preview modal
 */
function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.remove();
    }
}

// Duplicate Detection Functions

/**
 * Detect duplicate payment records
 * @param {Array} records - Payment records to check
 * @returns {Object} - Duplicate information
 */
function detectDuplicates(records) {
    const duplicateGroups = [];
    const seen = new Map();
    
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Create a key based on payment date, amount, and payer name
        const key = createDuplicateKey(record);
        
        if (!key) {
            // Skip records without required fields for duplicate detection
            continue;
        }
        
        if (seen.has(key)) {
            // This is a duplicate
            const originalIndex = seen.get(key);
            
            // Check if we already have a group for this duplicate
            let group = duplicateGroups.find(g => g.indices.includes(originalIndex));
            
            if (group) {
                // Add to existing group
                group.indices.push(i);
            } else {
                // Create new group
                duplicateGroups.push({
                    key,
                    indices: [originalIndex, i],
                    payerName: record.payerName,
                    paymentDate: record.paymentDate,
                    paymentAmount: record.paymentAmount
                });
            }
        } else {
            // First occurrence
            seen.set(key, i);
        }
    }
    
    return {
        hasDuplicates: duplicateGroups.length > 0,
        duplicateGroups,
        totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.indices.length - 1, 0)
    };
}

/**
 * Create a unique key for duplicate detection
 * @param {Object} record - Payment record
 * @returns {string|null} - Unique key or null if required fields missing
 */
function createDuplicateKey(record) {
    if (!record.payerName || !record.paymentDate || !record.paymentAmount) {
        return null;
    }
    
    // Normalize date to YYYY-MM-DD format
    const dateStr = record.paymentDate instanceof Date 
        ? record.paymentDate.toISOString().split('T')[0]
        : String(record.paymentDate);
    
    // Normalize payer name (lowercase, trim)
    const payerName = String(record.payerName).toLowerCase().trim();
    
    // Normalize amount (round to 2 decimal places)
    const amount = Number(record.paymentAmount).toFixed(2);
    
    return `${dateStr}|${payerName}|${amount}`;
}

/**
 * Show duplicate notification modal
 * @param {Object} duplicateInfo - Information about duplicates
 * @param {Array} paymentRecords - All payment records
 * @param {Event} fileInputEvent - File input event (to reset if needed)
 */
function showDuplicateNotification(duplicateInfo, paymentRecords, fileInputEvent) {
    const { duplicateGroups, totalDuplicates } = duplicateInfo;
    
    // Create modal HTML
    const modalHTML = `
        <div id="duplicateModal" class="modal show">
            <div class="modal-content">
                <h2>⚠️ Duplicate Payments Detected</h2>
                <p class="duplicate-summary">
                    Found <strong>${totalDuplicates}</strong> duplicate payment(s) in ${duplicateGroups.length} group(s).
                </p>
                <p class="duplicate-explanation">
                    Duplicates are identified by matching payment date, amount, and payer name.
                </p>
                
                <div class="duplicate-groups">
                    ${duplicateGroups.map((group, idx) => `
                        <div class="duplicate-group">
                            <h4>Duplicate Group ${idx + 1}</h4>
                            <p>
                                <strong>Payer:</strong> ${group.payerName}<br>
                                <strong>Date:</strong> ${formatDate(group.paymentDate)}<br>
                                <strong>Amount:</strong> ${group.paymentAmount.toFixed(2)}<br>
                                <strong>Occurrences:</strong> ${group.indices.length}
                            </p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="duplicate-actions">
                    <button id="includeDuplicatesBtn" class="btn btn-secondary">
                        Include All Records
                    </button>
                    <button id="excludeDuplicatesBtn" class="btn btn-primary">
                        Exclude Duplicates (Keep First Only)
                    </button>
                    <button id="cancelUploadBtn" class="btn btn-tertiary">
                        Cancel Upload
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const existingModal = document.getElementById('duplicateModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up event listeners
    document.getElementById('includeDuplicatesBtn').addEventListener('click', () => {
        closeDuplicateModal();
        processPaymentRecords(paymentRecords, duplicateInfo);
        showWarning(`File processed with ${totalDuplicates} duplicate(s) included. This may affect membership calculations.`);
    });
    
    document.getElementById('excludeDuplicatesBtn').addEventListener('click', () => {
        closeDuplicateModal();
        const filteredRecords = excludeDuplicates(paymentRecords, duplicateInfo);
        processPaymentRecords(filteredRecords, duplicateInfo);
        showSuccess(`✓ File processed: ${totalDuplicates} duplicate(s) excluded (kept first occurrence only)`);
    });
    
    document.getElementById('cancelUploadBtn').addEventListener('click', () => {
        closeDuplicateModal();
        fileInputEvent.target.value = '';
        showInfo('Upload cancelled. Please select a different file.');
    });
}

/**
 * Close duplicate notification modal
 */
function closeDuplicateModal() {
    const modal = document.getElementById('duplicateModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Exclude duplicate records, keeping only the first occurrence
 * @param {Array} records - All payment records
 * @param {Object} duplicateInfo - Duplicate information
 * @returns {Array} - Filtered records without duplicates
 */
function excludeDuplicates(records, duplicateInfo) {
    const { duplicateGroups } = duplicateInfo;
    
    // Create a set of indices to exclude (all duplicates except first occurrence)
    const indicesToExclude = new Set();
    
    for (const group of duplicateGroups) {
        // Keep the first index, exclude the rest
        for (let i = 1; i < group.indices.length; i++) {
            indicesToExclude.add(group.indices[i]);
        }
    }
    
    // Filter records, marking excluded duplicates
    return records.map((record, index) => {
        if (indicesToExclude.has(index)) {
            // Mark as excluded duplicate
            return {
                ...record,
                isExcludedDuplicate: true,
                isComplete: false  // Treat as incomplete so it won't be analyzed
            };
        }
        return record;
    }).filter(record => !record.isExcludedDuplicate);
}

// Data Export Functions

/**
 * Generate Excel export from player data
 * @param {Array} players - Array of player records to export
 * @param {string} filter - Current filter applied
 * @returns {Blob} - Excel file as blob
 */
function generateExport(players, filter) {
    // Create worksheet data
    const worksheetData = createWorksheetData(players);
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 20 }, // Player Name
        { wch: 20 }, // Guardian Name
        { wch: 18 }, // Membership Plan
        { wch: 30 }, // Ticket Details
        { wch: 18 }, // Last Payment Date
        { wch: 18 }, // Last Payment Amount
        { wch: 15 }, // Expiry Date
        { wch: 15 }, // Status
        { wch: 18 }  // Days Until Expiry
    ];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add worksheet to workbook
    const sheetName = filter === 'all' ? 'All Members' : formatStatus(filter);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Create worksheet data from players
 * @param {Array} players - Array of player records
 * @returns {Array} - 2D array for worksheet
 */
function createWorksheetData(players) {
    // Header row
    const headers = [
        'Player Name',
        'Guardian Name',
        'Membership Plan',
        'Ticket Details',
        'Last Payment Date',
        'Last Payment Amount',
        'Expiry Date',
        'Status',
        'Days Until Expiry'
    ];
    
    // Data rows
    const rows = players.map(player => [
        player.playerName,
        player.guardianName,
        player.membershipCampaign,
        player.ticketDetails || 'N/A',
        formatDate(player.lastPaymentDate),
        player.lastPaymentAmount.toFixed(2),
        player.expiryDate ? formatDate(player.expiryDate) : 'Unknown',
        formatStatus(player.status),
        player.expiryDate ? player.daysUntilExpiry : 'N/A'
    ]);
    
    // Combine headers and rows
    return [headers, ...rows];
}

/**
 * Trigger file download
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
function triggerDownload(blob, filename) {
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Data Store Functions
// These will be expanded in task 4

/**
 * Store payment records in memory
 */
function storePaymentRecords(records) {
    appState.paymentRecords = records;
}

/**
 * Get payment records from memory
 */
function getPaymentRecords() {
    return appState.paymentRecords;
}

/**
 * Store players in memory
 */
function storePlayers(players) {
    appState.players = players;
}

/**
 * Get players from memory
 */
function getPlayers() {
    return appState.players;
}

/**
 * Store membership plans in memory
 */
function storeMembershipCampaigns(plans) {
    appState.membershipCampaigns = plans;
}

/**
 * Get membership plans from memory
 */
function getMembershipCampaigns() {
    return appState.membershipCampaigns;
}

/**
 * Clear all data from memory
 */
function clearAllData() {
    appState.paymentRecords = [];
    appState.players = [];
    appState.currentFilter = 'all';
    appState.errorMessage = null;
    renderTable();
    updateRecordCount();
}

// Notifications System
const notifications = [];

/**
 * Add a notification to the drawer
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function addNotification(type, title, message) {
    const notification = {
        id: Date.now(),
        type,
        title,
        message,
        timestamp: new Date()
    };
    
    notifications.unshift(notification); // Add to beginning
    updateNotificationsDrawer();
    updateNotificationBadge();
}

/**
 * Update the notifications drawer content
 */
function updateNotificationsDrawer() {
    const content = document.getElementById('notificationsContent');
    if (!content) return;
    
    if (notifications.length === 0) {
        content.innerHTML = '<p class="no-notifications">No notifications</p>';
        return;
    }
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    content.innerHTML = notifications.map(notif => {
        const icon = icons[notif.type] || 'ℹ';
        const timeAgo = getTimeAgo(notif.timestamp);
        
        return `
            <div class="notification-item ${notif.type}">
                <div class="notification-header">
                    <span class="notification-icon">${icon}</span>
                    <span class="notification-title">${notif.title}</span>
                </div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-timestamp">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

/**
 * Update notification badge count
 */
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    if (notifications.length > 0) {
        badge.textContent = notifications.length;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Toggle notifications drawer
 */
function toggleNotificationsDrawer() {
    const drawer = document.getElementById('notificationsDrawer');
    const overlay = document.getElementById('drawerOverlay');
    
    if (!drawer || !overlay) return;
    
    const isOpen = drawer.classList.contains('open');
    
    if (isOpen) {
        drawer.classList.remove('open');
        overlay.classList.remove('show');
    } else {
        drawer.classList.add('open');
        overlay.classList.add('show');
    }
}

/**
 * Close notifications drawer
 */
function closeNotificationsDrawer() {
    const drawer = document.getElementById('notificationsDrawer');
    const overlay = document.getElementById('drawerOverlay');
    
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

// Set up notifications drawer event listeners
document.addEventListener('DOMContentLoaded', () => {
    const notifBtn = document.getElementById('notificationsBtn');
    const closeDrawerBtn = document.querySelector('.close-drawer');
    const overlay = document.getElementById('drawerOverlay');
    
    if (notifBtn) {
        notifBtn.addEventListener('click', toggleNotificationsDrawer);
    }
    
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeNotificationsDrawer);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeNotificationsDrawer);
    }
});

// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcon('light');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});

function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-theme');
    
    if (isLight) {
        body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
    } else {
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
    }
}

function updateThemeIcon(theme) {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) return;
    
    const icon = themeToggleBtn.querySelector('span[aria-hidden="true"]');
    if (icon) {
        // Sun icon for light theme (click to go dark), Moon icon for dark theme (click to go light)
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
    
    // Update aria-label
    themeToggleBtn.setAttribute('aria-label', 
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
    themeToggleBtn.setAttribute('title', 
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
}
