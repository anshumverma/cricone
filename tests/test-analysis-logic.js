#!/usr/bin/env node

/**
 * Checkpoint Task 9: Verify Analysis Logic
 * Tests for Tasks 7.1-7.4 and 8.1
 */

// Mock DOM functions that app.js might use
global.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ addEventListener: () => {} })
};

global.window = {
    addEventListener: () => {}
};

// Load app.js functions by evaluating the relevant parts
// Since we can't directly require app.js (it's not a module), we'll copy the functions

// ============================================================================
// COPY OF ANALYSIS FUNCTIONS FROM APP.JS
// ============================================================================

function groupPaymentsByPlayer(records) {
    const playerPaymentsMap = new Map();
    
    for (const record of records) {
        const playerIdentifier = record.playerName || record.payerName;
        
        if (!playerIdentifier) {
            continue;
        }
        
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
    
    const plan = plans.find(p => p.name === payment.membershipPlan);
    
    if (!plan || !plan.durationDays) {
        return null;
    }
    
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

    const sortedPayments = [...payments].sort((a, b) => b.paymentDate - a.paymentDate);
    const mostRecentPayment = sortedPayments[0];

    const hasPlayerName = mostRecentPayment.playerName !== null;
    const playerName = hasPlayerName ? mostRecentPayment.playerName : playerIdentifier;
    const guardianName = hasPlayerName ? mostRecentPayment.payerName : playerIdentifier;

    const plan = plans.find(p => p.name === mostRecentPayment.membershipPlan);
    const hasUnknownPlan = !plan;

    const expiryDate = calculateExpiryDate(mostRecentPayment, plans);
    const status = determineMembershipStatus(expiryDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : 0;

    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce((sum, p) => sum + p.paymentAmount, 0);

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
    const completeRecords = records.filter(r => r.isComplete);

    if (completeRecords.length === 0) {
        return [];
    }

    const playerPaymentsMap = groupPaymentsByPlayer(completeRecords);
    const players = [];

    for (const [playerKey, payments] of playerPaymentsMap.entries()) {
        const player = createPlayerRecord(playerKey, payments, plans);
        if (player) {
            players.push(player);
        }
    }

    return players;
}

function createDuplicateKey(record) {
    if (!record.payerName || !record.paymentDate || !record.paymentAmount) {
        return null;
    }
    
    const dateStr = record.paymentDate instanceof Date 
        ? record.paymentDate.toISOString().split('T')[0]
        : String(record.paymentDate);
    
    const payerName = String(record.payerName).toLowerCase().trim();
    const amount = Number(record.paymentAmount).toFixed(2);
    
    return `${dateStr}|${payerName}|${amount}`;
}

function detectDuplicates(records) {
    const duplicateGroups = [];
    const seen = new Map();
    
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const key = createDuplicateKey(record);
        
        if (!key) {
            continue;
        }
        
        if (seen.has(key)) {
            const originalIndex = seen.get(key);
            let group = duplicateGroups.find(g => g.indices.includes(originalIndex));
            
            if (group) {
                group.indices.push(i);
            } else {
                duplicateGroups.push({
                    key,
                    indices: [originalIndex, i],
                    payerName: record.payerName,
                    paymentDate: record.paymentDate,
                    paymentAmount: record.paymentAmount
                });
            }
        } else {
            seen.set(key, i);
        }
    }
    
    return {
        hasDuplicates: duplicateGroups.length > 0,
        duplicateGroups,
        totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.indices.length - 1, 0)
    };
}

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: []
};

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

function runTest(name, testFn) {
    testResults.total++;
    try {
        testFn();
        testResults.passed++;
        return { name, status: 'PASS', error: null };
    } catch (error) {
        testResults.failed++;
        return { name, status: 'FAIL', error: error.message };
    }
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testPlayerGrouping() {
    const tests = [];
    const testPaymentRecords = [
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
            playerName: 'Jack Doe',
            paymentAmount: 200,
            paymentDate: new Date('2024-01-20'),
            membershipPlan: 'Quarterly',
            isComplete: true
        },
        {
            payerName: 'Mary Smith',
            playerName: null,
            paymentAmount: 365,
            paymentDate: new Date('2024-01-01'),
            membershipPlan: 'Annual',
            isComplete: true
        }
    ];

    const testPlans = [
        { name: 'Monthly', durationDays: 30 },
        { name: 'Quarterly', durationDays: 90 },
        { name: 'Annual', durationDays: 365 }
    ];

    tests.push(runTest('Should group payments by player name', () => {
        const grouped = groupPaymentsByPlayer(testPaymentRecords);
        assert(grouped.size === 3, `Expected 3 unique players, got ${grouped.size}`);
        assert(grouped.has('Jane Doe'), 'Should have Jane Doe');
        assert(grouped.get('Jane Doe').length === 2, 'Jane Doe should have 2 payments');
    }));

    tests.push(runTest('Should create player records', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        assert(players.length === 3, `Expected 3 player records, got ${players.length}`);
    }));

    tests.push(runTest('Should link players to guardians', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        assertEqual(janeDoe.guardianName, 'John Doe', 'Jane Doe guardian should be John Doe');
    }));

    tests.push(runTest('Should calculate payment totals', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        assertEqual(janeDoe.totalPayments, 2, 'Jane Doe should have 2 payments');
        assertEqual(janeDoe.totalAmountPaid, 200, 'Jane Doe total should be 200');
    }));

    tests.push(runTest('Should use most recent payment for expiry', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        const expectedDate = new Date('2024-02-15');
        assert(janeDoe.lastPaymentDate.getTime() === expectedDate.getTime(), 
               'Should use most recent payment date');
    }));

    return { suiteName: 'Task 7.1: Player Grouping Logic', tests };
}

function testExpiryCalculation() {
    const tests = [];
    const plans = [
        { name: 'Monthly', durationDays: 30 },
        { name: 'Quarterly', durationDays: 90 },
        { name: 'Annual', durationDays: 365 }
    ];

    tests.push(runTest('Should calculate expiry for Monthly plan', () => {
        const payment = {
            paymentDate: new Date('2024-01-01'),
            membershipPlan: 'Monthly'
        };
        const result = calculateExpiryDate(payment, plans);
        const expected = new Date('2024-01-31');
        assert(result.getTime() === expected.getTime(), 
            `Expected ${expected.toISOString()}, got ${result.toISOString()}`);
    }));

    tests.push(runTest('Should calculate expiry for Quarterly plan', () => {
        const payment = {
            paymentDate: new Date('2024-01-01'),
            membershipPlan: 'Quarterly'
        };
        const result = calculateExpiryDate(payment, plans);
        const expected = new Date('2024-03-30'); // Jan 1 + 90 days = Mar 30
        // Compare dates only (ignore time/timezone)
        const resultDate = result.toISOString().split('T')[0];
        const expectedDate = expected.toISOString().split('T')[0];
        assert(resultDate === expectedDate, 
            `Expected ${expectedDate}, got ${resultDate}`);
    }));

    tests.push(runTest('Should calculate expiry for Annual plan', () => {
        const payment = {
            paymentDate: new Date('2024-01-01'),
            membershipPlan: 'Annual'
        };
        const result = calculateExpiryDate(payment, plans);
        const expected = new Date('2024-12-31');
        assert(result.getTime() === expected.getTime(), 
            `Expected ${expected.toISOString()}, got ${result.toISOString()}`);
    }));

    tests.push(runTest('Should return null for unknown plan', () => {
        const payment = {
            paymentDate: new Date('2024-01-01'),
            membershipPlan: 'UnknownPlan'
        };
        const result = calculateExpiryDate(payment, plans);
        assert(result === null, 'Should return null for unknown plan');
    }));

    tests.push(runTest('Should return null for missing payment date', () => {
        const payment = {
            paymentDate: null,
            membershipPlan: 'Monthly'
        };
        const result = calculateExpiryDate(payment, plans);
        assert(result === null, 'Should return null for missing payment date');
    }));

    return { suiteName: 'Task 7.2: Expiry Date Calculation', tests };
}

function testStatusDetermination() {
    const tests = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tests.push(runTest('Should return "lapsed" for null expiry date', () => {
        const status = determineMembershipStatus(null);
        assertEqual(status, 'lapsed', 'Null expiry should be lapsed');
    }));

    tests.push(runTest('Should return "lapsed" for past expiry date', () => {
        const past = new Date(today);
        past.setDate(past.getDate() - 30);
        const status = determineMembershipStatus(past);
        assertEqual(status, 'lapsed', 'Past expiry should be lapsed');
    }));

    tests.push(runTest('Should return "expiring_soon" for today', () => {
        const status = determineMembershipStatus(new Date(today));
        assertEqual(status, 'expiring_soon', 'Today should be expiring_soon');
    }));

    tests.push(runTest('Should return "expiring_soon" for 7 days from now', () => {
        const future = new Date(today);
        future.setDate(future.getDate() + 7);
        const status = determineMembershipStatus(future);
        assertEqual(status, 'expiring_soon', '7 days should be expiring_soon');
    }));

    tests.push(runTest('Should return "active" for 8 days from now', () => {
        const future = new Date(today);
        future.setDate(future.getDate() + 8);
        const status = determineMembershipStatus(future);
        assertEqual(status, 'active', '8 days should be active');
    }));

    tests.push(runTest('Should return "active" for 30 days from now', () => {
        const future = new Date(today);
        future.setDate(future.getDate() + 30);
        const status = determineMembershipStatus(future);
        assertEqual(status, 'active', '30 days should be active');
    }));

    return { suiteName: 'Task 7.3: Membership Status Determination', tests };
}

function testPaymentHistory() {
    const tests = [];
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
        }
    ];

    const testPlans = [{ name: 'Monthly', durationDays: 30 }];

    tests.push(runTest('Should sum total amount paid per player', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        assertEqual(janeDoe.totalAmountPaid, 375, 'Total should be 375 (100+125+150)');
    }));

    tests.push(runTest('Should count total payments per player', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        assertEqual(janeDoe.totalPayments, 3, 'Should have 3 payments');
    }));

    tests.push(runTest('Should sort payment history chronologically', () => {
        const players = analyzePayments(testPaymentRecords, testPlans);
        const janeDoe = players.find(p => p.playerName === 'Jane Doe');
        
        const dates = janeDoe.paymentHistory.map(p => p.paymentDate.getTime());
        for (let i = 1; i < dates.length; i++) {
            assert(dates[i] >= dates[i-1], 
                `Payment ${i} should be after payment ${i-1}`);
        }
    }));

    tests.push(runTest('Should include all required fields in payment history', () => {
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
    }));

    return { suiteName: 'Task 7.4: Payment Totals and History', tests };
}

function testDuplicateDetection() {
    const tests = [];

    tests.push(runTest('Should detect no duplicates in unique records', () => {
        const records = [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 }
        ];
        const result = detectDuplicates(records);
        assertEqual(result.hasDuplicates, false, 'Should have no duplicates');
        assertEqual(result.totalDuplicates, 0, 'Total duplicates should be 0');
    }));

    tests.push(runTest('Should detect exact duplicates', () => {
        const records = [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 }
        ];
        const result = detectDuplicates(records);
        assertEqual(result.hasDuplicates, true, 'Should have duplicates');
        assertEqual(result.totalDuplicates, 1, 'Should have 1 duplicate');
    }));

    tests.push(runTest('Should detect multiple duplicate groups', () => {
        const records = [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 }
        ];
        const result = detectDuplicates(records);
        assertEqual(result.hasDuplicates, true, 'Should have duplicates');
        assertEqual(result.totalDuplicates, 2, 'Should have 2 duplicates');
    }));

    tests.push(runTest('Should be case insensitive for payer names', () => {
        const records = [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "john doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "JOHN DOE", paymentDate: new Date("2024-01-01"), paymentAmount: 100 }
        ];
        const result = detectDuplicates(records);
        assertEqual(result.hasDuplicates, true, 'Should detect case-insensitive duplicates');
        assertEqual(result.totalDuplicates, 2, 'Should have 2 duplicates');
    }));

    tests.push(runTest('Should not detect duplicates with different amounts', () => {
        const records = [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 150 }
        ];
        const result = detectDuplicates(records);
        assertEqual(result.hasDuplicates, false, 'Different amounts should not be duplicates');
    }));

    tests.push(runTest('Should not detect duplicates with different dates', () => {
        const records = [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-02"), paymentAmount: 100 }
        ];
        const result = detectDuplicates(records);
        assertEqual(result.hasDuplicates, false, 'Different dates should not be duplicates');
    }));

    return { suiteName: 'Task 8.1: Duplicate Detection Logic', tests };
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

function runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  CHECKPOINT TASK 9: VERIFY ANALYSIS LOGIC                     ║');
    console.log('║  Testing Tasks 7.1-7.4 and 8.1 Implementation                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const suites = [
        testPlayerGrouping(),
        testExpiryCalculation(),
        testStatusDetermination(),
        testPaymentHistory(),
        testDuplicateDetection()
    ];

    suites.forEach(suite => {
        console.log(`\n${suite.suiteName}`);
        console.log('─'.repeat(70));
        
        suite.tests.forEach(test => {
            const icon = test.status === 'PASS' ? '✓' : '✗';
            const color = test.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
            const reset = '\x1b[0m';
            
            console.log(`${color}${icon}${reset} ${test.name}`);
            if (test.error) {
                console.log(`  ${color}Error: ${test.error}${reset}`);
            }
        });
    });

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`\x1b[32mPassed: ${testResults.passed}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${testResults.failed}\x1b[0m`);

    if (testResults.failed === 0) {
        console.log('\n\x1b[32m✓ ALL TESTS PASSED!\x1b[0m');
        console.log('All analysis logic (Tasks 7.1-7.4 and 8.1) is working correctly.');
        console.log('Ready to proceed to UI implementation tasks.\n');
        process.exit(0);
    } else {
        console.log('\n\x1b[31m✗ SOME TESTS FAILED\x1b[0m');
        console.log('Please review the errors above.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests();
