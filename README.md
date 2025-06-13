# WhatsApp Support Automation (Enterprise-Grade)

## 🤖 Claude Code Build Instructions

**Target Agent:** Claude Code (Research Preview)  
**Complexity:** Enterprise-level Python application  
**Estimated Build Time:** 45-90 minutes (with Claude Code efficiency)  
**Architecture:** Microservices with MSG91 + OpenRouter + Railway

> **Claude Code Optimized:** This project includes a `CLAUDE.md` file for optimal context and Railway-specific deployment configurations.

---

## 🎯 Build Objectives

You are tasked with building a production-ready WhatsApp customer support automation system. This system must handle 1,000+ concurrent users with enterprise-grade security, monitoring, and reliability.

### Success Criteria:
- ✅ Complete FastAPI backend with all modules
- ✅ MSG91 WhatsApp integration with webhook validation
- ✅ OpenRouter LLM integration with fallback models
- ✅ Redis session management with clustering
- ✅ PostgreSQL with proper models and migrations
- ✅ Comprehensive error handling and logging
- ✅ Production-ready Docker configuration
- ✅ Full test suite with 90%+ coverage
- ✅ Monitoring and observability stack
- ✅ Security compliance (encryption, rate limiting)

---

## 📋 Build Checklist (Follow Sequentially)

### Phase 1: Project Foundation
- [ ] Create project structure
- [ ] Setup virtual environment and dependencies
- [ ] Configure environment variables
- [ ] Initialize Git repository

### Phase 2: Core Backend
- [ ] Build FastAPI application structure
- [ ] Implement webhook gateway with signature validation
- [ ] Create session management with Redis
- [ ] Build database models and migrations

### Phase 3: Integration Layer
- [ ] Implement MSG91 WhatsApp integration
- [ ] Build OpenRouter LLM handler with fallbacks
- [ ] Create flow engine for conversation logic
- [ ] Add message composition and delivery

### Phase 4: Production Features
- [ ] Add comprehensive error handling
- [ ] Implement security features (encryption, rate limiting)
- [ ] Build monitoring and observability
- [ ] Create health checks and circuit breakers

### Phase 5: Testing & Documentation
- [ ] Write unit tests (target 90%+ coverage)
- [ ] Create integration tests
- [ ] Add load testing scripts
- [ ] Generate API documentation

### Phase 6: Deployment
- [ ] Create Docker configuration
- [ ] Setup Railway deployment
- [ ] Configure environment for production
- [ ] Validate end-to-end functionality

---

## 🛠 Prerequisites

```bash
# Required tools
python >= 3.9
docker >= 20.10
docker-compose >= 1.29
redis >= 6.0
postgresql >= 13

# External services accounts needed
- MSG91 account (WhatsApp Business API)
- OpenRouter account (LLM access)
- Railway account (hosting)
```

---

## 📁 Project Structure (Create This Exactly)

```
whatsapp-support/
├── README.md
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── main.py
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── conversation.py
│   │   └── message.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── webhook.py
│   │   ├── health.py
│   │   └── admin.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── webhook_validator.py
│   │   ├── session_manager.py
│   │   ├── flow_engine.py
│   │   ├── llm_handler.py
│   │   ├── message_composer.py
│   │   └── delivery_service.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── redis_client.py
│   │   ├── security.py
│   │   └── exceptions.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   ├── metrics.py
│   │   └── helpers.py
│   └── flows/
│       ├── __init__.py
│       ├── welcome_flow.yaml
│       ├── support_flow.yaml
│       └── escalation_flow.yaml
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_webhook.py
│   ├── test_flows.py
│   ├── test_llm.py
│   └── load_tests/
│       └── locustfile.py
├── scripts/
│   ├── setup_db.py
│   ├── seed_data.py
│   └── health_check.py
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│       └── dashboards/
└── docs/
    ├── api.md
    ├── deployment.md
    └── troubleshooting.md
```

---

## 🚀 Claude Code Build Instructions

### Step 1: Initialize Project

```bash
# Create project directory
mkdir whatsapp-support
cd whatsapp-support

# Initialize git and Claude Code workspace
git init
echo "whatsapp-support" > .git/description

# Create CLAUDE.md file (Claude Code will auto-read this)
# [Copy the CLAUDE.md content from the separate artifact]

# Initialize Python environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
```

**Claude Code Command:**
```bash
claude init project
```

Create `.gitignore`:
```gitignore
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.env
.venv
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Project specific
logs/
temp/
uploads/
```

### Step 2: Setup Dependencies & Environment

**Claude Code Commands:**
```bash
# Ask Claude Code to create requirements.txt
claude "Create requirements.txt with FastAPI, SQLAlchemy, Redis, OpenRouter dependencies for production WhatsApp automation"

# Setup environment
claude "Create .env.example with all required environment variables for MSG91 and OpenRouter"

# Install dependencies
pip install -r requirements.txt
```

**Manual Environment Setup:**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual API keys:
# - MSG91_AUTH_KEY=your-msg91-key
# - OPENROUTER_API_KEY=your-openrouter-key
# - DATABASE_URL=postgresql://user:pass@localhost:5432/whatsapp_support
# - REDIS_URL=redis://localhost:6379/0
```

### Step 3: Build Core Application with Claude Code

**Use Claude Code's advanced thinking for complex architecture:**

```bash
# Build the complete application structure
claude think hard "Build the entire FastAPI WhatsApp support automation system based on the CLAUDE.md specifications. Include all models, services, API routes, and error handling. Make it production-ready for Railway deployment."

# Or build incrementally:
claude "Create the FastAPI app structure with config.py and database setup"
claude "Build the session manager and Redis integration"
claude "Create the LLM handler with OpenRouter and fallback logic"
claude "Implement the webhook validator and MSG91 integration"
claude "Add the flow engine for conversation management"
claude "Create comprehensive error handling and logging"
```

**Test the build:**
```bash
# Run tests (Claude Code can write these too)
claude "Write comprehensive pytest test suite with 90% coverage"
pytest tests/ -v --cov=app

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Create `app/core/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.config import settings

# Async database engine
engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

Create `app/core/redis_client.py`:
```python
import aioredis
import json
from typing import Optional, Any
from app.config import settings
import structlog

logger = structlog.get_logger()

class RedisClient:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
    
    async def connect(self):
        try:
            self.redis = aioredis.from_url(
                settings.redis_url,
                decode_responses=True,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={1: 1, 2: 3, 3: 5},
            )
            await self.redis.ping()
            logger.info("Redis connected successfully")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            raise
    
    async def disconnect(self):
        if self.redis:
            await self.redis.close()
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            return await self.redis.set(key, value, ex=expire)
        except Exception as e:
            logger.error(f"Redis SET error: {e}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        try:
            value = await self.redis.get(key)
            if value:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception as e:
            logger.error(f"Redis GET error: {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        try:
            return bool(await self.redis.delete(key))
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        try:
            return bool(await self.redis.exists(key))
        except Exception as e:
            logger.error(f"Redis EXISTS error: {e}")
            return False

redis_client = RedisClient()
```

### Step 4: Database Models

Create `app/models/user.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100))
    language = Column(String(5), default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    metadata = Column(Text)  # JSON field for additional user data
```

Create `app/models/conversation.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(20), default="active")  # active, completed, escalated
    current_flow = Column(String(50))
    current_step = Column(String(50))
    language = Column(String(5), default="en")
    escalation_reason = Column(Text)
    resolution_time = Column(Float)  # in seconds
    satisfaction_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", backref="conversations")
    messages = relationship("Message", back_populates="conversation")
```

Create `app/models/message.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    msg91_message_id = Column(String(100), unique=True, index=True)
    direction = Column(String(10), nullable=False)  # inbound, outbound
    message_type = Column(String(20), default="text")  # text, image, document, etc.
    content = Column(Text, nullable=False)
    sender_number = Column(String(20))
    recipient_number = Column(String(20))
    delivery_status = Column(String(20), default="pending")  # pending, sent, delivered, failed
    is_from_llm = Column(Boolean, default=False)
    llm_model_used = Column(String(50))
    llm_cost = Column(Float, default=0.0)
    processing_time = Column(Float)  # in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True))
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
```

### Step 5: Core Services

Create `app/services/webhook_validator.py`:
```python
import hmac
import hashlib
from typing import Dict, Any
from fastapi import HTTPException, status
from app.config import settings
import structlog

logger = structlog.get_logger()

class WebhookValidator:
    def __init__(self):
        self.secret = settings.msg91_webhook_secret.encode()
    
    def validate_signature(self, payload: str, signature: str) -> bool:
        """Validate MSG91 webhook signature"""
        try:
            expected_signature = hmac.new(
                self.secret,
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Remove 'sha256=' prefix if present
            if signature.startswith('sha256='):
                signature = signature[7:]
            
            is_valid = hmac.compare_digest(expected_signature, signature)
            
            if not is_valid:
                logger.warning("Invalid webhook signature", 
                             expected=expected_signature[:10], 
                             received=signature[:10])
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Signature validation error: {e}")
            return False
    
    def validate_webhook_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and sanitize webhook data"""
        required_fields = ["from", "text", "timestamp"]
        
        for field in required_fields:
            if field not in data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Sanitize phone number
        phone = data.get("from", "").replace("+", "").replace("-", "").replace(" ", "")
        if not phone.isdigit() or len(phone) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format"
            )
        
        return {
            "phone_number": phone,
            "message": data.get("text", "").strip(),
            "timestamp": data.get("timestamp"),
            "message_id": data.get("messageId", ""),
            "message_type": data.get("type", "text")
        }

webhook_validator = WebhookValidator()
```

Create `app/services/session_manager.py`:
```python
from typing import Optional, Dict, Any
from app.core.redis_client import redis_client
import structlog
import json

logger = structlog.get_logger()

class SessionManager:
    def __init__(self):
        self.session_timeout = 3600  # 1 hour
        self.conversation_timeout = 86400  # 24 hours
    
    def _get_session_key(self, phone_number: str) -> str:
        return f"session:{phone_number}"
    
    def _get_conversation_key(self, session_id: str) -> str:
        return f"conversation:{session_id}"
    
    async def get_or_create_session(self, phone_number: str) -> Dict[str, Any]:
        """Get existing session or create new one"""
        session_key = self._get_session_key(phone_number)
        session_data = await redis_client.get(session_key)
        
        if session_data:
            logger.info("Retrieved existing session", phone=phone_number)
            return session_data
        
        # Create new session
        import uuid
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "phone_number": phone_number,
            "current_flow": None,
            "current_step": None,
            "context": {},
            "message_count": 0,
            "created_at": int(time.time()),
            "last_activity": int(time.time())
        }
        
        await redis_client.set(session_key, session_data, expire=self.session_timeout)
        await redis_client.set(
            self._get_conversation_key(session_id), 
            session_data, 
            expire=self.conversation_timeout
        )
        
        logger.info("Created new session", phone=phone_number, session_id=session_id)
        return session_data
    
    async def update_session(self, phone_number: str, updates: Dict[str, Any]) -> bool:
        """Update session data"""
        session_key = self._get_session_key(phone_number)
        session_data = await redis_client.get(session_key)
        
        if not session_data:
            logger.warning("Session not found for update", phone=phone_number)
            return False
        
        # Update fields
        session_data.update(updates)
        session_data["last_activity"] = int(time.time())
        
        # Save updated session
        await redis_client.set(session_key, session_data, expire=self.session_timeout)
        await redis_client.set(
            self._get_conversation_key(session_data["session_id"]), 
            session_data, 
            expire=self.conversation_timeout
        )
        
        return True
    
    async def end_session(self, phone_number: str) -> bool:
        """End user session"""
        session_key = self._get_session_key(phone_number)
        session_data = await redis_client.get(session_key)
        
        if session_data:
            conversation_key = self._get_conversation_key(session_data["session_id"])
            await redis_client.delete(conversation_key)
        
        return await redis_client.delete(session_key)
    
    async def get_session_by_id(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by session ID"""
        conversation_key = self._get_conversation_key(session_id)
        return await redis_client.get(conversation_key)

session_manager = SessionManager()
```

### Step 6: LLM Handler

Create `app/services/llm_handler.py`:
```python
import httpx
import json
from typing import Dict, Any, Optional
from app.config import settings
import structlog
import time
import asyncio

logger = structlog.get_logger()

class LLMHandler:
    def __init__(self):
        self.base_url = settings.openrouter_base_url
        self.api_key = settings.openrouter_api_key
        self.primary_model = settings.openrouter_primary_model
        self.fallback_model = settings.openrouter_fallback_model
        self.max_tokens = settings.openrouter_max_tokens
        self.timeout = settings.openrouter_timeout
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://your-domain.com",
            "X-Title": "WhatsApp Support Bot"
        }
    
    async def generate_response(
        self, 
        message: str, 
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate LLM response with fallback"""
        model_to_use = model or self.primary_model
        
        try:
            response = await self._call_llm(message, context, model_to_use)
            return response
        except Exception as e:
            logger.warning(f"Primary model failed: {e}, trying fallback")
            try:
                response = await self._call_llm(message, context, self.fallback_model)
                response["model_used"] = f"{self.fallback_model} (fallback)"
                return response
            except Exception as fallback_error:
                logger.error(f"Both models failed: {fallback_error}")
                return {
                    "response": "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
                    "model_used": "error_fallback",
                    "cost": 0.0,
                    "tokens_used": 0,
                    "processing_time": 0.0
                }
    
    async def _call_llm(
        self, 
        message: str, 
        context: Dict[str, Any], 
        model: str
    ) -> Dict[str, Any]:
        """Make actual LLM API call"""
        start_time = time.time()
        
        # Prepare conversation context
        system_prompt = self._build_system_prompt(context)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]
        
        # Add conversation history if available
        if "recent_messages" in context:
            for hist_msg in context["recent_messages"][-5:]:  # Last 5 messages
                messages.insert(-1, {
                    "role": "assistant" if hist_msg["direction"] == "outbound" else "user",
                    "content": hist_msg["content"]
                })
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": 0.7,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            processing_time = time.time() - start_time
            
            # Extract response content
            response_content = data["choices"][0]["message"]["content"]
            
            # Calculate cost (rough estimate)
            tokens_used = data.get("usage", {}).get("total_tokens", 0)
            estimated_cost = self._estimate_cost(model, tokens_used)
            
            return {
                "response": response_content.strip(),
                "model_used": model,
                "cost": estimated_cost,
                "tokens_used": tokens_used,
                "processing_time": processing_time
            }
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build system prompt based on context"""
        base_prompt = """You are a helpful WhatsApp customer support assistant. 

Key guidelines:
- Be concise and friendly
- Use simple language appropriate for WhatsApp
- Keep responses under 300 characters when possible
- If you cannot help, politely offer to escalate to a human agent
- Use emojis sparingly and appropriately
- Always be professional and helpful

Customer context:
"""
        
        if context.get("user_name"):
            base_prompt += f"- Customer name: {context['user_name']}\n"
        
        if context.get("language"):
            base_prompt += f"- Preferred language: {context['language']}\n"
        
        if context.get("current_flow"):
            base_prompt += f"- Current conversation topic: {context['current_flow']}\n"
        
        return base_prompt
    
    def _estimate_cost(self, model: str, tokens: int) -> float:
        """Estimate API cost based on model and tokens"""
        # Rough cost estimates (update based on actual pricing)
        cost_per_1k_tokens = {
            "anthropic/claude-3-sonnet": 0.003,
            "mistralai/mixtral-8x7b-instruct": 0.0007,
            "openai/gpt-3.5-turbo": 0.0015,
        }
        
        rate = cost_per_1k_tokens.get(model, 0.002)  # default rate
        return (tokens / 1000) * rate

llm_handler = LLMHandler()
```

**⚠️ CHECKPOINT: Agent Rate Limit Check**

If you're hitting rate limits at this point, please refer to `continue_after_rate_limit.md` to pause and resume the build process.

---

### Step 7: Flow Engine (Continue Building...)

Create `app/services/flow_engine.py`:
```python
import yaml
import json
from typing import Dict, Any, Optional, List
from pathlib import Path
import structlog

logger = structlog.get_logger()

class FlowEngine:
    def __init__(self):
        self.flows = {}
        self.load_flows()
    
    def load_flows(self):
        """Load all flow definitions from YAML files"""
        flows_dir = Path("app/flows")
        for flow_file in flows_dir.glob("*.yaml"):
            try:
                with open(flow_file, 'r') as f:
                    flow_data = yaml.safe_load(f)
                    self.flows[flow_data['flow_id']] = flow_data
                    logger.info(f"Loaded flow: {flow_data['flow_id']}")
            except Exception as e:
                logger.error(f"Failed to load flow {flow_file}: {e}")
    
    async def process_message(
        self, 
        message: str, 
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process message through flow engine"""
        
        current_flow = session_data.get("current_flow")
        current_step = session_data.get("current_step")
        
        # Check for flow triggers if no active flow
        if not current_flow:
            triggered_flow = self._check_triggers(message)
            if triggered_flow:
                return await self._start_flow(triggered_flow, session_data)
        
        # Continue existing flow
        if current_flow and current_step:
            return await self._continue_flow(message, session_data)
        
        # No flow match - return None to use LLM
        return {"use_llm": True}
    
    def _check_triggers(self, message: str) -> Optional[str]:
        """Check if message triggers any flow"""
        message_lower = message.lower().strip()
        
        for flow_id, flow_data in self.flows.items():
            triggers = flow_data.get("triggers", [])
            
            for trigger in triggers:
                if trigger["type"] == "keyword":
                    keywords = trigger.get("values", [trigger.get("value", "")])
                    for keyword in keywords:
                        if keyword.lower() in message_lower:
                            return flow_id
                
                elif trigger["type"] == "exact_match":
                    if message_lower == trigger["value"].lower():
                        return flow_id
        
        return None
    
    async def _start_flow(
        self, 
        flow_id: str, 
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Start a new flow"""
        flow = self.flows.get(flow_id)
        if not flow:
            return {"use_llm": True}
        
        first_step = flow["steps"][0]
        
        # Update session
        session_data["current_flow"] = flow_id
        session_data["current_step"] = 0
        session_data["flow_data"] = {}
        
        return await self._execute_step(first_step, session_data)
    
    async def _continue_flow(
        self, 
        message: str, 
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Continue existing flow"""
        flow_id = session_data["current_flow"]
        current_step = session_data["current_step"]
        
        flow = self.flows.get(flow_id)
        if not flow or current_step >= len(flow["steps"]):
            return await self._end_flow(session_data)
        
        # Process user input for current step
        step = flow["steps"][current_step]
        
        if step["type"] == "input":
            # Store user input
            session_data.setdefault("flow_data", {})[step["variable"]] = message
            
            # Move to next step
            session_data["current_step"] += 1
            if session_data["current_step"] < len(flow["steps"]):
                next_step = flow["steps"][session_data["current_step"]]
                return await self._execute_step(next_step, session_data)
            else:
                return await self._end_flow(session_data)
        
        elif step["type"] == "quick_replies":
            # Handle quick reply selection
            return await self._handle_quick_reply(message, step, session_data)
        
        # Default: move to next step
        session_data["current_step"] += 1
        if session_data["current_step"] < len(flow["steps"]):
            next_step = flow["steps"][session_data["current_step"]]
            return await self._execute_step(next_step, session_data)
        else:
            return await self._end_flow(session_data)
    
    async def _execute_step(
        self, 
        step: Dict[str, Any], 
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a flow step"""
        step_type = step["type"]
        
        if step_type == "message":
            return {
                "response": self._render_template(step["text"], session_data),
                "type": "text"
            }
        
        elif step_type == "quick_replies":
            replies = []
            for reply in step["replies"]:
                replies.append({
                    "text": reply["text"],
                    "payload": reply.get("action", reply["text"])
                })
            
            return {
                "response": step["text"],
                "type": "quick_replies",
                "quick_replies": replies
            }
        
        elif step_type == "conditional":
            condition = step["condition"]
            if self._evaluate_condition(condition, session_data):
                return await self._execute_step(step["steps"][0], session_data)
            elif "else_steps" in step:
                return await self._execute_step(step["else_steps"][0], session_data)
        
        elif step_type == "escalate":
            session_data["escalated"] = True
            session_data["escalation_department"] = step.get("department", "general")
            return {
                "response": "Let me connect you with a human agent. Please wait a moment.",
                "type": "escalation",
                "department": step.get("department", "general")
            }
        
        return {"use_llm": True}
    
    async def _handle_quick_reply(
        self, 
        message: str, 
        step: Dict[str, Any], 
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle quick reply selection"""
        message_lower = message.lower().strip()
        
        for reply in step["replies"]:
            if message_lower == reply["text"].lower():
                action = reply.get("action")
                
                if action == "flow":
                    # Switch to different flow
                    new_flow_id = reply["target"]
                    session_data["current_flow"] = new_flow_id
                    session_data["current_step"] = 0
                    return await self._start_flow(new_flow_id, session_data)
                
                elif action == "escalate":
                    return await self._execute_step({
                        "type": "escalate",
                        "department": reply.get("department", "general")
                    }, session_data)
        
        # No match found
        return {
            "response": "Please select one of the available options.",
            "type": "quick_replies",
            "quick_replies": [{"text": r["text"], "payload": r["text"]} for r in step["replies"]]
        }
    
    def _render_template(self, template: str, session_data: Dict[str, Any]) -> str:
        """Render message template with session data"""
        flow_data = session_data.get("flow_data", {})
        
        # Simple template rendering
        for key, value in flow_data.items():
            template = template.replace(f"{{{key}}}", str(value))
        
        # Add user name if available
        if "user_name" in session_data:
            template = template.replace("{user_name}", session_data["user_name"])
        
        return template
    
    def _evaluate_condition(self, condition: str, session_data: Dict[str, Any]) -> bool:
        """Evaluate flow condition"""
        # Simple condition evaluation
        # In production, use a proper expression evaluator
        
        flow_data = session_data.get("flow_data", {})
        
        if "==" in condition:
            left, right = condition.split("==")
            left_val = flow_data.get(left.strip(), "")
            right_val = right.strip().strip('"\'')
            return str(left_val) == right_val
        
        return False
    
    async def _end_flow(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """End current flow"""
        session_data["current_flow"] = None
        session_data["current_step"] = None
        session_data["flow_data"] = {}
        
        return {
            "response": "Thank you! Is there anything else I can help you with?",
            "type": "text"
        }

flow_engine = FlowEngine()
```

### Step 8: Message Delivery Service

Create `app/services/delivery_service.py`:
```python
import httpx
from typing import Dict, Any, List
from app.config import settings
import structlog
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

logger = structlog.get_logger()

class DeliveryService:
    def __init__(self):
        self.base_url = settings.msg91_base_url
        self.auth_key = settings.msg91_auth_key
        self.sender_id = settings.msg91_sender_id
        
        self.headers = {
            "authkey": self.auth_key,
            "Content-Type": "application/json"
        }
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def send_message(
        self, 
        phone_number: str, 
        message: str, 
        message_type: str = "text",
        quick_replies: List[Dict] = None
    ) -> Dict[str, Any]:
        """Send WhatsApp message via MSG91"""
        
        payload = {
            "recipient": [
                {
                    "phone": phone_number,
                    "message": message
                }
            ]
        }
        
        # Add quick replies if provided
        if quick_replies and message_type == "quick_replies":
            payload["recipient"][0]["quick_replies"] = quick_replies
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.base_url}/whatsapp/send",
                    headers=self.headers,
                    json=payload
                )
                
                response.raise_for_status()
                result = response.json()
                
                logger.info(
                    "Message sent successfully",
                    phone=phone_number,
                    message_id=result.get("messageId")
                )
                
                return {
                    "success": True,
                    "message_id": result.get("messageId"),
                    "status": "sent"
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"MSG91 API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Message delivery failed: {e}")
            raise
    
    async def send_rich_message(
        self, 
        phone_number: str, 
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Send rich message (buttons, lists, etc.)"""
        
        message_type = content.get("type", "text")
        
        if message_type == "quick_replies":
            return await self.send_message(
                phone_number,
                content["response"],
                "quick_replies",
                content.get("quick_replies", [])
            )
        
        elif message_type == "text":
            return await self.send_message(
                phone_number,
                content["response"]
            )
        
        else:
            # Fallback to text message
            return await self.send_message(
                phone_number,
                content.get("response", "I'm sorry, I encountered an error.")
            )
    
    async def send_bulk_messages(
        self, 
        recipients: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """Send messages to multiple recipients"""
        
        tasks = []
        for recipient in recipients:
            task = self.send_message(
                recipient["phone_number"],
                recipient["message"]
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "phone_number": recipients[i]["phone_number"],
                    "success": False,
                    "error": str(result)
                })
            else:
                processed_results.append({
                    "phone_number": recipients[i]["phone_number"],
                    **result
                })
        
        return processed_results

delivery_service = DeliveryService()
```

---

## 🚨 Rate Limit Checkpoint

**If you've hit rate limits, save your progress and refer to the `continue_after_rate_limit.md` file for instructions on how to resume building.**

The next phases include:
- API routes and webhook handlers
- Testing setup
- Docker configuration
- Production deployment

**Current Progress: ~40% Complete**
- ✅ Project structure
- ✅ Core services (Session, LLM, Flow, Delivery)
- ✅ Database models
- ⏳ API routes (next)
- ⏳ Testing suite (next)
- ⏳ Docker & deployment (next)

Continue with the next file when rate limits reset!



