# CricOne - Cricket Academy Membership Manager

A browser-based web application for analyzing cricket academy player memberships. The system processes Excel exports from payment gateway services, analyzes payment data in-memory, tracks membership status, calculates expiry dates, and identifies active versus lapsed members.

## 🌐 Live Demo

**Access the app**: [https://anshumverma.github.io/cricone/](https://anshumverma.github.io/cricone/)

## Features

- **Excel File Upload**: Import payment data from Excel files (.xlsx, .xls)
- **Campaign Management**: Auto-detect and filter by membership campaigns
- **Duplicate Detection**: Identify and handle duplicate payments intelligently
- **Membership Analysis**: Calculate expiry dates and membership status automatically
- **Player Grouping**: Associate payments with players and guardians
- **Filtering & Sorting**: View members by status (Active, Expiring Soon, Lapsed, Annual Fee)
- **Payment History**: View complete payment history for each player
- **Data Export**: Export filtered membership analysis to Excel format
- **Theme Support**: Light and dark theme with persistent preference
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Accessibility**: Full keyboard navigation and ARIA labels for screen readers

## Quick Start

### Online Access (Recommended)

Simply visit: **[https://anshumverma.github.io/cricone/](https://anshumverma.github.io/cricone/)**

No installation required! The app runs entirely in your browser.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/anshumverma/cricone.git
   cd cricone
   ```

2. Open `index.html` in a modern web browser

That's it! No build process or server required.

## Architecture

### High-Level Overview

The application follows a simple client-side architecture:

```
Browser UI → Application Controller → Business Logic Modules → In-Memory Data Store
```

### Key Components

1. **UI Layer** (`index.html`, `styles.css`)
   - File upload interface
   - Membership plan configuration
   - Data table with filtering and sorting
   - Payment history modal
   - Export functionality

2. **Application Controller** (`src/app.js`)
   - Orchestrates data flow between components
   - Manages application state
   - Handles user interactions

3. **Excel Parser**
   - Reads Excel files using SheetJS library
   - Extracts payment records
   - Validates required fields

4. **Membership Analyzer**
   - Groups payments by player
   - Calculates membership expiry dates
   - Determines membership status (active, expiring soon, lapsed)

5. **Data Export Generator**
   - Creates downloadable Excel reports
   - Respects active filters and sorting

6. **In-Memory Data Store**
   - Holds parsed payment records
   - Stores player analysis results
   - Maintains membership plan configurations
   - Clears on page refresh (stateless sessions)

### Data Models

**PaymentRecord**
```javascript
{
  payerName: string,        // Guardian name
  playerName: string,       // Player name (if available)
  paymentAmount: number,
  paymentDate: Date,
  membershipPlan: string,
  isComplete: boolean       // All required fields present
}
```

**Player**
```javascript
{
  playerName: string,
  guardianName: string,
  membershipPlan: string,
  lastPaymentDate: Date,
  lastPaymentAmount: number,
  expiryDate: Date,
  status: 'active' | 'expiring_soon' | 'lapsed',
  daysUntilExpiry: number,
  totalPayments: number,
  totalAmountPaid: number,
  paymentHistory: PaymentRecord[]
}
```

**MembershipPlan**
```javascript
{
  name: string,
  durationDays: number
}
```

## Implementation Details

### Excel Parsing

The application uses SheetJS to parse Excel files and maps columns to the data model:
- "Payer Name", "Name", "Donor Name" → payerName
- "Amount", "Payment Amount", "Total" → paymentAmount
- "Date", "Payment Date", "Transaction Date" → paymentDate
- "Campaign", "Program", "Plan", "Item" → membershipPlan
- "Player Name", "Student Name", "Beneficiary" → playerName (optional)

### Membership Status Logic

1. **Player Identification**: Groups payments by player name, or uses guardian name if player name unavailable
2. **Expiry Calculation**: `expiryDate = mostRecentPaymentDate + planDuration`
3. **Status Determination**:
   - `active`: expiryDate >= today
   - `expiring_soon`: expiryDate within 7 days
   - `lapsed`: expiryDate < today

### Duplicate Detection

Duplicates are identified based on:
- Same payment date
- Same payment amount
- Same payer name

Administrators can choose to include or exclude duplicates from analysis.

### Browser Compatibility

Requires modern browsers with ES6+ support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Project Structure

```
.
├── index.html              # Main application entry point
├── src/
│   ├── app.js             # Main application JavaScript (1776 lines)
│   └── styles.css         # Application styles
├── tests/                 # Test files for all implemented features
│   ├── test-*.html        # HTML test files
│   └── test-*.js          # JavaScript test files
├── docs/                  # Implementation documentation
│   ├── TASK-*.md          # Task implementation summaries
│   └── CHECKPOINT-*.md    # Checkpoint verification reports
├── .kiro/
│   └── specs/
│       └── cricket-academy-membership-manager/
│           ├── requirements.md  # Feature requirements
│           ├── design.md        # Design document
│           └── tasks.md         # Implementation task list
├── package.json           # Project dependencies
└── README.md             # This file
```

## Usage

1. **Import Data**: Click the "Import" button and select your Excel file
2. **View Members**: Browse all members or filter by status/campaign
3. **Check Details**: Click on any player to view their payment history
4. **Export Results**: Click the export button to download filtered data
5. **Switch Themes**: Toggle between light and dark themes

### Supported Excel Columns

The app automatically detects these columns:
- Payer Name / Guardian Name
- Player Name / Student Name (optional)
- Payment Amount
- Payment Date
- Campaign / Plan / Membership Plan
- Ticket Details (optional)
- Recurring Status (blank = annual fee)
- Date of Birth (optional)

## Deployment

### GitHub Pages

This app is deployed on GitHub Pages. To deploy your own version:

1. Fork this repository
2. Go to Settings > Pages
3. Select `main` branch and `/ (root)` folder
4. Save and wait for deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling with responsive design
- **Vanilla JavaScript** - Application logic
- **SheetJS (xlsx)** - Excel file parsing and generation
- **date-fns** - Date manipulation and formatting

## Development

### Testing

The project includes comprehensive test files in the `tests/` directory covering:
- File upload and validation
- Excel parsing
- Membership analysis
- Filtering and sorting
- Payment history
- Data export
- Error handling
- Complete workflow integration

### Documentation

Detailed implementation documentation is available in the `docs/` directory:
- Task implementation summaries for each feature
- Checkpoint verification reports
- Integration test results

## Specification

This project was built using spec-driven development methodology. The complete specification is available in `.kiro/specs/cricket-academy-membership-manager/`:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Architecture, components, and correctness properties
- `tasks.md` - Implementation plan with 26 completed tasks

## License

This project is provided as-is for cricket academy membership management.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **Issues**: [GitHub Issues](https://github.com/anshumverma/cricone/issues)
- **Documentation**: See `docs/` folder for detailed documentation
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide

## Author

**Anshum Verma**
- GitHub: [@anshumverma](https://github.com/anshumverma)

---

Made with ❤️ for cricket academies
