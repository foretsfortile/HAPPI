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

    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // On ne vide QUE le chat au changement pour garder l'historique visuel si désiré
    // Ou videz tout ici selon votre préférence hier.
    document.getElementById('chat-mobile').innerHTML = `<div class="scenario-separator">>>> SESSION : ${id}</div>`;

    renderStep();
};

// 3. RENDU (Extension douce)
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx >= scenario.steps.length - 1);

    // --- LOGS ---
    const logBox = document.getElementById('matrix-logs');
    logBox.insertAdjacentHTML('beforeend', `<div class="log-line"><span class="log-time">${getTechTime()}</span> > ${step.Log_Systeme}</div>`);
    logBox.scrollTop = logBox.scrollHeight;

    // --- SMART & KPI ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    // Extension pour le Débrief Final (Scénario 009)
    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.innerHTML = `<div class="debrief-final">${scenario.Script_Debrief_IA}</div>`;
    } else {
        smartBox.innerHTML = step.Explication_SMART;
    }
    kpiBox.innerHTML = step.Impact_KPI;

    // --- CHAT & EMAIL CARD ---
    const chatBox = document.getElementById('chat-mobile');

    // Extension pour l'Email Card (Fin de scénario)
    if (isLastStep && scenario.Is_Email_Card) {
        const emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI : CLÔTURE DE DOSSIER</div>
                <div class="email-body">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom || "Client").replace(/\n/g, '<br>')}</div>
                <button class="feedback-btn" onclick="alert('Feedback enregistré')">JE DONNE MON AVIS</button>
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

    // --- BOUTON DE NAVIGATION ---
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

// 4. RESET & FOCUS (Inchangé)
document.getElementById('resetBtn').onclick = () => location.reload();

const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };
applyFocus();