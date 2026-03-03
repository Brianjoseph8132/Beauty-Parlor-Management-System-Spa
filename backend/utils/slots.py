from datetime import datetime, date, timedelta
from .constants import SALON_CLOSE, SALON_OPEN, TIME_BLOCKS, BUFFER_MINUTES

def overlaps(start1, end1, start2, end2):
    return start1 < end2 and start2 < end1

def generate_service_slots(service_duration, buffer_minutes=BUFFER_MINUTES):
    """
    Generate time slots with buffer between appointments.
    """
    slots = []
    current = datetime.combine(date.today(), SALON_OPEN)
    closing = datetime.combine(date.today(), SALON_CLOSE)
    
    # Total time blocked includes service + buffer
    total_block_time = service_duration + buffer_minutes
    
    while current + timedelta(minutes=service_duration) <= closing:
        start_time = current.time()
        # Customer sees service end time only (no buffer shown)
        end_time = (current + timedelta(minutes=service_duration)).time()
        slots.append((start_time, end_time))
        
        # Next slot starts after service + buffer
        current += timedelta(minutes=total_block_time)
    
    return slots


def categorize_slot(start_time):
    """
    Categorize a time slot into morning, afternoon, or evening.
    """
    for period, (start, end) in TIME_BLOCKS.items():
        if start <= start_time < end:
            return period
    return "evening"