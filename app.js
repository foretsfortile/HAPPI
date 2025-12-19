/* ============================================================
   HAPPI - Moteur de Démonstration (app.js)
   ============================================================ */

let scenariosData = {};
let currentScenarioSteps = [];
let currentStepIndex = 0;
let currentScenarioMeta = {};

// 1. Initialisation : Chargement du JSON
window.onload = async function () {
    try {
        const response = await fetch('scenarios.json');
        scenariosData = await response.json();
        console.log("HAPPI : Données chargées avec succès.");

        // Optionnel : peupler le sélecteur de scénario si présent
        const selector = document.querySelector('select');
        if (selector) {
            selector.onchange = (e) => loadScenario(e.target.value);
        }
    } catch (error) {
        console.error("Erreur critique de chargement :", error);
    }
};

// 2. Chargement d'un scénario par son ID (ex: "005")
function loadScenario(id) {
    const data = scenariosData[id];
    if (!data) return;

    currentScenarioMeta = data;
    currentScenarioSteps = data.steps || [];
    currentStepIndex = 0;

    // Nettoyage des zones d'affichage
    document.querySelector('.col:nth-child(1) .content').innerHTML = ""; // Zone Interaction
    document.querySelector('.col:nth-child(2) .content').innerHTML = ""; // Zone SMART
    document.querySelector('.col:nth-child(3) .content').innerHTML = ""; // Zone Log

    renderStep();
}

// 3. Moteur de rendu d'étape
function renderStep() {
    const step = currentScenarioSteps[currentStepIndex];
    if (!step) return;

    // Identification des zones cibles (selon vos captures)
    const chatArea = document.querySelector('.col:nth-child(1) .content');
    const smartPanel = document.querySelector('.col:nth-child(2) .content');
    const logPanel = document.querySelector('.col:nth-child(3) .content');
    const nextBtn = document.getElementById('nextBtn');

    const isLastStep = (currentStepIndex === currentScenarioSteps.length - 1);

    // --- A. RENDU DE L'INTERACTION (COLONNE 1) ---
    if (isLastStep && currentScenarioMeta.Is_Email_Card) {
        let emailText = currentScenarioMeta.Is_Email_Card
            .replace(/<Client>/g, currentScenarioMeta.Client_Nom || "Cher Client")
            .replace(/\n/g, '<br>');

        const emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI fait le point : Dites-nous tout</div>
                <div class="email-body">${emailText}</div>
                <button class="feedback-btn" onclick="alert('Enquête lancée...')">JE DONNE MON AVIS</button>
            </div>`;
        chatArea.insertAdjacentHTML('beforeend', emailHtml);
    } else {
        const actorClass = (step.Acteur === 'Client') ? 'Client' : 'Happi';
        const bubbleHtml = `
            <div class="message-row ${actorClass}">
                <div class="bubble">${step.Message_UI}</div>
            </div>`;
        chatArea.insertAdjacentHTML('beforeend', bubbleHtml);
    }

    // --- B. RENDU SMART & KPI (COLONNE 2) ---
    // Au dernier step du 009, on affiche le debrief stratégique
    if (isLastStep && currentScenarioMeta.Scenario_ID === "009") {
        smartPanel.innerHTML = `<div class="final-debrief">${currentScenarioMeta.Script_Debrief_IA}</div>`;
    } else {
        smartPanel.innerHTML = `
            <p><strong>Explication SMART :</strong><br>${step.Explication_SMART || ""}</p>
            <p style="margin-top:10px; color:#10b981;"><strong>Impact KPI :</strong><br>${step.Impact_KPI || "---"}</p>
        `;
    }

    // --- C. RENDU LOG SYSTÈME (COLONNE 3) ---
    logPanel.insertAdjacentHTML('beforeend', `<div>> ${step.Log_Systeme || "executing..."}</div>`);

    // --- D. NAVIGATION & TRANSITION ---
    if (isLastStep && currentScenarioMeta.Scenario_Suivant) {
        nextBtn.innerText = "CONTINUER";
        nextBtn.onclick = () => {
            const [nextId, transText] = currentScenarioMeta.Scenario_Suivant.split(':');
            executeTransition(nextId, transText);
        };
    } else {
        nextBtn.innerText = "SUIVANT";
        nextBtn.className = "main-action"; // S'assurer que la classe CSS est conservée
        nextBtn.onclick = () => {
            if (currentStepIndex < currentScenarioSteps.length - 1) {
                currentStepIndex++;
                renderStep();
            }
        };
    }

    // Scroll auto pour le chat et les logs
    chatArea.scrollTop = chatArea.scrollHeight;
    logPanel.scrollTop = logPanel.scrollHeight;
}

// 4. Fonction de transition
function executeTransition(nextId, message) {
    const chatArea = document.querySelector('.col:nth-child(1) .content');
    chatArea.innerHTML = `<div class="transition-overlay">${message || "Chargement..."}</div>`;

    setTimeout(() => {
        loadScenario(nextId);
    }, 2500);
}