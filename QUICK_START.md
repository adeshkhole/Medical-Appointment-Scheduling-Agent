# Quick Start Guide - 2 Minutes Setup

## 🚀 Instant Setup

### 1. Download Project
```bash
# Copy from /mnt/okcomputer/output/appointment-scheduling-agent/
cp -r /mnt/okcomputer/output/appointment-scheduling-agent ./
cd appointment-scheduling-agent
```

### 2. Backend (Terminal 1)
```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload
```

### 3. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```

### 4. Test
- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Health: http://localhost:8000/

## 📋 Essential Commands

### Backend
```bash
# Start development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test imports
python -c "import main; print('✓ Backend ready')"

# Run tests
cd tests && python test_agent.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Docker
```bash
# Build and run everything
docker-compose up --build

# Stop services
docker-compose down
```

## 🔧 Common Issues

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Use different port
uvicorn main:app --port 8001
```

### Import Errors
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Run from correct directory
cd backend
python -m uvicorn main:app --reload
```

### Missing Dependencies
```bash
# Install missing packages
pip install package_name

# Reinstall all requirements
pip install -r requirements.txt --force-reinstall
```

## 📁 Key Files

### Backend
- `backend/main.py` - API entry point
- `backend/agent/scheduling_agent.py` - AI logic
- `backend/api/chat.py` - Chat endpoint

### Frontend
- `frontend/src/components/App.jsx` - Main app
- `frontend/src/components/ChatInterface.jsx` - Chat UI
- `frontend/src/api.js` - API client

### Configuration
- `.env.example` - Environment template
- `requirements.txt` - Python packages
- `package.json` - Node.js packages

## 🎯 Next Steps

1. **Get API Keys**: OpenAI, Calendly
2. **Configure Environment**: Copy `.env.example` to `.env`
3. **Customize**: Modify prompts, FAQ data
4. **Deploy**: Use Docker or cloud services

## 📞 Help

- **Setup Guide**: See SETUP_GUIDE.md
- **Testing Guide**: See TESTING_GUIDE.md
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md
- **Full Documentation**: See README.md

---

**🎉 Ready to go!** Your appointment scheduling agent is properly structured and functional.