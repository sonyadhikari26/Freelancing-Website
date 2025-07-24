import React, { useEffect, useState } from "react";
import "./Pay.scss";
import { useParams, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";

const Pay = () => {
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await newRequest.get(`/gigs/single/${id}`);
        setGig(res.data.gig);
      } catch (err) {
        toast.error("Error loading gig");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id, navigate]);

  const handleDirectPurchase = async () => {
    try {
      setPurchasing(true);
      await newRequest.post(`/hire/hire/${id}`);
      toast.success("Service hired successfully!");
      navigate("/orders");
    } catch (err) {
      const errorMessage = err.response?.data || "Failed to hire service";
      toast.error(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="pay">Loading...</div>;
  }

  if (!gig) {
    return <div className="pay">Gig not found</div>;
  }

  return (
    <div className="pay">
      <div className="container">
        <div className="payment-card">
          <h1>Complete Your Purchase</h1>
          
          <div className="gig-summary">
            <img src={gig.cover} alt={gig.title} />
            <div className="gig-details">
              <h3>{gig.title}</h3>
              <p>{gig.shortDesc}</p>
              <div className="price">
                <span className="amount">${gig.price}</span>
              </div>
            </div>
          </div>

          <div className="payment-section">
            <div className="payment-info">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Service Price:</span>
                <span>${gig.price}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${gig.price}</span>
              </div>
            </div>

            <button 
              className="purchase-btn"
              onClick={handleDirectPurchase}
              disabled={purchasing}
            >
              {purchasing ? "Processing..." : "Purchase Now"}
            </button>

            <p className="note">
              Note: This is a direct purchase. The service will be added to your orders immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;
