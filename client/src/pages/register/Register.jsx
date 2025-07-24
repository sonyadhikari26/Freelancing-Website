import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    img: "",
    country: "",
    isSeller: false,
    desc: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSeller = (e) => {
    setUser((prev) => {
      return { ...prev, isSeller: e.target.checked };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = await upload(file);
    try {
      const response = await newRequest.post("/auth/register", {
        ...user,
        img: url,
      });
      toast.success("Registration successful! Please check your email to verify your account.");
      // Don't navigate to login immediately, let user verify email first
      navigate("/login", { 
        state: { 
          message: "Please check your email and verify your account before logging in.",
          email: user.email 
        }
      });
    } catch (err) {
      toast.error(err?.response?.data);
    }
  };
  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>Create a new account</h1>
          <label htmlFor="">Name</label>
          <input name="username" type="text" onChange={handleChange} required />
          <label htmlFor="">Email</label>
          <input name="email" type="email" onChange={handleChange} required />
          <label htmlFor="">Password</label>
          <input
            name="password"
            type="password"
            onChange={handleChange}
            required
          />
          <label htmlFor="">Profile Picture</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <label htmlFor="">Country</label>
          <input name="country" type="text" onChange={handleChange} required />
          <button type="submit">Register</button>
        </div>
        <div className="right">
          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label htmlFor="">Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          <label htmlFor="">Phone Number</label>
          <input name="phone" type="text" onChange={handleChange} required />
          <label htmlFor="">Description</label>
          <textarea
            placeholder="A short description of yourself"
            name="desc"
            id=""
            cols="30"
            rows="10"
            onChange={handleChange}
            required
          ></textarea>
        </div>
      </form>
    </div>
  );
}

export default Register;
