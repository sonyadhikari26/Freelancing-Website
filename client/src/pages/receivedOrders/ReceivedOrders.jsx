import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReceivedOrders.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getImageUrl from "../../utils/getImageUrl";

const ReceivedOrders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch received orders for the seller
  const { isLoading, error, data } = useQuery({
    queryKey: ["receivedOrders"],
    queryFn: () =>
      newRequest.get(`/orders/received-orders`).then((res) => res.data),
  });

  const updateOrderStatus = useMutation(
    (updateData) =>
      newRequest.patch(`/orders/${updateData.id}`, {
        status: updateData.status,
      }),
    {
      onSuccess: () => {
        // Refetch received orders after update
        queryClient.invalidateQueries(["receivedOrders"]);
      },
    }
  );

  const handleContact = async (order) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const sellerId = order.sellerId._id;
    const buyerId = order.buyerId._id;

    // Ensure you are setting the conversation ID based on the correct user roles
    const id = sellerId < buyerId ? sellerId + buyerId : buyerId + sellerId;

    try {
      // Try to fetch the existing conversation
      const res = await newRequest.get(`/conversations/single/${id}`);
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err.response.status === 404) {
        // If conversation does not exist, create a new one
        const res = await newRequest.post(`/conversations/`, {
          sellerId,
          buyerId,
        });
        navigate(`/message/${res.data.id}`);
      }
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="orders">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Received Orders</h1>
          </div>
          {data.length === 0 ? (
            <p>You don't have any received orders.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Buyer</th> {/* New column for Buyer */}
                  <th>Contact</th>
                  {currentUser.isSeller && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <img className="image" src={getImageUrl(order.img)} alt="" />
                    </td>
                    <td>{order.title}</td>
                    <td>{order.price}</td>
                    <td className={`status ${order.status}`}>{order.status}</td>
                    <td>{order.buyerId.username}</td>{" "}
                    {/* Display buyer's name */}
                    <td>
                      <img
                        className="message"
                        src="./img/message.png"
                        alt="Message"
                        onClick={() => handleContact(order)}
                      />
                    </td>
                    {currentUser.isSeller && (
                      <td>
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusChange(order._id, "completed")
                            }
                          >
                            Mark as Completed
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceivedOrders;
