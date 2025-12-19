let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

// 1. CHARGEMENT (Inchangé, pure lecture)
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

// 2. CHANGEMENT DE SCENARIO (Correction des labels ici)
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    // CORRECTION : On affiche les labels UNIQUEMENT au lancement
    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // Reset des zones
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('smart-content').innerHTML = "";
    document.getElementById('kpi-content').innerHTML = "";
    document.getElementById('matrix-logs').innerHTML = "";

    renderStep();
};

// 3. RENDU GÉNÉRALISTE (On ajoute sans changer)
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx === scenario.steps.length - 1);

    // --- BLOC INTERACTION ---
    const chatBox = document.getElementById('chat-mobile');

    // EXTENSION : Si c'est la fin et qu'il y a une carte email
    if (isLastStep && scenario.Is_Email_Card) {
        appendEmailCard(chatBox, scenario);
    } else {
        appendChatMessage(chatBox, step);
    }

    // --- BLOC INTELLIGENCE (SMART & KPI) ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    // EXTENSION : Si c'est le débrief final du 009
    if (isLastStep && scenario.Scenario_ID === "009") {
        smartBox.innerHTML = `<div class="debrief-final">${scenario.Script_Debrief_IA}</div>`;
    } else {
        smartBox.innerHTML = step.Explication_SMART || "";
    }
    kpiBox.innerHTML = step.Impact_KPI || "";

    // --- BLOC MACHINERIE (LOGS) ---
    const logBox = document.getElementById('matrix-logs');
    logBox.insertAdjacentHTML('beforeend', `<div class="log-line">> ${step.Log_Systeme}</div>`);
    logBox.scrollTop = logBox.scrollHeight;

    // NAVIGATION
    updateNavigationButtons(isLastStep, scenario);
}

// --- NOUVELLES FONCTIONS (APPEND UNIQUEMENT) ---

function appendChatMessage(container, step) {
    const side = (step.Acteur === "Client") ? "Client" : "Happi";
    container.insertAdjacentHTML('beforeend', `
        <div class="message-row ${side}">
            <div class="bubble">${step.Message_UI}</div>
        </div>`);
    container.scrollTop = container.scrollHeight;
}

function appendEmailCard(container, scenario) {
    const emailHtml = `
        <div class="email-card">
            <div class="email-header">HAPPI : CLÔTURE</div>
            <div class="email-body">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
            <button class="feedback-btn">JE DONNE MON AVIS</button>
        </div>`;
    container.insertAdjacentHTML('beforeend', emailHtml);
}

function updateNavigationButtons(isLast, scenario) {
    const btn = document.getElementById('nextBtn');
    if (isLast && scenario.Scenario_Suivant) {
        btn.innerText = "CONTINUER";
        btn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            document.getElementById('scenario-select').value = nextId;
            document.getElementById('scenario-select').dispatchEvent(new Event('change'));
        };
    } else {
        btn.innerText = isLast ? "FIN" : "SUIVANT";
        btn.onclick = () => { if (currentStepIdx < scenario.steps.length - 1) { currentStepIdx++; renderStep(); } };
    }
}

// FOCUS (Inchangé, repris de votre version d'hier)
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
document.getElementById('focusNext').onclick = () => {
    focusIdx = (focusIdx + 1) % sections.length;
    sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused'));
};