from typing import List, Dict, Callable

class RulesEngine:
    def __init__(self):
        # A map of rule IDs to their checking functions
        self.checkers: Dict[str, Callable[[Dict], bool]] = {
            "CIS-1.1": self._check_mfa_root,
            "CIS-2.1": self._check_s3_public,
            "CIS-4.1": self._check_exposed_ssh,
            "AZ-1.0": self._check_generic_compliance,
            "GCP-1.0": self._check_generic_compliance,
        }
        
        # Rule metadata
        self.rules_metadata = {
            "aws": [
                {"id": "CIS-1.1", "name": "MFA for Root Account", "severity": "CRITICAL"},
                {"id": "CIS-2.1", "name": "S3 Public Access Blocked", "severity": "HIGH"},
                {"id": "CIS-4.1", "name": "SSH Port Exposed", "severity": "MEDIUM"}
            ],
            "azure": [
                {"id": "AZ-1.0", "name": "MFA Enabled for All Users", "severity": "CRITICAL"},
            ],
            "gcp": [
                {"id": "GCP-1.0", "name": "Cloud Storage Public Access", "severity": "HIGH"},
            ]
        }

    def _check_mfa_root(self, config: Dict) -> bool: return config.get("mfa_root", False)
    def _check_s3_public(self, config: Dict) -> bool: return not config.get("s3_public", True)
    def _check_exposed_ssh(self, config: Dict) -> bool: return not config.get("ssh_port_open", False)
    def _check_generic_compliance(self, config: Dict) -> bool: return config.get("compliant", True)

    def evaluate(self, provider: str, configuration: Dict) -> Dict:
        """Evaluates the provided cloud configuration against CIS rules."""
        findings = []
        score = 100
        
        provider_rules = self.rules_metadata.get(provider.lower(), [])
        
        for rule_meta in provider_rules:
            rule_id = rule_meta["id"]
            checker = self.checkers.get(rule_id, self._check_generic_compliance)
            
            is_compliant = checker(configuration)
            
            if not is_compliant:
                penalty = 0
                severity = rule_meta["severity"]
                if severity == "CRITICAL": penalty = 30
                elif severity == "HIGH": penalty = 15
                elif severity == "MEDIUM": penalty = 5
                
                score -= penalty
                findings.append({
                    "rule_id": rule_id,
                    "name": rule_meta["name"],
                    "status": "FAIL",
                    "severity": severity
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
