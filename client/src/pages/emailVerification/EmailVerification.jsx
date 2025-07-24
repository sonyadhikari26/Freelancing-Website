import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import "./EmailVerification.scss";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email for the correct link.");
        return;
      }

      try {
        const response = await newRequest.get(`/auth/verify-email?token=${token}&email=${email}`);
        setStatus("success");
        setMessage(response.data.message);
        toast.success("Email verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data || "Verification failed. Please try again.");
        toast.error("Email verification failed!");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="emailVerification">
      <div className="container">
        <div className="card">
          {status === "verifying" && (
            <>
              <div className="loader"></div>
              <h2>Verifying Your Email...</h2>
              <p>Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="success-icon">✅</div>
              <h2>Email Verified Successfully!</h2>
              <p>{message}</p>
              <p>You will be redirected to login in 3 seconds...</p>
              <Link to="/login" className="button">
                Go to Login Now
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="error-icon">❌</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <div className="actions">
                <Link to="/resend-verification" className="button secondary">
                  Resend Verification Email
                </Link>
                <Link to="/register" className="button">
                  Register Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
