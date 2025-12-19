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

    const sep = `<div class="scenario-separator">>>> SESSION : ${id}</div>`;
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sep);

    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('nextBtn').disabled = false;
    renderStep();
};

// 3. MOTEUR DE RENDU
// Variable pour stocker le scénario suivant
let nextScenarioConfig = null;

function renderStep(step) {
    const chatArea = document.getElementById('chat-mobile'); // ou votre ID de zone chat

    // 1. Vérification si c'est une carte Email (en fin de scénario)
    if (currentScenarioMeta.Is_Email_Card && isLastStep()) {
        const emailHtml = `
            <div class="email-card">
                <div class="email-header">HAPPI fait le point : Dites-nous tout</div>
                <div class="email-body">
                    ${step.Message_UI}
                    <div class="email-footer-phrase">
                        Parce que votre ressenti est notre meilleur guide, nous vous serions reconnaissants de nous dire comment vous avez vécu cet échange et de nous partager vos suggestions pour nous améliorer.
                    </div>
                </div>
                <button class="feedback-btn">JE DONNE MON AVIS</button>
            </div>`;
        chatArea.insertAdjacentHTML('beforeend', emailHtml);
    } else {
        // Rendu normal d'un message (votre code existant)
        appendChatMessage(step);
    }

    // 2. Gestion du scénario suivant
    if (isLastStep() && currentScenarioMeta.Scenario_Suivant) {
        const parts = currentScenarioMeta.Scenario_Suivant.split(':');
        const nextId = parts[0];
        const transitionText = parts[1] || "Chargement du scénario suivant...";

        // On prépare le bouton SUIVANT pour charger le nouveau scénario
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.innerText = "CONTINUER";
        nextBtn.onclick = () => loadNextScenario(nextId, transitionText);
    }
}

function loadNextScenario(id, text) {
    const chatArea = document.getElementById('chat-mobile');
    chatArea.innerHTML = `<div class="transition-overlay">${text}</div>`;

    setTimeout(() => {
        // Appeler votre fonction existante de chargement de scénario
        fetchScenario(id);
    }, 2000); // Pause de 2 secondes pour l'effet de transition
}

// 4. BOUTONS
document.getElementById('nextBtn').onclick = () => {
    if (currentStepIdx < allScenarios[currentScenarioId].steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

document.getElementById('resetBtn').onclick = () => location.reload();

// 5. FOCUS NAVIGATION
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % 3; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx + 2) % 3; applyFocus(); };
applyFocus();