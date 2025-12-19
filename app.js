let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

// 1. Chargement des données
fetch('scenarios.json')
    .then(response => response.json())
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

// 2. Sélection d'un scénario
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;

    currentScenarioId = id;
    currentStepIdx = 0; // On repart à zéro

    // Nettoyage de l'interface pour le nouveau scénario
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('smart-content').innerHTML = "";
    document.getElementById('kpi-content').innerHTML = "";
    document.getElementById('matrix-logs').innerHTML = "";

    document.getElementById('nextBtn').disabled = false;
    document.getElementById('nextBtn').innerText = "ÉTAPE SUIVANTE";

    renderStep();
};

// 3. Fonction d'affichage d'une étape
function renderStep() {
    if (!currentScenarioId || !allScenarios[currentScenarioId]) return;

    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];

    // --- DISTRIBUTION DES DONNÉES ---

    // A. Machinerie (Logs Matrix avec curseur clignotant)
    const logArea = document.getElementById('matrix-logs');
    // On enlève le curseur précédent
    const oldCursor = logArea.querySelector('.cursor');
    if (oldCursor) oldCursor.remove();

    const logLine = document.createElement('div');
    logLine.className = "log-entry";
    logLine.innerHTML = `> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span>`;
    logArea.appendChild(logLine);
    logArea.scrollTop = logArea.scrollHeight;

    // B. Intelligence (SMART & KPI)
    if (step.Explication_SMART) {
        const smartDiv = document.createElement('div');
        smartDiv.className = "insight-item";
        smartDiv.innerHTML = `<strong>Analyse :</strong> ${step.Explication_SMART}`;
        document.getElementById('smart-content').appendChild(smartDiv);
        document.getElementById('smart-content').scrollTop = document.getElementById('smart-content').scrollHeight;
    }

    if (step.Impact_KPI) {
        const kpiDiv = document.createElement('div');
        kpiDiv.className = "kpi-item";
        kpiDiv.innerHTML = `📌 ${step.Impact_KPI}`;
        document.getElementById('kpi-content').appendChild(kpiDiv);
        document.getElementById('kpi-content').scrollTop = document.getElementById('kpi-content').scrollHeight;
    }

    // C. Interaction (Chat avec badges dynamiques)
    if (step.Message_UI && step.Message_UI !== "") {
        const chatBox = document.getElementById('chat-mobile');

        let labelHTML = '';
        let labelClass = '';

        // Mapping des acteurs vers les badges
        if (step.HAPPI === "HAPPI" || step.HAPPI === "IA") {
            labelHTML = "HAPPI";
            labelClass = "badge-happi";
        } else if (step.HAPPI === "Conseiller") {
            labelHTML = "CONSEILLER";
            labelClass = "badge-human";
        } else if (step.HAPPI === "Superviseur") {
            labelHTML = "SUPERVISEUR";
            labelClass = "badge-expert";
        } else if (step.HAPPI === "Client") {
            labelHTML = "CLIENT";
            labelClass = "badge-client";
        }

        const msgRow = document.createElement('div');
        msgRow.className = `message-row ${step.HAPPI}`;

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

    // --- PRÉPARATION ÉTAPE SUIVANTE ---
    const btn = document.getElementById('nextBtn');
    if (currentStepIdx >= steps.length - 1) {
        btn.innerText = "FIN DU SCÉNARIO";
        // On ne désactive pas forcément le bouton pour permettre de voir la fin
    } else {
        btn.innerText = "ÉTAPE SUIVANTE";
    }
}

// 4. Gestion du bouton "ÉTAPE SUIVANTE"
document.getElementById('nextBtn').onclick = () => {
    const steps = allScenarios[currentScenarioId].steps;
    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

// 5. Bouton Reprise (Reset)
document.getElementById('resetBtn').onclick = () => {
    location.reload();
};