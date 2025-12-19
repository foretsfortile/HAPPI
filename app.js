let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT DU JSON
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

// 2. CHANGEMENT DE SCÉNARIO
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;
    currentScenarioId = id;
    currentStepIdx = 0;

    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // MÉMOIRE : Insertion d'un séparateur néon sans effacer l'historique
    const sep = `<div class="scenario-separator">>>> SESSION : ${id} - ${getTechTime()}</div>`;
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sep);

    // On vide uniquement le chat pour démarrer la nouvelle discussion
    document.getElementById('chat-mobile').innerHTML = "";
    document.getElementById('nextBtn').disabled = false;
    renderStep();
};

// 3. MOTEUR DE RENDU
function renderStep() {
    const step = allScenarios[currentScenarioId].steps[currentStepIdx];

    // A. LOGS (Insertion en haut avec curseur Matrix)
    const logArea = document.getElementById('matrix-logs');
    if (logArea.querySelector('.cursor')) logArea.querySelector('.cursor').remove();
    logArea.insertAdjacentHTML('afterbegin', `<div><span class="timestamp">${getTechTime()}</span>> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span></div>`);

    // B. EXPLICATION SMART (Insertion en haut)
    if (step.Explication_SMART) {
        document.getElementById('smart-content').insertAdjacentHTML('afterbegin', `<div class="insight-item"><span class="timestamp">${getTechTime()}</span> ${step.Explication_SMART}</div>`);
    }

    // C. IMPACT KPI (Insertion en haut)
    if (step.Impact_KPI) {
        document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', `<div class="kpi-item"><span style="color:#10b981">⚡ KPI :</span> ${step.Impact_KPI}</div>`);
    }

    // D. CHAT (Insertion en bas + Gestion dynamique de l'Acteur)
    if (step.Message_UI) {
        const chatBox = document.getElementById('chat-mobile');

        // On récupère le nom depuis la colonne "Acteur"
        const nomActeur = step.Acteur || "Système";

        // Style : Client à droite, tout le reste (Happi, Superviseur, etc.) à gauche
        const sideClass = (nomActeur === "Client") ? "Client" : "Happi";

        const html = `
            <div class="message-row ${sideClass}">
                <div class="bubble">
                    <span class="msg-badge">${nomActeur.toUpperCase()}</span>
                    ${step.Message_UI.replace(/"/g, "")}
                </div>
            </div>`;

        chatBox.insertAdjacentHTML('beforeend', html);
        // On force le défilement vers le bas
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('nextBtn').innerText = (currentStepIdx >= allScenarios[currentScenarioId].steps.length - 1) ? "FIN" : "SUIVANT";
}

// 4. BOUTONS DE CONTRÔLE
document.getElementById('nextBtn').onclick = () => {
    if (currentStepIdx < allScenarios[currentScenarioId].steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

document.getElementById('resetBtn').onclick = () => location.reload();

// GESTION DU FOCUS VISUEL
const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % 3; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx + 2) % 3; applyFocus(); };
applyFocus();