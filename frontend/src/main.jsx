import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';

import '../data.jsx';
import { ToastProvider } from '../ui.jsx';
import { App } from '../app.jsx';

window.React = React;

createRoot(document.getElementById('root')).render(
  <ToastProvider><App /></ToastProvider>
);
