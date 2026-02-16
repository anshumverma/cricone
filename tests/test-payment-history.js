/**
 * Test Runner for Task 7.4: Payment Totals and History
 * Tests: Sum total amount paid, count payments, chronological sorting
 */

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// ============================================================================
// HELPER FUNCTIONS FROM APP.JS
// ============================================================================

function groupPaymentsByPlayer(records) {
    const grouped = new Map();
    
    records.forEach(record => {
        const playerIdentifier = record.playerName || record.payerName;
        
        if (!grouped.has(playerIdentifier)) {
            grouped.set(playerIdentifier, []);
        }
        
        grouped.get(playerIdentifier).push(record);
    });
    
    return grouped;
}

function calculateExpiryDate(payment, plans) {
    const plan = plans.find(p => p.name === payment.membershipPlan);
    
    if (!plan) {
        return null;
    }
    
    const expiryDate = new Date(payment.paymentDate);
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays);
    
    return expiryDate;
}

function determineMembershipStatus(expiryDate) {
    if (!expiryDate) {
        return 'unknown';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
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
    const hasPlayerName = mostRecentPayment.playerName !== null;
    const playerName = hasPlayerName ? mostRecentPayment.playerName : playerIdentifier;
    const guardianName = hasPlayerName ? mostRecentPayment.payerName : playerIdentifier;

    // Check if membership plan is known
    const plan = plans.find(p => p.name === mostRecentPayment.membershipPlan);
    const hasUnknownPlan = !plan;

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
        paymentHistory,
        hasUnknownPlan
    };
}

function analyzePayments(records, plans) {
    const grouped = groupPaymentsByPlayer(records);
    const players = [];
    
    grouped.forEach((payments, playerIdentifier) => {
        const playerRecord = createPlayerRecord(playerIdentifier, payments, plans);
        if (playerRecord) {
            players.push(playerRecord);
        }
    });
    
    return players;
}

// ============================================================================
// TEST DATA
// ============================================================================

const testPaymentRecords = [
    {
        payerName: 'John Doe',
        playerName: 'Jane Doe',
        paymentAmount: 150,
        paymentDate: new Date('2024-03-15'),
        membershipPlan: 'Monthly',
        isComplete: true
    },
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
        paymentAmount: 125,
        paymentDate: new Date('2024-02-15'),
        membershipPlan: 'Monthly',
        isComplete: true
    },
    {
        payerName: 'Mary Smith',
        playerName: 'Bob Smith',
        paymentAmount: 200,
        paymentDate: new Date('2024-02-01'),
        membershipPlan: 'Quarterly',
        isComplete: true
    },
    {
        payerName: 'Mary Smith',
        playerName: 'Bob Smith',
        paymentAmount: 180,
        paymentDate: new Date('2023-11-01'),
        membershipPlan: 'Quarterly',
        isComplete: true
    }
];

const testPlans = [
    { name: 'Monthly', durationDays: 30 },
    { name: 'Quarterly', durationDays: 90 }
];

// ============================================================================
// TESTS FOR TASK 7.4
// ============================================================================

function testPaymentTotalsAndHistory() {
    console.log('\n=== TASK 7.4: PAYMENT TOTALS AND HISTORY TESTS ===\n');
    
    // Test 1: Calculate total amount paid per player
    test('Should sum total amount paid per player', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        const bobSmith = players.find(p => p.playerName === 'Bob Smith');
        
        assertEqual(janeDoe.totalAmountPaid, 375, 'Jane Doe total should be 375 (100+125+150)');
        assertEqual(bobSmith.totalAmountPaid, 380, 'Bob Smith total should be 380 (180+200)');
    });

    // Test 2: Count total payments per player
    test('Should count total payments per player', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        const bobSmith = players.find(p => p.playerName === 'Bob Smith');
        
        assertEqual(janeDoe.totalPayments, 3, 'Jane Doe should have 3 payments');
        assertEqual(bobSmith.totalPayments, 2, 'Bob Smith should have 2 payments');
    });

    // Test 3: Sort payment history chronologically (oldest to newest)
    test('Should sort payment history chronologically', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        
        assert(janeDoe.paymentHistory.length === 3, 'Jane Doe should have 3 payments in history');
        
        // Check dates are in ascending order
        const dates = janeDoe.paymentHistory.map(p => p.paymentDate.getTime());
        for (let i = 1; i < dates.length; i++) {
            assert(dates[i] >= dates[i-1], 
                `Payment ${i} should be after payment ${i-1}`);
        }
        
        // Verify specific order
        assertEqual(janeDoe.paymentHistory[0].paymentAmount, 100, 'First payment should be 100');
        assertEqual(janeDoe.paymentHistory[1].paymentAmount, 125, 'Second payment should be 125');
        assertEqual(janeDoe.paymentHistory[2].paymentAmount, 150, 'Third payment should be 150');
    });

    // Test 4: Payment history includes all required fields
    test('Should include date, amount, and plan in payment history', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        
        janeDoe.paymentHistory.forEach((payment, index) => {
            assert(payment.paymentDate instanceof Date, 
                `Payment ${index} should have a valid date`);
            assert(typeof payment.paymentAmount === 'number', 
                `Payment ${index} should have a numeric amount`);
            assert(typeof payment.membershipPlan === 'string', 
                `Payment ${index} should have a plan name`);
        });
    });

    // Test 5: Verify chronological order for multiple players
    test('Should sort payment history for all players', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        
        players.forEach(player => {
            const dates = player.paymentHistory.map(p => p.paymentDate.getTime());
            for (let i = 1; i < dates.length; i++) {
                assert(dates[i] >= dates[i-1], 
                    `${player.playerName}: Payment ${i} should be after payment ${i-1}`);
            }
        });
    });

    // Test 6: Verify total calculations match payment history
    test('Should match totals with payment history sum', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        
        players.forEach(player => {
            const historySum = player.paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0);
            assertEqual(player.totalAmountPaid, historySum, 
                `${player.playerName}: Total should match sum of payment history`);
            
            assertEqual(player.totalPayments, player.paymentHistory.length,
                `${player.playerName}: Payment count should match history length`);
        });
    });

    // Test 7: Single payment player
    test('Should handle players with single payment', () => {
        const singlePaymentRecords = [
            {
                payerName: 'Alice Brown',
                playerName: 'Charlie Brown',
                paymentAmount: 365,
                paymentDate: new Date('2024-01-01'),
                membershipPlan: 'Annual',
                isComplete: true
            }
        ];
        
        const plans = [{ name: 'Annual', durationDays: 365 }];
        const players = analyzePayments(singlePaymentRecords, plans);
        const charlie = players.find(p => p.playerName === 'Charlie Brown');
        
        assertEqual(charlie.totalPayments, 1, 'Should have 1 payment');
        assertEqual(charlie.totalAmountPaid, 365, 'Total should be 365');
        assertEqual(charlie.paymentHistory.length, 1, 'History should have 1 entry');
    });

    // Test 8: Empty payment history
    test('Should handle empty payment records', () => {
        const players = analyzePayments([], testPlans);
        assertEqual(players.length, 0, 'Should return empty array for no payments');
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

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  TASK 7.4: PAYMENT TOTALS AND HISTORY                         ║');
    console.log('║  Requirements: 7.2, 7.4                                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
    testPaymentTotalsAndHistory();
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\nTotal Tests: ${testResults.passed + testResults.failed}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    if (testResults.failed === 0) {
        console.log('\n✓ ALL TESTS PASSED! Payment totals and history are working correctly.\n');
        console.log('Task 7.4 Implementation Summary:');
        console.log('  ✓ Sum total amount paid per player');
        console.log('  ✓ Count total payments per player');
        console.log('  ✓ Sort payment history chronologically');
        console.log('  ✓ Validates Requirements 7.2 and 7.4\n');
        process.exit(0);
    } else {
        console.log('\n✗ SOME TESTS FAILED. Please review the errors above.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests();
