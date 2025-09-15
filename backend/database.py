from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database configuration
DATABASE_URL = "sqlite:///./ai_image_studio.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ProcessingHistory(Base):
    __tablename__ = "processing_history"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)  # For tracking user sessions
    original_filename = Column(String, nullable=False)
    processed_filename = Column(String)
    operation_type = Column(String, nullable=False)  # background_removal, upscaling, etc.
    model_used = Column(String, nullable=False)
    processing_status = Column(String, default="pending")  # pending, completed, failed
    processing_time_seconds = Column(Integer)
    file_size_original = Column(Integer)
    file_size_processed = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    error_message = Column(Text)
    
class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    total_images_processed = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()