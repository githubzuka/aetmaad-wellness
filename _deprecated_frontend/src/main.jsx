import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './index.css';
import App from './App.jsx';

/**
 * DEPRECATED DUPLICATE APP — DO NOT EDIT
 * =====================================
 * This folder is a stale, partial copy of the application that lives in the
 * repository root (`/src`). It is missing pages that the root app has, so it
 * cannot build successfully.
 *
 * The canonical app is /src at the repo root. This file forwards to it so any
 * deployment or tooling pointed at ./frontend still builds the real, current
 * application instead of an out-of-date copy.
 */
import RootApp from '../../../src/App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <RootApp />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
