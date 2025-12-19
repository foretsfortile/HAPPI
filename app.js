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

    // On garde votre logique de séparateur pour ne pas casser l'historique Matrix
    const sep = `<div class="scenario-separator">>>> SESSION : ${id}</div>`;
    document.getElementById('smart-content').insertAdjacentHTML('beforeend', sep);
    document.getElementById('matrix-logs').insertAdjacentHTML('beforeend', sep);

    renderStep();
};

// 3. RENDU (Strictement votre logique de remplissage)
function renderStep() {
    const scenario = allScenarios[currentScenarioId];
    const step = scenario.steps[currentStepIdx];
    const isLastStep = (currentStepIdx >= scenario.steps.length - 1);

    // LOGS (Remplissage Matrix préservé)
    const logBox = document.getElementById('matrix-logs');
    logBox.insertAdjacentHTML('beforeend', `<div class="log-line"><span class="log-time">${getTechTime()}</span> > ${step.Log_Systeme}</div>`);
    logBox.scrollTop = logBox.scrollHeight;

    // SMART & KPI (Remplissage par le haut préservé)
    const smartBox = document.getElementById('smart-content');
    const kpiBox = document.getElementById('kpi-content');

    // EXTENSION : Débrief IA si c'est la fin du 009
    if (isLastStep && scenario.Scenario_ID === "009" && scenario.Script_Debrief_IA) {
        smartBox.innerHTML = `<div class="debrief-final">${scenario.Script_Debrief_IA}</div>`;
    } else {
        smartBox.innerHTML = step.Explication_SMART;
    }
    kpiBox.innerHTML = step.Impact_KPI;

    // CHAT (Gestion Acteurs + Extension Email Card)
    const chatBox = document.getElementById('chat-mobile');

    if (isLastStep && scenario.Is_Email_Card) {
        // OBJET EXTENSIBLE : La Carte Email
        const emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI : CLÔTURE</div>
                <div class="email-body">${scenario.Is_Email_Card.replace(/<Client>/g, scenario.Client_Nom).replace(/\n/g, '<br>')}</div>
                <button class="feedback-btn">ENVOYER MON AVIS</button>
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

    // BOUTON (Votre logique + Extension Transition)
    const nextBtn = document.getElementById('nextBtn');
    if (isLastStep && scenario.Scenario_Suivant) {
        nextBtn.innerText = "CONTINUER";
        nextBtn.onclick = () => {
            const nextId = scenario.Scenario_Suivant.split(':')[0];
            document.getElementById('scenario-select').value = nextId;
            document.getElementById('scenario-select').dispatchEvent(new Event('change'));
        };
    } else {
        nextBtn.innerText = isLastStep ? "FIN" : "SUIVANT";
        nextBtn.onclick = () => {
            if (currentStepIdx < scenario.steps.length - 1) {
                currentStepIdx++;
                renderStep();
            }
        };
    }
}

// 4. BOUTONS & FOCUS (Repris mot pour mot de votre fichier fonctionnel)
document.getElementById('resetBtn').onclick = () => location.reload();

const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() {
    sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused'));
}

document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % sections.length; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx - 1 + sections.length) % sections.length; applyFocus(); };

applyFocus();