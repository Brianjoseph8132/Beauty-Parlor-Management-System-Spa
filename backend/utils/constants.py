from datetime import time

SALON_OPEN = time(8, 0)
SALON_CLOSE = time(22, 0)
GRACE_PERIOD_END = time(8, 30)
BUFFER_MINUTES = 10 
RESCHEDULE_HOURS_BEFORE = 24 

TIME_BLOCKS = {
    "morning": (time(8, 0), time(12, 0)),
    "afternoon": (time(12, 0), time(17, 0)),
    "evening": (time(17, 0), time(22, 0)),
}


DAY_MAP = {
    "0": "Monday",
    "1": "Tuesday",
    "2": "Wednesday",
    "3": "Thursday",
    "4": "Friday",
    "5": "Saturday",
    "6": "Sunday"
}

# Reverse map to convert names → numbers
DAY_NAME_TO_NUM = {v: k for k, v in DAY_MAP.items()}