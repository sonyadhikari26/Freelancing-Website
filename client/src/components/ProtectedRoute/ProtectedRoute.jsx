import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const location = useLocation();
  
  // Check if user is logged in and email is verified
  if (!currentUser) {
    // Show toast message for better UX
    toast.info("Please sign in to access this page");
    
    // Redirect to login with the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email is verified for certain protected routes
  if (!currentUser.isEmailVerified) {
    toast.warn("Please verify your email to access this feature");
    return <Navigate to="/verify-email" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
