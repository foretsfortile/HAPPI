let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT (Inchangé)
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

// 2. CHANGEMENT DE SCENARIO (Correction : On ne vide plus tout)
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // On ajoute un séparateur pour marquer la nouvelle session sans effacer l'historique Matrix
    const sep = `<div class="scenario-separator" style="color: #3b82f6; border-bottom: 1px dashed #3b82f6; margin: 15px 0; font-size: 10px;">>>> NOUVELLE SESSION : ${id}</div>`;
    document.getElementById('matrix-logs').insertAdjacentHTML('beforeend', sep);
    document.getElementById('smart-content').insertAdjacentHTML('beforeend', sep);

    renderStep();
};

// 3. RENDU (Restauration du remplissage par accumulation)
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx >= scenario.steps.length - 1);

    // --- LOGS (Restauration Matrix : insertAdjacentHTML au lieu de innerHTML) ---
    const logBox = document.getElementById('matrix-logs');
    logBox.insertAdjacentHTML('beforeend', `<div class="log-line"><span class="log-time">${getTechTime()}</span> > ${step.Log_Systeme}</div>`);
    logBox.scrollTop = logBox.scrollHeight;

    // --- SMART & KPI (Restauration Continuité) ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    // Si c'est le débrief final du 009, on l'ajoute à la fin
    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.insertAdjacentHTML('beforeend', `<div class="debrief-final" style="margin-top:20px; border: 1px double #3b82f6; padding: 10px; background: rgba(59,130,246,0.1);">${scenario.Script_Debrief_IA}</div>`);
    } else {
        // On AJOUTE l'explication au lieu de remplacer
        smartBox.insertAdjacentHTML('beforeend', `<div class="smart-entry" style="margin-bottom:10px;">${step.Explication_SMART}</div>`);
    }
    // Le KPI peut rester en remplacement (innerHTML) car c'est une valeur fixe par étape
    kpiBox.innerHTML = `<div class="kpi-update" style="animation: highlight 0.5s;">${step.Impact_KPI}</div>`;
    smartBox.scrollTop = smartBox.scrollHeight;

    // --- CHAT & EMAIL CARD (Déjà fonctionnel) ---
    const chatBox = document.getElementById('chat-mobile');

    if (isLastStep && scenario.Is_Email_Card) {
        const emailHtml = `
            <div class="email-card" style="background: #1e293b; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 10px 0;">
                <div style="color: #10b981; font-weight: bold; margin-bottom: 8px; font-size: 10px;">HAPPI : CLÔTURE</div>
                <div style="font-size: 13px; line-height: 1.4;">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
                <button style="width:100%; margin-top:10px; background:#10b981; color:white; border:none; padding:8px; border-radius:4px; font-weight:bold; cursor:pointer;">AVIS</button>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', emailHtml);
    } else {
        const acteur = step.Acteur;
        const side = (acteur === "Client") ? "Client" : "Happi";
        const colorClass = acteur.toLowerCase();
        const html = `
            <div class="message-row ${side}">
                <div class="bubble">
                    <span class="msg-badge ${colorClass}">${acteur.toUpperCase()}</span>
                    <div>${step.Message_UI.replace(/\"/g, "")}</div>
                </div>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', html);
    }
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- BOUTON DE NAVIGATION & TRANSITION ---
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
        btn.onclick = () => {
            if (currentStepIdx < scenario.steps.length - 1) {
                currentStepIdx++;
                renderStep();
            }
        };
    }
}

// 4. FOCUS & RESET (Inchangé)
document.getElementById('resetBtn').onclick = () => location.reload();
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };
applyFocus();