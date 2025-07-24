import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  // If user is already logged in, redirect to home
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PublicRoute;
