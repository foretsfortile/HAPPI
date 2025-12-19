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
    })
    .catch(err => console.error("Erreur JSON:", err));

// 2. Sélection d'un scénario
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

// 3. Fonction d'affichage principale
function renderStep() {
    if (!currentScenarioId) return;
    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];

    // --- A. MACHINERIE (LOGS) ---
    const logArea = document.getElementById('matrix-logs');
    const oldCursor = logArea.querySelector('.cursor');
    if (oldCursor) oldCursor.remove();

    const logLine = document.createElement('div');
    logLine.className = "log-entry";
    logLine.innerHTML = `> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span>`;
    logArea.appendChild(logLine);
    logArea.scrollTop = logArea.scrollHeight;

    // --- B. INTELLIGENCE (SMART & KPI) ---
    // On remplace la fonction manquante par ce bloc direct
    if (step.Explication_SMART) {
        const div = document.createElement('div');
        div.className = "insight-item";
        div.style.marginBottom = "10px";
        div.innerHTML = `<strong>Analyse :</strong> ${step.Explication_SMART}`;
        document.getElementById('smart-content').appendChild(div);
    }

    if (step.Impact_KPI) {
        const div = document.createElement('div');
        div.className = "kpi-item";
        div.style.marginBottom = "10px";
        div.innerHTML = `📌 ${step.Impact_KPI}`;
        document.getElementById('kpi-content').appendChild(div);
    }

    // --- C. INTERACTION (CHAT) ---
    if (step.Message_UI && step.Message_UI !== "") {
        const chatBox = document.getElementById('chat-mobile');

        // Mapping des badges
        let label = step.HAPPI;
        let cls = "badge-human";

        if (step.HAPPI === "IA" || step.HAPPI === "HAPPI") {
            label = "HAPPI";
            cls = "badge-happi";
        } else if (step.HAPPI === "Superviseur") {
            cls = "badge-expert";
        } else if (step.HAPPI === "Client") {
            cls = "badge-client";
        }

        const msgRow = document.createElement('div');
        msgRow.className = `message-row ${step.HAPPI}`;
        msgRow.innerHTML = `
            <div class="bubble">
                <span class="msg-badge ${cls}">${label}</span>
                <div class="msg-text">${step.Message_UI.replace(/"/g, "")}</div>
            </div>`;
        chatBox.appendChild(msgRow);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Mise à jour du texte du bouton
    const btn = document.getElementById('nextBtn');
    if (currentStepIdx >= steps.length - 1) {
        btn.innerText = "FIN DU SCÉNARIO";
    } else {
        btn.innerText = "ÉTAPE SUIVANTE";
    }
}

// 4. GESTION DU CLIC
document.getElementById('nextBtn').addEventListener('click', function () {
    if (!currentScenarioId) return;
    const steps = allScenarios[currentScenarioId].steps;

    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
});

// 5. REPRISE
document.getElementById('resetBtn').onclick = () => location.reload();