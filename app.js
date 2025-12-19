/* ============================================================
   HAPPI - Moteur de Démonstration (app.js)
   ============================================================ */

let scenariosData = {};
let currentScenarioSteps = [];
let currentStepIndex = 0;
let currentScenarioMeta = {};

// 1. Initialisation
window.onload = async function () {
    try {
        const response = await fetch('scenarios.json');
        scenariosData = await response.json();
        console.log("HAPPI : Données chargées avec succès.");
    } catch (error) {
        console.error("Erreur critique de chargement :", error);
    }
};

// 2. Chargement d'un scénario
function loadScenario(id) {
    const data = scenariosData[id];
    if (!data) return;

    currentScenarioMeta = data;
    currentScenarioSteps = data.steps || [];
    currentStepIndex = 0;

    const chatArea = document.getElementById('chat-mobile');
    if (chatArea) chatArea.innerHTML = ""; // Reset du chat

    renderStep();
}

// 3. Rendu de l'étape
function renderStep() {
    const step = currentScenarioSteps[currentStepIndex];
    const chatArea = document.getElementById('chat-mobile');
    const smartPanel = document.getElementById('smart-content'); // Vérifiez l'ID de votre panneau SMART
    const nextBtn = document.getElementById('nextBtn');

    if (!step || !chatArea) return;

    const isLastStep = (currentStepIndex === currentScenarioSteps.length - 1);

    // --- AFFICHAGE DE LA CARTE EMAIL ---
    if (isLastStep && currentScenarioMeta.Is_Email_Card) {
        let emailText = currentScenarioMeta.Is_Email_Card
            .replace(/<Client>/g, currentScenarioMeta.Client_Nom || "Cher Client")
            .replace(/\n/g, '<br>');

        const emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI fait le point : Dites-nous tout</div>
                <div class="email-body">${emailText}</div>
                <button class="feedback-btn" onclick="alert('Lancement de l\\'enquête...')">JE DONNE MON AVIS</button>
            </div>`;
        chatArea.insertAdjacentHTML('beforeend', emailHtml);
    } else {
        // Affichage classique
        const actorClass = (step.Acteur === 'Client') ? 'Client' : 'Happi';
        const bubbleHtml = `
            <div class="message-row ${actorClass}">
                <div class="bubble">${step.Message_UI}</div>
            </div>`;
        chatArea.insertAdjacentHTML('beforeend', bubbleHtml);
    }

    // --- AFFICHAGE SMART PANEL / DEBRIEF ---
    if (smartPanel) {
        // Au dernier step du 009, on affiche le debrief final stratégique
        if (isLastStep && currentScenarioMeta.Scenario_ID === "009") {
            smartPanel.innerHTML = `<div class="final-debrief">${currentScenarioMeta.Script_Debrief_IA}</div>`;
        } else {
            smartPanel.innerHTML = step.Explication_SMART || "";
        }
    }

    // --- NAVIGATION & TRANSITION ---
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

    chatArea.scrollTop = chatArea.scrollHeight;
}

// 4. Effet de transition
function executeTransition(nextId, message) {
    const chatArea = document.getElementById('chat-mobile');
    chatArea.innerHTML = `
        <div class="transition-overlay">
            <p>${message || "Traitement en cours..."}</p>
        </div>`;

    setTimeout(() => loadScenario(nextId), 2500);
}