import React, { useEffect } from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";
import getImageUrl from "../../utils/getImageUrl";
import Reviews from "../../components/reviews/Reviews";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat"; // load on demand
dayjs.extend(advancedFormat); // use plugin

function Gig() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get the current logged-in user
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id;

  // Fetch gig and recommended gigs
  const { isLoading, error, data } = useQuery({
    queryKey: ["gig", id],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const userId = data?.gig.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  const handleContinueClick = () => {
    if (!currentUserId) {
      toast.info("Please login to continue");
      navigate("/login");
    } else {
      navigate(`/pay/${id}`);
    }
  };

  // Scroll to top when gig data changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]); // Depend on `id` so it triggers when gig changes

  return (
    <div className="gig">
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          <div className="left">
            <h1>{data.gig.title}</h1>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="user">
                <img
                  className="pp"
                  src={getImageUrl(dataUser.img)}
                  alt=""
                />
                <span>{dataUser.username}</span>
                {!isNaN(data.gig.totalStars / data.gig.starNumber) && (
                  <div className="stars">
                    {Array(
                      Math.round(data.gig.totalStars / data.gig.starNumber)
                    )
                      .fill()
                      .map((item, i) => (
                        <img src="/img/star.png" alt="" key={i} />
                      ))}
                    <span>
                      {Math.round(data.gig.totalStars / data.gig.starNumber)}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Slider slidesToShow={1} arrowsScroll={1} className="slider">
              {data.gig.images.map((img) => (
                <img key={img} src={getImageUrl(img)} alt="" />
              ))}
            </Slider>
            <h2>About This Gig</h2>
            <p className="desc">{data.gig.desc}</p>
            {isLoadingUser ? (
              "loading"
            ) : errorUser ? (
              "Something went wrong!"
            ) : (
              <div className="seller">
                <h2>About The Seller</h2>
                <div className="user">
                  <img src={getImageUrl(dataUser.img)} alt="" />
                  <div className="info">
                    <span>{dataUser.username}</span>
                    {!isNaN(data.gig.totalStars / data.gig.starNumber) && (
                      <div className="stars">
                        {Array(
                          Math.round(data.gig.totalStars / data.gig.starNumber)
                        )
                          .fill()
                          .map((item, i) => (
                            <img src="/img/star.png" alt="" key={i} />
                          ))}
                        <span>
                          {Math.round(
                            data.gig.totalStars / data.gig.starNumber
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="box">
                  <div className="items">
                    <div className="item">
                      <span className="title">From</span>
                      <span className="desc">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title">Contact</span>
                      <span className="desc">{dataUser.phone}</span>
                    </div>
                    <div className="item">
                      <span className="title">Email</span>
                      <span className="desc">{dataUser.email}</span>
                    </div>
                    <div className="item">
                      <span className="title">Member Since</span>
                      <span className="desc">
                        {dayjs(dataUser.createdAt).format("Do MMMM YYYY")}
                      </span>
                    </div>
                  </div>
                  <hr />
                  <p>{dataUser.desc}</p>
                </div>
              </div>
            )}
            <Reviews
              gigId={id}
              currentUserId={currentUserId}
              gigCreatorId={data.gig.userId}
            />
            <div className="similar-gigs">
              <h2>Similar Gigs</h2>
              {data.recommendedGigs.length > 0 ? (
                <div className="recommendations">
                  {data.recommendedGigs.map((recGig) => (
                    <div key={recGig._id} className="recommendation-item">
                      <img src={getImageUrl(recGig.cover)} alt={recGig.title} />
                      <div className="info">
                        <h3>{recGig.title}</h3>
                        <p>${recGig.price}</p>
                        <Link to={`/gig/${recGig._id}`}>View Gig</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No similar gigs found.</p>
              )}
            </div>
          </div>

          <div className="right">
            <div className="price">
              <h3>{data.gig.title}</h3>
              <h2>$ {data.gig.price}</h2>
            </div>
            <div className="details">
              <div className="item">
                <img src="/img/clock.png" alt="" />
                <span>{data.gig.deliveryTime} Days Delivery</span>
              </div>
            </div>
            <button
              onClick={handleContinueClick}
              disabled={currentUserId === data.gig.userId}
              style={{ opacity: currentUserId === data.gig.userId ? 0.5 : 1 }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gig;
