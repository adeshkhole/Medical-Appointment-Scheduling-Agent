import React from "react";
import styled from "styled-components";

const Bubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  white-space: pre-line;
  align-self: ${(props) => (props.type === "user" ? "flex-end" : "flex-start")};
  background: ${(props) => (props.type === "user" ? "#665fee" : "#e9ecef")};
  color: ${(props) => (props.type === "user" ? "white" : "black")};
`;

const MessageBubble = ({ message }) => {
  return <Bubble type={message.type}>{message.content}</Bubble>;
};

export default MessageBubble;
