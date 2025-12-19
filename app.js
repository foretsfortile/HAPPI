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
function renderStep() {
    const step = allScenarios[currentScenarioId].steps[currentStepIdx];

    // A. LOGS
    const logArea = document.getElementById('matrix-logs');
    if (logArea.querySelector('.cursor')) logArea.querySelector('.cursor').remove();
    logArea.insertAdjacentHTML('afterbegin', `<div><span class="timestamp">${getTechTime()}</span>> ${step.Log_Systeme || "IDLE"} <span class="cursor">_</span></div>`);

    // B. SMART
    if (step.Explication_SMART) {
        document.getElementById('smart-content').insertAdjacentHTML('afterbegin', `<div class="insight-item"><span class="timestamp">${getTechTime()}</span> ${step.Explication_SMART}</div>`);
    }

    // C. KPI
    if (step.Impact_KPI) {
        document.getElementById('kpi-content').insertAdjacentHTML('afterbegin', `<div class="kpi-item"><span style="color:#10b981">⚡ KPI :</span> ${step.Impact_KPI}</div>`);
    }

    // D. CHAT (Avec couleurs dynamiques par Acteur)
    if (step.Message_UI) {
        const chatBox = document.getElementById('chat-mobile');
        const acteur = step.Acteur || "Système";
        const side = (acteur === "Client") ? "Client" : "Happi";
        const colorClass = acteur.toLowerCase();

        const html = `
            <div class="message-row ${side}">
                <div class="bubble">
                    <span class="msg-badge ${colorClass}">${acteur.toUpperCase()}</span>
                    <div>${step.Message_UI.replace(/"/g, "")}</div>
                </div>
            </div>`;

        chatBox.insertAdjacentHTML('beforeend', html);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('nextBtn').innerText = (currentStepIdx >= allScenarios[currentScenarioId].steps.length - 1) ? "FIN" : "SUIVANT";
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