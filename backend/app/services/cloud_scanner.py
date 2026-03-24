from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

class CloudScanner:
    """Enterprise-grade cloud environment simulator."""
    
    def scan_environment(self, provider: str) -> Dict[str, Any]:
        """Returns the current state of cloud resources with realistic drift."""
        if provider == "aws":
            return self._scan_aws()
        elif provider == "azure":
            return self._scan_azure()
        elif provider == "gcp":
            return self._scan_gcp()
        return {"error": "Unknown provider"}

    def _scan_aws(self) -> Dict[str, Any]:
        return {
            "provider": "aws",
            "region": "us-east-1",
            "timestamp": datetime.now().isoformat(),
            "iam_roles": [
                {"name": "OrganizationAccountAccessRole", "mfa": True, "last_used": (datetime.now() - timedelta(hours=2)).isoformat()},
                {"name": "CloudGuard-Audit-Role", "mfa": True, "last_used": "never"},
                {"name": "Admin-Jumpstart", "mfa": random.choice([True, False]), "last_used": (datetime.now() - timedelta(minutes=15)).isoformat()}
            ],
            "compute_instances": [
                {"id": "i-09f123456789abcde", "type": "t3.medium", "state": "running", "public_ip": "54.12.87.12", "encryption": True},
                {"id": "i-09f123456789fffff", "type": "m5.large", "state": "running", "public_ip": random.choice([None, "52.4.91.22"]), "encryption": random.choice([True, False])}
            ],
            "storage_buckets": [
                {"name": "cg-prod-backups", "public": False, "versioning": True, "encryption": "AES256"},
                {"name": "cg-web-assets-public", "public": True, "versioning": False, "encryption": "None"},
                {"name": "cg-internal-data", "public": random.choice([False, True]), "versioning": True, "encryption": "AES256"}
            ],
            "network_acls": [
                {"id": "acl-01", "rules": [{"port": 80, "action": "allow", "source": "0.0.0.0/0"}]},
                {"id": "acl-02", "rules": [{"port": 22, "action": "allow", "source": random.choice(["10.0.0.0/16", "0.0.0.0/0"])}]}
            ]
        }

    def _scan_azure(self) -> Dict[str, Any]:
        return {
            "provider": "azure",
            "subscription": "Visual Studio Enterprise",
            "resource_groups": ["prod-rg-01", "security-rg"],
            "virtual_machines": [
                {"name": "prod-vm-sql", "status": "running", "managed_disk_encryption": True},
                {"name": "dev-vm-jump", "status": "running", "managed_disk_encryption": random.choice([True, False])}
            ],
            "key_vaults": [
                {"name": "cg-secrets-kv", "purge_protection": True, "soft_delete": True}
            ],
            "network_security_groups": [
                {"name": "nsg-prod", "rules": [{"name": "AllowSSH", "priority": 100, "access": "Allow", "source": "0.0.0.0/0"}]}
            ]
        }

    def _scan_gcp(self) -> Dict[str, Any]:
        return {
            "provider": "gcp",
            "project_id": "cloudguard-production-42",
            "compute_engines": [
                {"name": "gcp-instance-1", "zone": "us-central1-a", "shielded_vm": True, "external_ip": "104.12.4.5"}
            ],
            "iam_policies": [
                {"member": "user:attacker@gmail.com", "role": random.choice(["roles/viewer", "roles/owner"])}
            ],
            "cloud_storage": [
                {"name": "sensitive-data-bucket", "uniform_access": True, "public": random.choice([False, True])}
            ]
        }

# Singleton
scanner = CloudScanner()
