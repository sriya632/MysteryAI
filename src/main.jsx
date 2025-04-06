import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { CaseProvider } from './Case/caseContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CaseProvider>
        <App />
      </CaseProvider>
    </BrowserRouter>
  </React.StrictMode>
);