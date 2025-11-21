import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FiSend, FiMessageCircle, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { ChatAPI } from '../services/api';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import AppointmentScheduler from './AppointmentScheduler';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ChatTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const ChatSubtitle = styled.p`
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 14px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputContainer = styled.div`
  background: white;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  resize: none;
  min-height: 45px;
  max-height: 120px;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: inherit;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #667eea;
  font-size: 14px;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 20px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  align-self: flex-start;
  margin: 10px 0;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }

  @keyframes typing {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
`;

const ChatInterface = ({ sessionId, userId, onBookingConfirmed, isLoading, setIsLoading }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const chatAPI = new ChatAPI();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize chat with welcome message
  useEffect(() => {
    if (sessionId && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'agent',
        content: `Hello! I'm your medical appointment scheduling assistant. I'm here to help you schedule appointments, check availability, and answer any questions about our clinic.

How can I assist you today? I can help you with:

• Scheduling a new appointment
• Checking available time slots
• Answering questions about our services
• Providing clinic information

What would you like to do?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [sessionId]);

  const sendMessage = async (message) => {
    if (!message.trim() || !sessionId) return;

    // Add user message to chat
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      setIsLoading(true);
      const response = await chatAPI.sendMessage(message, sessionId, userId);
      setIsLoading(false);

      if (response.success) {
        // Add agent response to chat
        const agentMessage = {
          id: `msg_${Date.now()}_agent`,
          type: 'agent',
          content: response.data.response,
          timestamp: new Date(),
          requires_action: response.data.requires_action,
          action_type: response.data.action_type,
          suggested_slots: response.data.suggested_slots,
        };

        setMessages(prev => [...prev, agentMessage]);

        // Handle booking confirmation
        if (response.data.booking_confirmation) {
          onBookingConfirmed(response.data.booking_confirmation);
        }

        // Handle suggested slots
        if (response.data.suggested_slots) {
          setSuggestedSlots(response.data.suggested_slots);
          setShowScheduler(true);
        }
      } else {
        // Handle error
        const errorMessage = {
          id: `msg_${Date.now()}_error`,
          type: 'agent',
          content: 'I apologize, but I encountered an issue processing your request. Please try again or contact our office directly.',
          timestamp: new Date(),
          is_error: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        type: 'agent',
        content: 'I apologize, but I\'m having trouble connecting to our system. Please try again in a moment.',
        timestamp: new Date(),
        is_error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const handleSendClick = () => {
    sendMessage(inputMessage);
  };

  const handleQuickAction = (action) => {
    let message = '';
    
    switch (action) {
      case 'schedule':
        message = 'I would like to schedule an appointment';
        break;
      case 'check_availability':
        message = 'What appointment slots are available?';
        break;
      case 'faq':
        message = 'Tell me about your clinic services';
        break;
      case 'cancel':
        message = 'I need to cancel an appointment';
        break;
      default:
        message = action;
    }
    
    sendMessage(message);
  };

  const handleSlotSelection = async (slot) => {
    const message = `I would like to book the appointment on ${slot.date} at ${slot.time}`;
    sendMessage(message);
    setShowScheduler(false);
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Medical Appointment Assistant</ChatTitle>
        <ChatSubtitle>Available 24/7 to help schedule your appointments</ChatSubtitle>
      </ChatHeader>

      <MessagesContainer>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onQuickAction={handleQuickAction}
          />
        ))}

        {isTyping && (
          <TypingIndicator>
            <FiMessageCircle size={16} />
            <span>Assistant is typing</span>
            <TypingDots>
              <Dot />
              <Dot />
              <Dot />
            </TypingDots>
          </TypingIndicator>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      {showScheduler && suggestedSlots.length > 0 && (
        <AppointmentScheduler
          slots={suggestedSlots}
          onSlotSelect={handleSlotSelection}
          onClose={() => setShowScheduler(false)}
        />
      )}

      <QuickActions onActionClick={handleQuickAction} />

      <InputContainer>
        <MessageInput
          ref={inputRef}
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here... (Shift+Enter for new line)"
          disabled={isLoading || isTyping}
          rows={1}
        />
        <SendButton
          onClick={handleSendClick}
          disabled={!inputMessage.trim() || isLoading || isTyping}
        >
          <FiSend size={18} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;