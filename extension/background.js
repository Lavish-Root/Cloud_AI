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
        
        // When message is from popup, sender.tab is undefined. We must query the active tab.
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) {
                sendResponse({ status: 'error', message: 'No active tab found.' });
                return;
            }

            const activeTab = tabs[0];
            const url = activeTab.url.toLowerCase();

            fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }) // Backend now manages indicators internally
            })
            .then(response => response.json())
            .then(data => sendResponse(data))
            .catch(err => {
                console.error('Error contacting backend:', err);
                sendResponse({ status: 'error', message: 'Could not reach backend security engine.' });
            });
        });
        return true;
    }
    
    if (request.action === 'simulateAttack') {
        const backendUrl = "http://localhost:8000/api/security/check";
        fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                url: "https://console.cloud.google.com/iam-admin",
                indicators: {
                    change_freq: 50,
                    unauth_attempts: 15,
                    public_resources: 5,
                    sensitive_calls: 25
                }
            })
        })
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ status: 'error', message: 'Backend unreachable.' }));
        return true;
    }
});
