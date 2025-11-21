from datetime import datetime, timedelta

class AvailabilityTool:

    async def get_available_slots(self, days_ahead=5):
        slots = []
        now = datetime.now()
        for i in range(days_ahead):
            d = now + timedelta(days=i)
            for hour in [9, 11, 14, 16]:
                slots.append({
                    "id": f"slot_{i}_{hour}",
                    "date": d.strftime("%Y-%m-%d"),
                    "time": f"{hour}:00",
                    "duration": 30
                })
        return slots
