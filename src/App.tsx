// src/App.tsx

import React, { useState } from 'react';

// Import Worker
import { Worker } from '@react-pdf-viewer/core';
// Import the main Viewer component
// (We'll use it in the HighlightExample component)
import '@react-pdf-viewer/core/lib/styles/index.css';
// default layout plugin
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import HighlightExample from './HighlightExample';

function App() {
    // pdf file onChange state
    const [pdfFile, setPdfFile] = useState<string | null>(null);

    // pdf file error state
    const [pdfError, setPdfError] = useState<string>('');

    // handle file onChange event
    const allowedFiles = ['application/pdf'];

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (allowedFiles.includes(selectedFile.type)) {
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onloadend = (event) => {
                    setPdfError('');
                    setPdfFile(event.target?.result as string);
                };
            } else {
                setPdfError('Not a valid pdf: Please select only PDF');
                setPdfFile(null);
            }
        } else {
            console.log('Please select a PDF');
        }
    };

    return (
        <div className="container">
            {/* Upload PDF */}
            <form>
                <label>
                    <h5>Upload PDF</h5>
                </label>
                <br />

                <input
                    type="file"
                    className="form-control"
                    onChange={handleFile}
                />

                {/* Display error message if the selected file is not a PDF */}
                {pdfError && <span className="text-danger">{pdfError}</span>}
            </form>

            {/* View PDF */}
            <h5>View PDF</h5>
            <div className="viewer">
                {/* Render this if we have a pdf file */}
                {pdfFile ? (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
                        <HighlightExample fileUrl={pdfFile} />
                    </Worker>
                
                ) : (
                    // Render this if we have pdfFile state null
                    <>No file is selected yet</>
                )}
            </div>
        </div>
    );
}

export default App;
