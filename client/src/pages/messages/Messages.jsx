import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => {
        return res.data;
      }),
  });
  console.log(data);

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="messages">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : data.length === 0 ? (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          <p>You don't have any messages</p>
        </div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Messages</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Last Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                // Determine if the current user is the buyer or seller
                const otherUser =
                  currentUser._id === c.sellerId._id
                    ? c.buyerId.username // If current user is the seller, show buyer's username
                    : c.sellerId.username; // If current user is the buyer, show seller's username

                return (
                  <tr
                    className={
                      ((currentUser._id === c.sellerId._id &&
                        !c.readBySeller) ||
                        (currentUser._id === c.buyerId._id &&
                          !c.readByBuyer)) &&
                      "active"
                    }
                    key={c.id}
                  >
                    <td>{otherUser}</td> {/* Show the other user's name */}
                    <td>
                      <Link to={`/message/${c.id}`} className="link">
                        {c?.lastMessage?.substring(0, 100)}...
                      </Link>
                    </td>
                    <td>{moment(c.updatedAt).fromNow()}</td>
                    <td>
                      {((currentUser._id === c.sellerId._id &&
                        !c.readBySeller) ||
                        (currentUser._id === c.buyerId._id &&
                          !c.readByBuyer)) && (
                        <button onClick={() => handleRead(c.id)}>
                          Mark as Read
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Messages;
