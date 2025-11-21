class BookingTool:

    def __init__(self):
        self.bookings = {}
        self.counter = 1

    async def book_appointment(self, patient, slot):
        booking_id = f"BOOK{self.counter}"
        self.counter += 1

        self.bookings[booking_id] = {
            "patient": patient,
            "slot": slot
        }

        return {"success": True, "booking_id": booking_id}
