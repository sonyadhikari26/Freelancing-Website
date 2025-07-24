import React, { useState, useEffect } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if coming from registration with a message
    if (location.state?.message) {
      toast.info(location.state.message);
      if (location.state.email) {
        setEmail(location.state.email);
      }
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await newRequest.post("/auth/login", { email, password });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      toast.success("Logged in successfully!");
      
      // Redirect to the intended page or home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err?.response?.data;
      toast.error(errorMessage);
      
      // Show verification link if email not verified
      if (errorMessage?.includes("verify your email")) {
        setShowVerificationMessage(true);
      }
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <label htmlFor="">Email</label>
        <input
          name="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="">Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        
        {showVerificationMessage && (
          <div className="verification-message">
            <p>Haven't verified your email yet?</p>
            <Link to="/resend-verification" className="resend-link">
              Click here to resend verification email
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
