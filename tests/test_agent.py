import pytest
import asyncio
from datetime import datetime, date, time
from unittest.mock import Mock, patch, AsyncMock

from backend.agent.scheduling_agent import SchedulingAgent, ConversationContext
from backend.agent.prompts import AgentPrompts
from backend.models.schemas import PatientInfo, AppointmentRequest, BookingConfirmation
from backend.rag.faq_rag import FAQRAG
from backend.tools.availability_tool import AvailabilityTool
from backend.tools.booking_tool import BookingTool

class TestSchedulingAgent:
    
    @pytest.fixture
    def scheduling_agent(self):
        return SchedulingAgent()
    
    @pytest.fixture
    def sample_patient_info(self):
        return {
            'name': 'John Doe',
            'phone': '(555) 123-4567',
            'email': 'john.doe@email.com',
            'reason': 'Annual checkup'
        }
    
    @pytest.fixture
    def sample_appointment_request(self):
        return AppointmentRequest(
            patient_info=PatientInfo(
                first_name='Jane',
                last_name='Smith',
                email='jane.smith@email.com',
                phone='(555) 987-6543'
            ),
            appointment_type='general_consultation',
            slot_id='slot_001',
            reason_for_visit='Follow-up consultation'
        )
    
    # Test FAQ query detection
    @pytest.mark.asyncio
    async def test_is_faq_query(self, scheduling_agent):
        # Test various FAQ-related queries
        faq_queries = [
            "What are your hours?",
            "Do you accept Blue Cross insurance?",
            "Where are you located?",
            "What should I bring to my appointment?",
            "Can I park at your clinic?",
            "What is your cancellation policy?",
            "Do I need to wear a mask for COVID?",
            "How much is a consultation?",
            "What insurance do you take?",
            "Are you open on weekends?"
        ]
        
        for query in faq_queries:
            result = await scheduling_agent._is_faq_query(query)
            assert result == True, f"Query should be detected as FAQ: {query}"
    
    @pytest.mark.asyncio
    async def test_is_not_faq_query(self, scheduling_agent):
        # Test non-FAQ queries
        non_faq_queries = [
            "I want to schedule an appointment",
            "Book me for tomorrow",
            "What times are available?",
            "I need to see a doctor",
            "Can I reschedule my appointment?",
            "Hello",
            "Hi there",
            "Good morning"
        ]
        
        for query in non_faq_queries:
            result = await scheduling_agent._is_faq_query(query)
            assert result == False, f"Query should not be detected as FAQ: {query}"
    
    # Test appointment type extraction
    @pytest.mark.asyncio
    async def test_extract_appointment_type(self, scheduling_agent):
        test_cases = [
            ("I need a general consultation", "general_consultation"),
            ("I want a checkup", "general_consultation"),
            ("Book a follow-up appointment", "follow_up"),
            ("I need to follow up with my doctor", "follow_up"),
            ("Schedule a physical exam", "physical_exam"),
            ("I want a complete physical", "physical_exam"),
            ("I need to see a specialist", "specialist_consultation"),
            ("Book a specialty consultation", "specialist_consultation")
        ]
        
        for message, expected_type in test_cases:
            result = await scheduling_agent._extract_appointment_type(message)
            assert result == expected_type, f"Expected {expected_type} for '{message}', got {result}"
    
    @pytest.mark.asyncio
    async def test_extract_no_appointment_type(self, scheduling_agent):
        unclear_messages = [
            "I need to see a doctor",
            "Book an appointment",
            "I want to schedule something",
            "Hello",
            "What do you offer?"
        ]
        
        for message in unclear_messages:
            result = await scheduling_agent._extract_appointment_type(message)
            assert result is None, f"Should not extract appointment type from: {message}"
    
    # Test patient info extraction
    @pytest.mark.asyncio
    async def test_extract_patient_info_valid(self, scheduling_agent, sample_patient_info):
        message = f"""Name: {sample_patient_info['name']}
Phone: {sample_patient_info['phone']}
Email: {sample_patient_info['email']}
Reason: {sample_patient_info['reason']}"""
        
        result = await scheduling_agent._extract_patient_info(message)
        assert result is not None
        assert result['name'] == sample_patient_info['name']
        assert result['phone'] == sample_patient_info['phone']
        assert result['email'] == sample_patient_info['email']
        assert result['reason'] == sample_patient_info['reason']
    
    @pytest.mark.asyncio
    async def test_extract_patient_info_invalid(self, scheduling_agent):
        incomplete_messages = [
            "Name: John Doe\nPhone: (555) 123-4567",  # Missing email and reason
            "Email: john@email.com\nReason: Checkup",  # Missing name and phone
            "Name: John Doe\nEmail: john@email.com",  # Missing phone and reason
            "Phone: (555) 123-4567\nReason: Checkup",  # Missing name and email
            "Just call me John"  # Not formatted properly
        ]
        
        for message in incomplete_messages:
            result = await scheduling_agent._extract_patient_info(message)
            assert result is None, f"Should not extract incomplete info from: {message}"
    
    # Test conversation flow
    @pytest.mark.asyncio
    async def test_greeting_phase(self, scheduling_agent):
        session_id = "test_session_001"
        message = "Hello"
        
        result = await scheduling_agent.process_message(message, session_id)
        
        assert result['session_id'] == session_id
        assert result['requires_action'] == False
        assert "Hello" in result['response'] or "How can I assist you" in result['response']
    
    @pytest.mark.asyncio
    async def test_faq_response(self, scheduling_agent):
        session_id = "test_session_002"
        message = "What are your clinic hours?"
        
        result = await scheduling_agent.process_message(message, session_id)
        
        assert result['session_id'] == session_id
        assert result['action_type'] == "faq_answer"
        assert "hours" in result['response'].lower()
    
    # Test slot formatting
    def test_format_slots_for_display(self, scheduling_agent):
        slots = [
            {
                'date': '2024-01-15',
                'time': '10:00 AM',
                'duration': 30
            },
            {
                'date': '2024-01-15',
                'time': '02:30 PM',
                'duration': 45
            },
            {
                'date': '2024-01-16',
                'time': '09:00 AM',
                'duration': 30
            }
        ]
        
        result = scheduling_agent._format_slots_for_display(slots)
        expected_parts = [
            "1. 2024-01-15 at 10:00 AM (30 minutes)",
            "2. 2024-01-15 at 02:30 PM (45 minutes)",
            "3. 2024-01-16 at 09:00 AM (30 minutes)"
        ]
        
        for part in expected_parts:
            assert part in result
    
    # Test context management
    @pytest.mark.asyncio
    async def test_context_creation(self, scheduling_agent):
        session_id = "test_session_003"
        
        # First message should create context
        await scheduling_agent.process_message("Hello", session_id)
        
        assert session_id in scheduling_agent.conversation_contexts
        context = scheduling_agent.conversation_contexts[session_id]
        assert context.session_id == session_id
        assert context.current_phase == "greeting"
    
    @pytest.mark.asyncio
    async def test_context_persistence(self, scheduling_agent):
        session_id = "test_session_004"
        
        # Process multiple messages
        await scheduling_agent.process_message("Hello", session_id)
        await scheduling_agent.process_message("I need a general consultation", session_id)
        
        # Context should persist and update
        context = scheduling_agent.conversation_contexts[session_id]
        assert context.appointment_type == "general_consultation"
        assert context.current_phase == "slot_recommendation"
    
    # Test appointment durations
    def test_appointment_durations(self, scheduling_agent):
        expected_durations = {
            "general_consultation": 30,
            "follow_up": 15,
            "physical_exam": 45,
            "specialist_consultation": 60
        }
        
        assert scheduling_agent.appointment_durations == expected_durations
    
    # Test edge cases
    @pytest.mark.asyncio
    async def test_empty_message(self, scheduling_agent):
        session_id = "test_session_005"
        
        result = await scheduling_agent.process_message("", session_id)
        
        assert result['session_id'] == session_id
        assert result['requires_action'] == False
    
    @pytest.mark.asyncio
    async def test_none_values(self, scheduling_agent):
        session_id = "test_session_006"
        user_id = None
        
        result = await scheduling_agent.process_message("Hello", session_id, user_id)
        
        assert result['session_id'] == session_id
        assert session_id in scheduling_agent.conversation_contexts
        context = scheduling_agent.conversation_contexts[session_id]
        assert context.user_id is None

class TestFAQRAG:
    
    @pytest.fixture
    def faq_rag(self):
        return FAQRAG()
    
    @pytest.mark.asyncio
    async def test_get_answer_valid_question(self, faq_rag):
        questions = [
            "What are your hours?",
            "Where are you located?",
            "Do you accept insurance?",
            "What should I bring to my appointment?"
        ]
        
        for question in questions:
            answer = await faq_rag.get_answer(question)
            assert answer is not None
            assert len(answer) > 0
            assert "I don't have specific information" not in answer
    
    @pytest.mark.asyncio
    async def test_get_answer_invalid_question(self, faq_rag):
        invalid_questions = [
            "What's the meaning of life?",
            "How do I build a rocket?",
            "What stocks should I buy?",
            ""
        ]
        
        for question in invalid_questions:
            answer = await faq_rag.get_answer(question)
            assert "I don't have specific information" in answer or "contact our office" in answer
    
    @pytest.mark.asyncio
    async def test_search_faqs(self, faq_rag):
        query = "hours location parking"
        results = await faq_rag.search_faqs(query, top_k=3)
        
        assert isinstance(results, list)
        assert len(results) <= 3
        
        for result in results:
            assert 'faq' in result
            assert 'similarity' in result
            assert result['similarity'] >= 0.3
    
    def test_get_faq_by_category(self, faq_rag):
        categories = ["Clinic Details", "Insurance & Billing", "Visit Preparation"]
        
        for category in categories:
            faqs = faq_rag.get_faq_by_category(category)
            assert isinstance(faqs, list)
            for faq in faqs:
                assert faq['category'] == category
    
    def test_get_all_categories(self, faq_rag):
        categories = faq_rag.get_all_categories()
        assert isinstance(categories, list)
        assert len(categories) > 0
        assert "Clinic Details" in categories

class TestBookingTool:
    
    @pytest.fixture
    def booking_tool(self):
        return BookingTool()
    
    @pytest.fixture
    def sample_booking_request(self):
        return AppointmentRequest(
            patient_info=PatientInfo(
                first_name="Test",
                last_name="Patient",
                email="test@email.com",
                phone="(555) 123-4567"
            ),
            appointment_type="general_consultation",
            slot_id="slot_test_001",
            reason_for_visit="Annual checkup"
        )
    
    @pytest.mark.asyncio
    async def test_validate_appointment_request_valid(self, booking_tool, sample_booking_request):
        result = await booking_tool._validate_appointment_request(sample_booking_request)
        
        assert result['valid'] == True
        assert result['message'] == "Validation passed"
        assert 'errors' not in result or len(result.get('errors', [])) == 0
    
    @pytest.mark.asyncio
    async def test_validate_appointment_request_invalid(self, booking_tool):
        invalid_request = AppointmentRequest(
            patient_info=PatientInfo(
                first_name="",  # Invalid - empty name
                last_name="Test",
                email="invalid-email",  # Invalid - bad email
                phone="123"  # Invalid - too short
            ),
            appointment_type="invalid_type",  # Invalid - wrong type
            slot_id="",  # Invalid - empty slot
            reason_for_visit="x"  # Invalid - too short
        )
        
        result = await booking_tool._validate_appointment_request(invalid_request)
        
        assert result['valid'] == False
        assert result['message'] == "Validation failed"
        assert 'errors' in result
        assert len(result['errors']) > 0
    
    def test_calculate_appointment_duration(self, booking_tool):
        test_cases = [
            ("general_consultation", 30),
            ("follow_up", 15),
            ("physical_exam", 45),
            ("specialist_consultation", 60),
            ("invalid_type", 30)  # Default
        ]
        
        for appointment_type, expected_duration in test_cases:
            duration = booking_tool._get_appointment_duration(appointment_type)
            assert duration == expected_duration
    
    def test_can_cancel_booking(self, booking_tool):
        # Test booking more than 24 hours away
        future_booking = BookingConfirmation(
            booking_id="test_001",
            appointment_date=date.today() + timedelta(days=2),
            appointment_time=time(10, 0),
            appointment_type="general_consultation",
            patient_info=PatientInfo(
                first_name="Test",
                last_name="Patient",
                email="test@email.com",
                phone="(555) 123-4567"
            ),
            duration_minutes=30,
            status="confirmed",
            created_at=datetime.now()
        )
        
        can_cancel = booking_tool._can_cancel_booking(future_booking)
        assert can_cancel == True
        
        # Test booking less than 24 hours away
        soon_booking = BookingConfirmation(
            booking_id="test_002",
            appointment_date=date.today(),
            appointment_time=time(datetime.now().hour + 1),  # 1 hour from now
            appointment_type="general_consultation",
            patient_info=PatientInfo(
                first_name="Test",
                last_name="Patient",
                email="test@email.com",
                phone="(555) 123-4567"
            ),
            duration_minutes=30,
            status="confirmed",
            created_at=datetime.now()
        )
        
        can_cancel = booking_tool._can_cancel_booking(soon_booking)
        assert can_cancel == False

class TestAvailabilityTool:
    
    @pytest.fixture
    def availability_tool(self):
        return AvailabilityTool()
    
    def test_business_hours(self, availability_tool):
        expected_hours = {
            'monday': {'start': '08:00', 'end': '18:00'},
            'tuesday': {'start': '08:00', 'end': '18:00'},
            'wednesday': {'start': '08:00', 'end': '18:00'},
            'thursday': {'start': '08:00', 'end': '18:00'},
            'friday': {'start': '08:00', 'end': '18:00'},
            'saturday': {'start': '09:00', 'end': '14:00'},
            'sunday': None
        }
        
        assert availability_tool.business_hours == expected_hours
    
    def test_appointment_durations(self, availability_tool):
        expected_durations = {
            'general_consultation': 30,
            'follow_up': 15,
            'physical_exam': 45,
            'specialist_consultation': 60
        }
        
        assert availability_tool.appointment_durations == expected_durations
    
    def test_rank_slots_by_preference(self, availability_tool):
        slots = [
            {
                'datetime': datetime(2024, 1, 15, 9, 0).isoformat(),  # 9 AM - morning
                'appointment_type': 'general_consultation'
            },
            {
                'datetime': datetime(2024, 1, 15, 14, 0).isoformat(),  # 2 PM - afternoon
                'appointment_type': 'general_consultation'
            },
            {
                'datetime': datetime(2024, 1, 15, 17, 0).isoformat(),  # 5 PM - evening
                'appointment_type': 'general_consultation'
            }
        ]
        
        ranked_slots = availability_tool._rank_slots_by_preference(slots)
        
        # Morning slot should have highest score
        assert ranked_slots[0]['preference_score'] > ranked_slots[1]['preference_score']
        assert ranked_slots[1]['preference_score'] > ranked_slots[2]['preference_score']
    
    @pytest.mark.asyncio
    async def test_get_available_slots_mock(self, availability_tool):
        slots = await availability_tool._get_mock_available_slots("general_consultation")
        
        assert isinstance(slots, list)
        assert len(slots) > 0
        
        for slot in slots:
            assert 'id' in slot
            assert 'date' in slot
            assert 'time' in slot
            assert 'duration' in slot
            assert slot['available'] == True
            assert slot['appointment_type'] == "general_consultation"

# Integration tests
class TestIntegration:
    
    @pytest.mark.asyncio
    async def test_full_conversation_flow(self):
        agent = SchedulingAgent()
        session_id = "integration_test_001"
        
        # Start conversation
        result1 = await agent.process_message("Hello", session_id)
        assert result1['requires_action'] == False
        
        # Ask for appointment type
        result2 = await agent.process_message("I need a general consultation", session_id)
        assert result2['requires_action'] == True
        assert result2['action_type'] == "slot_selection"
        assert len(result2['suggested_slots']) > 0
        
        # Context should be updated
        context = agent.conversation_contexts[session_id]
        assert context.appointment_type == "general_consultation"
        assert context.current_phase == "slot_recommendation"

# Run tests
if __name__ == "__main__":
    pytest.main(["-v", __file__])