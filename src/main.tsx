import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './components/PropertyChatWidget.css';
import './ux-polish.css';
import './design-system.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <App />
    </>
  </React.StrictMode>,
);
