from dataclasses import dataclass
from typing import Optional, Dict, Any, List

from rag.faq_rag import FAQRAG
from tools.availability_tool import AvailabilityTool
from tools.booking_tool import BookingTool


@dataclass
class ConversationContext:
    session_id: str
    user_id: Optional[str]
    current_phase: str = "greeting"
    appointment_type: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    patient_info: Optional[Dict[str, Any]] = None
    suggested_slots: List[Dict[str, Any]] = None
    selected_slot: Optional[Dict[str, Any]] = None
    booking_confirmed: bool = False


class SchedulingAgent:
    def __init__(self):
        self.faq_rag = FAQRAG()
        self.availability_tool = AvailabilityTool()
        self.booking_tool = BookingTool()
        self.conversation_contexts: Dict[str, ConversationContext] = {}

        self.appointment_durations = {
            "general_consultation": 30,
            "follow_up": 15,
            "physical_exam": 45,
            "specialist_consultation": 60
        }

    async def process_message(self, message: str, session_id: str, user_id: Optional[str] = None):

        if session_id not in self.conversation_contexts:
            self.conversation_contexts[session_id] = ConversationContext(
                session_id=session_id, user_id=user_id)

        context = self.conversation_contexts[session_id]

        if await self._is_faq_query(message):
            answer = await self.answer_faq(message)
            return {"response": answer}

        if context.current_phase == "greeting":
            context.current_phase = "understanding"
            return {"response": "Hello! What type of appointment do you need?"}

        if context.current_phase == "understanding":
            ap_type = await self._extract_appointment_type(message)
            if not ap_type:
                return {"response": "Choose: general, follow-up, exam, specialist."}

            context.appointment_type = ap_type
            context.current_phase = "slots"

            slots = await self.availability_tool.get_available_slots()
            context.suggested_slots = slots[:5]

            text = "\n".join([f"{i+1}. {s['date']} {s['time']}" for i, s in enumerate(context.suggested_slots)])
            return {"response": f"Here are available slots:\n{text}"}

        if context.current_phase == "slots":
            slot = await self._extract_slot_selection(message, context.suggested_slots)
            if not slot:
                return {"response": "Please say which slot number you choose."}
            context.selected_slot = slot
            context.current_phase = "patient"
            return {"response": "Please provide name, phone, email, reason."}

        if context.current_phase == "patient":
            info = await self._extract_patient_info(message)
            if not info:
                return {"response": "Provide: name, phone, email, reason."}
            context.patient_info = info

            return {"response": f"Confirm booking? (yes/no)"}

        if context.current_phase == "confirm":
            if "yes" in message.lower():
                result = await self.booking_tool.book_appointment(context.patient_info, context.selected_slot)
                return {"response": f"Booked! ID: {result['booking_id']}"}
            return {"response": "Cancelled."}

        return {"response": "Try again."}

    async def _is_faq_query(self, m): return any(k in m.lower() for k in ["hours", "location", "insurance"])

    async def answer_faq(self, q): return await self.faq_rag.get_answer(q)

    async def _extract_appointment_type(self, m):
        m = m.lower()
        if "general" in m: return "general_consultation"
        if "follow" in m: return "follow_up"
        if "exam" in m: return "physical_exam"
        if "specialist" in m: return "specialist_consultation"
        return None

    async def _extract_slot_selection(self, m, slots):
        for s in slots:
            if s["date"] in m or s["time"].lower() in m.lower():
                return s
        return None

    async def _extract_patient_info(self, m):
        lines = m.split("\n")
        info = {}
        for line in lines:
            if ":" not in line: continue
            k, v = line.split(":", 1)
            k, v = k.strip().lower(), v.strip()
            if "name" in k: info["name"] = v
            if "phone" in k: info["phone"] = v
            if "email" in k: info["email"] = v
            if "reason" in k: info["reason"] = v
        return info if len(info) == 4 else None
