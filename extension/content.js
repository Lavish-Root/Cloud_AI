console.log("CloudGuard AI Extension Activated");

const injectSecurityHUD = () => {
    // Create a container for the security assessment
    const container = document.createElement('div');
    container.id = 'cloudguard-ai-hud';
    container.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: rgba(26, 32, 44, 0.95);
        border: 2px solid #3182ce;
        border-top-width: 6px;
        border-radius: 12px;
        z-index: 999999;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: white;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        transition: transform 0.3s ease;
    `;

    container.innerHTML = `
        <div style="position: absolute; top: 10px; right: 12px; cursor: pointer; color: #a0aec0; font-size: 18px; font-weight: bold; line-height: 1;" id="cg-close-btn">
            &times;
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; margin-top: 5px;">
            <div style="font-weight: 700; font-size: 16px; color: #63b3ed;">CloudGuard AI</div>
            <div id="cg-status-badge" style="background: #48bb78; color: white; border-radius: 6px; font-size: 12px; padding: 2px 8px; font-weight: bold;">Monitoring</div>
        </div>
        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 14px; color: #a0aec0;">Risk Score</span>
                <span id="cg-risk-score" style="font-size: 32px; font-weight: 800; color: #48bb78;">98/100</span>
            </div>
            <div style="height: 6px; width: 100%; background: #2d3748; border-radius: 3px; margin-top: 5px;">
                <div id="cg-risk-bar" style="height: 100%; width: 98%; background: linear-gradient(90deg, #48bb78, #38a169); border-radius: 3px;"></div>
            </div>
        </div>
        <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <span style="color: #48bb78; margin-right: 8px;">✓</span>
                <span>IAM Policy Compliant</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <span style="color: #48bb78; margin-right: 8px;">✓</span>
                <span>Storage Encryption Verified</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="color: #48bb78; margin-right: 8px;">✓</span>
                <span>Network Baseline Secure</span>
            </div>
        </div>
        <button id="cg-dashboard-btn" style="width: 100%; background: #3182ce; border: none; padding: 10px; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            Open Security Dashboard
        </button>
    `;

    document.body.appendChild(container);

    // Event handlers
    const closeBtn = document.getElementById('cg-close-btn');
    closeBtn.onclick = () => container.remove();
    closeBtn.onmouseover = () => closeBtn.style.color = 'white';
    closeBtn.onmouseout = () => closeBtn.style.color = '#a0aec0';

    const btn = document.getElementById('cg-dashboard-btn');
    btn.onmouseover = () => btn.style.background = '#2b6cb0';
    btn.onmouseout = () => btn.style.background = '#3182ce';
    btn.onclick = () => window.open('http://localhost:5173', '_blank'); // Assuming dashboard runs on 5173

    // Ask extension for data
    chrome.runtime.sendMessage({ action: "getSecurityData" }, (response) => {
        if (response && response.riskScore) {
            updateHUD(response);
        }
    });

    const updateHUD = (data) => {
        const scoreElem = document.getElementById('cg-risk-score');
        const barElem = document.getElementById('cg-risk-bar');
        const badgeElem = document.getElementById('cg-status-badge');

        scoreElem.innerText = `${data.riskScore}/100`;
        barElem.style.width = `${data.riskScore}%`;

        if (data.ruleFindings && data.ruleFindings.some(f => f.rule_id === 'GCP_OWNER_REMOVAL_DETECTED')) {
            injectHijackAlert();
        }

        if (data.riskScore > 80) {
            scoreElem.style.color = '#48bb78';
            barElem.style.background = 'linear-gradient(90deg, #48bb78, #38a169)';
            badgeElem.style.background = '#48bb78';
            badgeElem.innerText = 'Safe';
        } else if (data.riskScore > 50) {
            scoreElem.style.color = '#ecc94b';
            barElem.style.background = 'linear-gradient(90deg, #ecc94b, #d69e2e)';
            badgeElem.style.background = '#ecc94b';
            badgeElem.innerText = 'Caution';
        } else {
            scoreElem.style.color = '#f56565';
            barElem.style.background = 'linear-gradient(90deg, #f56565, #e53e3e)';
            badgeElem.style.background = '#f56565';
            badgeElem.innerText = 'Critical';
        }
    };

    const injectHijackAlert = () => {
        const hijackDiv = document.createElement('div');
        hijackDiv.style = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            background: #e53e3e;
            color: white;
            padding: 20px;
            border-radius: 20px;
            z-index: 1000000;
            text-align: center;
            font-weight: 800;
            font-size: 24px;
            box-shadow: 0 0 50px rgba(229, 62, 62, 0.5);
            animation: cg-pulse 1s infinite;
        `;
        hijackDiv.innerHTML = `
            ⚠️ CRITICAL HIJACK ATTEMPT DETECTED! ⚠️<br>
            <span style="font-size: 16px; font-weight: 400;">Unauthorized Ownership Removal Detected in GCP IAM Console</span>
            <div style="margin-top: 15px; font-size: 14px;">Review in CloudGuard Dashboard Immediately</div>
        `;
        const style = document.createElement('style');
        style.innerHTML = "@keyframes cg-pulse { 0% { opacity: 1; scale: 1; } 50% { opacity: 0.8; scale: 1.05; } 100% { opacity: 1; scale: 1; } }";
        document.head.appendChild(style);
        document.body.appendChild(hijackDiv);
        setTimeout(() => hijackDiv.remove(), 10000);
    };
};

// Check if we are already injected
if (!document.getElementById('cloudguard-ai-hud')) {
    injectSecurityHUD();
}
