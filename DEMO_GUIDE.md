# CloudGuard AI Enterprise - Demonstration Guide 🏢

Follow this professional script to showcase the full power of the Enterprise security platform.

## 🚀 Pre-Demo Setup
1.  **Backend**: `python main.py` in `/backend` (Ensures DB is active).
2.  **Dashboard**: `npm run dev` in `/dashboard`.
3.  **Extension**: Load `/extension` in Chrome.

---

## 🎭 The Demonstration Script

### Act 1: The "Real-Time" Perimeter (Extension)
*   **Scene**: Open any Cloud Console (e.g., [console.cloud.google.com](https://console.cloud.google.com)).
*   **Action**: Point to the **Security HUD** in the corner.
*   **The Hook**: "Notice how we aren't just a dashboard. We are *inside* the workload. The HUD shows a real-time risk score specifically for this IAM context."
*   **Trigger**: Navigate to an **IAM Admin** page.
*   **The Payload**: The **CRITICAL HIJACK ATTEMPT** banner triggers.
*   **Explanation**: "Our AI Engine just detected an anomalous ownership-removal pattern. This isn't a static rule; it's behavioral analysis acting in milliseconds."

### Act 2: The Command Center (Dashboard)
*   **Scene**: Switch to `http://localhost:5173`.
*   **Action**: Pass the **Master Passcode** challenge (`password123`).
*   **The Value**: "Security requires friction where it matters. Our Enterprise vault ensures only authorized security officers can intercept these threats."
*   **Visualization**: View the **Posture Trend** chart.
*   **Explanation**: "Because we use a persistent SQLite audit-trail, the dashboard shows true security growth over time, not just a static snapshot."

### Act 3: One-Click Hardening (Remediation)
*   **Scene**: Go to the **Remediation Center**.
*   **Action**: Click **"Apply Fix"** on a Critical vulnerability.
*   **The Value**: "We don't just find problems; we solve them. One click reverts the cloud resource to its secure baseline, instantly boosting the global score and logging the event in our audit trial."

### Act 4: Executive Compliance (Reporting)
*   **Scene**: Click **"Export Analytics"** in the sidebar.
*   **Action**: Open the generated **PDF Report**.
*   **The Conclusion**: "This is a continuous audit. Every scan, every fix, and every threat is recorded in this enterprise-ready PDF, ready for CIS or SOC2 compliance reviewers."

---

## 🛠️ Verification Points for You
*   **Persistence Check**: Refresh the dashboard. Notice the Chart.js trend stays populated? That's the SQLite database at work.
*   **Multi-Cloud Toggle**: Refresh a few times to see the active provider switch between AWS, Azure, and GCP in the header based on your simulated traffic.
*   **Audit Trail**: Every remediation action you take is now permanently recorded in `backend/app/db/cloudguard.db`.
