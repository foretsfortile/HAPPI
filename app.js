let scenariosData = {};
let currentScenarioSteps = [];
let currentStepIndex = 0;
let currentScenarioMeta = {};

// 1. Chargement stable
window.onload = async function () {
    try {
        const response = await fetch('scenarios.json');
        scenariosData = await response.json();

        const selector = document.querySelector('select');
        if (selector) {
            selector.innerHTML = '<option value="">-- Choisir un Scénario --</option>';
            Object.keys(scenariosData).forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.innerText = id + " - " + scenariosData[id].Nom_Scenario;
                selector.appendChild(opt);
            });
            selector.onchange = (e) => loadScenario(e.target.value);
        }
    } catch (e) { console.error("Erreur lecture JSON"); }
};

// 2. Initialisation propre des colonnes
function loadScenario(id) {
    if (!id || !scenariosData[id]) return;
    currentScenarioMeta = scenariosData[id];
    currentScenarioSteps = currentScenarioMeta.steps || [];
    currentStepIndex = 0;

    // On vide les contenus sans toucher aux structures de colonnes
    document.querySelectorAll('.col .content').forEach(zone => zone.innerHTML = "");

    renderStep();
}

// 3. Rendu fidèle à votre design d'origine
function renderStep() {
    const step = currentScenarioSteps[currentStepIndex];
    if (!step) return;

    const zones = document.querySelectorAll('.col .content');
    const chatZone = zones[0];
    const smartZone = zones[1];
    const logZone = zones[2];
    const nextBtn = document.getElementById('nextBtn');

    const isLast = (currentStepIndex === currentScenarioSteps.length - 1);

    // INTERACTION (Respect total de vos classes CSS)
    if (chatZone) {
        if (isLast && currentScenarioMeta.Is_Email_Card) {
            let emailTxt = currentScenarioMeta.Is_Email_Card.replace(/<Client>/g, currentScenarioMeta.Client_Nom).replace(/\n/g, '<br>');
            chatZone.insertAdjacentHTML('beforeend', `
                <div class="email-card">
                    <div class="email-header">HAPPI : CLÔTURE</div>
                    <div class="email-body">${emailTxt}</div>
                    <button class="feedback-btn">JE DONNE MON AVIS</button>
                </div>`);
        } else {
            const side = (step.Acteur === 'Client') ? 'Client' : 'Happi';
            chatZone.insertAdjacentHTML('beforeend', `
                <div class="message-row ${side}">
                    <div class="bubble">${step.Message_UI}</div>
                </div>`);
        }
        chatZone.scrollTop = chatZone.scrollHeight;
    }

    // INTELLIGENCE
    if (smartZone) {
        if (isLast && currentScenarioMeta.Scenario_ID === "009") {
            smartZone.innerHTML = `<div class="debrief-final">${currentScenarioMeta.Script_Debrief_IA}</div>`;
        } else {
            smartZone.innerHTML = `<h4>ANALYSE</h4><p>${step.Explication_SMART}</p><h4>KPI</h4><p>${step.Impact_KPI}</p>`;
        }
    }

    // MACHINERIE
    if (logZone) {
        logZone.insertAdjacentHTML('beforeend', `<div class="log-line">> ${step.Log_Systeme}</div>`);
        logZone.scrollTop = logZone.scrollHeight;
    }

    // BOUTON
    if (nextBtn) {
        nextBtn.innerText = (isLast && currentScenarioMeta.Scenario_Suivant) ? "CONTINUER" : "SUIVANT";
        nextBtn.onclick = () => {
            if (isLast && currentScenarioMeta.Scenario_Suivant) {
                const [nextId, msg] = currentScenarioMeta.Scenario_Suivant.split(':');
                executeTransition(nextId, msg);
            } else if (currentStepIndex < currentScenarioSteps.length - 1) {
                currentStepIndex++;
                renderStep();
            }
        };
    }
}

function executeTransition(id, msg) {
    const chat = document.querySelectorAll('.col .content')[0];
    chat.innerHTML = `<div class="transition-overlay">${msg}</div>`;
    setTimeout(() => loadScenario(id), 2000);
}