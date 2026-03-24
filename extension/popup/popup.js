chrome.runtime.sendMessage({ action: "getSecurityData" }, (response) => {
    const scoreElem = document.getElementById('score');
    const providerElem = document.getElementById('provider');
    const indicator = document.getElementById('status-indicator');

    if (response && response.riskScore !== undefined) {
        scoreElem.innerText = response.riskScore;
        providerElem.innerText = response.provider.toUpperCase() + " ACTIVE";
        indicator.classList.add('active');
        
        // Dynamic coloring based on score
        if (response.riskScore > 80) scoreElem.style.color = "#10b981";
        else if (response.riskScore > 50) scoreElem.style.color = "#f59e0b";
        else scoreElem.style.color = "#ef4444";
    } else {
        scoreElem.innerText = "--";
        providerElem.innerText = "NO SESSION DETECTED";
        providerElem.style.color = "#ef4444";
        indicator.classList.remove('active');
    }
});

document.getElementById('open-dashboard').onclick = () => {
    // In dev, Vite usually runs on 5173
    chrome.tabs.create({ url: 'http://localhost:5173' });
};
