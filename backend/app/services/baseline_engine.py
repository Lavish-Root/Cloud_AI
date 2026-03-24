from typing import Dict, List, Optional
import json
import os

class BaselineEngine:
    """Handles snapshotting and continuous comparison of cloud configurations."""
    
    def __init__(self, baseline_file="cloud_baseline.json"):
        self.baseline_path = baseline_file
        self.baseline_data: Dict[str, Dict] = {}
        self._load_baseline()

    def _load_baseline(self):
        # Disabled persistent loading to avoid "cached" baseline data on startup.
        # Now every start is fresh unless specifically snapshotted during this session.
        self.baseline_data = {}

    def create_baseline(self, provider: str, current_state: Dict):
        """Saves current-state security snapshots for a cloud provider."""
        self.baseline_data[provider] = current_state
        with open(self.baseline_path, 'w') as f:
            json.dump(self.baseline_data, f, indent=4)
        return {"status": "success", "provider": provider, "timestamp": "now"}

    def detect_drift(self, provider: str, current_state: Dict) -> List[Dict]:
        """Compares current state vs baseline to identify unauthorized changes or drift."""
        baseline = self.baseline_data.get(provider)
        if not baseline:
            return [{"type": "NO_BASELINE", "msg": f"No baseline exists for {provider}"}]

        drifts = []
        
        # 1. Compare Storage Buckets (Example drift check)
        current_buckets = {b["name"]: b for b in current_state.get("storage_buckets", [])}
        baseline_buckets = {b["name"]: b for b in baseline.get("storage_buckets", [])}

        for name, b_bucket in baseline_buckets.items():
            if name not in current_buckets:
                drifts.append({"resource": name, "change": "DELETED", "severity": "HIGH"})
            else:
                c_bucket = current_buckets[name]
                if b_bucket["public"] != c_bucket["public"] and c_bucket["public"] == True:
                    drifts.append({"resource": name, "change": "PUBLIC_ACCESS_ENABLED", "severity": "CRITICAL"})
                if b_bucket["encrypted"] != c_bucket["encrypted"]:
                    drifts.append({"resource": name, "change": "ENCRYPTION_DISABLED", "severity": "CRITICAL"})

        # New buckets
        for name in current_buckets:
            if name not in baseline_buckets:
                drifts.append({"resource": name, "change": "NEW_RESOURCE_CREATED", "severity": "MEDIUM"})

        return drifts

# Singleton
baseline_engine = BaselineEngine()
