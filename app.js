let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT (Strictement identique au vôtre)
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

// 2. CHANGEMENT DE SCENARIO (Nettoyage pour la transition)
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // On vide tout pour assurer la transition propre demandée
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('smart-content').innerHTML = "";
    document.getElementById('matrix-logs').innerHTML = "";
    document.getElementById('kpi-content').innerHTML = "";

    renderStep();
};

// 3. RENDU (Réutilisation de VOS méthodes d'insertion)
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx >= scenario.steps.length - 1);

    // --- LOGS (Insertion par le HAUT - Votre Matrix) ---
    const logBox = document.getElementById('matrix-logs');
    const logEntry = `<div class="log-line"><span class="log-time">${getTechTime()}</span> > ${step.Log_Systeme}</div>`;
    // 'afterbegin' = Remplissage par le haut (méthode de votre fichier original)
    logBox.insertAdjacentHTML('afterbegin', logEntry);

    // --- SMART & KPI (Insertion par le HAUT) ---
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.insertAdjacentHTML('afterbegin', `<div class="debrief-final">${scenario.Script_Debrief_IA}</div>`);
    } else {
        smartBox.insertAdjacentHTML('afterbegin', `<div class="smart-entry">${step.Explication_SMART}</div>`);
    }
    kpiBox.innerHTML = step.Impact_KPI;

    // --- CHAT & EMAIL CARD (Insertion par le BAS) ---
    const chatBox = document.getElementById('chat-mobile');

    if (isLastStep && scenario.Is_Email_Card) {
        const emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI : CLÔTURE</div>
                <div class="email-body">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
                <button class="feedback-btn">AVIS</button>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', emailHtml);
    } else {
        const acteur = step.Acteur;
        const side = (acteur === "Client") ? "Client" : "Happi";
        const html = `
            <div class="message-row ${side}">
                <div class="bubble">
                    <span class="msg-badge ${acteur.toLowerCase()}">${acteur.toUpperCase()}</span>
                    <div>${step.Message_UI.replace(/\"/g, "")}</div>
                </div>
            </div>`;
        chatBox.insertAdjacentHTML('beforeend', html);
    }
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- LOGIQUE BOUTON (L'indicateur CONTINUER) ---
    const btn = document.getElementById('nextBtn');

    if (isLastStep && scenario.Scenario_Suivant) {
        btn.innerText = "CONTINUER"; // Signal visuel pour le présentateur
        btn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            const select = document.getElementById('scenario-select');
            select.value = nextId;
            select.dispatchEvent(new Event('change')); // Déclenche le nettoyage du panneau
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

// 4. FOCUS (Strictement repris de votre fichier original)
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };
document.getElementById('resetBtn').onclick = () => location.reload();
applyFocus();