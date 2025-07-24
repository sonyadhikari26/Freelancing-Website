import React, { useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import "./ResendVerification.scss";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await newRequest.post("/auth/resend-verification", { email });
      setSent(true);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="resendVerification">
        <div className="container">
          <div className="card success">
            <div className="success-icon">📧</div>
            <h2>Verification Email Sent!</h2>
            <p>
              We've sent a new verification email to <strong>{email}</strong>.
              Please check your inbox and spam folder.
            </p>
            <div className="actions">
              <Link to="/login" className="button">
                Go to Login
              </Link>
              <button 
                onClick={() => setSent(false)} 
                className="button secondary"
              >
                Send Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resendVerification">
      <div className="container">
        <div className="card">
          <h2>Resend Verification Email</h2>
          <p>
            Enter your email address and we'll send you a new verification link.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Email"}
            </button>
          </form>
          
          <div className="links">
            <Link to="/login">Back to Login</Link>
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
