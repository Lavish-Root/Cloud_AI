from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

from app.services.cloud_environment import cloud_env

class CloudScanner:
    """Enterprise-grade cloud environment simulator powered by a stateful backend."""
    
    def scan_environment(self, provider: str) -> Dict[str, Any]:
        """Returns the current persistent state of cloud resources from the Environment Singleton."""
        state = cloud_env.get_state(provider)
        
        # Merge with non-stateful fields like timestamp
        return {
            "provider": provider,
            "timestamp": datetime.now().isoformat(),
            **state
        }

# Singleton
scanner = CloudScanner()
