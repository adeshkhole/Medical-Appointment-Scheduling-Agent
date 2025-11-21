# Testing Guide for Appointment Scheduling Agent

## 🧪 Running Tests

### Basic Test Execution

1. **Navigate to tests directory**:
   ```bash
   cd tests
   ```

2. **Run the main test file**:
   ```bash
   python test_agent.py
   ```

3. **Expected output**:
   ```
   Testing Scheduling Agent...
   ✓ Agent initialization
   ✓ Basic conversation flow
   ✓ Appointment type selection
   ✓ Time slot suggestion
   ✓ Booking confirmation
   All tests passed! 🎉
   ```

## 🔍 Manual Testing

### Testing the API Endpoints

1. **Start the backend server**:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Test basic endpoint**:
   ```bash
   curl http://localhost:8000/
   ```
   Expected response: `{"message": "Backend running successfully!"}`

3. **Test chat endpoint**:
   ```bash
   curl -X POST "http://localhost:8000/chat/" \
     -H "Content-Type: application/json" \
     -d '{
       "message": "I need to schedule an appointment",
       "session_id": "test_session_123",
       "user_id": "test_user_123"
     }'
   ```

### Testing Conversation Flows

#### Flow 1: New Appointment Booking

1. **Send**: "Hi, I need an appointment"
2. **Expected**: Greeting + appointment type options
3. **Send**: "General consultation"
4. **Expected**: Date/time preference questions
5. **Send**: "Tomorrow afternoon"
6. **Expected**: Available slots displayed
7. **Send**: "2:00 PM slot"
8. **Expected**: Confirmation details

#### Flow 2: FAQ Questions

1. **Send**: "What are your clinic hours?"
2. **Expected**: Clinic hours information
3. **Send**: "Do you accept insurance?"
4. **Expected**: Insurance information

#### Flow 3: Rescheduling

1. **Send**: "I need to reschedule my appointment"
2. **Expected**: Request for current appointment details
3. **Send**: "Booking ID BOOK123"
4. **Expected**: Rescheduling options

## 🛠️ Testing Tools

### Using FastAPI Interactive Docs

1. **Access Swagger UI**: http://localhost:8000/docs
2. **Test all endpoints interactively**
3. **View request/response schemas**

### Using Postman

**Import this collection** for testing:

```json
{
  "info": {
    "name": "Appointment Agent API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": [""]
        }
      }
    },
    {
      "name": "Chat Endpoint",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"I need to schedule an appointment\",\n  \"session_id\": \"test_session_123\",\n  \"user_id\": \"test_user_123\"\n}"
        },
        "url": {
          "raw": "http://localhost:8000/chat/",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["chat", ""]
        }
      }
    }
  ]
}
```

## 📊 Performance Testing

### Load Testing with curl

**Multiple concurrent requests**:
```bash
for i in {1..10}; do
  curl -s -X POST "http://localhost:8000/chat/" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test message $i\", \"session_id\": \"session_$i\"}" &
done
wait
```

### Memory Usage Testing

```bash
# Monitor memory usage while running
htop  # or top on Mac/Linux
```

## 🔍 Debugging Tests

### Common Test Issues

#### Issue 1: Import Errors
```python
# Add to test file if needed
import sys
sys.path.append('../backend')
```

#### Issue 2: Async Test Failures
```python
# Use async test patterns
import asyncio

async def test_async_function():
    result = await some_async_function()
    assert result is not None

# Run async test
asyncio.run(test_async_function())
```

#### Issue 3: Database Connection Issues
```python
# Use mock data for testing
import unittest.mock as mock

def test_with_mock():
    with mock.patch('module.database_connection') as mock_db:
        mock_db.return_value = mock_data
        # test code here
```

## 📈 Test Coverage

### Running Coverage Report

```bash
# Install coverage tool
pip install coverage

# Run tests with coverage
coverage run test_agent.py

# Generate coverage report
coverage report

# Generate HTML report
coverage html
```

### Expected Coverage Areas

- [ ] Agent initialization (100%)
- [ ] Conversation flow (90%+)
- [ ] API endpoints (100%)
- [ ] Tool functions (85%+)
- [ ] Error handling (80%+)

## 🎯 Integration Testing

### Testing with Real APIs

**Note**: Use test/sandbox API keys

1. **Set up test API keys** in `.env` file
2. **Run integration tests**:
   ```bash
   python test_integration.py
   ```

### Testing External Services

#### Calendly Integration Test
```python
def test_calendly_integration():
    # Test with sandbox token
    calendly = CalendlyIntegration(test_token="test_token")
    result = calendly.get_availability()
    assert result is not None
```

#### OpenAI Integration Test
```python
def test_openai_response():
    # Test with mock to avoid API costs
    with mock.patch('openai.ChatCompletion.create') as mock_chat:
        mock_chat.return_value = {
            'choices': [{'message': {'content': 'Test response'}}]
        }
        response = get_ai_response("Test message")
        assert response == "Test response"
```

## 🚀 Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r ../requirements.txt
    
    - name: Run tests
      run: |
        cd tests
        python test_agent.py
```

## 📋 Test Checklist

### Before Committing Code

- [ ] All existing tests pass
- [ ] New functionality has tests
- [ ] Tests cover edge cases
- [ ] Integration tests pass
- [ ] Performance tests acceptable
- [ ] Code coverage >80%

### Before Production Release

- [ ] All tests pass in CI/CD
- [ ] Load testing completed
- [ ] Security testing done
- [ ] API integration tests pass
- [ ] User acceptance testing complete

## 🛡️ Security Testing

### API Security Tests

```python
def test_api_security():
    # Test SQL injection protection
    malicious_input = "'; DROP TABLE users; --"
    response = client.post("/chat/", json={"message": malicious_input})
    assert response.status_code == 200
    
    # Test XSS protection
    xss_input = "<script>alert('xss')</script>"
    response = client.post("/chat/", json={"message": xss_input})
    assert "<script>" not in response.text
```

### Authentication Tests

```python
def test_authentication():
    # Test without authentication
    response = client.post("/protected-endpoint/")
    assert response.status_code == 401
    
    # Test with valid authentication
    headers = {"Authorization": "Bearer valid_token"}
    response = client.post("/protected-endpoint/", headers=headers)
    assert response.status_code == 200
```

## 📊 Monitoring and Observability

### Adding Logging to Tests

```python
import logging

def test_with_logging():
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)
    
    logger.info("Starting test")
    result = some_function()
    logger.info(f"Test result: {result}")
    
    assert result is not None
```

### Performance Monitoring

```python
import time

def test_performance():
    start_time = time.time()
    
    result = some_function()
    
    end_time = time.time()
    execution_time = end_time - start_time
    
    assert execution_time < 1.0  # Should complete in less than 1 second
    assert result is not None
```

## 🎯 Best Practices

### Test Organization

1. **Unit tests** in `test_unit.py`
2. **Integration tests** in `test_integration.py`
3. **Performance tests** in `test_performance.py`
4. **Security tests** in `test_security.py`

### Test Naming Convention

```python
def test_[component]_[scenario]_[expected_result]():
    # Example:
    def test_chat_agent_valid_message_returns_response():
        # test code here
        pass
```

### Test Data Management

```python
# Use fixtures for test data
@pytest.fixture
def test_appointment_data():
    return {
        "patient_name": "John Doe",
        "appointment_type": "General Consultation",
        "preferred_date": "2024-12-25",
        "preferred_time": "14:00"
    }

def test_appointment_booking(test_appointment_data):
    result = book_appointment(test_appointment_data)
    assert result["success"] is True
```

## 🚀 Next Steps

After successful testing:

1. **Set up CI/CD pipeline**
2. **Configure monitoring**
3. **Set up alerting**
4. **Create performance benchmarks**
5. **Document test results**

Happy testing! 🎉