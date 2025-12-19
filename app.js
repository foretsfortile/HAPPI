let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

// Utilitaire pour le temps réel
function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT JSON
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

// 2. CHANGEMENT DE SCÉNARIO
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    // Affichage des titres cachés
    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('interaction-label').style.display = 'block';
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // Séparateur Néon (Ajouté sans vider pour la continuité)
    const sep = `<div class="scenario-separator">>>> NEW SESSION: ${id} - ${getTechTime()}</div>`;
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sep);

    // Seul le chat est remis à zéro pour la nouvelle discussion
    document.getElementById('chat-mobile').innerHTML = "";

    document.getElementById('nextBtn').disabled = false;
    document.getElementById('nextBtn').innerText = "ÉTAPE SUIVANTE";
    renderStep();
};

// 3. MOTEUR D'AFFICHAGE
function renderStep() {
    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];

    // A. LOGS (MATRIX) - Remplissage par le haut (prepend)
    const logArea = document.getElementById('matrix-logs');
    const logLine = document.createElement('div');
    logLine.style.marginBottom = "4px";
    logLine.innerHTML = `<span class="timestamp">${getTechTime()}</span><span style="color:#00ff41">></span> ${step.Log_Systeme || "IDLE"}`;
    logArea.prepend(logLine);

    // B. SMART & KPI - Remplissage par le haut (prepend)
    if (step.Explication_SMART) {
        const d = document.createElement('div');
        d.className = "insight-item";
        d.innerHTML = `<span class="timestamp">${getTechTime()}</span> <small style="color:#3b82f6">INTEL:</small> ${step.Explication_SMART}`;
        document.getElementById('smart-content').prepend(d);
    }
    if (step.Impact_KPI) {
        const d = document.createElement('div');
        d.className = "kpi-item";
        d.innerHTML = `<span style="color:#10b981">⚡ KPI:</span> ${step.Impact_KPI}`;
        document.getElementById('kpi-content').prepend(d);
    }

    // C. CHAT - Défilement vers le bas (append)
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

// 4. BOUTONS & FOCUS
document.getElementById('nextBtn').onclick = () => {
    const steps = allScenarios[currentScenarioId].steps;
    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % 3; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx + 2) % 3; applyFocus(); };

document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus(); function renderStep() {
    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];

    // LOGS SYSTEME
    const logArea = document.getElementById('matrix-logs');
    const logLine = document.createElement('div');
    logLine.innerHTML = `<span class="timestamp">${getTechTime()}</span><span style="color:#00ff41">></span> ${step.Log_Systeme || "IDLE"}`;
    logArea.prepend(logLine);

    // EXPLICATION SMART (Uniquement si le texte existe)
    if (step.Explication_SMART && step.Explication_SMART.trim() !== "") {
        const d = document.createElement('div');
        d.className = "insight-item";
        d.innerHTML = `<span class="timestamp">${getTechTime()}</span> <b style="color:#3b82f6">INTEL:</b> ${step.Explication_SMART}`;
        document.getElementById('smart-content').prepend(d);
    }

    // IMPACT KPI (Uniquement si le texte existe)
    if (step.Impact_KPI && step.Impact_KPI.trim() !== "") {
        const d = document.createElement('div');
        d.className = "kpi-item";
        d.innerHTML = `<span style="color:#10b981">⚡ KPI:</span> ${step.Impact_KPI}`;
        document.getElementById('kpi-content').prepend(d);
    }

    // CHAT (Interaction)
    if (step.Message_UI) {
        const chatBox = document.getElementById('chat-mobile');
        const row = document.createElement('div');
        row.className = `message-row ${step.HAPPI}`;
        // Utilisation des guillemets typographiques pour les messages
        const cleanMsg = step.Message_UI.replace(/"/g, "").replace(/'/g, "’");
        row.innerHTML = `
            <div class="bubble">
                <span class="msg-badge ${(step.HAPPI === 'Client') ? 'badge-client' : 'badge-happi'}">${step.HAPPI}</span>
                <div>« ${cleanMsg} »</div>
            </div>`;
        chatBox.appendChild(row);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('nextBtn').innerText = (currentStepIdx >= steps.length - 1) ? "FIN DU SCÉNARIO" : "ÉTAPE SUIVANTE";
}