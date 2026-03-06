document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});

// Simulation Logic
function simulateScan(resultId) {
    const resultDiv = document.getElementById(resultId);

    // Show Loading
    resultDiv.innerHTML = '<span style="color: var(--primary-color);">Scanning... ⏳</span>';

    // Simulate delay
    setTimeout(() => {
        // Random Risk Score (1-100)
        const score = Math.floor(Math.random() * 100) + 1;
        let riskLevel = '';
        let color = '';

        if (score < 20) {
            riskLevel = 'Low Risk';
            color = 'var(--secondary-color)';
        } else if (score < 70) {
            riskLevel = 'Medium Risk';
            color = 'orange'; // Fallback or define in CSS
        } else {
            riskLevel = 'High Risk';
            color = 'var(--accent-color)';
        }

        resultDiv.innerHTML = `Risk Score: <span style="color: ${color}; font-size: 1.2rem;">${score}/100</span> (${riskLevel})`;
    }, 2000); // 2 seconds delay
}

function calculateOverallScore() {
    const resultDiv = document.getElementById('overall-result');
    const inputs = [
        document.getElementById('job-link-input').value,
        document.getElementById('jd-input') ? document.getElementById('jd-input').value : '',
        document.getElementById('email-input').value,
        document.getElementById('company-input').value,
        document.getElementById('offer-upload').value
    ];

    // Check if at least one input is filled
    const hasInput = inputs.some(input => input.trim() !== '');

    if (!hasInput) {
        resultDiv.innerHTML = '<span style="color: var(--accent-color);">Please fill in at least one field above to calculate a score.</span>';
        return;
    }

    resultDiv.innerHTML = '<span style="color: var(--primary-color);">Analyzing all data points... ⏳</span>';

    setTimeout(() => {
        // Random Overall Score (biased towards safety for demo)
        const score = Math.floor(Math.random() * 30) + 70; // 70-100 score (Safe)

        let riskLevel = 'Safe';
        let color = 'var(--secondary-color)';

        // Occasional risk for demo
        if (Math.random() > 0.7) {
            const badScore = Math.floor(Math.random() * 50);
            riskLevel = 'High Risk';
            color = 'var(--accent-color)';
            resultDiv.innerHTML = `Comprehensive Trust Score: <span style="color: ${color}; font-size: 2rem;">${badScore}/100</span><br><span style="color: ${color};">${riskLevel} Detected! Proceed with Caution.</span>`;
        } else {
            resultDiv.innerHTML = `Comprehensive Trust Score: <span style="color: ${color}; font-size: 2rem;">${score}/100</span><br><span style="color: ${color};">Looks Safe! Verification Passed.</span>`;
        }
    }, 2500);
}
