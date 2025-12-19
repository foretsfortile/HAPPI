let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// Chargement du JSON
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

// Changement de scénario
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    // Affichage des labels et mise à jour du titre
    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // Séparateurs de session
    const sep = `<div class="scenario-separator">>>> SESSION ACTIVÉE : ${id} - ${getTechTime()}</div>`;
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sep);

    // Reset du chat
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('nextBtn').disabled = false;
    renderStep();
};

function renderStep() {
    const step = allScenarios[currentScenarioId].steps[currentStepIdx];

    // 1. MACHINERIE (Log système) avec curseur
    const logArea = document.getElementById('matrix-logs');
    const oldCursor = logArea.querySelector('.cursor');
    if (oldCursor) oldCursor.remove();

    const logLine = document.createElement('div');
    logLine.innerHTML = `<span class="timestamp">${getTechTime()}</span><span style="color:#00ff41">></span> ${step.Log_Systeme || "IDLE"} <span class="cursor"></span>`;
    logArea.prepend(logLine);

    // 2. EXPLICATION SMART (Sans préfixe "INTEL")
    if (step.Explication_SMART) {
        const d = document.createElement('div');
        d.className = "insight-item";
        d.innerHTML = `<span class="timestamp">${getTechTime()}</span> ${step.Explication_SMART}`;
        document.getElementById('smart-content').prepend(d);
    }

    // 3. IMPACT KPI
    if (step.Impact_KPI) {
        const d = document.createElement('div');
        d.className = "kpi-item";
        d.innerHTML = `<span style="color:#10b981">⚡ KPI :</span> ${step.Impact_KPI}`;
        document.getElementById('kpi-content').prepend(d);
    }

    // 4. INTERACTION (Chat)
    if (step.Message_UI) {
        const chatBox = document.getElementById('chat-mobile');
        const row = document.createElement('div');
        row.className = `message-row ${step.HAPPI}`;
        const label = (step.HAPPI === "Client") ? "CLIENT" : "HAPPI";
        const cls = (step.HAPPI === "Client") ? "badge-client" : "badge-happi";

        row.innerHTML = `
            <div class="bubble">
                <span class="msg-badge ${cls}">${label}</span>
                <div>${step.Message_UI.replace(/"/g, "")}</div>
            </div>`;
        chatBox.appendChild(row);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Bouton de fin
    document.getElementById('nextBtn').innerText = (currentStepIdx >= allScenarios[currentScenarioId].steps.length - 1) ? "FIN DU SCÉNARIO" : "ÉTAPE SUIVANTE";
}

// Bouton Suivant
document.getElementById('nextBtn').onclick = () => {
    const scenario = allScenarios[currentScenarioId];
    if (currentStepIdx < scenario.steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

// Fonctions annexes (Focus & Reset)
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % 3; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx + 2) % 3; applyFocus(); };
document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus();