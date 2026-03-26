import random
from datetime import datetime, timedelta
from typing import Dict, Any, List

class CloudEnvironment:
    """A singleton that maintains the persistent state of simulated cloud resources."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CloudEnvironment, cls).__new__(cls)
            cls._instance._initialize_state()
        return cls._instance

    def _initialize_state(self):
        self._state = {
            "aws": {
                "iam_roles": [
                    {"name": "OrganizationAccountAccessRole", "mfa": True, "last_used": (datetime.now() - timedelta(hours=2)).isoformat()},
                    {"name": "Admin-Jumpstart", "mfa": False, "last_used": (datetime.now() - timedelta(minutes=15)).isoformat()}
                ],
                "compute_instances": [
                    {"id": "i-09f123456789abcde", "type": "t3.medium", "state": "running", "public_ip": "54.12.87.12", "encryption": True},
                    {"id": "i-09f123456789fffff", "type": "m5.large", "state": "running", "public_ip": "52.4.91.22", "encryption": False}
                ],
                "storage_buckets": [
                    {"name": "cg-prod-backups", "public": False, "versioning": True, "encryption": "AES256"},
                    {"name": "cg-internal-data", "public": True, "versioning": True, "encryption": "AES256"}
                ],
                "network_acls": [
                    {"id": "acl-02", "rules": [{"port": 22, "action": "allow", "source": "0.0.0.0/0"}]}
                ]
            },
            "azure": {
                "virtual_machines": [
                    {"name": "dev-vm-jump", "status": "running", "managed_disk_encryption": False}
                ],
                "network_security_groups": [
                    {"name": "nsg-prod", "rules": [{"name": "AllowSSH", "priority": 100, "access": "Allow", "source": "0.0.0.0/0"}]}
                ]
            },
            "gcp": {
                "iam_policies": [
                    {"member": "user:ops-admin@gmail.com", "role": "roles/owner"}
                ],
                "cloud_storage": [
                    {"name": "sensitive-data-bucket", "uniform_access": True, "public": False}
                ]
            }
        }
        self.last_drift = datetime.now()
        self.unauth_attempts = 0 # Persistent across scans until resolved

    def get_state(self, provider: str) -> Dict[str, Any]:
        self._apply_periodic_drift()
        state = self._state.get(provider, {})
        # If we are under attack, inject it into the state
        if self.unauth_attempts > 5 and provider == "gcp":
            pass # The security API handles the specific finding injection for now
        return state

    def update_indicators(self, unauth_attempts: int):
        self.unauth_attempts = unauth_attempts

    def resolve_attack(self):
        """Neutralizes the active hijacking threat."""
        self.unauth_attempts = 0
        # Reset any malicious owner roles in GCP
        self._state["gcp"]["iam_policies"] = [
            p for p in self._state["gcp"]["iam_policies"] 
            if "attacker" not in p["member"] and "unknown-actor" not in p["member"]
        ]

    def apply_remediation(self, provider: str, resource_id: str, issue_id: str):
        """Actually modifies the state to 'fix' the issue."""
        state = self._state.get(provider)
        if not state: return

        # Simple logic to 'fix' based on common IDs
        if "MFA" in issue_id:
            for role in state.get("iam_roles", []):
                if role["name"] in resource_id or "Admin" in role["name"]:
                    role["mfa"] = True
        
        if "PUBLIC" in issue_id or "BUCKET" in issue_id:
            for bucket in state.get("storage_buckets", []):
                if bucket["name"] == resource_id:
                    bucket["public"] = False
            for bucket in state.get("cloud_storage", []):
                if bucket["name"] == resource_id:
                    bucket["public"] = False
                    
        if "SSH" in issue_id or "ACL" in issue_id:
             for acl in state.get("network_acls", []):
                 if acl["id"] == resource_id:
                     for rule in acl["rules"]:
                         if rule["port"] == 22: rule["source"] = "10.0.0.0/16"

    def _apply_periodic_drift(self):
        """Simulates configuration drift if more than 2 minutes passed since last check."""
        if datetime.now() - self.last_drift > timedelta(minutes=2):
            # Introduce a random vulnerability
            provider = random.choice(["aws", "azure", "gcp"])
            if provider == "aws":
                self._state["aws"]["storage_buckets"][0]["public"] = True
            elif provider == "azure":
                self._state["azure"]["virtual_machines"][0]["managed_disk_encryption"] = False
            elif provider == "gcp":
                self._state["gcp"]["iam_policies"].append({"member": "user:unknown-actor@attacker.io", "role": "roles/owner"})
            
            self.last_drift = datetime.now()

cloud_env = CloudEnvironment()
