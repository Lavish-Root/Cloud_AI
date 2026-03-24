from typing import List, Dict
import random

class CloudScanner:
    """Simulates scanning cloud environments for resource configurations."""
    
    def scan_environment(self, provider: str) -> Dict:
        """Returns the current state of cloud resources."""
        if provider == "aws":
            return self._scan_aws()
        elif provider == "azure":
            return self._scan_azure()
        elif provider == "gcp":
            return self._scan_gcp()
        return {}

    def _scan_aws(self) -> Dict:
        # Use randomness to simulate real-time configuration drift/changes
        return {
            "iam_roles": [
                {"name": "AdminRole", "permissions": "FullAccess", "mfa": random.choice([True, True, False])},
                {"name": "ReadOnly", "permissions": "ReadOnlyAccess", "mfa": True}
            ],
            "storage_buckets": [
                {"name": "prod-data", "public": random.choice([False, False, True]), "encrypted": True},
                {"name": "public-assets", "public": True, "encrypted": False}
            ],
            "firewall_rules": [
                {"id": "sg-123", "port": 80, "action": "allow", "source": "0.0.0.0/0"},
                {"id": "sg-456", "port": 22, "action": "allow", "source": random.choice(["10.0.0.0/24", "0.0.0.0/0"])}
            ],
            "databases": [
                {"id": "db-prod", "public": False, "encrypted": True}
            ]
        }

    def _scan_azure(self) -> Dict:
        # Simplified Azure scan
        return {"resources": "azure-mock-data"}

    def _scan_gcp(self) -> Dict:
        # Simplified GCP scan
        return {"resources": "gcp-mock-data"}

# Singleton
scanner = CloudScanner()
