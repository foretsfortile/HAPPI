// On garde la structure de chargement identique
let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

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

document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    // Nettoyage : on garde l'historique ou on vide selon votre choix
    document.querySelectorAll('.scroll-area, .matrix-area').forEach(el => el.innerHTML = "");
    renderStep();
};

function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const chatBox = document.getElementById('chat-mobile');

    // 1. GESTION DES LABELS (HAPPI, Conseiller, Superviseur)
    let labelHTML = '';
    let labelClass = '';

    // On se base sur le champ "HAPPI" du JSON
    if (step.HAPPI === "HAPPI" || step.HAPPI === "IA") {
        labelHTML = "HAPPI";
        labelClass = "badge-happi";
    } else if (step.HAPPI === "Conseiller") {
        labelHTML = "CONSEILLER";
        labelClass = "badge-human";
    } else if (step.HAPPI === "Superviseur") {
        labelHTML = "SUPERVISEUR";
        labelClass = "badge-expert";
    }

    // 2. AFFICHAGE DU MESSAGE
    if (step.Message_UI && step.Message_UI !== "") {
        const msgRow = document.createElement('div');
        msgRow.className = `message-row ${step.HAPPI}`;

        // On crée la bulle avec le label s'il existe
        const badge = labelHTML ? `<span class="msg-badge ${labelClass}">${labelHTML}</span>` : '';

        msgRow.innerHTML = `
            <div class="bubble">
                ${badge}
                <div class="msg-text">${step.Message_UI.replace(/"/g, "")}</div>
            </div>
        `;
        chatBox.appendChild(msgRow);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // 3. MACHINERIE (LOGS) AVEC CURSEUR CLIGNOTANT
    const logArea = document.getElementById('matrix-logs');
    // On retire l'ancien curseur s'il existe
    const oldCursor = document.querySelector('.cursor');
    if (oldCursor) oldCursor.remove();

    const logLine = document.createElement('div');
    logLine.className = "log-entry";
    logLine.innerHTML = `> ${step.Log_Systeme || "PROCESS_IDLE"} <span class="cursor">_</span>`;
    logArea.appendChild(logLine);
    logArea.scrollTop = logArea.scrollHeight;

    // 4. INTELLIGENCE (SMART & KPI)
    updateIntelligencePanels(step);

    currentStepIdx++;

    // Mise à jour du bouton
    const btn = document.getElementById('nextBtn');
    if (currentStepIdx >= scenario.steps.length) {
        btn.innerText = "FIN DU SCÉNARIO";
    } else {
        btn.innerText = "ÉTAPE SUIVANTE";
    }
}

function updateSidePanels(step) {
    // Logs Matrix (Ajout en bas et scroll)
    const logArea = document.getElementById('matrix-logs');
    const log = document.createElement('div');
    log.innerText = `> [${new Date().toLocaleTimeString()}] ${step.Log_Systeme || "IDLE"}`;
    logArea.appendChild(log);
    logArea.scrollTop = logArea.scrollHeight;

    // SMART & KPI
    if (step.Explication_SMART) {
        const smart = document.createElement('div');
        smart.className = "insight-item";
        smart.innerHTML = `<strong>Analyse :</strong> ${step.Explication_SMART}`;
        document.getElementById('smart-content').appendChild(smart);
    }
    if (step.Impact_KPI) {
        const kpi = document.createElement('div');
        kpi.className = "kpi-item";
        kpi.innerHTML = `📌 ${step.Impact_KPI}`;
        document.getElementById('kpi-content').appendChild(kpi);
    }
}