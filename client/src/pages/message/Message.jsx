import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link, useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import getImageUrl from "../../utils/getImageUrl";
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const queryClient = useQueryClient();

  // Fetch messages
  const {
    isLoading: messagesLoading,
    error: messagesError,
    data: messagesData,
  } = useQuery({
    queryKey: ["messages", id],
    queryFn: () =>
      newRequest.get(`/messages/${id}`).then((res) => {
        return res.data;
      }),
  });

  // Fetch conversation details to get the other user's details
  const {
    isLoading: conversationLoading,
    error: conversationError,
    data: conversationData,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () =>
      newRequest.get(`/conversations/single/${id}`).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (message) => {
      return newRequest.post(`/messages`, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      conversationId: id,
      desc: e.target[0].value,
    });
    e.target[0].value = "";
  };

  if (messagesLoading || conversationLoading) return "loading";
  if (messagesError || conversationError) return "error";

  const otherUser =
    currentUser._id === conversationData.sellerId._id
      ? conversationData.buyerId
      : conversationData.sellerId;

  return (
    <div className="message">
      <div className="container">
        <span className="breadcrumbs">
          <Link to="/messages">Messages</Link> &gt; {otherUser.username} &gt;
        </span>
        <div className="messages">
          {messagesData.map((m) => (
            <div
              className={m.userId === currentUser._id ? "owner item" : "item"}
              key={m._id}
            >
              <img
                src={getImageUrl(
                  m.userId === currentUser._id ? currentUser.img : otherUser.img
                )}
                alt="Avatar"
              />
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
        <hr />
        <form className="write" onSubmit={handleSubmit}>
          <textarea type="text" placeholder="write a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Message;
