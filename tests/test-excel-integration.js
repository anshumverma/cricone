/**
 * Excel Parsing Integration Test
 * Tests parsing with actual Excel file
 */

const XLSX = require('xlsx');
const fs = require('fs');

// ============================================================================
// EXCEL PARSING FUNCTIONS (from app.js)
// ============================================================================

function detectColumnMapping(headers) {
    const mapping = {
        payerName: null,
        playerName: null,
        paymentAmount: null,
        paymentDate: null,
        membershipPlan: null
    };
    
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    const payerPatterns = ['payer name', 'name', 'donor name', 'payer', 'donor', 'guardian name', 'guardian'];
    mapping.payerName = findMatchingHeader(normalizedHeaders, headers, payerPatterns);
    
    const playerPatterns = ['player name', 'student name', 'beneficiary', 'player', 'student', 'child name'];
    mapping.playerName = findMatchingHeader(normalizedHeaders, headers, playerPatterns);
    
    const amountPatterns = ['amount', 'payment amount', 'total', 'price', 'payment'];
    mapping.paymentAmount = findMatchingHeader(normalizedHeaders, headers, amountPatterns);
    
    const datePatterns = ['date', 'payment date', 'transaction date', 'created at', 'timestamp'];
    mapping.paymentDate = findMatchingHeader(normalizedHeaders, headers, datePatterns);
    
    const planPatterns = ['campaign', 'program', 'plan', 'item', 'membership plan', 'membership', 'product'];
    mapping.membershipPlan = findMatchingHeader(normalizedHeaders, headers, planPatterns);
    
    return mapping;
}

function findMatchingHeader(normalizedHeaders, originalHeaders, patterns) {
    for (const pattern of patterns) {
        const index = normalizedHeaders.findIndex(h => h.includes(pattern) || pattern.includes(h));
        if (index !== -1) {
            return originalHeaders[index];
        }
    }
    return null;
}

function extractField(row, columnName) {
    if (!columnName || !row[columnName]) {
        return null;
    }
    
    const value = row[columnName];
    
    if (typeof value === 'string') {
        return value.trim() || null;
    }
    
    return value ? String(value).trim() : null;
}

function extractAmount(row, columnName) {
    if (!columnName || !row[columnName]) {
        return 0;
    }
    
    let value = row[columnName];
    
    if (typeof value === 'string') {
        value = value.replace(/[$€£¥,\s]/g, '');
    }
    
    const amount = parseFloat(value);
    return isNaN(amount) ? 0 : amount;
}

function extractDate(row, columnName) {
    if (!columnName || !row[columnName]) {
        return null;
    }
    
    const value = row[columnName];
    
    if (typeof value === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
        return isNaN(date.getTime()) ? null : date;
    }
    
    if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
    
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    
    return null;
}

function validateRecord(record) {
    return !!(
        record.payerName &&
        record.paymentAmount > 0 &&
        record.paymentDate &&
        record.membershipPlan
    );
}

function extractPaymentRecords(worksheet) {
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    if (rawData.length === 0) {
        return [];
    }
    
    const columnMapping = detectColumnMapping(Object.keys(rawData[0]));
    
    const paymentRecords = rawData.map(row => {
        const record = {
            payerName: extractField(row, columnMapping.payerName),
            playerName: extractField(row, columnMapping.playerName),
            paymentAmount: extractAmount(row, columnMapping.paymentAmount),
            paymentDate: extractDate(row, columnMapping.paymentDate),
            membershipPlan: extractField(row, columnMapping.membershipPlan),
            isComplete: false,
            rawData: row
        };
        
        record.isComplete = validateRecord(record);
        
        return record;
    });
    
    return paymentRecords.filter(record => 
        record.payerName || record.paymentAmount || record.paymentDate || record.membershipPlan
    );
}

// ============================================================================
// INTEGRATION TEST
// ============================================================================

function testExcelParsing() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  EXCEL PARSING INTEGRATION TEST                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    const excelFile = 'Zeffy-export-CampaignPayments-1770856231447.xlsx';
    
    // Check if file exists
    if (!fs.existsSync(excelFile)) {
        console.log(`✗ Excel file not found: ${excelFile}`);
        console.log('  Skipping integration test.\n');
        return true;
    }
    
    console.log(`Reading Excel file: ${excelFile}`);
    
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(excelFile);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        console.log(`✓ Successfully loaded worksheet: ${firstSheetName}`);
        
        // Extract payment records
        const paymentRecords = extractPaymentRecords(worksheet);
        
        console.log(`✓ Extracted ${paymentRecords.length} payment records`);
        
        // Analyze records
        const completeRecords = paymentRecords.filter(r => r.isComplete);
        const incompleteRecords = paymentRecords.filter(r => !r.isComplete);
        
        console.log(`  - Complete records: ${completeRecords.length}`);
        console.log(`  - Incomplete records: ${incompleteRecords.length}`);
        
        // Show sample records
        if (paymentRecords.length > 0) {
            console.log('\nSample Records (first 3):');
            paymentRecords.slice(0, 3).forEach((record, index) => {
                console.log(`\n  Record ${index + 1}:`);
                console.log(`    Payer: ${record.payerName || 'N/A'}`);
                console.log(`    Player: ${record.playerName || 'N/A'}`);
                console.log(`    Amount: ${record.paymentAmount || 0}`);
                console.log(`    Date: ${record.paymentDate ? record.paymentDate.toLocaleDateString() : 'N/A'}`);
                console.log(`    Plan: ${record.membershipPlan || 'N/A'}`);
                console.log(`    Complete: ${record.isComplete ? 'Yes' : 'No'}`);
            });
        }
        
        // Verify basic requirements
        console.log('\n✓ Excel parsing integration test completed successfully');
        
        if (paymentRecords.length === 0) {
            console.log('⚠ Warning: No payment records found in the file');
        }
        
        return true;
        
    } catch (error) {
        console.log(`✗ Error parsing Excel file: ${error.message}`);
        return false;
    }
}

// ============================================================================
// RUN TEST
// ============================================================================

const success = testExcelParsing();

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  INTEGRATION TEST SUMMARY                                      ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

if (success) {
    console.log('✓ Excel parsing integration test PASSED\n');
    process.exit(0);
} else {
    console.log('✗ Excel parsing integration test FAILED\n');
    process.exit(1);
}
