# Terminology Update: Plans → Campaigns

## Overview
Updated all references from "plans" to "campaigns" throughout the application to better reflect the membership structure terminology.

## Changes Made

### 1. User Interface (index.html)
- **Header Dropdown**: "Plans Dropdown" → "Campaigns Dropdown"
- **Filter Select**: `id="planFilter"` → `id="campaignFilter"`
- **Aria Label**: "Filter by membership plan" → "Filter by membership campaign"
- **Options**: "All Plans" → "All Campaigns"
- **Sidebar Section**: "Plans Section" → "Campaigns Section"
- **Section Heading**: "Plans" → "Campaigns"
- **Container ID**: `id="plansList"` → `id="campaignsList"`

### 2. JavaScript Variables & Functions (src/app.js)
- `membershipPlans` → `membershipCampaigns`
- `membershipPlan` → `membershipCampaign`
- `currentPlanFilter` → `currentCampaignFilter`
- `initializeDefaultPlans()` → `initializeDefaultCampaigns()`
- `autoDetectMembershipPlans()` → `autoDetectMembershipCampaigns()`
- `renderPlanFilter()` → `renderCampaignFilter()`
- `handlePlanFilterChange()` → `handleCampaignFilterChange()`

### 3. Sidebar Handler (src/sidebar-handler.js)
- `planFilter` → `campaignFilter`
- `renderSidebarPlans()` → `renderSidebarCampaigns()`
- `handleSidebarPlanFilter()` → `handleSidebarCampaignFilter()`
- `uniquePlans` → `uniqueCampaigns`
- `sortedPlans` → `sortedCampaigns`

### 4. CSS Classes (src/styles.css)
- `.plans-nav` → `.campaigns-nav`
- `.plan-item-nav` → `.campaign-item-nav`
- `.plan-icon` → `.campaign-icon`
- `.plan-name-label` → `.campaign-name-label`
- `.plan-count` → `.campaign-count`
- `.plan-config` → `.campaign-config`
- `.plan-form` → `.campaign-form`
- `.plans-list` → `.campaigns-list`
- `.empty-plans` → `.empty-campaigns`
- `.plan-item` → `.campaign-item`
- `.plan-info` → `.campaign-info`
- `.plan-name` → `.campaign-name`
- `.plan-duration` → `.campaign-duration`
- `.unknown-plan` → `.unknown-campaign`
- `.plan-tag-row` → `.campaign-tag-row`
- `.plan-tag-inline` → `.campaign-tag-inline`
- `.plan-tag` → `.campaign-tag`

### 5. Comments & Documentation
- All code comments updated to use "campaign" terminology
- CSS section headers updated
- Function documentation updated

## Backward Compatibility

### Excel Column Detection
The column detection logic still recognizes both old and new terminology:
```javascript
const campaignPatterns = ['campaign', 'program', 'plan', 'item', 'membership plan', 'membership', 'product'];
```

This means Excel files with columns named:
- "Campaign" ✓
- "Plan" ✓
- "Membership Plan" ✓
- "Program" ✓
- "Item" ✓

...will all be correctly detected and processed.

## User-Facing Changes

### Before:
- "All Plans" dropdown
- "Plans" section in sidebar
- "Membership Plan" in table
- "Plan" in payment history

### After:
- "All Campaigns" dropdown
- "Campaigns" section in sidebar
- "Membership Campaign" in table
- "Campaign" in payment history

## Technical Impact

### No Breaking Changes
- All functionality remains the same
- Data structures unchanged (only renamed)
- Excel file parsing still works with old column names
- No database or storage changes required

### Benefits
- More accurate terminology for membership programs
- Consistent with industry standard terminology
- Better alignment with campaign-based membership models
- Clearer distinction from other types of "plans"

## Files Modified

1. `index.html` - UI elements and IDs
2. `src/app.js` - Core application logic
3. `src/sidebar-handler.js` - Sidebar functionality
4. `src/styles.css` - CSS classes and styling

## Testing Checklist

- [x] Campaign dropdown displays correctly
- [x] Campaign filtering works
- [x] Campaign auto-detection from Excel works
- [x] Campaign tags display in table
- [x] Campaign information in payment history
- [x] Sidebar campaign navigation
- [x] CSS styling applies correctly
- [x] No console errors
- [x] Backward compatibility with "plan" column names

## Migration Notes

### For Users
No action required. The application will continue to work with existing Excel files that use "Plan" or "Membership Plan" as column headers.

### For Developers
When adding new features:
- Use "campaign" terminology in new code
- Update variable names to use `campaign` instead of `plan`
- Use CSS classes with `campaign-` prefix
- Update documentation to reflect campaign terminology

## Related Documentation
- See `docs/PROJECT-STRUCTURE.md` for overall architecture
- See `docs/FEATURE-UPDATE-AUTO-DETECT-PLANS.md` for campaign auto-detection logic
