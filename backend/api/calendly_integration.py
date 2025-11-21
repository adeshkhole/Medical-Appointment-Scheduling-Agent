class CalendlyAPI:

    async def get_busy_times(self, date_str):
        return []  # always free for demo

    async def check_slot_availability(self, slot_id, appointment_type):
        return {"available": True, "slot": None}

    async def book_appointment(self, slot_id, patient_info, appointment_type):
        return {
            "success": True,
            "booking_details": {
                "booking_id": f"CL-{slot_id}"
            }
        }

    async def cancel_appointment(self, booking_id):
        return {"success": True}

    async def reschedule_appointment(self, booking_id, new_slot_id):
        return {"success": True}

    async def get_appointment_details(self, booking_id):
        return {"success": True, "details": {}}
