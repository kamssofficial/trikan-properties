import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PropertyChatWidget from './components/PropertyChatWidget';
import './index.css';
import './components/PropertyChatWidget.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <App />
      <PropertyChatWidget />
    </>
  </React.StrictMode>,
);
