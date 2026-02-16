/**
 * Test Player Grouping Logic (Task 7.1)
 * Tests for grouping payment records by player and creating player records
 */

// Mock appState for testing
const appState = {
    paymentRecords: [],
    players: [],
    membershipPlans: [
        { name: 'Monthly', durationDays: 30 },
        { name: 'Quarterly', durationDays: 90 },
        { name: 'Annual', durationDays: 365 }
    ],
    currentFilter: 'all',
    currentSort: { column: 'playerName', direction: 'asc' },
    isLoading: false,
    errorMessage: null
};

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// ============================================================================
// COPY OF FUNCTIONS FROM app.js FOR TESTING
// ============================================================================

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

function calculateExpiryDate(payment, plans) {
    if (!payment || !payment.paymentDate || !payment.membershipPlan) {
        return null;
    }
    
    // Find the matching plan
    const plan = plans.find(p => p.name === payment.membershipPlan);
    
    if (!plan || !plan.durationDays) {
        return null;
    }
    
    // Calculate expiry date: payment date + plan duration
    const expiryDate = new Date(payment.paymentDate);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
    
    return expiryDate;
}

function determineMembershipStatus(expiryDate) {
    if (!expiryDate) {
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
    
    // Calculate expiry date based on most recent payment
    const expiryDate = calculateExpiryDate(mostRecentPayment, plans);
    
    // Determine membership status
    const status = determineMembershipStatus(expiryDate);
    
    // Calculate days until expiry (positive if active, negative if lapsed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : 0;
    
    // Calculate totals
    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce((sum, p) => sum + p.paymentAmount, 0);
    
    // Sort payment history chronologically (oldest to newest for display)
    const paymentHistory = [...payments].sort((a, b) => a.paymentDate - b.paymentDate);
    
    return {
        playerName,
        guardianName,
        membershipPlan: mostRecentPayment.membershipPlan,
        lastPaymentDate: mostRecentPayment.paymentDate,
        lastPaymentAmount: mostRecentPayment.paymentAmount,
        expiryDate,
        status,
        daysUntilExpiry,
        totalPayments,
        totalAmountPaid,
        paymentHistory
    };
}

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

// ============================================================================
// PLAYER GROUPING TESTS (Task 7.1)
// ============================================================================

function testPlayerGrouping() {
    console.log('\n=== PLAYER GROUPING TESTS (Task 7.1) ===\n');
    
    // Test 1: Group payments by player name when available
    test('Should group payments by player name when available', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-02-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            }
        ];
        
        const grouped = groupPaymentsByPlayer(records);
        
        assert(grouped.size === 1, 'Should have 1 unique player');
        assert(grouped.has('Jane Doe'), 'Should group by player name');
        assert(grouped.get('Jane Doe').length === 2, 'Should have 2 payments for Jane Doe');
    });
    
    // Test 2: Group payments by guardian name when player name unavailable
    test('Should group payments by guardian name when player name unavailable', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: null,
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'John Doe',
                playerName: null,
                paymentAmount: 100,
                paymentDate: new Date('2024-02-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            }
        ];
        
        const grouped = groupPaymentsByPlayer(records);
        
        assert(grouped.size === 1, 'Should have 1 unique player');
        assert(grouped.has('John Doe'), 'Should group by guardian name');
        assert(grouped.get('John Doe').length === 2, 'Should have 2 payments for John Doe');
    });
    
    // Test 3: Create unique player records
    test('Should create unique player records for different players', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'Mary Smith',
                playerName: 'Bob Smith',
                paymentAmount: 200,
                paymentDate: new Date('2024-01-20'),
                membershipPlan: 'Quarterly',
                isComplete: true
            }
        ];
        
        const players = analyzePayments(records, appState.membershipPlans);
        
        assert(players.length === 2, 'Should create 2 unique player records');
        assert(players[0].playerName === 'Jane Doe', 'First player should be Jane Doe');
        assert(players[1].playerName === 'Bob Smith', 'Second player should be Bob Smith');
    });
    
    // Test 4: Associate all payments with correct player
    test('Should associate all payments with correct player', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-02-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-03-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            }
        ];
        
        const players = analyzePayments(records, appState.membershipPlans);
        
        assert(players.length === 1, 'Should have 1 player');
        assert(players[0].paymentHistory.length === 3, 'Should have 3 payments in history');
        assert(players[0].totalPayments === 3, 'Should count 3 total payments');
        assert(players[0].totalAmountPaid === 300, 'Should sum to 300');
    });
    
    // Test 5: Link players to guardians
    test('Should link players to guardians correctly', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            }
        ];
        
        const players = analyzePayments(records, appState.membershipPlans);
        
        assert(players.length === 1, 'Should have 1 player');
        assert(players[0].playerName === 'Jane Doe', 'Player name should be Jane Doe');
        assert(players[0].guardianName === 'John Doe', 'Guardian name should be John Doe');
    });
    
    // Test 6: Handle case where player name is same as guardian name
    test('Should handle case where player name is unavailable (use guardian as both)', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: null,
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            }
        ];
        
        const players = analyzePayments(records, appState.membershipPlans);
        
        assert(players.length === 1, 'Should have 1 player');
        assert(players[0].playerName === 'John Doe', 'Player name should be John Doe');
        assert(players[0].guardianName === 'John Doe', 'Guardian name should be John Doe');
    });
    
    // Test 7: Skip incomplete records
    test('Should skip incomplete records during analysis', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'Mary Smith',
                playerName: null,
                paymentAmount: 0,
                paymentDate: null,
                membershipPlan: 'Monthly',
                isComplete: false
            }
        ];
        
        const players = analyzePayments(records, appState.membershipPlans);
        
        assert(players.length === 1, 'Should only create player for complete record');
        assert(players[0].playerName === 'Jane Doe', 'Should only include Jane Doe');
    });
    
    // Test 8: Handle multiple players with same guardian
    test('Should handle multiple players with same guardian', () => {
        const records = [
            {
                payerName: 'John Doe',
                playerName: 'Jane Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            },
            {
                payerName: 'John Doe',
                playerName: 'Jack Doe',
                paymentAmount: 100,
                paymentDate: new Date('2024-01-15'),
                membershipPlan: 'Monthly',
                isComplete: true
            }
        ];
        
        const players = analyzePayments(records, appState.membershipPlans);
        
        assert(players.length === 2, 'Should create 2 separate player records');
        assert(players[0].guardianName === 'John Doe', 'Both should have same guardian');
        assert(players[1].guardianName === 'John Doe', 'Both should have same guardian');
        assert(players[0].playerName !== players[1].playerName, 'Players should be different');
    });
}

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

function test(name, fn) {
    try {
        fn();
        testResults.passed++;
        testResults.tests.push({ name, status: 'PASS' });
        console.log(`✓ ${name}`);
    } catch (error) {
        testResults.failed++;
        testResults.tests.push({ name, status: 'FAIL', error: error.message });
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  TASK 7.1: PLAYER GROUPING LOGIC TESTS                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
    testPlayerGrouping();
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\nTotal Tests: ${testResults.passed + testResults.failed}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    if (testResults.failed === 0) {
        console.log('\n✓ ALL TESTS PASSED! Player grouping logic is working correctly.\n');
        process.exit(0);
    } else {
        console.log('\n✗ SOME TESTS FAILED. Please review the errors above.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests();
