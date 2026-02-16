// Test duplicate detection logic
// Run with: node test-duplicate-detection.js

// Copy the duplicate detection functions from app.js
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

function excludeDuplicates(records, duplicateInfo) {
    const { duplicateGroups } = duplicateInfo;
    const indicesToExclude = new Set();
    
    for (const group of duplicateGroups) {
        for (let i = 1; i < group.indices.length; i++) {
            indicesToExclude.add(group.indices[i]);
        }
    }
    
    return records.map((record, index) => {
        if (indicesToExclude.has(index)) {
            return {
                ...record,
                isExcludedDuplicate: true,
                isComplete: false
            };
        }
        return record;
    }).filter(record => !record.isExcludedDuplicate);
}

// Test cases
const tests = [
    {
        name: "Test 1: No duplicates",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 },
            { payerName: "Bob Johnson", paymentDate: new Date("2024-01-03"), paymentAmount: 200 }
        ],
        expected: { hasDuplicates: false, totalDuplicates: 0 }
    },
    {
        name: "Test 2: Exact duplicates",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 }
        ],
        expected: { hasDuplicates: true, totalDuplicates: 1 }
    },
    {
        name: "Test 3: Multiple duplicate groups",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 },
            { payerName: "Bob Johnson", paymentDate: new Date("2024-01-03"), paymentAmount: 200 }
        ],
        expected: { hasDuplicates: true, totalDuplicates: 2 }
    },
    {
        name: "Test 4: Triple duplicates",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 }
        ],
        expected: { hasDuplicates: true, totalDuplicates: 2 }
    },
    {
        name: "Test 5: Case insensitive payer name",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "john doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "JOHN DOE", paymentDate: new Date("2024-01-01"), paymentAmount: 100 }
        ],
        expected: { hasDuplicates: true, totalDuplicates: 2 }
    },
    {
        name: "Test 6: Different amounts - not duplicates",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 150 }
        ],
        expected: { hasDuplicates: false, totalDuplicates: 0 }
    },
    {
        name: "Test 7: Different dates - not duplicates",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-02"), paymentAmount: 100 }
        ],
        expected: { hasDuplicates: false, totalDuplicates: 0 }
    },
    {
        name: "Test 8: Missing required fields",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: null, paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: null, paymentAmount: 100 }
        ],
        expected: { hasDuplicates: false, totalDuplicates: 0 }
    },
    {
        name: "Test 9: Exclude duplicates",
        records: [
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "John Doe", paymentDate: new Date("2024-01-01"), paymentAmount: 100 },
            { payerName: "Jane Smith", paymentDate: new Date("2024-01-02"), paymentAmount: 150 }
        ],
        testExclusion: true,
        expected: { filteredCount: 2 }
    }
];

// Run tests
let passCount = 0;
let failCount = 0;

console.log('='.repeat(60));
console.log('DUPLICATE DETECTION TESTS');
console.log('='.repeat(60));

tests.forEach((test, index) => {
    console.log(`\n${test.name}`);
    console.log('-'.repeat(60));
    
    try {
        const duplicateInfo = detectDuplicates(test.records);
        
        let passed = true;
        let message = '';

        if (test.testExclusion) {
            const filtered = excludeDuplicates(test.records, duplicateInfo);
            passed = filtered.length === test.expected.filteredCount;
            message = `Expected ${test.expected.filteredCount} records after exclusion, got ${filtered.length}`;
        } else {
            const hasDuplicatesMatch = duplicateInfo.hasDuplicates === test.expected.hasDuplicates;
            const totalDuplicatesMatch = duplicateInfo.totalDuplicates === test.expected.totalDuplicates;
            passed = hasDuplicatesMatch && totalDuplicatesMatch;
            message = `Expected hasDuplicates: ${test.expected.hasDuplicates}, got: ${duplicateInfo.hasDuplicates}\n`;
            message += `Expected totalDuplicates: ${test.expected.totalDuplicates}, got: ${duplicateInfo.totalDuplicates}`;
        }

        if (passed) {
            console.log('✓ PASS');
            passCount++;
        } else {
            console.log('✗ FAIL');
            console.log(message);
            failCount++;
        }

    } catch (error) {
        console.log('✗ ERROR:', error.message);
        failCount++;
    }
});

console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total: ${tests.length}`);
console.log(`Success Rate: ${((passCount / tests.length) * 100).toFixed(1)}%`);
console.log('='.repeat(60));
