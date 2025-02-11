import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

export default function Resume() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#1E1E1E'
    }}>
      <div style={{
        width: '60vw', // Adjust width to keep PDF centered and visible
        height: '90vh', // Adjust height so it fits well
        backgroundColor: '#fff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)' // Adds a soft shadow effect
      }}>
        <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`}>
          <Viewer fileUrl="/Suleyman_Kiani_RESUME_2025.pdf" defaultScale={1.1} />
        </Worker>
      </div>
    </div>
  );
}