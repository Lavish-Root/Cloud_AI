console.log("CloudGuard AI Extension Activated");

const injectSecurityHUD = () => {
    // Create a container for the security assessment
    const container = document.createElement('div');
    container.id = 'cloudguard-ai-hud';
    container.style = `
        position: fixed;
        top: 24px;
        right: 24px;
        width: 340px;
        background: rgba(3, 7, 18, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 28px;
        z-index: 10000;
        font-family: 'Inter', -apple-system, sans-serif;
        color: white;
        padding: 24px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: cg-slide-in 0.5s ease-out;
    `;

    container.innerHTML = `
        <style>
            @keyframes cg-slide-in { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes cg-pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
            #cg-dashboard-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); }
            #cg-dashboard-btn:active { transform: translateY(0); }
        </style>
        <div style="position: absolute; top: 18px; right: 20px; cursor: pointer; color: #475569; font-size: 20px;" id="cg-close-btn">&times;</div>
        
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
            <div style="width: 28px; height: 28px; background: #2563eb; border-radius: 8px; box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);"></div>
            <div style="font-weight: 800; font-size: 16px; letter-spacing: -0.025em; color: white;">CloudGuard AI</div>
            <div id="cg-status-badge" style="margin-left: auto; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 8px; font-size: 10px; padding: 4px 10px; font-weight: 800; text-transform: uppercase;">Active Monitoring</div>
        </div>

        <div style="margin-bottom: 24px; background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Contextual Risk</span>
                <span id="cg-risk-score" style="font-size: 36px; font-weight: 800; color: #10b981; letter-spacing: -0.05em;">--</span>
            </div>
            <div style="height: 6px; width: 100%; background: rgba(255, 255, 255, 0.05); border-radius: 100px;">
                <div id="cg-risk-bar" style="height: 100%; width: 0%; background: #10b981; border-radius: 100px; transition: width 1s ease-out; box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);"></div>
            </div>
        </div>

        <div style="font-size: 12px; font-weight: 500; color: #94a3b8; margin-bottom: 24px; display: grid; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #10b981;">●</span> Identity Access: <span style="color: #f8fafc; font-weight: 700;">Secure</span></div>
            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #10b981;">●</span> Network Egress: <span style="color: #f8fafc; font-weight: 700;">Encrypted</span></div>
            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #10b981;">●</span> Audit Integrity: <span style="color: #10b981; font-weight: 700;">Verified</span></div>
        </div>

        <button id="cg-dashboard-btn" style="width: 100%; background: #2563eb; border: none; padding: 16px; border-radius: 18px; color: white; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
            Admin Console
        </button>

        <button id="cg-simulate-btn" style="width: 100%; background: #e53e3e; border: none; padding: 12px; border-radius: 12px; color: white; font-weight: 700; font-size: 11px; text-transform: uppercase; cursor: pointer; transition: all 0.3s;">
            🚨 Simulate Cloud Attack
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

    const simBtn = document.getElementById('cg-simulate-btn');
    simBtn.onmouseover = () => simBtn.style.background = '#c53030';
    simBtn.onmouseout = () => simBtn.style.background = '#e53e3e';
    simBtn.onclick = () => {
        simBtn.innerText = "Analyzing...";
        chrome.runtime.sendMessage({ action: "simulateAttack" }, (response) => {
            if (response && response.riskScore) {
                updateHUD(response);
            }
            simBtn.innerText = "🚨 Simulate Cloud Attack";
        });
    };

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
        hijackDiv.id = 'cg-hijack-alert';
        if (document.getElementById('cg-hijack-alert')) return;

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
            <span style="font-size: 16px; font-weight: 400;">Unauthorized Action Blocked by Prevention-First Protocol</span>
            <div style="margin-top: 15px; font-size: 14px;">Review in CloudGuard Dashboard Immediately</div>
        `;
        const style = document.createElement('style');
        style.innerHTML = "@keyframes cg-pulse { 0% { opacity: 1; scale: 1; } 50% { opacity: 0.8; scale: 1.05; } 100% { opacity: 1; scale: 1; } }";
        document.head.appendChild(style);
        document.body.appendChild(hijackDiv);
        setTimeout(() => hijackDiv.remove(), 10000);
    };

    // --- PREVENTION FIRST APPROACH ---
    document.addEventListener('click', (e) => {
        const scoreElem = document.getElementById('cg-risk-score');
        if (!scoreElem) return;
        
        const scoreStr = scoreElem.innerText;
        const score = parseInt(scoreStr.split('/')[0]);
        
        // Block destructive actions if score is critical (<= 50)
        if (!isNaN(score) && score <= 50) {
            const btnText = (e.target.innerText || e.target.value || '').toLowerCase();
            const destructivePattern = /\\b(delete|remove|revoke|destroy|disable)\\b/i;
            
            if (destructivePattern.test(btnText)) {
                e.preventDefault();
                e.stopPropagation();
                injectHijackAlert();
                console.warn("CloudGuard AI: Destructive action blocked due to CRITICAL risk score.");
            }
        }
    }, true); // Use capture phase to intercept before React/Angular handlers
};

// Check if we are already injected
if (!document.getElementById('cloudguard-ai-hud')) {
    injectSecurityHUD();
}
