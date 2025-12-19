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

    // CONTINUITÉ : On ne vide QUE le chat. 
    // On laisse les logs et intel pour l'effet "historique système".
    document.getElementById('chat-mobile').innerHTML = "";

    // On ajoute juste un marqueur visuel dans les logs sans effacer
    const sep = `<div class="scenario-separator" style="color:#3b82f6; border-bottom:1px dashed #3b82f6; margin:10px 0;">>>> NOUVEAU CONTEXTE : ${id}</div>`;
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sep);

    renderStep();
};

// 3. RENDU DES ÉTAPES
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx >= scenario.steps.length - 1);

    // --- LOGS (Restauration Matrix + Remplissage par le HAUT) ---
    const logBox = document.getElementById('matrix-logs');
    // 'afterbegin' assure que le nouveau log est en haut, activant le curseur Matrix du CSS
    logBox.insertAdjacentHTML('afterbegin', `<div class="log-line"><span class="log-time">${getTechTime()}</span> > ${step.Log_Systeme}</div>`);

    // --- SMART & KPI (Restauration Taille & Remplissage Haut) ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    // Style inline pour garantir la petite taille demandée (si non géré par CSS)
    const smallTextStyle = "font-size: 0.85rem; line-height: 1.2; margin-bottom: 8px; color: #cbd5e1;";

    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.insertAdjacentHTML('afterbegin', `<div class="debrief-final" style="${smallTextStyle} color:#3b82f6; font-style:italic; border:1px solid #3b82f6; padding:5px;">${scenario.Script_Debrief_IA}</div>`);
    } else {
        smartBox.insertAdjacentHTML('afterbegin', `<div class="smart-entry" style="${smallTextStyle}">${step.Explication_SMART}</div>`);
    }

    // KPI : On remplace la valeur pour plus de lisibilité, mais en petit
    kpiBox.innerHTML = `<div style="font-size: 0.9rem; font-weight: bold; color: #10b981;">${step.Impact_KPI}</div>`;

    // --- CHAT & EMAIL CARD ---
    const chatBox = document.getElementById('chat-mobile');

    if (isLastStep && scenario.Is_Email_Card) {
        chatBox.insertAdjacentHTML('beforeend', `
            <div class="email-card" style="background:rgba(30,41,59,0.8); border:1px solid #10b981; padding:15px; margin:10px 0; border-radius:8px;">
                <div style="color:#10b981; font-weight:bold; font-size:10px; margin-bottom:5px;">HAPPI : CLÔTURE</div>
                <div style="font-size:12px;">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
                <button style="width:100%; margin-top:10px; background:#10b981; border:none; color:white; padding:5px; cursor:pointer;">AVIS</button>
            </div>`);
    } else {
        const acteur = step.Acteur;
        const side = (acteur === "Client") ? "Client" : "Happi";
        chatBox.insertAdjacentHTML('beforeend', `
            <div class="message-row ${side}">
                <div class="bubble">
                    <span class="msg-badge ${acteur.toLowerCase()}">${acteur.toUpperCase()}</span>
                    <div>${step.Message_UI.replace(/\"/g, "")}</div>
                </div>
            </div>`);
    }
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- NAVIGATION ---
    const btn = document.getElementById('nextBtn');
    if (isLastStep && scenario.Scenario_Suivant) {
        btn.innerText = "CONTINUER"; // Signal pour le présentateur
        btn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            document.getElementById('scenario-select').value = nextId;
            document.getElementById('scenario-select').dispatchEvent(new Event('change'));
        };
    } else {
        btn.innerText = isLastStep ? "FIN" : "SUIVANT";
        btn.onclick = () => {
            if (currentStepIdx < scenario.steps.length - 1) {
                currentStepIdx++;
                renderStep();
            }
        };
    }
}

// 4. NAVIGATION FOCUS (Inchangée)
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };
document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus();