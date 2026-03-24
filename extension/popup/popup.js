chrome.runtime.sendMessage({ action: "getSecurityData" }, (response) => {
    if (response && response.riskScore) {
        document.getElementById('score').innerText = response.riskScore + "/100";
        document.getElementById('provider').innerText = "Active Session: " + response.provider.toUpperCase();
        
        const scoreElem = document.getElementById('score');
        if (response.riskScore > 80) scoreElem.style.color = "#10b981";
        else if (response.riskScore > 50) scoreElem.style.color = "#f59e0b";
        else scoreElem.style.color = "#ef4444";
    } else {
        document.getElementById('score').innerText = "N/A";
        document.getElementById('provider').innerText = "No Cloud Session Detected";
        document.getElementById('provider').style.color = "#ef4444";
    }
});

document.getElementById('open-dashboard').onclick = () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
};
