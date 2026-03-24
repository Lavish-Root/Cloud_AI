chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('aws.amazon.com') ||
            tab.url.includes('portal.azure.com') ||
            tab.url.includes('console.cloud.google.com')) {
            console.log('Detected Cloud Platform access:', tab.url);
            // Notify the user or update extension badge
            chrome.action.setBadgeText({ text: 'ON', tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSecurityData') {
        const backendUrl = "http://localhost:8000/api/security/check";
        const url = sender.tab.url.toLowerCase();
        
        // Context-aware indicators for simulated threat detection
        const indicators = {
            change_freq: url.includes('iam') ? 8 : Math.floor(Math.random() * 3),
            unauth_attempts: url.includes('iam') ? 6 : Math.floor(Math.random() * 2),
            public_resources: url.includes('s3') || url.includes('storage') ? 1 : 0
        };

        fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, indicators })
        })
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(err => {
            console.error('Error contacting backend:', err);
            sendResponse({ status: 'error', message: 'Could not reach backend security engine.' });
        });
        return true; // async handle
    }
});
