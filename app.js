let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

// 1. CHARGEMENT INITIAL
fetch('scenarios.json').then(r => r.json()).then(data => {
    allScenarios = data;
    const select = document.getElementById('scenario-select');
    Object.keys(data).forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.innerText = `${id} - ${data[id].Nom_Scenario}`;
        select.appendChild(opt);
    });
});

// 2. CHANGEMENT DE SCENARIO
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    // Reset des zones
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('smart-content').innerHTML = "";
    document.getElementById('kpi-content').innerHTML = "";
    document.getElementById('matrix-logs').innerHTML = "";

    renderStep();
};

// 3. RENDU D'UNE ÉTAPE
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx === scenario.steps.length - 1);

    // --- Colonne 1 : Interaction ---
    const chatBox = document.getElementById('chat-mobile');
    if (isLastStep && scenario.Is_Email_Card) {
        let emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI : CLÔTURE</div>
                <div class="email-body">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
                <button class="feedback-btn">JE DONNE MON AVIS</button>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', emailHtml);
    } else {
        const side = (step.Acteur === "Client") ? "Client" : "Happi";
        chatBox.insertAdjacentHTML('beforeend', `<div class="message-row ${side}"><div class="bubble">${step.Message_UI}</div></div>`);
    }
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- Colonne 2 : Intelligence ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    if (isLastStep && scenario.Scenario_ID === "009") {
        smartBox.innerHTML = `<div class="debrief-final">${scenario.Script_Debrief_IA}</div>`;
        kpiBox.innerHTML = `<span class="kpi-value">${step.Impact_KPI}</span>`;
    } else {
        smartBox.innerHTML = step.Explication_SMART;
        kpiBox.innerHTML = step.Impact_KPI;
    }

    // --- Colonne 3 : Machinerie ---
    const logBox = document.getElementById('matrix-logs');
    logBox.insertAdjacentHTML('beforeend', `<div class="log-line">> ${step.Log_Systeme}</div>`);
    logBox.scrollTop = logBox.scrollHeight;

    // Gestion du bouton
    const btn = document.getElementById('nextBtn');
    if (isLastStep && scenario.Scenario_Suivant) {
        btn.innerText = "CONTINUER";
        btn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            loadScenarioDirectly(nextId);
        };
    } else {
        btn.innerText = isLastStep ? "FIN" : "SUIVANT";
        btn.onclick = () => { if (currentStepIdx < scenario.steps.length - 1) { currentStepIdx++; renderStep(); } };
    }
}

function loadScenarioDirectly(id) {
    document.getElementById('scenario-select').value = id;
    document.getElementById('scenario-select').dispatchEvent(new Event('change'));
}

document.getElementById('resetBtn').onclick = () => location.reload();