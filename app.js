let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

// 1. CHARGEMENT
fetch('scenarios.json')
    .then(r => r.json())
    .then(data => {
        allScenarios = data;
        const select = document.getElementById('scenario-select');
        Object.keys(data).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerText = `${id} - ${data[id].Nom_Scenario}`;
            select.appendChild(opt);
        });
    });

// 2. SELECTION SCENARIO
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('smart-content').innerHTML = "";
    document.getElementById('kpi-content').innerHTML = "";
    document.getElementById('matrix-logs').innerHTML = "";

    document.getElementById('nextBtn').disabled = false;
    document.getElementById('nextBtn').innerText = "ÉTAPE SUIVANTE";
    renderStep();
};

// 3. AFFICHAGE ETAPE
function renderStep() {
    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];

    // A. LOGS (MATRIX)
    const logArea = document.getElementById('matrix-logs');
    if (logArea.querySelector('.cursor')) logArea.querySelector('.cursor').remove();
    const logLine = document.createElement('div');
    logLine.innerHTML = `> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span>`;
    logArea.appendChild(logLine);
    logArea.scrollTop = logArea.scrollHeight;

    // B. SMART & KPI
    if (step.Explication_SMART) {
        const d = document.createElement('div');
        d.className = "insight-item";
        d.style.marginBottom = "15px";
        d.innerHTML = `<small style="color:#3b82f6">ANALYSE :</small><br>${step.Explication_SMART}`;
        document.getElementById('smart-content').appendChild(d);
        document.getElementById('smart-content').scrollTop = document.getElementById('smart-content').scrollHeight;
    }
    if (step.Impact_KPI) {
        const d = document.createElement('div');
        d.className = "kpi-item";
        d.innerHTML = `<span style="color:#10b981">📌</span> ${step.Impact_KPI}`;
        document.getElementById('kpi-content').appendChild(d);
    }

    // C. CHAT (ESCALIER ET BADGES)
    if (step.Message_UI) {
        const chatBox = document.getElementById('chat-mobile');
        let label = step.HAPPI;
        let cls = "badge-human";

        if (step.HAPPI === "IA" || step.HAPPI === "HAPPI") { label = "HAPPI"; cls = "badge-happi"; }
        else if (step.HAPPI === "Superviseur") { cls = "badge-expert"; }
        else if (step.HAPPI === "Client") { cls = "badge-client"; }

        const row = document.createElement('div');
        row.className = `message-row ${step.HAPPI}`;
        row.innerHTML = `
            <div class="bubble">
                <span class="msg-badge ${cls}">${label}</span>
                <div class="text">${step.Message_UI.replace(/"/g, "")}</div>
            </div>`;
        chatBox.appendChild(row);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('nextBtn').innerText = (currentStepIdx >= steps.length - 1) ? "FIN DU SCÉNARIO" : "ÉTAPE SUIVANTE";
}

// 4. EVENEMENTS (BOUTON ET FOCUS)
document.getElementById('nextBtn').onclick = () => {
    const steps = allScenarios[currentScenarioId].steps;
    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() {
    sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused'));
}
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % 3; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx + 2) % 3; applyFocus(); };

document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus(); // Initialisation