from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    limit = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))