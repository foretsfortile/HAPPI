/* ============================================================
   HAPPI - VERSION STABLE RESTAURÉE
   Note : Ce code ne contient AUCUN style. Il utilise votre CSS.
   ============================================================ */

let scenariosData = {};
let currentScenarioSteps = [];
let currentStepIndex = 0;
let currentScenarioMeta = {};

// 1. Initialisation (Le menu réapparaît)
window.onload = async function () {
    try {
        const response = await fetch('scenarios.json');
        scenariosData = await response.json();

        const selector = document.querySelector('select');
        if (selector) {
            selector.innerHTML = '<option value="">-- Sélectionner un scénario --</option>';
            Object.keys(scenariosData).forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.innerText = id + " - " + scenariosData[id].Nom_Scenario;
                selector.appendChild(opt);
            });
            selector.onchange = (e) => loadScenario(e.target.value);
        }
    } catch (e) { console.error("Erreur : Fichier scenarios.json manquant."); }
};

// 2. Chargement : On vide les zones SANS toucher aux IDs
function loadScenario(id) {
    if (!id || !scenariosData[id]) return;
    currentScenarioMeta = scenariosData[id];
    currentScenarioSteps = currentScenarioMeta.steps || [];
    currentStepIndex = 0;

    // On cible les zones de contenu par leurs IDs d'origine
    const zones = ["chat-mobile", "smart-content", "log-content"];
    zones.forEach(idZone => {
        const el = document.getElementById(idZone);
        if (el) el.innerHTML = "";
    });

    renderStep();
}

// 3. Rendu : On pose les textes dans les "boîtes" existantes
function renderStep() {
    const step = currentScenarioSteps[currentStepIndex];
    if (!step) return;

    const chatZone = document.getElementById('chat-mobile');
    const smartZone = document.getElementById('smart-content');
    const logZone = document.getElementById('log-content');
    const nextBtn = document.getElementById('nextBtn');

    const isLast = (currentStepIndex === currentScenarioSteps.length - 1);

    // --- INTERACTION ---
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

    // --- SMART PANEL ---
    if (smartZone) {
        if (isLast && currentScenarioMeta.Scenario_ID === "009") {
            smartZone.innerHTML = `<div class="debrief-final">${currentScenarioMeta.Script_Debrief_IA}</div>`;
        } else {
            smartZone.innerHTML = `<h4>ANALYSE</h4><p>${step.Explication_SMART}</p><h4>KPI</h4><p>${step.Impact_KPI}</p>`;
        }
    }

    // --- LOGS ---
    if (logZone) {
        logZone.insertAdjacentHTML('beforeend', `<div class="log-line">> ${step.Log_Systeme}</div>`);
        logZone.scrollTop = logZone.scrollHeight;
    }

    // --- BOUTON ---
    if (nextBtn) {
        nextBtn.innerText = (isLast && currentScenarioMeta.Scenario_Suivant) ? "CONTINUER" : "SUIVANT";
        nextBtn.onclick = () => {
            if (isLast && currentScenarioMeta.Scenario_Suivant) {
                const [nextId] = currentScenarioMeta.Scenario_Suivant.split(':');
                loadScenario(nextId);
            } else if (currentStepIndex < currentScenarioSteps.length - 1) {
                currentStepIndex++;
                renderStep();
            }
        };
    }
}