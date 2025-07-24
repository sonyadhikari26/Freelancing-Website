import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import getImageUrl from "../../utils/getImageUrl";
import "./Navbar.scss";

function Navbar() {
  const [open, setOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link className="link" to="/">
            <span className="text">TalentLink</span>
          </Link>
        </div>
        <div className="links">
          <Link className="link" to="/gigs">
            <span>Browse Gigs</span> {/* Renamed Explore to Browse Gigs */}
          </Link>
          {currentUser ? (
            <>
              <Link className="link" to="/orders">
                My Orders
              </Link>
              <Link className="link" to="/messages">
                Messages
              </Link>
              <div className="user" onClick={() => setOpen(!open)}>
                <img src={getImageUrl(currentUser.img)} alt="" />
                <span>{currentUser?.username}</span>
                {open && (
                  <div className="options">
                    {currentUser.isSeller && (
                      <>
                        <Link className="link" to="/mygigs">
                          My Gigs
                        </Link>
                        <Link className="link" to="/add">
                          Add New Gig
                        </Link>
                        <Link className="link" to="/received-orders">
                          Received Orders
                        </Link>
                      </>
                    )}
                    <Link className="link" onClick={handleLogout}>
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="link">
                Sign in
              </Link>
              <Link className="link" to="/register">
                <button>Join</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
