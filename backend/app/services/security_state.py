from typing import Dict
from pydantic import BaseModel

class LiveIndicators(BaseModel):
    change_freq: int = 2
    unauth_attempts: int = 0
    public_resources: int = 0

class SecurityStateManager:
    """Manages the global real-time security state of the simulated environment."""
    
    def __init__(self):
        self.indicators = LiveIndicators()
        self.active_hijack = False

    def get_indicators(self) -> LiveIndicators:
        return self.indicators

    def update_indicators(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self.indicators, key):
                setattr(self.indicators, key, value)
        
        # Sync hijack flag based on unauth attempts
        if self.indicators.unauth_attempts > 5:
            self.active_hijack = True
        else:
            self.active_hijack = False

    def resolve_hijack(self):
        """Called when user 'Intercepts' the attack."""
        self.indicators.unauth_attempts = 0
        self.active_hijack = False

# Singleton
security_state = SecurityStateManager()
