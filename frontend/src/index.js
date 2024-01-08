// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

//set this to correct path
const basename = 'SGQR-Pro-Max/'
console.log('Public URL:', process.env.PUBLIC_URL);
console.log('Basename:', basename);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router basename={basename}>
    <App />
  </Router>
);

reportWebVitals();
