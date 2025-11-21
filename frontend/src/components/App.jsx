import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ChatInterface from './components/ChatInterface';
import AppointmentConfirmation from './components/AppointmentConfirmation';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FAQSection from './components/FAQSection';
import { ChatAPI } from './services/api';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto';
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SidebarContainer = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #667eea;
`;

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [sessionId, setSessionId] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const chatAPI = new ChatAPI();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await chatAPI.initializeSession();
        if (response.success) {
          setSessionId(response.session_id);
          setUserId(response.user_id);
        }
      } catch (error) {
        toast.error('Failed to initialize chat session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const handleBookingConfirmed = (confirmation) => {
    setBookingConfirmation(confirmation);
    setCurrentView('confirmation');
    toast.success('Appointment booked successfully!');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleReturnToChat = () => {
    setCurrentView('chat');
    setBookingConfirmation(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ChatInterface
            sessionId={sessionId}
            userId={userId}
            onBookingConfirmed={handleBookingConfirmed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 'confirmation':
        return (
          <AppointmentConfirmation
            confirmation={bookingConfirmation}
            onReturnToChat={handleReturnToChat}
          />
        );
      case 'faq':
        return <FAQSection onReturnToChat={handleReturnToChat} />;
      default:
        return (
          <ChatInterface
            sessionId={sessionId}
            userId={userId}
            onBookingConfirmed={handleBookingConfirmed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <AppContainer>
        <GlobalStyle />
        <LoadingSpinner>Initializing Medical Appointment Assistant...</LoadingSpinner>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <GlobalStyle />
      <ToastContainer />

      <Header 
        onViewChange={handleViewChange} 
        currentView={currentView} 
      />

      <MainContent>
        <ChatContainer>
          {renderCurrentView()}
        </ChatContainer>

        <SidebarContainer>
          <Sidebar
            sessionId={sessionId}
            userId={userId}
            onViewChange={handleViewChange}
            currentView={currentView}
          />
        </SidebarContainer>
      </MainContent>
    </AppContainer>
  );
}

export default App;
