let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;
let isIAMode = false; // État initial

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT & FILTRAGE
function populateSelect() {
    const select = document.getElementById('scenario-select');
    select.innerHTML = '<option value="">-- Choisir un Scénario --</option>';

    if (!allScenarios) return;

    Object.keys(allScenarios).forEach(id => {
        const scenario = allScenarios[id];
        // Filtrage sémantique
        const matches = isIAMode ? (scenario.IA === true) : (!scenario.IA);

        if (matches) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerText = `${id} - ${scenario.Nom_Scenario}`;
            select.appendChild(opt);
        }
    });
}

fetch('scenarios.json').then(r => r.json()).then(data => {
    allScenarios = data;
    populateSelect();
});

// GESTION DU BOUTON IA
const btnIA = document.getElementById('toggleIA');
btnIA.onclick = () => {
    isIAMode = !isIAMode;
    btnIA.innerText = isIAMode ? "IA ON" : "IA OFF";
    btnIA.classList.toggle('ia-on');
    populateSelect(); // Rafraîchit la liste
};

// 2. CHANGEMENT DE SCENARIO
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.getElementById('chat-mobile').innerHTML = "";

    // Séparateurs de session
    const sepHtml = `<div style="color:#3b82f6; border-bottom:1px dashed #1e293b; margin:10px 0; font-size:10px;">>>> NEW_SESSION: ${id}</div>`;
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sepHtml);
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sepHtml);

    renderStep();
};

// 3. RENDU DES ÉTAPES
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx += 1 >= scenario.steps.length);

    // LOGS + CURSEUR MATRIX
    const logBox = document.getElementById('matrix-logs');
    const oldCursor = logBox.querySelector('.cursor');
    if (oldCursor) oldCursor.remove();
    logBox.insertAdjacentHTML('afterbegin', `
        <div class="log-line">${getTechTime()} > ${step.Log_Systeme} <span class="cursor">_</span></div>
    `);

    // INTEL (SMART & KPI)
    const smallStyle = "font-size: 11px; font-family: 'Fira Code', monospace; margin-bottom: 8px;";
    const smartBox = document.getElementById('smart-content');

    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.insertAdjacentHTML('afterbegin', `<div style="${smallStyle} color:#3b82f6; border:1px solid #3b82f6; padding:5px;">${scenario.Script_Debrief_IA}</div>`);
    } else {
        smartBox.insertAdjacentHTML('afterbegin', `<div style="${smallStyle}"><span style="color:#00ff41;">></span> ${step.Explication_SMART}</div>`);
    }
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', `<div style="${smallStyle} color:#10b981;">[KPI] ${step.Impact_KPI}</div>`);

    // CHAT & EMAIL CARD
    const chatBox = document.getElementById('chat-mobile');
    if (isLastStep && scenario.Is_Email_Card) {
        chatBox.innerHTML = ""; // Exclusivité du mail
        chatBox.insertAdjacentHTML('beforeend', `
            <div class="email-card" style="background:#1e293b; border:1px solid #10b981; padding:15px; border-radius:8px;">
                <div style="color:#10b981; font-weight:bold; font-size:10px;">HAPPI : CLÔTURE</div>
                <div style="font-size:12px; margin-top:5px;">${scenario.Is_Email_Card.replace(/\n/g, '<br>')}</div>
                <button style="width:100%; margin-top:10px; background:#10b981; border:none; color:white; padding:8px; cursor:pointer;">AVIS</button>
            </div>`);
    } else {
        const acteur = step.Acteur;
        const side = (acteur === "Client") ? "Client" : "Happi";
        chatBox.insertAdjacentHTML('beforeend', `
            <div class="message-row ${side}"><div class="bubble"><span class="msg-badge ${acteur.toLowerCase()}">${acteur.toUpperCase()}</span>${step.Message_UI}</div></div>
        `);
    }
    chatBox.scrollTop = chatBox.scrollHeight;

    // BOUTON NAVIGATION
    const btn = document.getElementById('nextBtn');
    if (isLastStep && scenario.Scenario_Suivant) {
        btn.innerText = "CONTINUER";
        btn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            document.getElementById('scenario-select').value = nextId;
            document.getElementById('scenario-select').dispatchEvent(new Event('change'));
        };
    } else {
        btn.innerText = isLastStep ? "FIN" : "SUIVANT";
        btn.onclick = isLastStep ? null : () => { currentStepIdx++; renderStep(); };
    }
}

// 4. FOCUS & RESET
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };
document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus();