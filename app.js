let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

console.log("Script HAPPI chargé");

// 1. Chargement des données
fetch('scenarios.json')
    .then(response => response.json())
    .then(data => {
        allScenarios = data;
        console.log("Données chargées :", Object.keys(data).length, "scénarios trouvés");
        const select = document.getElementById('scenario-select');
        Object.keys(data).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerText = `${id} - ${data[id].Nom_Scenario}`;
            select.appendChild(opt);
        });
    })
    .catch(err => console.error("Erreur chargement JSON:", err));

// 2. Sélection d'un scénario
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;

    console.log("Changement de scénario vers :", id);
    currentScenarioId = id;
    currentStepIdx = 0;

    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('smart-content').innerHTML = "";
    document.getElementById('kpi-content').innerHTML = "";
    document.getElementById('matrix-logs').innerHTML = "";

    const btn = document.getElementById('nextBtn');
    btn.disabled = false;
    btn.innerText = "ÉTAPE SUIVANTE";

    renderStep();
};

// 3. Fonction d'affichage
function renderStep() {
    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];
    console.log("Affichage étape :", currentStepIdx + 1, "/", steps.length);

    // Logs Matrix
    const logArea = document.getElementById('matrix-logs');
    const logLine = document.createElement('div');
    logLine.className = "log-entry";
    logLine.innerHTML = `> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span>`;
    logArea.appendChild(logLine);
    logArea.scrollTop = logArea.scrollHeight;

    // Intelligence
    if (step.Explication_SMART) {
        const div = document.createElement('div');
        div.className = "insight-item";
        div.innerHTML = `<strong>Analyse :</strong> ${step.Explication_SMART}`;
        document.getElementById('smart-content').appendChild(div);
    }

    if (step.Impact_KPI) {
        const div = document.createElement('div');
        div.className = "kpi-item";
        div.innerHTML = `📌 ${step.Impact_KPI}`;
        document.getElementById('kpi-content').appendChild(div);
    }

    // Chat
    if (step.Message_UI && step.Message_UI !== "") {
        const chatBox = document.getElementById('chat-mobile');
        let label = step.HAPPI === "IA" || step.HAPPI === "HAPPI" ? "HAPPI" : step.HAPPI;
        let cls = "badge-human";
        if (label === "HAPPI") cls = "badge-happi";
        if (label === "Superviseur") cls = "badge-expert";
        if (label === "Client") cls = "badge-client";

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

    // Mise à jour du bouton
    const btn = document.getElementById('nextBtn');
    if (currentStepIdx >= steps.length - 1) {
        btn.innerText = "FIN DU SCÉNARIO";
    }
}

// 4. LE BOUTON (Correction majeure de l'événement)
const nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', function () {
    console.log("Clic détecté sur Étape Suivante");
    if (!currentScenarioId) return;

    const steps = allScenarios[currentScenarioId].steps;
    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        renderStep();
    } else {
        console.log("Fin du scénario atteinte");
    }
});

document.getElementById('resetBtn').onclick = () => location.reload();