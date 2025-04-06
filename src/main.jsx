import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { CaseProvider } from './Case/caseContext'; // Import CaseProvider

const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CaseProvider>
        <App />
      </CaseProvider>
    </BrowserRouter>
  </React.StrictMode>
);