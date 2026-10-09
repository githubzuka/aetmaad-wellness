import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ textCenter: 'center', padding: '100px 20px', minHeight: '60vh' }}>
    <h1 style={{ fontSize: '72px', color: '#10b981', margin: 0 }}>404</h1>
    <h2>Oops! Page Not Found</h2>
    <p>The page you are looking for does not exist or has been moved.</p>
    <Link to="/" style={{
      display: 'inline-block', marginTop: '20px', background: '#10b981',
      color: '#fff', padding: '12px 28px', borderRadius: '25px', textDecoration: 'none', fontWeight: 'bold'
    }}>
      Back to Home
    </Link>
  </div>
);

export default NotFound;