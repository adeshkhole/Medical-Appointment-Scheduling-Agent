import React from "react";
import styled from "styled-components";

const Box = styled.div`
  padding: 20px;
  background: white;
  border-radius: 10px;
`;

const SlotBtn = styled.button`
  padding: 12px;
  width: 100%;
  margin-top: 10px;
  background: #665fee;
  color: white;
  border-radius: 10px;
  border: none;
  cursor: pointer;
`;

const AppointmentScheduler = ({ slots, onSlotSelect }) => {
  return (
    <Box>
      <h3>Available Slots</h3>
      {slots.map((s, i) => (
        <SlotBtn key={i} onClick={() => onSlotSelect(s)}>
          {s.date} — {s.time}
        </SlotBtn>
      ))}
    </Box>
  );
};

export default AppointmentScheduler;
