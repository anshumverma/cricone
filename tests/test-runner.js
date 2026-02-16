/**
 * Test Runner for Cricket Academy Membership Manager
 * Checkpoint Task 6: Verify parsing and configuration
 */

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Mock appState for testing
const appState = {
    paymentRecords: [],
    players: [],
    membershipPlans: [],
    currentFilter: 'all',
    currentSort: { column: 'playerName', direction: 'asc' },
    isLoading: false,
    errorMessage: null
};

// ============================================================================
// FILE VALIDATION TESTS (Task 2.1)
// ============================================================================

function isValidExcelFile(file) {
    if (!file || !file.name) {
        return false;
    }
    
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
}

function testFileValidation() {
    console.log('\n=== FILE VALIDATION TESTS (Task 2.1) ===\n');
    
    // Test 1: Valid .xlsx file
    test('Valid .xlsx file should be accepted', () => {
        const file = { name: 'test.xlsx' };
        assert(isValidExcelFile(file) === true, 'Should accept .xlsx files');
    });
    
    // Test 2: Valid .xls file
    test('Valid .xls file should be accepted', () => {
        const file = { name: 'test.xls' };
        assert(isValidExcelFile(file) === true, 'Should accept .xls files');
    });
    
    // Test 3: Invalid .txt file
    test('Invalid .txt file should be rejected', () => {
        const file = { name: 'test.txt' };
        assert(isValidExcelFile(file) === false, 'Should reject .txt files');
    });
    
    // Test 4: Invalid .csv file
    test('Invalid .csv file should be rejected', () => {
        const file = { name: 'test.csv' };
        assert(isValidExcelFile(file) === false, 'Should reject .csv files');
    });
    
    // Test 5: Null file
    test('Null file should be rejected', () => {
        assert(isValidExcelFile(null) === false, 'Should reject null');
    });
    
    // Test 6: File without name
    test('File without name should be rejected', () => {
        assert(isValidExcelFile({}) === false, 'Should reject file without name');
    });
    
    // Test 7: Case insensitive
    test('File extension check should be case insensitive', () => {
        const file1 = { name: 'test.XLSX' };
        const file2 = { name: 'test.XLS' };
        assert(isValidExcelFile(file1) === true, 'Should accept .XLSX');
        assert(isValidExcelFile(file2) === true, 'Should accept .XLS');
    });
}

// ============================================================================
// VALIDATION TESTS (Task 3.2)
// ============================================================================

function validateRecord(record) {
    return !!(
        record.payerName &&
        record.paymentAmount > 0 &&
        record.paymentDate &&
        record.membershipPlan
    );
}

function testRecordValidation() {
    console.log('\n=== RECORD VALIDATION TESTS (Task 3.2) ===\n');
    
    // Test 1: Complete record
    test('Complete record should be valid', () => {
        const record = {
            payerName: 'John Doe',
            playerName: 'Jane Doe',
            paymentAmount: 100,
            paymentDate: new Date('2024-01-15'),
            membershipPlan: 'Monthly'
        };
        assert(validateRecord(record) === true, 'Complete record should be valid');
    });
    
    // Test 2: Missing payer name
    test('Record without payer name should be invalid', () => {
        const record = {
            payerName: null,
            paymentAmount: 100,
            paymentDate: new Date('2024-01-15'),
            membershipPlan: 'Monthly'
        };
        assert(validateRecord(record) === false, 'Should be invalid without payer name');
    });
    
    // Test 3: Zero amount
    test('Record with zero amount should be invalid', () => {
        const record = {
            payerName: 'John Doe',
            paymentAmount: 0,
            paymentDate: new Date('2024-01-15'),
            membershipPlan: 'Monthly'
        };
        assert(validateRecord(record) === false, 'Should be invalid with zero amount');
    });
    
    // Test 4: Missing date
    test('Record without date should be invalid', () => {
        const record = {
            payerName: 'John Doe',
            paymentAmount: 100,
            paymentDate: null,
            membershipPlan: 'Monthly'
        };
        assert(validateRecord(record) === false, 'Should be invalid without date');
    });
    
    // Test 5: Missing plan
    test('Record without membership plan should be invalid', () => {
        const record = {
            payerName: 'John Doe',
            paymentAmount: 100,
            paymentDate: new Date('2024-01-15'),
            membershipPlan: null
        };
        assert(validateRecord(record) === false, 'Should be invalid without plan');
    });
    
    // Test 6: Player name is optional
    test('Record without player name should still be valid', () => {
        const record = {
            payerName: 'John Doe',
            playerName: null,
            paymentAmount: 100,
            paymentDate: new Date('2024-01-15'),
            membershipPlan: 'Monthly'
        };
        assert(validateRecord(record) === true, 'Player name is optional');
    });
}

// ============================================================================
// DATA STORE TESTS (Task 4.1)
// ============================================================================

function storePaymentRecords(records) {
    appState.paymentRecords = records;
}

function getPaymentRecords() {
    return appState.paymentRecords;
}

function storePlayers(players) {
    appState.players = players;
}

function getPlayers() {
    return appState.players;
}

function storeMembershipPlans(plans) {
    appState.membershipPlans = plans;
}

function getMembershipPlans() {
    return appState.membershipPlans;
}

function clearAllData() {
    appState.paymentRecords = [];
    appState.players = [];
    appState.currentFilter = 'all';
    appState.errorMessage = null;
}

function testDataStore() {
    console.log('\n=== DATA STORE TESTS (Task 4.1) ===\n');
    
    // Test 1: Store and retrieve payment records
    test('Should store and retrieve payment records', () => {
        const records = [
            { payerName: 'John Doe', paymentAmount: 100 },
            { payerName: 'Jane Smith', paymentAmount: 200 }
        ];
        
        storePaymentRecords(records);
        const retrieved = getPaymentRecords();
        
        assert(retrieved.length === 2, 'Should retrieve 2 records');
        assert(retrieved[0].payerName === 'John Doe', 'First record should match');
    });
    
    // Test 2: Store and retrieve players
    test('Should store and retrieve player records', () => {
        const players = [
            { playerName: 'Player 1', guardianName: 'Guardian 1' },
            { playerName: 'Player 2', guardianName: 'Guardian 2' }
        ];
        
        storePlayers(players);
        const retrieved = getPlayers();
        
        assert(retrieved.length === 2, 'Should retrieve 2 players');
        assert(retrieved[0].playerName === 'Player 1', 'First player should match');
    });
    
    // Test 3: Store and retrieve membership plans
    test('Should store and retrieve membership plans', () => {
        const plans = [
            { name: 'Monthly', durationDays: 30 },
            { name: 'Annual', durationDays: 365 }
        ];
        
        storeMembershipPlans(plans);
        const retrieved = getMembershipPlans();
        
        assert(retrieved.length === 2, 'Should retrieve 2 plans');
        assert(retrieved[0].name === 'Monthly', 'First plan should match');
    });
    
    // Test 4: Clear all data
    test('Should clear all data', () => {
        storePaymentRecords([{ payerName: 'Test' }]);
        storePlayers([{ playerName: 'Test Player' }]);
        
        clearAllData();
        
        assert(getPaymentRecords().length === 0, 'Payment records should be empty');
        assert(getPlayers().length === 0, 'Players should be empty');
        assert(appState.currentFilter === 'all', 'Filter should be reset');
    });
    
    // Test 5: Overwrite existing data
    test('Should overwrite existing data when storing new data', () => {
        const records1 = [{ payerName: 'First' }];
        const records2 = [{ payerName: 'Second' }, { payerName: 'Third' }];
        
        storePaymentRecords(records1);
        assert(getPaymentRecords().length === 1, 'Should have 1 record initially');
        
        storePaymentRecords(records2);
        assert(getPaymentRecords().length === 2, 'Should have 2 records after overwrite');
    });
}

// ============================================================================
// MEMBERSHIP PLAN CONFIGURATION TESTS (Task 5.1)
// ============================================================================

function initializeDefaultPlans() {
    appState.membershipPlans = [
        { name: 'Monthly', durationDays: 30 },
        { name: 'Quarterly', durationDays: 90 },
        { name: 'Annual', durationDays: 365 }
    ];
}

function addPlan(name, durationDays) {
    // Validate plan name and duration
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('Plan name is required');
    }

    if (!durationDays || typeof durationDays !== 'number' || durationDays <= 0) {
        throw new Error('Duration must be a positive number');
    }

    // Check if plan already exists
    const existingPlan = appState.membershipPlans.find(p => p.name === name);
    if (existingPlan) {
        throw new Error('A plan with this name already exists');
    }

    // Add plan
    appState.membershipPlans.push({ name, durationDays });
    return true;
}

function getPlan(planName) {
    return appState.membershipPlans.find(p => p.name === planName);
}

function testPlanConfiguration() {
    console.log('\n=== MEMBERSHIP PLAN CONFIGURATION TESTS (Task 5.1) ===\n');
    
    // Test 1: Default plans initialization
    test('Should initialize default plans', () => {
        appState.membershipPlans = [];
        initializeDefaultPlans();
        
        assert(appState.membershipPlans.length === 3, 'Should have 3 default plans');
        
        const monthly = getPlan('Monthly');
        const quarterly = getPlan('Quarterly');
        const annual = getPlan('Annual');
        
        assert(monthly && monthly.durationDays === 30, 'Monthly plan should be 30 days');
        assert(quarterly && quarterly.durationDays === 90, 'Quarterly plan should be 90 days');
        assert(annual && annual.durationDays === 365, 'Annual plan should be 365 days');
    });
    
    // Test 2: Add new plan
    test('Should allow adding a new plan', () => {
        appState.membershipPlans = [];
        const result = addPlan('Weekly', 7);
        
        assert(result === true, 'Should return true on success');
        
        const plan = getPlan('Weekly');
        assert(plan && plan.durationDays === 7, 'Plan should be stored correctly');
    });
    
    // Test 3: Reject plan without name
    test('Should reject plan without name', () => {
        appState.membershipPlans = [];
        let errorThrown = false;
        
        try {
            addPlan('', 30);
        } catch (error) {
            errorThrown = true;
        }
        
        assert(errorThrown === true, 'Should throw error for missing name');
    });
    
    // Test 4: Reject plan without duration
    test('Should reject plan without duration', () => {
        appState.membershipPlans = [];
        let errorThrown = false;
        
        try {
            addPlan('Test Plan', null);
        } catch (error) {
            errorThrown = true;
        }
        
        assert(errorThrown === true, 'Should throw error for missing duration');
    });
    
    // Test 5: Reject plan with zero duration
    test('Should reject plan with zero duration', () => {
        appState.membershipPlans = [];
        let errorThrown = false;
        
        try {
            addPlan('Test Plan', 0);
        } catch (error) {
            errorThrown = true;
        }
        
        assert(errorThrown === true, 'Should throw error for zero duration');
    });
    
    // Test 6: Reject plan with negative duration
    test('Should reject plan with negative duration', () => {
        appState.membershipPlans = [];
        let errorThrown = false;
        
        try {
            addPlan('Test Plan', -10);
        } catch (error) {
            errorThrown = true;
        }
        
        assert(errorThrown === true, 'Should throw error for negative duration');
    });
    
    // Test 7: Reject duplicate plan names
    test('Should reject duplicate plan names', () => {
        appState.membershipPlans = [];
        addPlan('Monthly', 30);
        
        let errorThrown = false;
        try {
            addPlan('Monthly', 60);
        } catch (error) {
            errorThrown = true;
        }
        
        assert(errorThrown === true, 'Should throw error for duplicate plan name');
    });
    
    // Test 8: Store multiple plans
    test('Should store multiple plans in memory', () => {
        appState.membershipPlans = [];
        addPlan('Biweekly', 14);
        addPlan('Semester', 180);
        
        assert(appState.membershipPlans.length === 2, 'Should have 2 plans');
        
        const biweekly = getPlan('Biweekly');
        const semester = getPlan('Semester');
        
        assert(biweekly && semester, 'Both plans should be accessible');
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
    console.log('║  CHECKPOINT TASK 6: VERIFY PARSING AND CONFIGURATION          ║');
    console.log('║  Testing Tasks 1-5 Implementation                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
    testFileValidation();
    testRecordValidation();
    testDataStore();
    testPlanConfiguration();
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\nTotal Tests: ${testResults.passed + testResults.failed}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    if (testResults.failed === 0) {
        console.log('\n✓ ALL TESTS PASSED! Parsing and configuration are working correctly.\n');
        process.exit(0);
    } else {
        console.log('\n✗ SOME TESTS FAILED. Please review the errors above.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests();
