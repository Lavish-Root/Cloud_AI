import sqlite3
import json
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "cloudguard.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tables for security history
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            provider TEXT,
            risk_score INTEGER,
            findings TEXT,
            ml_inference TEXT
        )
    ''')
    
    # Table for audit logs (remeditaiton actions, etc)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            action TEXT,
            resource_id TEXT,
            user_id TEXT,
            details TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def save_scan(provider, risk_score, findings, ml_inference):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO security_scans (provider, risk_score, findings, ml_inference)
        VALUES (?, ?, ?, ?)
    ''', (provider, risk_score, json.dumps(findings), json.dumps(ml_inference)))
    conn.commit()
    conn.close()

def get_recent_scans(limit=10):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM security_scans ORDER BY timestamp DESC LIMIT ?', (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    scans = []
    for r in rows:
        scans.append({
            "id": r[0],
            "timestamp": r[1],
            "provider": r[2],
            "risk_score": r[3],
            "findings": json.loads(r[4]),
            "ml_inference": json.loads(r[5])
        })
    return scans

def save_audit_log(action, resource_id, details, user_id="system-auto"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO audit_logs (action, resource_id, user_id, details)
        VALUES (?, ?, ?, ?)
    ''', (action, resource_id, user_id, details))
    conn.commit()
    conn.close()

# Initialize on import
if not os.path.exists(DB_PATH):
    init_db()
else:
    # Just in case schema needs update
    init_db()
