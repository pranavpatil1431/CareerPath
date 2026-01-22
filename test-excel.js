import fetch from 'node-fetch';
import fs from 'fs';

async function testExcelExport() {
    try {
        console.log('🧪 Testing Excel export endpoint...');
        
        const response = await fetch('http://localhost:5000/api/export/excel');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ Response status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        console.log('📁 Content-Disposition:', response.headers.get('content-disposition'));
        
        // Save the Excel file
        const buffer = await response.buffer();
        const filename = `test_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        fs.writeFileSync(filename, buffer);
        console.log(`💾 Excel file saved as: ${filename}`);
        console.log(`📏 File size: ${buffer.length} bytes`);
        
    } catch (error) {
        console.error('❌ Error testing Excel export:', error.message);
    }
}

testExcelExport();