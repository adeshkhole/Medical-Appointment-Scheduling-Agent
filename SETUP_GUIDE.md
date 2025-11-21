# Complete Setup Guide for Appointment Scheduling Agent

## 📋 Prerequisites Checklist

Before you begin, ensure you have:
- [ ] Python 3.10 or higher installed
- [ ] Node.js 16+ installed (for frontend)
- [ ] Git installed
- [ ] VS Code or any code editor
- [ ] Terminal/Command Prompt access

## 🔧 Step-by-Step Installation

### Step 1: Download and Extract Project

1. **Download the project folder** from the provided location
2. **Extract** the files to your desired location
3. **Open terminal/command prompt** in the project root directory

### Step 2: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   # Windows
   python -m venv venv
   
   # Mac/Linux
   python3 -m venv venv
   ```

3. **Activate virtual environment**:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r ../requirements.txt
   ```

5. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp ../.env.example ../.env
   
   # Edit the .env file with your API keys
   # Use any text editor to fill in the required values
   ```

### Step 3: Frontend Setup (Optional)

1. **Open new terminal window** (keep backend terminal running)
2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Start frontend development server**:
   ```bash
   npm start
   ```

## 🧪 Testing the Application

### Test Backend API

1. **Start the backend server**:
   ```bash
   # From backend directory
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Test the API**:
   - Open browser and go to: `http://localhost:8000/docs`
   - You should see the FastAPI documentation
   - Try the `/chat/` endpoint with test data

### Test Frontend

1. **If frontend is running**, go to: `http://localhost:3000`
2. **Test the chat interface** by typing messages

### Run Automated Tests

```bash
# From project root
cd tests
python test_agent.py
```

## 🛠️ Development Workflow

### Daily Development

1. **Start backend**:
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn main:app --reload
   ```

2. **Start frontend** (in new terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Make changes** to code files
4. **Test immediately** - both servers auto-reload on changes

### Code Structure Understanding

- **Backend Logic**: `/backend/agent/scheduling_agent.py`
- **API Endpoints**: `/backend/api/chat.py`
- **Frontend Components**: `/frontend/src/components/`
- **Data Files**: `/data/clinic_info.json`, `/data/doctor_schedule.json`

## 🔐 API Keys Setup

### Required API Keys

1. **OpenAI API Key** (for AI responses):
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up and get API key
   - Add to `.env` file: `OPENAI_API_KEY=your_key_here`

2. **Calendly API Token** (for real scheduling):
   - Go to [Calendly Integrations](https://calendly.com/integrations)
   - Create personal access token
   - Add to `.env` file: `CALENDLY_API_TOKEN=your_token_here`

3. **Optional API Keys**:
   - **SendGrid**: For email notifications
   - **Twilio**: For SMS notifications
   - **Anthropic**: For Claude AI alternative

### Testing Without Real API Keys

For development, you can use mock data:
- The system has fallback mock responses
- Appointment booking simulates success
- No real API calls are made in mock mode

## 🚀 Running in Production

### Using Docker

1. **Build Docker image**:
   ```bash
   docker build -t appointment-agent .
   ```

2. **Run container**:
   ```bash
   docker run -p 8000:8000 appointment-agent
   ```

### Direct Deployment

1. **Set production environment variables**
2. **Use production database**
3. **Enable HTTPS/SSL**
4. **Set up monitoring**

## 🐛 Common Issues and Solutions

### Issue 1: Import Errors
```
ModuleNotFoundError: No module named 'backend'
```
**Solution**: Ensure you're running from correct directory. Use:
```bash
cd backend
python -m uvicorn main:app --reload
```

### Issue 2: Port Already in Use
```
Port 8000 is already in use
```
**Solution**: Change port:
```bash
uvicorn main:app --port 8001
```

### Issue 3: CORS Errors
**Solution**: Check that frontend URL is in CORS allowed origins in `main.py`

### Issue 4: Module Not Found
```
ModuleNotFoundError: No module named 'some_package'
```
**Solution**: Install missing package:
```bash
pip install some_package
```

## 📁 File Structure Reference

```
appointment-scheduling-agent/
├── backend/                    # Python backend
│   ├── agent/                  # AI agent logic
│   ├── api/                    # API endpoints
│   ├── rag/                    # FAQ system
│   ├── tools/                  # Business tools
│   └── models/                 # Data models
├── frontend/                   # React frontend
│   └── src/
│       └── components/         # React components
├── data/                       # JSON data files
├── tests/                      # Test files
├── requirements.txt            # Python dependencies
├── package.json               # Node.js dependencies
└── .env.example              # Environment template
```

## 🎯 Next Steps After Setup

### For Learning:
1. **Read the code** in `scheduling_agent.py` to understand AI logic
2. **Modify responses** in `prompts.py`
3. **Add new FAQ entries** in `clinic_info.json`
4. **Customize the frontend** components

### For Production:
1. **Get real API keys** from service providers
2. **Set up proper database** (PostgreSQL/MySQL)
3. **Configure HTTPS/SSL**
4. **Set up monitoring** and logging
5. **Test thoroughly** with real data

## 📞 Getting Help

If you encounter issues:

1. **Check this guide** again for missed steps
2. **Read error messages** carefully
3. **Verify file paths** and directory structure
4. **Check API keys** are properly set
5. **Look at logs** for detailed error information

### Useful Commands for Debugging

```bash
# Check Python version
python --version

# Check Node.js version
node --version

# List installed packages
pip list

# Check running processes
netstat -an | grep 8000  # Check if port is in use

# View recent logs
tail -f log_file.txt
```

## 🎉 Success Indicators

You'll know everything is working when:
- [ ] Backend starts without errors on port 8000
- [ ] Frontend loads on port 3000 (if using)
- [ ] API documentation loads at `/docs`
- [ ] Chat interface responds to messages
- [ ] No import errors in terminal
- [ ] All tests pass

Good luck with your appointment scheduling agent! 🚀