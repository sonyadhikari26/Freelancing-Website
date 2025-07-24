import React, { useState } from "react";
import "./GigCard.scss";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getImageUrl from "../../utils/getImageUrl";
import getCurrentUser from "../../utils/getCurrentUser";
import { toast } from "react-toastify";

const GigCard = ({ item }) => {
  const [isHiring, setIsHiring] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const { isLoading, error, data } = useQuery({
    queryKey: [item.userId],
    queryFn: () =>
      newRequest.get(`/users/${item.userId}`).then((res) => {
        return res.data;
      }),
  });

  // Hire mutation
  const hireMutation = useMutation({
    mutationFn: (gigId) => {
      return newRequest.post(`/hire/hire/${gigId}`);
    },
    onSuccess: (response) => {
      toast.success("Service hired successfully! Check your orders.");
      setIsHiring(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data || "Failed to hire service";
      toast.error(errorMessage);
      setIsHiring(false);
    },
  });

  // Calculate the average rating if there are ratings
  const averageRating = item.starNumber
    ? Math.round(item.totalStars / item.starNumber)
    : 0;

  const handleHire = (e) => {
    e.preventDefault(); // Prevent navigation to gig details
    e.stopPropagation();
    
    if (!currentUser) {
      toast.info("Please login to hire services");
      navigate("/login");
      return;
    }

    if (currentUser.id === String(item.userId)) {
      toast.error("You cannot hire your own service!");
      return;
    }

    setIsHiring(true);
    hireMutation.mutate(item._id || item.id);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/gig/${item._id || item.id}`);
  };

  return (
    <div className="gigCard">
      <img src={getImageUrl(item.cover)} alt={item.title} />
      <div className="info">
        {isLoading ? (
          "Loading..."
        ) : error ? (
          "Something went wrong!"
        ) : (
          <div className="user">
            <img src={getImageUrl(data.img)} alt={data.username} />
            <span>{data.username}</span>
          </div>
        )}
        <p>{item.title.substring(0, 60)}...</p>
        <div className="star">
          <img src="./img/star.png" alt="Star" />
          {item.starNumber === 0 ? (
            <span style={{ color: "black", fontWeight: 400 }}>
              No ratings yet
            </span>
          ) : (
            <span>
              {averageRating} ({item.starNumber})
            </span>
          )}
        </div>
      </div>
      <hr />
      <div className="detail">
        <div className="price">
          <h2>Price: ${item.price}</h2>
        </div>
        <div className="actions">
          <button
            onClick={handleHire}
            disabled={isHiring || hireMutation.isLoading}
            className={`hire-btn ${currentUser?.id === String(item.userId) ? 'disabled' : ''}`}
          >
            {isHiring ? "Hiring..." : "Hire Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GigCard;
