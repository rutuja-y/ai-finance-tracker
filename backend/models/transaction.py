from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime, timezone

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    amount = Column(Integer)
    type = Column(String)
    category = Column(String)
    user_id = Column(Integer)

    # ✅ FIXED
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )