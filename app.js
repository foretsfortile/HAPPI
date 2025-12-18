import React, { useState, useEffect, useRef } from 'react';
import {
    Bot,
    Send,
    Gift,
    ArrowRightLeft,
    Terminal,
    Activity,
    BrainCircuit,
    Zap,
    User,
    ShieldCheck,
    MessageSquare,
    AlertTriangle,
    ChevronRight,
    Database,
    History
} from 'lucide-react';

/**
 * CONFIGURATION DES SCÉNARIOS
 */
const SCENARIOS = {
    retail: {
        id: 'retail',
        label: 'Retail / E-commerce',
        subtitle: 'Litige Livraison & Fidélité',
        client: { name: 'Jean Martin', id: '#7842-X', seniority: '5 ans', segment: 'A+ (Premium)' },
        initialMessages: [
            { id: 1, role: 'client', sender: 'Jean Martin', text: "Bonjour, je n'ai toujours pas reçu ma commande passée il y a 5 jours. C'est inadmissible !", time: '10:30' },
            { id: 2, role: 'happi', sender: 'HAPPI', text: "Bonjour Jean. Je regrette sincèrement ce retard. Je vois que votre colis est bloqué au centre de tri de Lyon. Souhaitez-vous un remboursement des frais de port ?", time: '10:31' },
            { id: 3, role: 'client', sender: 'Jean Martin', text: "C'est un début, mais je suis client fidèle depuis 5 ans, j'attendais un meilleur suivi.", time: '10:32' },
        ],
        aiAnalysis: { irritation: 82, intent: 'Réclamation', urgency: 'Haute' }
    },
    assurance: {
        id: 'assurance',
        label: 'Assurance / Sinistre',
        subtitle: 'Déclaration Dégât des Eaux',
        client: { name: 'Marie Leroy', id: '#A-901', seniority: '12 ans', segment: 'Gold' },
        initialMessages: [
            { id: 1, role: 'client', sender: 'Marie Leroy', text: "J'ai une fuite importante dans ma cuisine, l'eau commence à couler chez le voisin du dessous !", time: '09:15' },
            { id: 2, role: 'happi', sender: 'HAPPI', text: "Bonjour Marie. Restez calme, j'ai identifié l'urgence. Un plombier partenaire est disponible dans 45 minutes. Puis-je valider l'intervention ?", time: '09:16' },
        ],
        aiAnalysis: { irritation: 45, intent: 'Urgence Sinistre', urgency: 'Critique' }
    },
    telco: {
        id: 'telco',
        label: 'Télécom / Fibre',
        subtitle: 'Panne Totale Services',
        client: { name: 'Thomas Bernard', id: '#T-442', seniority: '2 ans', segment: 'Standard' },
        initialMessages: [
            { id: 1, role: 'client', sender: 'Thomas Bernard', text: "Ma box clignote rouge depuis ce matin. Je télétravaille, j'ai besoin de connexion maintenant.", time: '08:45' },
            { id: 2, role: 'happi', sender: 'HAPPI', text: "Bonjour Thomas. Un incident réseau est en cours dans votre quartier. Les techniciens prévoient un rétablissement à 14h00.", time: '08:46' },
        ],
        aiAnalysis: { irritation: 68, intent: 'Support Technique', urgency: 'Moyenne' }
    }
};

const App = () => {
    // --- ÉTATS ---
    const [activeScenario, setActiveScenario] = useState(SCENARIOS.retail);
    const [messages, setMessages] = useState(SCENARIOS.retail.initialMessages);
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([]);
    const chatEndRef = useRef(null);

    // Changement de scénario
    const handleSelectScenario = (key) => {
        const scenario = SCENARIOS[key];
        setActiveScenario(scenario);
        setMessages(scenario.initialMessages);
        addLog(`Changement de contexte : ${scenario.label}`, "info");
    };

    // Scroll auto
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addLog = (msg, type = 'info') => {
        const newLog = {
            id: Date.now(),
            type,
            msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setLogs(prev => [newLog, ...prev].slice(0, 20));
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;
        const newMessage = {
            id: Date.now(),
            role: 'conseiller',
            sender: 'Lucas',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);
        addLog("Transmission du message conseiller", "success");
        setInput('');
    };

    const triggerAction = (type) => {
        addLog(`Action déclenchée : ${type}`, "warning");
        const systemMsg = {
            id: Date.now(),
            role: 'superviseur',
            sender: 'Système',
            text: `Action validée : ${type === 'geste' ? 'Coupon de réduction 10% envoyé' : 'Dossier transmis au niveau 2'}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMsg]);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">

            {/* HEADER */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex justify-between items-center shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase leading-none">
                            HAPPI <span className="text-blue-600 font-light lowercase italic tracking-normal">Omni-Console</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Plateforme de Supervision IA • <span className="text-blue-500">{activeScenario.subtitle}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200">
                        V1.2.0-STABLE
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">

                {/* BARRE LATERALE : SCENARIOS */}
                <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-white/50">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Database size={12} /> Scénarios de Démo
                        </h2>
                        <nav className="space-y-2">
                            {Object.keys(SCENARIOS).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleSelectScenario(key)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${activeScenario.id === key
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {SCENARIOS[key].label}
                                    <ChevronRight size={14} className={activeScenario.id === key ? 'opacity-100' : 'opacity-30'} />
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <History size={12} /> Infos Client
                        </h2>
                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 pb-2 border-b border-slate-100">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-black">{activeScenario.client.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{activeScenario.client.id}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-[9px] text-slate-400 uppercase font-bold">Ancienneté</div>
                                <div className="text-[10px] font-bold text-right">{activeScenario.client.seniority}</div>
                                <div className="text-[9px] text-slate-400 uppercase font-bold">Segment</div>
                                <div className="text-[10px] font-bold text-right text-blue-600">{activeScenario.client.segment}</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* COLONNE CENTRALE : CHAT */}
                <section className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="h-10 border-b border-slate-100 px-6 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flux Conversationnel Actif</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">En direct</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'client' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] ${msg.role === 'client' ? 'text-left' : 'text-right'}`}>
                                    {msg.role !== 'client' && (
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase mb-1 ${msg.role === 'happi' ? 'bg-blue-600' : msg.role === 'superviseur' ? 'bg-purple-600' : 'bg-slate-700'
                                            }`}>
                                            {msg.role}
                                        </span>
                                    )}
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.role === 'client'
                                            ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                            : msg.role === 'superviseur'
                                                ? 'bg-purple-50 text-purple-800 border border-purple-100 italic font-medium'
                                                : 'bg-blue-600 text-white rounded-tr-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                        {msg.sender} • {msg.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                            <input
                                className="flex-1 px-4 py-2.5 bg-transparent text-sm focus:outline-none"
                                placeholder="Écrivez votre réponse..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* COLONNE DROITE : IA & LOGS */}
                <section className="w-80 flex flex-col shrink-0">
                    {/* IA DASHBOARD */}
                    <div className="h-1/2 bg-slate-900 text-white p-6 overflow-y-auto">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <BrainCircuit size={14} className="text-blue-400" /> Analyse IA Contextuelle
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sentiment / Frustration</span>
                                    <span className={`text-xs font-black ${activeScenario.aiAnalysis.irritation > 70 ? 'text-rose-500' : 'text-blue-400'}`}>
                                        {activeScenario.aiAnalysis.irritation}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${activeScenario.aiAnalysis.irritation > 70 ? 'bg-rose-500' : 'bg-blue-500'}`}
                                        style={{ width: `${activeScenario.aiAnalysis.irritation}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Intention</div>
                                    <div className="text-[11px] font-bold text-blue-300">{activeScenario.aiAnalysis.intent}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Urgence</div>
                                    <div className="text-[11px] font-bold text-amber-500 uppercase">{activeScenario.aiAnalysis.urgency}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommandations</h3>
                                <button
                                    onClick={() => triggerAction('geste')}
                                    className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-400 p-3 rounded-xl text-xs font-bold flex items-center justify-between group transition-all"
                                >
                                    Appliquer Geste Commercial
                                    <Gift size={14} className="group-hover:rotate-12 transition-transform" />
                                </button>
                                <button
                                    onClick={() => triggerAction('escalade')}
                                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-3 rounded-xl text-xs font-bold flex items-center justify-between group transition-all"
                                >
                                    Escalader vers N2
                                    <ArrowRightLeft size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LOGS CONSOLE */}
                    <div className="h-1/2 bg-slate-950 border-t border-slate-800 flex flex-col">
                        <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={12} /> System Logs
                            </span>
                            <span className="text-[8px] text-slate-800 font-mono">NODE_HAPPI_01</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-[9px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                            {logs.length === 0 && <div className="text-slate-800 italic">En attente d'événements...</div>}
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-2">
                                    <span className="text-slate-800">[{log.time}]</span>
                                    <span className={
                                        log.type === 'success' ? 'text-emerald-700' :
                                            log.type === 'warning' ? 'text-amber-700' : 'text-blue-900'
                                    }>{log.type}:</span>
                                    <span className="text-slate-500">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default App;