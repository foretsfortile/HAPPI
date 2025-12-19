let allScenarios = null;
let currentScenarioId = null;
let currentStepIdx = 0;

function getTechTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

// 1. CHARGEMENT INITIAL DU JSON
fetch('scenarios.json')
    .then(r => r.json())
    .then(data => {
        allScenarios = data;
        const select = document.getElementById('scenario-select');
        Object.keys(data).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerText = `${id} - ${data[id].Nom_Scenario}`;
            select.appendChild(opt);
        });
    });

// 2. LOGIQUE DE CHANGEMENT DE SCÉNARIO
document.getElementById('scenario-select').onchange = (e) => {
    const id = e.target.value;
    if (!id) return;

    currentScenarioId = id;
    currentStepIdx = 0;

    // Affichage des titres internes
    document.querySelectorAll('.inner-label').forEach(el => el.style.display = 'block');
    document.getElementById('scenario-name').innerText = allScenarios[id].Nom_Scenario;

    // MÉMOIRE : On NE vide PAS les conteneurs techniques. On insère juste un séparateur néon.
    const sep = `<div class="scenario-separator">>>> SESSION : ${id} - ${getTechTime()}</div>`;
    document.getElementById('smart-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', sep);
    document.getElementById('matrix-logs').insertAdjacentHTML('afterbegin', sep);

    // On vide uniquement le CHAT pour la clarté visuelle
    document.getElementById('chat-mobile').innerHTML = "";

    document.getElementById('nextBtn').disabled = false;
    renderStep();
};

// 3. MOTEUR D'AFFICHAGE DES ÉTAPES
function renderStep() {
    const steps = allScenarios[currentScenarioId].steps;
    const step = steps[currentStepIdx];

    // A. LOGS MATRIX (AVEC CURSEUR TIREt BAS)
    const logArea = document.getElementById('matrix-logs');
    const oldCursor = logArea.querySelector('.cursor');
    if (oldCursor) oldCursor.remove(); // Retire l'ancien curseur clignotant

    const logLine = document.createElement('div');
    logLine.innerHTML = `<span class="timestamp">${getTechTime()}</span><span style="color:#00ff41">></span> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span>`;
    logArea.prepend(logLine);

    // B. EXPLICATION SMART (Remplissage par le haut)
    if (step.Explication_SMART) {
        const d = document.createElement('div');
        d.className = "insight-item";
        d.innerHTML = `<span class="timestamp">${getTechTime()}</span> ${step.Explication_SMART}`;
        document.getElementById('smart-content').prepend(d);
    }

    // C. IMPACT KPI (Remplissage par le haut)
    if (step.Impact_KPI) {
        const d = document.createElement('div');
        d.className = "kpi-item";
        d.innerHTML = `<span style="color:#10b981">⚡ KPI :</span> ${step.Impact_KPI}`;
        document.getElementById('kpi-content').prepend(d);
    }

    // D. CHAT INTERACTION (Remplissage par le bas)
    if (step.Message_UI) {
        const chatBox = document.getElementById('chat-mobile');
        const row = document.createElement('div');
        row.className = `message-row ${step.HAPPI}`;
        const label = (step.HAPPI === "Client") ? "CLIENT" : "HAPPI";
        const cls = (step.HAPPI === "Client") ? "badge-client" : "badge-happi";

        row.innerHTML = `
            <div class="bubble">
                <span class="msg-badge ${cls}">${label}</span>
                <div>${step.Message_UI.replace(/"/g, "")}</div>
            </div>`;
        chatBox.appendChild(row);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Mise à jour du bouton
    document.getElementById('nextBtn').innerText = (currentStepIdx >= steps.length - 1) ? "FIN DU SCÉNARIO" : "ÉTAPE SUIVANTE";
}

// 4. BOUTONS DE CONTRÔLE
document.getElementById('nextBtn').onclick = () => {
    const steps = allScenarios[currentScenarioId].steps;
    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        renderStep();
    }
};

const sections = [document.querySelector('.action-col'), document.querySelector('.brain-col'), document.querySelector('.system-col')];
let focusIdx = 0;
function applyFocus() { sections.forEach((s, i) => i === focusIdx ? s.classList.add('focused') : s.classList.remove('focused')); }
document.getElementById('focusNext').onclick = () => { focusIdx = (focusIdx + 1) % 3; applyFocus(); };
document.getElementById('focusPrev').onclick = () => { focusIdx = (focusIdx + 2) % 3; applyFocus(); };

document.getElementById('resetBtn').onclick = () => location.reload();

applyFocus();