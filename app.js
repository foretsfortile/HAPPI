let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT
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

    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;
    document.getElementById('chat-mobile').innerHTML = "";

    // Séparateurs de continuité (Style Matrix)
    const sepHtml = `<div class="scenario-separator" style="color:#00ff41; border-bottom:1px dashed #1e293b; margin:10px 0; font-size:10px;">>>> NEW_CONTEXT_LOADED: ${id}</div>`;
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sepHtml);
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sepHtml);
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', sepHtml);

    renderStep();
};

// 3. RENDU DES ÉTAPES
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx >= scenario.steps.length - 1);

    // --- LOGS (Curseur Matrix à la FIN de la ligne) ---
    const logBox = document.getElementById('matrix-logs');
    const oldCursor = logBox.querySelector('.cursor');
    if (oldCursor) oldCursor.remove();

    // On place le curseur APPRÈS le texte du log
    const logEntry = `
        <div class="log-line">
            <span class="log-time">${getTechTime()}</span> > ${step.Log_Systeme} <span class="cursor">_</span>
        </div>`;
    logBox.insertAdjacentHTML('afterbegin', logEntry);

    // --- SMART & KPI (Remplissage Haut + Séparateurs) ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');
    const smallStyle = "font-size: 11px; font-family: 'Fira Code', monospace; margin-bottom: 8px; color: #cbd5e1;";

    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.insertAdjacentHTML('afterbegin', `<div class="debrief-final" style="${smallStyle} color:#3b82f6; border:1px solid #3b82f6; padding:5px;">${scenario.Script_Debrief_IA}</div>`);
    } else {
        smartBox.insertAdjacentHTML('afterbegin', `<div class="smart-entry" style="${smallStyle}"><span style="color:#00ff41;">></span> ${step.Explication_SMART}</div>`);
    }
    kpiBox.insertAdjacentHTML('afterbegin', `<div style="${smallStyle} color:#10b981; font-weight:bold;">[IMPACT] ${step.Impact_KPI}</div>`);

    // --- CHAT & EMAIL CARD ---
    const chatBox = document.getElementById('chat-mobile');
    if (isLastStep && scenario.Is_Email_Card) {
        chatBox.insertAdjacentHTML('beforeend', `
            <div class="email-card" style="background:rgba(30,41,59,0.9); border:1px solid #10b981; padding:15px; margin:10px 0; border-radius:8px;">
                <div style="color:#10b981; font-weight:bold; font-size:10px; margin-bottom:5px;">HAPPI : CLÔTURE</div>
                <div style="font-size:12px;">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
                <button style="width:100%; margin-top:10px; background:#10b981; border:none; color:white; padding:8px; cursor:pointer; font-weight:bold;">JE DONNE MON AVIS</button>
            </div>`);
    } else {
        const acteur = step.Acteur;
        const side = (acteur === "Client") ? "Client" : "Happi";
        chatBox.insertAdjacentHTML('beforeend', `
            <div class="message-row ${side}">
                <div class="bubble">
                    <span class="msg-badge ${acteur.toLowerCase()}">${acteur.toUpperCase()}</span>
                    <div style="margin-top:5px;">${step.Message_UI.replace(/\"/g, "")}</div>
                </div>
            </div>`);
    }
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- LOGIQUE BOUTON : CONTINUER (Transition) vs SUIVANT ---
    const btn = document.getElementById('nextBtn');
    if (isLastStep && scenario.Scenario_Suivant) {
        // C'est une fin d'étape avec une transition prévue (ex: 008 vers 009)
        btn.innerText = "CONTINUER";
        btn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            const select = document.getElementById('scenario-select');
            select.value = nextId;
            select.dispatchEvent(new Event('change'));
        };
    } else if (isLastStep) {
        btn.innerText = "FIN";
        btn.onclick = null;
    } else {
        btn.innerText = "SUIVANT";
        btn.onclick = () => {
            currentStepIdx++;
            renderStep();
        };
    }
}

// 4. FOCUS & RESET (Inchangé)
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };
document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus();