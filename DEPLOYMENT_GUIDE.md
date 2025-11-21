# Deployment Guide for Appointment Scheduling Agent

## 🚀 Quick Deployment Options

### Option 1: Local Development (Recommended for Testing)

```bash
# Clone and setup
git clone <your-repo-url>
cd appointment-scheduling-agent

# Backend setup
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### Option 2: Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build
```

### Option 3: Cloud Deployment

#### Deploy to Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
git push heroku main
```

#### Deploy to AWS
```bash
# Use AWS ECS or Elastic Beanstalk
aws ecs create-service --cluster your-cluster --service-name appointment-agent
```

#### Deploy to Google Cloud
```bash
# Use Google Cloud Run
gcloud run deploy --image gcr.io/PROJECT/appointment-agent
```

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Python 3.10+ installed
- [ ] Node.js 16+ installed (for frontend)
- [ ] Docker installed (optional)
- [ ] Git configured

### API Keys Configuration
- [ ] OpenAI API key obtained
- [ ] Calendly API token obtained
- [ ] Environment variables configured in `.env`
- [ ] Test API keys working

### Security Checklist
- [ ] Environment variables not in code
- [ ] SSL certificates ready
- [ ] Database secured
- [ ] API rate limiting configured

### Performance Checklist
- [ ] Load testing completed
- [ ] Database optimized
- [ ] Caching configured
- [ ] Monitoring set up

## 🔧 Production Configuration

### Environment Variables (.env)
```bash
# Production Environment
ENVIRONMENT=production
DEBUG=False

# API Keys
OPENAI_API_KEY=your_production_openai_key
CALENDLY_API_TOKEN=your_production_calendly_token

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://redis-cluster:6379

# Security
SECRET_KEY=your_super_secret_key
JWT_SECRET=your_jwt_secret

# External Services
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Database Setup

#### PostgreSQL Setup
```bash
# Create database
createdb appointment_agent_prod

# Run migrations
alembic upgrade head

# Create indexes for performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_patients_email ON patients(email);
```

#### Redis Setup
```bash
# Install Redis
sudo apt-get install redis-server

# Configure for production
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb, maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl start redis-server
```

## 🐳 Docker Production Deployment

### Multi-stage Dockerfile
```dockerfile
# Build stage for frontend
FROM node:16-alpine as frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY data/ ./data/

# Copy built frontend
COPY --from=frontend-build /app/build ./frontend/build

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose Production
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:8000"
    environment:
      - ENVIRONMENT=production
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: appointment_agent
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## ☁️ Cloud-Specific Deployment

### AWS Deployment

#### Using ECS (Elastic Container Service)
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name appointment-agent-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
    --cluster appointment-agent-cluster \
    --service-name appointment-agent-service \
    --task-definition appointment-agent-task \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"
```

#### Task Definition (task-definition.json)
```json
{
  "family": "appointment-agent-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "appointment-agent",
      "image": "your-dockerhub/appointment-agent:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/appointment-agent",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Deployment

#### Using Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT/appointment-agent

# Deploy to Cloud Run
gcloud run deploy appointment-agent \
    --image gcr.io/PROJECT/appointment-agent \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars ENVIRONMENT=production
```

### Azure Deployment

#### Using Container Instances
```bash
# Create resource group
az group create --name appointment-agent-rg --location eastus

# Create container instance
az container create \
    --resource-group appointment-agent-rg \
    --name appointment-agent \
    --image your-dockerhub/appointment-agent:latest \
    --cpu 1 \
    --memory 1 \
    --ports 8000 \
    --dns-name-label appointment-agent-app \
    --environment-variables ENVIRONMENT=production
```

## 🔒 Security Best Practices

### SSL/TLS Configuration

#### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://app:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### API Security

#### Rate Limiting
```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.post("/chat/", dependencies=[RateLimiter(times=10, seconds=60)])
async def chat_endpoint(request: ChatRequest):
    # endpoint logic
```

#### Input Validation
```python
from pydantic import BaseModel, validator

class ChatRequest(BaseModel):
    message: str
    session_id: str
    
    @validator('message')
    def validate_message(cls, v):
        if len(v) > 1000:
            raise ValueError('Message too long')
        return v
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Prometheus Metrics
```python
from prometheus_client import Counter, Histogram, generate_latest

# Define metrics
request_count = Counter('app_requests_total', 'Total requests')
request_duration = Histogram('app_request_duration_seconds', 'Request duration')

@app.middleware("http")
async def add_metrics(request: Request, call_next):
    request_count.inc()
    with request_duration.time():
        response = await call_next(request)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

#### Structured Logging
```python
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def add_logging(request: Request, call_next):
    logger.info("Request started", path=request.url.path, method=request.method)
    response = await call_next(request)
    logger.info("Request completed", status_code=response.status_code)
    return response
```

### Health Checks

```python
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Check database connection
        db.execute("SELECT 1")
        
        # Check Redis connection
        redis_client.ping()
        
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: appointment-agent
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster production-cluster --service appointment-agent-service --force-new-deployment
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Automated daily backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump appointment_agent_prod > backup_$DATE.sql
gsutil cp backup_$DATE.sql gs://your-backup-bucket/
```

### Configuration Backup
```bash
# Backup environment variables
#!/bin/bash
git add .env.production
git commit -m "Backup production config $(date)"
git push origin backup-branch
```

## 📞 Post-Deployment Checklist

### Immediate Checks
- [ ] Application loads without errors
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] External API integrations working
- [ ] SSL certificate valid

### Performance Checks
- [ ] Response times under 200ms
- [ ] Database queries optimized
- [ ] Memory usage stable
- [ ] CPU usage under 70%

### Security Checks
- [ ] No sensitive data in logs
- [ ] API rate limiting working
- [ ] Input validation active
- [ ] SSL configured correctly

### Monitoring Setup
- [ ] Health checks configured
- [ ] Alerts set up
- [ ] Logging working
- [ ] Metrics collection active

## 🆘 Troubleshooting

### Common Deployment Issues

#### Container Won't Start
```bash
# Check logs
docker logs container_name

# Check resource usage
docker stats

# Check port conflicts
netstat -tuln | grep 8000
```

#### Database Connection Issues
```bash
# Test connection
psql -h hostname -U username -d database

# Check network connectivity
telnet database_host 5432

# Verify credentials
echo $DATABASE_URL
```

#### Performance Issues
```bash
# Check resource usage
top
htop

# Check database performance
EXPLAIN ANALYZE SELECT * FROM appointments;

# Check slow queries
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

## 🎉 Success Metrics

Your deployment is successful when:
- [ ] Application is accessible via HTTPS
- [ ] All API endpoints working
- [ ] Database operations successful
- [ ] Response times under 200ms
- [ ] Zero errors in logs
- [ ] Monitoring dashboards active
- [ ] Alert system configured

Congratulations! Your appointment scheduling agent is now live! 🎊