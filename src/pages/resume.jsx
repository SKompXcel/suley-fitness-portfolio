import React from 'react';
import { Document, Page } from 'react-pdf';
import resumeFile from '../../public/Suleyman_Kiani_RESUME_2025.pdf';

function Resume() {
    return (
        <div>
            <h1>My Resume</h1>
            <Document file={resumeFile}>
                <Page pageNumber={1} />
            </Document>
        </div>
    );
}

export default Resume;
