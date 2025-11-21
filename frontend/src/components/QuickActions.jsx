import React from "react";
import styled from "styled-components";

const Actions = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
`;

const Button = styled.button`
  padding: 10px 14px;
  border-radius: 20px;
  border: none;
  background: #eef1ff;
  cursor: pointer;
`;

const QuickActions = ({ onActionClick }) => {
  return (
    <Actions>
      <Button onClick={() => onActionClick("schedule")}>Schedule</Button>
      <Button onClick={() => onActionClick("check_availability")}>Slots</Button>
      <Button onClick={() => onActionClick("faq")}>FAQ</Button>
    </Actions>
  );
};

export default QuickActions;
