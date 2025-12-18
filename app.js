let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;
let focusElements = ["box-mobile", "box-agent", "box-smart", "box-kpi", "matrix-logs"];
let focusIdx = -1;

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
    currentStepIdx = 0;

    // Nettoyage complet pour un nouveau scénario
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.querySelectorAll('.scroll-area, .matrix-area').forEach(el => el.innerHTML = "");

    document.getElementById('nextBtn').disabled = false;
    renderStep();
};

// 3. Affichage d'une étape
function renderStep() {
    const step = allScenarios[currentScenarioId].steps[currentStepIdx];

    // Distribution vers la Machinerie (Logs Matrix)
    const logLine = document.createElement('div');
    logLine.className = "log-entry";
    logLine.innerText = `> ${step.Log_Systeme || "SYSTEM_IDLE"}`;
    document.getElementById('matrix-logs').prepend(logLine);

    // Distribution vers l'Intelligence (SMART & KPI)
    if (step.Explication_SMART) {
        const smartDiv = document.createElement('div');
        smartDiv.className = "insight-item";
        smartDiv.innerText = step.Explication_SMART;
        document.getElementById('smart-content').prepend(smartDiv);
    }

    if (step.Impact_KPI) {
        const kpiDiv = document.createElement('div');
        kpiDiv.className = "kpi-item";
        kpiDiv.innerText = step.Impact_KPI;
        document.getElementById('kpi-content').prepend(kpiDiv);
    }

    // Distribution vers l'Action (Mobile vs Conseiller)
    const targetId = (step.Type_Vue === "Mobile") ? 'chat-mobile' : 'chat-agent';
    const bubble = document.createElement('div');
    bubble.className = `bubble ${step.Acteur}`;
    bubble.innerText = step.Message_UI.replace(/"/g, ""); // Nettoyage des guillemets
    document.getElementById(targetId).prepend(bubble);

    // Mise à jour du bouton
    const btn = document.getElementById('nextBtn');
    if (currentStepIdx === allScenarios[currentScenarioId].steps.length - 1) {
        btn.innerText = "FIN DU SCÉNARIO";
        btn.classList.add('finished');
    } else {
        btn.innerText = "ÉTAPE SUIVANTE";
        btn.classList.remove('finished');
    }
}

// 4. Interaction boutons
document.getElementById('nextBtn').onclick = () => {
    if (currentStepIdx < allScenarios[currentScenarioId].steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

document.getElementById('resetBtn').onclick = () => location.reload();

// 5. Logique du Focus
document.getElementById('focusNext').onclick = () => {
    focusIdx = (focusIdx + 1) % focusElements.length;
    applyFocus();
};

document.getElementById('focusPrev').onclick = () => {
    focusIdx = (focusIdx - 1 + focusElements.length) % focusElements.length;
    applyFocus();
};

function applyFocus() {
    focusElements.forEach(id => document.getElementById(id).classList.remove('highlight'));
    if (focusIdx >= 0) {
        document.getElementById(focusElements[focusIdx]).classList.add('highlight');
    }
}