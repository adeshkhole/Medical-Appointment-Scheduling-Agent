# Medical Appointment Scheduling Agent

An intelligent conversational AI agent that helps patients schedule medical appointments through natural conversation. The system integrates with Calendly API, provides FAQ assistance using RAG (Retrieval Augmented Generation), and handles the complete appointment booking workflow.

## 🏥 Features

### Core Functionality
- **Intelligent Conversation Flow**: Natural language understanding for appointment scheduling
- **Calendly Integration**: Real-time availability checking and booking through Calendly API
- **FAQ System**: RAG-powered knowledge base for clinic information
- **Multi-Appointment Types**: Supports General Consultation (30min), Follow-up (15min), Physical Exam (45min), and Specialist Consultation (60min)
- **Smart Scheduling**: Ranks available slots based on user preferences
- **Context Management**: Maintains conversation context across interactions

### Advanced Features
- **Rescheduling & Cancellation**: Handle appointment changes with 24-hour notice policy
- **Waitlist Management**: Add patients to waitlist for earlier availability
- **Multiple Communication Channels**: Email and SMS notifications
- **Multi-Doctor Support**: Schedule with different specialists
- **Business Hours Awareness**: Only shows available slots during operating hours
- **Edge Case Handling**: Graceful handling of no-shows, late arrivals, and conflicts

## 🏗️ Architecture

### Tech Stack
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: React with TypeScript (Optional)
- **LLM**: OpenAI GPT-3.5/GPT-4, Anthropic Claude, or local models
- **Vector Database**: ChromaDB (default), Pinecone, Weaviate, or Qdrant
- **Calendar API**: Calendly API integration
- **Session Management**: In-memory with Redis option
- **Notifications**: Email (SendGrid) and SMS (Twilio)

### System Components

#### Backend (`/backend/`)
- **`main.py`**: FastAPI application entry point
- **`agent/`**: Core scheduling agent logic
  - `scheduling_agent.py`: Main conversation flow management
  - `prompts.py`: System prompts and templates
- **`rag/`**: RAG system for FAQ handling
  - `faq_rag.py`: FAQ retrieval and answering
  - `embeddings.py`: Text embedding management
  - `vector_store.py`: Vector database operations
- **`api/`**: External API integrations
  - `chat.py`: Chat session management
  - `calendly_integration.py`: Calendly API wrapper
- **`tools/`**: Business logic tools
  - `availability_tool.py`: Slot availability management
  - `booking_tool.py`: Appointment booking operations
- **`models/`**: Data schemas and models
  - `schemas.py`: Pydantic models for all data structures

#### Frontend (`/frontend/`) - Optional
- **React Application**: Modern chat interface
- **Real-time Updates**: Live chat with typing indicators
- **Responsive Design**: Works on desktop and mobile
- **Appointment Visualization**: Calendar-style slot selection

#### Data (`/data/`)
- **`clinic_info.json`**: FAQ knowledge base
- **`doctor_schedule.json`**: Doctor availability and schedules

## 🚀 Quick Start

### Prerequisites
- Python 3.10 or higher
- Node.js 16+ (for frontend)
- Calendly API token (for production)
- OpenAI or Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appointment-scheduling-agent
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   ```

4. **Install frontend dependencies (optional)**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Run the application**
   ```bash
   # Backend only
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # With frontend
   cd frontend
   npm start
   ```

6. **Access the application**
   - Backend API: http://localhost:8000
   - Frontend (if enabled): http://localhost:3000
   - API Documentation: http://localhost:8000/docs

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CALENDLY_API_TOKEN=your_calendly_token
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Configuration
DATABASE_URL=sqlite:///appointments.db
REDIS_URL=redis://localhost:6379
VECTOR_DB_PATH=./vector_db
DEBUG=True
```

### Testing

Run the test suite:
```bash
cd tests
python test_agent.py
```

## 📖 API Documentation

### Chat Endpoint
```http
POST /chat/
Content-Type: application/json

{
  "message": "I need to schedule an appointment",
  "session_id": "user_123_session",
  "user_id": "user_123"
}
```

### Response Format
```json
{
  "response": "I'd be happy to help you schedule an appointment...",
  "context": {
    "current_phase": "appointment_type_selection",
    "appointment_type": null,
    "suggested_slots": []
  }
}
```

## 🔧 Development

### Project Structure
```
appointment-scheduling-agent/
├── backend/
│   ├── agent/
│   │   ├── scheduling_agent.py
│   │   └── prompts.py
│   ├── rag/
│   │   ├── faq_rag.py
│   │   ├── embeddings.py
│   │   └── vector_store.py
│   ├── api/
│   │   ├── chat.py
│   │   └── calendly_integration.py
│   ├── tools/
│   │   ├── availability_tool.py
│   │   └── booking_tool.py
│   └── models/
│       └── schemas.py
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── ChatInterface.jsx
│           └── AppointmentConfirmation.jsx
├── data/
│   ├── clinic_info.json
│   └── doctor_schedule.json
└── tests/
    └── test_agent.py
```

### Adding New Features

1. **New Appointment Types**: Modify `scheduling_agent.py` and update duration mappings
2. **New FAQ Data**: Add entries to `clinic_info.json` and re-initialize vector store
3. **New API Integrations**: Add to `api/` directory and update `main.py`
4. **New Tools**: Add to `tools/` directory and update agent initialization

## 🚀 Deployment

### Docker Deployment
```bash
docker build -t appointment-agent .
docker run -p 8000:8000 appointment-agent
```

### Cloud Deployment
- **AWS**: Use ECS or Lambda
- **Google Cloud**: Use Cloud Run or App Engine
- **Azure**: Use Container Instances or App Service

### Production Considerations
- Use environment variables for sensitive data
- Set up monitoring and logging
- Configure SSL certificates
- Set up database backups
- Monitor API rate limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Voice integration
- [ ] Advanced analytics dashboard
- [ ] Integration with EMR systems
- [ ] Telemedicine scheduling
- [ ] AI-powered appointment optimization
- [ ] Patient reminder system
- [ ] Integration with insurance verification

## 📞 Support

For questions and support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, HIPAA compliance, and thorough testing.