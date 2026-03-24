from typing import List, Dict, Callable, Any

class RulesEngine:
    def __init__(self):
        # A map of rule IDs to their checking functions
        self.checkers: Dict[str, Callable[[Dict[str, Any]], bool]] = {
            # AWS
            "AWS-IAM-01": lambda cfg: all(role.get("mfa", False) for role in cfg.get("iam_roles", [])),
            "AWS-S3-01": lambda cfg: not any(b.get("public", False) for b in cfg.get("storage_buckets", [])),
            "AWS-S3-02": lambda cfg: all(b.get("encryption") != "None" for b in cfg.get("storage_buckets", [])),
            "AWS-EC2-01": lambda cfg: all(i.get("encryption", False) for i in cfg.get("compute_instances", [])),
            "AWS-NET-01": lambda cfg: not any(any(r.get("port") == 22 and r.get("source") == "0.0.0.0/0" for r in acl.get("rules", [])) for acl in cfg.get("network_acls", [])),
            
            # Azure
            "AZ-VM-01": lambda cfg: all(vm.get("managed_disk_encryption", False) for vm in cfg.get("virtual_machines", [])),
            "AZ-KV-01": lambda cfg: all(kv.get("purge_protection", False) for kv in cfg.get("key_vaults", [])),
            "AZ-NET-01": lambda cfg: not any(any(r.get("name") == "AllowSSH" and r.get("access") == "Allow" and r.get("source") == "0.0.0.0/0" for r in nsg.get("rules", [])) for nsg in cfg.get("network_security_groups", [])),
            
            # GCP
            "GCP-IAM-01": lambda cfg: not any(p.get("role") == "roles/owner" and "attacker" in p.get("member", "") for p in cfg.get("iam_policies", [])),
            "GCP-GCS-01": lambda cfg: not any(b.get("public", False) for b in cfg.get("cloud_storage", [])),
            "GCP-CE-01": lambda cfg: all(ce.get("shielded_vm", False) for ce in cfg.get("compute_engines", [])),
        }
        
        # Rule metadata
        self.rules_metadata = {
            "aws": [
                {"id": "AWS-IAM-01", "name": "MFA Compliance for All IAM Roles", "severity": "CRITICAL"},
                {"id": "AWS-S3-01", "name": "S3 Public Access Prevention", "severity": "HIGH"},
                {"id": "AWS-S3-02", "name": "S3 Data-at-Rest Encryption", "severity": "HIGH"},
                {"id": "AWS-EC2-01", "name": "EBS Volume Encryption", "severity": "MEDIUM"},
                {"id": "AWS-NET-01", "name": "Restricted SSH Access (Port 22)", "severity": "CRITICAL"}
            ],
            "azure": [
                {"id": "AZ-VM-01", "name": "Managed Disk Encryption for VMs", "severity": "HIGH"},
                {"id": "AZ-KV-01", "name": "Key Vault Purge Protection", "severity": "MEDIUM"},
                {"id": "AZ-NET-01", "name": "NSG SSH Lockdown", "severity": "CRITICAL"}
            ],
            "gcp": [
                {"id": "GCP-IAM-01", "name": "External Owner Detection", "severity": "CRITICAL"},
                {"id": "GCP-GCS-01", "name": "Cloud Storage Public Access", "severity": "HIGH"},
                {"id": "GCP-CE-01", "name": "Shielded VM Verification", "severity": "MEDIUM"}
            ]
        }

    def evaluate(self, provider: str, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates the provided cloud configuration against enterprise rules."""
        findings = []
        score = 100
        
        provider_rules = self.rules_metadata.get(provider.lower(), [])
        
        for rule_meta in provider_rules:
            rule_id = rule_meta["id"]
            checker = self.checkers.get(rule_id)
            
            if not checker:
                continue
                
            is_compliant = checker(configuration)
            
            if not is_compliant:
                penalty = {"CRITICAL": 30, "HIGH": 15, "MEDIUM": 5, "LOW": 2}.get(rule_meta["severity"], 0)
                score -= penalty
                findings.append({
                    "rule_id": rule_id,
                    "name": rule_meta["name"],
                    "status": "FAIL",
                    "severity": rule_meta["severity"]
                })
            else:
                findings.append({
                    "rule_id": rule_id,
                    "name": rule_meta["name"],
                    "status": "PASS",
                    "severity": rule_meta["severity"]
                })
        
        return {
            "overall_score": max(0, score),
            "findings": findings
        }

# Singleton instance
rules_engine = RulesEngine()
