import React from "react";
import styled from "styled-components";

const Box = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
`;

const Sidebar = ({ onViewChange }) => {
  return (
    <Box>
      <button onClick={() => onViewChange("chat")}>Chat</button>
      <button onClick={() => onViewChange("faq")}>FAQ</button>
    </Box>
  );
};

export default Sidebar;
