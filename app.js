/* ============================================================
   HAPPI - Moteur de Démonstration (Correctif Interface)
   ============================================================ */

let scenariosData = {};
let currentScenarioSteps = [];
let currentStepIndex = 0;
let currentScenarioMeta = {};

// 1. Initialisation et Chargement du JSON
window.onload = async function () {
    try {
        const response = await fetch('scenarios.json');
        scenariosData = await response.json();
        console.log("HAPPI : Système prêt.");

        // On peuple la liste déroulante si elle existe
        const selector = document.querySelector('select');
        if (selector) {
            selector.innerHTML = '<option value="">-- Choisir un Scénario --</option>';
            Object.keys(scenariosData).forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.innerText = `${id} - ${scenariosData[id].Nom_Scenario}`;
                selector.appendChild(opt);
            });
            selector.addEventListener('change', (e) => loadScenario(e.target.value));
        }
    } catch (error) {
        console.error("Erreur de chargement JSON :", error);
    }
};

// 2. Chargement d'un scénario
function loadScenario(id) {
    if (!id || !scenariosData[id]) return;

    currentScenarioMeta = scenariosData[id];
    currentScenarioSteps = currentScenarioMeta.steps || [];
    currentStepIndex = 0;

    // Reset de toutes les zones (on vide les conteneurs de contenu)
    const columns = document.querySelectorAll('.col');
    columns.forEach(col => {
        const contentZone = col.querySelector('.content') || col;
        // Si vous n'avez pas de <div class="content">, on vide la .col après le titre
        if (col.querySelector('.col-title')) {
            const title = col.querySelector('.col-title').outerHTML;
            col.innerHTML = title + '<div class="content"></div>';
        }
    });

    renderStep();
}

// 3. Moteur de rendu (Injection dans les colonnes)
function renderStep() {
    const step = currentScenarioSteps[currentStepIndex];
    if (!step) return;

    // Ciblage précis des colonnes par leur ordre d'apparition (1, 2, 3)
    const chatArea = document.querySelector('.col:nth-child(1) .content');
    const smartArea = document.querySelector('.col:nth-child(2) .content');
    const logArea = document.querySelector('.col:nth-child(3) .content');
    const nextBtn = document.getElementById('nextBtn');

    const isLastStep = (currentStepIndex === currentScenarioSteps.length - 1);

    // --- COLONNE 1 : INTERACTION ---
    if (chatArea) {
        if (isLastStep && currentScenarioMeta.Is_Email_Card) {
            // Affichage de la Carte Email
            let emailText = currentScenarioMeta.Is_Email_Card
                .replace(/<Client>/g, currentScenarioMeta.Client_Nom || "Cher Client")
                .replace(/\n/g, '<br>');

            chatArea.insertAdjacentHTML('beforeend', `
                <div class="email-card" style="border: 2px solid #3b82f6; background: #1e293b; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <div style="color: #10b981; font-weight: bold; margin-bottom: 10px;">HAPPI : CLÔTURE DE DOSSIER</div>
                    <div style="font-size: 13px; line-height: 1.5;">${emailText}</div>
                    <button class="feedback-btn" style="width: 100%; margin-top: 10px; background: #10b981; color: white; border: none; padding: 8px; cursor: pointer;">JE DONNE MON AVIS</button>
                </div>`);
        } else {
            // Bulle de chat classique
            const side = (step.Acteur === 'Client') ? 'Client' : 'Happi';
            chatArea.insertAdjacentHTML('beforeend', `
                <div class="message-row ${side}" style="margin-bottom: 10px; display: flex; flex-direction: column;">
                    <span style="font-size: 9px; color: #3b82f6;">${step.Acteur}</span>
                    <div class="bubble" style="background: ${side === 'Client' ? '#3b82f6' : '#1e293b'}; padding: 8px; border-radius: 8px; max-width: 90%; font-size: 13px;">
                        ${step.Message_UI}
                    </div>
                </div>`);
        }
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // --- COLONNE 2 : SMART / DEBRIEF ---
    if (smartArea) {
        if (isLastStep && currentScenarioMeta.Scenario_ID === "009") {
            smartArea.innerHTML = `<div style="color: #3b82f6; font-style: italic; padding: 10px; border: 1px dashed #3b82f6;">${currentScenarioMeta.Script_Debrief_IA}</div>`;
        } else {
            smartArea.innerHTML = `
                <div style="margin-bottom: 15px;"><strong>ANALYSE :</strong><br>${step.Explication_SMART || ""}</div>
                <div style="color: #10b981;"><strong>KPI :</strong><br>${step.Impact_KPI || "---"}</div>`;
        }
    }

    // --- COLONNE 3 : LOGS ---
    if (logArea) {
        logArea.insertAdjacentHTML('beforeend', `<div style="font-family: monospace; font-size: 11px; color: #94a3b8; margin-bottom: 4px;">> ${step.Log_Systeme || "processing..."}</div>`);
        logArea.scrollTop = logArea.scrollHeight;
    }

    // --- BOUTON NAVIGATION ---
    if (nextBtn) {
        if (isLastStep && currentScenarioMeta.Scenario_Suivant) {
            nextBtn.innerText = "CONTINUER";
            nextBtn.onclick = () => {
                const [nextId, transText] = currentScenarioMeta.Scenario_Suivant.split(':');
                executeTransition(nextId, transText);
            };
        } else {
            nextBtn.innerText = "SUIVANT";
            nextBtn.onclick = () => {
                if (currentStepIndex < currentScenarioSteps.length - 1) {
                    currentStepIndex++;
                    renderStep();
                }
            };
        }
    }
}

function executeTransition(nextId, message) {
    const chatArea = document.querySelector('.col:nth-child(1) .content');
    if (chatArea) {
        chatArea.innerHTML = `<div class="transition-overlay" style="padding: 40px; text-align: center; color: #3b82f6; font-weight: bold;">${message || "Chargement..."}</div>`;
    }
    setTimeout(() => loadScenario(nextId), 2500);
}