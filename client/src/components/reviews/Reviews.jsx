import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import { toast } from "react-toastify";
import "./Reviews.scss";

const Reviews = ({ gigId, currentUserId, gigCreatorId }) => {
  const queryClient = useQueryClient();

  // Fetch reviews
  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      newRequest.get(`/reviews/${gigId}`).then((res) => {
        return res.data;
      }),
  });

  // Mutation for adding a review
  const mutation = useMutation({
    mutationFn: (review) => {
      return newRequest.post("/reviews", review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      toast.success("Review was added");
    },
    onError: (err) => {
      toast.error(err.response?.data || "An error occurred");
    },
  });

  // Submit handler for review form
  const handleSubmit = (e) => {
    e.preventDefault();
    const desc = e.target[0].value;
    const star = e.target[1].value;
    mutation.mutate({ gigId, desc, star });
  };

  // Check if the user is logged in and is not the creator of the gig
  const canAddReview = currentUserId && currentUserId !== gigCreatorId;

  return (
    <div className="reviews">
      <h2>Reviews</h2>
      {isLoading ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : data.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        data.map((review) => <Review key={review._id} review={review} />)
      )}

      {canAddReview && (
        <div className="add">
          <h3>Add a review</h3>
          <form action="" className="addForm" onSubmit={handleSubmit}>
            <input type="text" placeholder="write your opinion" />
            <select name="" id="">
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reviews;
