import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

# Dynamically set origins based on environment
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
CORS(app, origins=FRONTEND_URL)

# Database configuration: Use PostgreSQL on Render, fall back to local SQLite
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    # Fix Render's postgres:// protocol legacy quirk to match SQLAlchemy's expectation
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
else:
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "church.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# ORM Model for Church Events
class ChurchEvent(db.Model):
    __tablename__ = "church_events"

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.String(20), nullable=False) # Store as YYYY-MM-DD
    time = db.Column(db.String(10), nullable=False) # Store as HH:MM
    location = db.Column(db.String(100), nullable=False, default="Main Sanctuary")
    ministry = db.Column(db.String(50), nullable=False, default="Main Service")
    attendance = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.utcnow().isoformat() + "Z")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "ministry": self.ministry,
            "attendance": self.attendance,
            "createdAt": self.created_at
        }

# Seed database with realistic default events if empty
def seed_database():
    if ChurchEvent.query.count() == 0:
        seed_events = [
            ChurchEvent(
                id="evt_1",
                title="Sunday Morning Main Service",
                description="Holy Communion and sermon led by Parish Minister. All are welcome.",
                date="2026-07-05",
                time="10:30",
                location="Main Sanctuary",
                ministry="Main Service",
                attendance=450,
                created_at=datetime.utcnow().isoformat() + "Z"
            ),
            ChurchEvent(
                id="evt_2",
                title="Youth Fellowship Summit",
                description="Vibrant praise, worship, and discussion on modern youth challenges.",
                date="2026-07-12",
                time="14:00",
                location="Youth Hall",
                ministry="Youth Fellowship",
                attendance=180,
                created_at=datetime.utcnow().isoformat() + "Z"
            ),
            ChurchEvent(
                id="evt_3",
                title="Woman's Guild Mid-Week Prayer",
                description="Intercessory prayer and fellowship for all registered members and visitors.",
                date="2026-07-08",
                time="15:00",
                location="Memorial Hall",
                ministry="Womens Guild",
                attendance=65,
                created_at=datetime.utcnow().isoformat() + "Z"
            ),
            ChurchEvent(
                id="evt_4",
                title="Sunday School & Bible Study",
                description="Fun, interactive biblical lessons and activities for kids of all ages.",
                date="2026-07-05",
                time="08:30",
                location="Church School Classrooms",
                ministry="Church School",
                attendance=120,
                created_at=datetime.utcnow().isoformat() + "Z"
            ),
            ChurchEvent(
                id="evt_5",
                title="Men's Fellowship Breakfast Meeting",
                description="Monthly breakfast fellowship discussing mentorship, leadership, and church growth.",
                date="2026-07-11",
                time="07:00",
                location="Parish Boardroom",
                ministry="Mens Fellowship",
                attendance=40,
                created_at=datetime.utcnow().isoformat() + "Z"
            )
        ]
        for event in seed_events:
            db.session.add(event)
        db.session.commit()
        print("Database seeded with default events.")

@app.route("/api/events", methods=["GET"])
def get_events():
    events = ChurchEvent.query.all()
    sorted_events = sorted(events, key=lambda e: e.date)
    return jsonify([e.to_dict() for e in sorted_events])

@app.route("/api/events/stats", methods=["GET"])
def get_stats():
    events = ChurchEvent.query.all()
    total_events = len(events)
    total_attendance = sum(e.attendance for e in events)
    
    ministry_counts = {}
    for e in events:
        ministry_counts[e.ministry] = ministry_counts.get(e.ministry, 0) + 1
        
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    upcoming_count = sum(1 for e in events if e.date >= today_str)
    
    return jsonify({
        "totalEvents": total_events,
        "totalAttendance": total_attendance,
        "ministryCounts": ministry_counts,
        "upcomingCount": upcoming_count
    })

@app.route("/api/events", methods=["POST"])
def create_event():
    data = request.get_json()
    if not data or not data.get("title") or not data.get("date"):
        return jsonify({"message": "Title and date are required fields"}), 400
        
    new_id = f"evt_{uuid.uuid4().hex[:8]}"
    
    new_event = ChurchEvent(
        id=new_id,
        title=data["title"],
        description=data.get("description"),
        date=data["date"],
        time=data.get("time", "00:00"),
        location=data.get("location", "Main Sanctuary"),
        ministry=data.get("ministry", "Main Service"),
        attendance=int(data.get("attendance", 0))
    )
    
    db.session.add(new_event)
    db.session.commit()
    return jsonify(new_event.to_dict()), 201

@app.route("/api/events/<string:event_id>", methods=["PUT"])
def update_event(event_id):
    event = ChurchEvent.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
        
    event.title = data.get("title", event.title)
    event.description = data.get("description", event.description)
    event.date = data.get("date", event.date)
    event.time = data.get("time", event.time)
    event.location = data.get("location", event.location)
    event.ministry = data.get("ministry", event.ministry)
    event.attendance = int(data.get("attendance", event.attendance))
    
    db.session.commit()
    return jsonify(event.to_dict())

@app.route("/api/events/<string:event_id>", methods=["DELETE"])
def delete_event(event_id):
    event = ChurchEvent.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
        
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event successfully deleted"})

# Prepare DB context and run local development server
with app.app_context():
    db.create_all()
    seed_database()

if __name__ == "__main__":
    # Pull dynamic port for local custom bindings, default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)