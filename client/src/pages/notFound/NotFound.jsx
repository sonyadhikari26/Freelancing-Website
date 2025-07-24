import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.scss';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <div className="content">
          <div className="error-code">404</div>
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          
          <div className="actions">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
            <Link to="/gigs" className="btn-secondary">
              Browse Services
            </Link>
          </div>
        </div>
        
        <div className="illustration">
          <div className="circle"></div>
          <div className="search-icon">🔍</div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
