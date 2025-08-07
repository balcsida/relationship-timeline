import React, { useState } from 'react';

const PrintDebugger = () => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const checkPrintElements = () => {
    const printContainer = document.querySelector('.print-container');
    const printHeader = document.querySelector('.print-header');
    const printChart = document.querySelector('.print-chart');
    
    const results = {
      container: printContainer ? 'Found' : 'Missing',
      header: printHeader ? 'Found' : 'Missing', 
      chart: printChart ? 'Found' : 'Missing',
      containerStyle: printContainer ? window.getComputedStyle(printContainer).display : 'N/A',
      visibility: printContainer ? window.getComputedStyle(printContainer).visibility : 'N/A'
    };
    
    console.log('Print Debug Results:', results);
    alert(`Print Debug Results:
- Container: ${results.container}
- Header: ${results.header}
- Chart: ${results.chart}
- Display: ${results.containerStyle}
- Visibility: ${results.visibility}`);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
      <h3 className="font-bold mb-2">Print Debugger</h3>
      <div className="space-y-2">
        <button
          onClick={() => setShowPrintPreview(!showPrintPreview)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm w-full"
        >
          Toggle Print Preview
        </button>
        <button
          onClick={checkPrintElements}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm w-full"
        >
          Check Print Elements
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm w-full"
        >
          Test Print
        </button>
      </div>
      
      {showPrintPreview && (
        <style>{`
          .print-container {
            display: block !important;
            border: 3px solid red !important;
            padding: 20px !important;
            background: yellow !important;
            position: relative !important;
            z-index: 1000 !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default PrintDebugger;