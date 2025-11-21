import React from 'react';
import styled from 'styled-components';
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiInfo
} from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100%;
`;

const ConfirmationCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: #4caf50;
  font-size: 80px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 18px;
  margin-bottom: 30px;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin: 30px 0;
  text-align: left;
`;

const DetailCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #667eea;
  font-weight: 600;
`;

const DetailContent = styled.div`
  color: #2c3e50;
  font-size: 16px;
  line-height: 1.5;
`;

const NextStepsContainer = styled.div`
  background: #e3f2fd;
  border-radius: 12px;
  padding: 25px;
  margin: 30px 0;
  text-align: left;
`;

const NextStepsTitle = styled.h3`
  color: #1976d2;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NextStepsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const NextStepItem = styled.li`
  color: #2c3e50;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #4caf50;
    font-weight: bold;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props =>
    props.primary
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#f8f9fa'};
  color: ${props => (props.primary ? 'white' : '#2c3e50')};
  border: ${props => (props.primary ? 'none' : '2px solid #e9ecef')};
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ContactInfo = styled.div`
  background: #fff3e0;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
`;

const ContactTitle = styled.h4`
  color: #f57c00;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContactDetail = styled.div`
  color: #2c3e50;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AppointmentConfirmation = ({ confirmation, onReturnToChat }) => {
  if (!confirmation) {
    return (
      <ConfirmationContainer>
        <ConfirmationCard>
          <Title>No Confirmation Available</Title>
          <Subtitle>There seems to be no booking confirmation to display.</Subtitle>
          <ActionButton primary onClick={onReturnToChat}>
            Return to Chat
          </ActionButton>
        </ConfirmationCard>
      </ConfirmationContainer>
    );
  }

  const {
    booking_id,
    appointment_date,
    appointment_time,
    appointment_type,
    patient_info,
    duration_minutes,
    created_at
  } = confirmation;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleScheduleAnother = () => {
    onReturnToChat();
  };

  const handleAddToCalendar = () => {
    const eventDetails = {
      title: `Medical Appointment - ${SchemaUtils.format_appointment_type(
        appointment_type
      )}`,
      start: `${appointment_date}T${appointment_time}`,
      duration: duration_minutes,
      description: `Appointment with ${patient_info.first_name} ${patient_info.last_name}`,
      location: 'Medical Clinic'
    };

    const blob = new Blob([
      `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventDetails.title}\nDTSTART:${eventDetails.start.replace(
        /[-:]/g,
        ''
      )}Z\nDURATION:PT${eventDetails.duration}M\nDESCRIPTION:${
        eventDetails.description
      }\nLOCATION:${eventDetails.location}\nEND:VEVENT\nEND:VCALENDAR`
    ], { type: 'text/calendar' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointment.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  return (
    <ConfirmationContainer>
      <ConfirmationCard>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>

        <Title>Appointment Confirmed!</Title>
        <Subtitle>Your appointment has been successfully scheduled</Subtitle>

        <DetailsGrid>
          <DetailCard>
            <DetailHeader>
              <FiUser size={20} />
              <span>Patient Information</span>
            </DetailHeader>
            <DetailContent>
              <strong>{patient_info.first_name} {patient_info.last_name}</strong><br />
              Email: {patient_info.email}<br />
              Phone: {patient_info.phone}
            </DetailContent>
          </DetailCard>

          <DetailCard>
            <DetailHeader>
              <FiCalendar size={20} />
              <span>Appointment Details</span>
            </DetailHeader>
            <DetailContent>
              <strong>{SchemaUtils.format_appointment_type(appointment_type)}</strong><br />
              Date: {formatDate(appointment_date)}<br />
              Time: {formatTime(appointment_time)}<br />
              Duration: {duration_minutes} minutes
            </DetailContent>
          </DetailCard>

          <DetailCard>
            <DetailHeader>
              <FiInfo size={20} />
              <span>Booking Reference</span>
            </DetailHeader>
            <DetailContent>
              Booking ID: <strong>{booking_id}</strong><br />
              Booked on: {formatDate(created_at)} at {formatTime(created_at)}
            </DetailContent>
          </DetailCard>
        </DetailsGrid>

        <NextStepsContainer>
          <NextStepsTitle>
            <FiCheckCircle size={20} />
            Next Steps
          </NextStepsTitle>
          <NextStepsList>
            <NextStepItem>Arrive 15 minutes early for check-in</NextStepItem>
            <NextStepItem>Bring a valid photo ID and insurance card</NextStepItem>
            <NextStepItem>Bring a list of current medications</NextStepItem>
            <NextStepItem>Complete any required forms (available online)</NextStepItem>
            <NextStepItem>Contact us at least 24 hours in advance if you need to cancel</NextStepItem>
          </NextStepsList>
        </NextStepsContainer>

        <ContactInfo>
          <ContactTitle>
            <FiPhone size={18} />
            Need Help?
          </ContactTitle>
          <ContactDetail>
            <FiPhone size={16} />
            Call us: (555) 123-4567
          </ContactDetail>
          <ContactDetail>
            <FiMail size={16} />
            Email: appointments@clinic.com
          </ContactDetail>
          <ContactDetail>
            <FiMapPin size={16} />
            Address: 123 Medical Center Dr, Healthcare City, HC 12345
          </ContactDetail>
        </ContactInfo>

        <ActionButtons>
          <ActionButton primary onClick={handleScheduleAnother}>
            Schedule Another Appointment
          </ActionButton>
          <ActionButton onClick={handleAddToCalendar}>
            Add to Calendar
          </ActionButton>
          <ActionButton onClick={handlePrintConfirmation}>
            Print Confirmation
          </ActionButton>
        </ActionButtons>
      </ConfirmationCard>
    </ConfirmationContainer>
  );
};

const SchemaUtils = {
  format_appointment_type: (appointment_type) => {
    const type_mapping = {
      'general_consultation': 'General Consultation',
      'follow_up': 'Follow-up Visit',
      'physical_exam': 'Physical Examination',
      'specialist_consultation': 'Specialist Consultation'
    };
    return type_mapping[appointment_type] || appointment_type;
  }
};

export default AppointmentConfirmation;
