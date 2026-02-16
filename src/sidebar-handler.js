/**
 * Sidebar Handler for Gmail-style navigation
 * This file contains functions to handle the new sidebar UI
 */

/**
 * Set up event listeners for the new sidebar
 */
function setupSidebarEventListeners() {
    // Import button click
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Navigation items (filter buttons)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            handleFilterChange(filter);
        });
    });
    
    // Campaign filter dropdown in header
    const campaignFilter = document.getElementById('campaignFilter');
    if (campaignFilter) {
        campaignFilter.addEventListener('change', (e) => {
            handleSidebarCampaignFilter(e.target.value);
        });
    }
}

/**
 * Update filter counts in navigation items
 */
function updateSidebarCounts() {
    const players = appState.players;
    
    // Count players by status
    const counts = {
        all: players.length,
        active: players.filter(p => p.status === 'active').length,
        expiring_soon: players.filter(p => p.status === 'expiring_soon').length,
        lapsed: players.filter(p => p.status === 'lapsed').length,
        annual_fee: players.filter(p => p.status === 'annual_fee').length
    };
    
    // Update count displays
    const countAll = document.getElementById('count-all');
    const countActive = document.getElementById('count-active');
    const countExpiring = document.getElementById('count-expiring');
    const countLapsed = document.getElementById('count-lapsed');
    const countAnnual = document.getElementById('count-annual');
    
    if (countAll) countAll.textContent = counts.all;
    if (countActive) countActive.textContent = counts.active;
    if (countExpiring) countExpiring.textContent = counts.expiring_soon;
    if (countLapsed) countLapsed.textContent = counts.lapsed;
    if (countAnnual) countAnnual.textContent = counts.annual_fee;
}

/**
 * Update active state of navigation items
 */
function updateSidebarActiveState(filter) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
        if (item.dataset.filter === filter) {
            item.classList.add('active');
            item.setAttribute('aria-pressed', 'true');
        }
    });
    
    // Update plan items
    document.querySelectorAll('.campaign-item-nav').forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * Render campaigns in header dropdown
 */
function renderSidebarCampaigns() {
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
 * Handle campaign filter change with sidebar update
 */
function handleSidebarCampaignFilter(campaignName) {
    appState.currentCampaignFilter = campaignName;
    
    // Re-render table
    renderTable();
    updateRecordCount();
    updateSidebarCounts();
    renderSidebarCampaigns();
}
