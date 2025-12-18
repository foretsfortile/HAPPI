import React, { useState, useEffect, useRef } from 'react';
import {
    Bot, Send, User, BrainCircuit, ShieldCheck, Zap,
    ChevronRight, Terminal, MessageSquare, Info
} from 'lucide-react';

const App = () => {
    const [scenarios, setScenarios] = useState({});
    const [currentScenarioId, setCurrentScenarioId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);

    // --- CHARGEMENT DU FICHIER SCENARIOS.JSON (RACINE) ---
    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                // Accès direct au fichier sans chemin inventé
                const response = await fetch('scenarios.json');
                const data = await response.json();
                setScenarios(data);

                // Sélection automatique du premier scénario
                const firstId = Object.keys(data)[0];
                if (firstId) setCurrentScenarioId(firstId);

                addLog("Système : Connexion établie avec scenarios.json", "system");
                setLoading(false);
            } catch (error) {
                console.error("Erreur de lecture du fichier JSON:", error);
                addLog("Erreur : Impossible de charger scenarios.json à la racine", "error");
                setLoading(false);
            }
        };
        fetchScenarios();
    }, []);

    // --- SYNCHRONISATION LORS DU CHANGEMENT DE SÉLECTION ---
    useEffect(() => {
        if (currentScenarioId && scenarios[currentScenarioId]) {
            const scenario = scenarios[currentScenarioId];
            setMessages(scenario.messages || []);
            addLog(`Chargement du scénario : ${currentScenarioId}`, 'system');
        }
    }, [currentScenarioId, scenarios]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{
            id: Date.now(),
            text: msg,
            time: new Date().toLocaleTimeString(),
            type
        }, ...prev]);
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;
        const newMsg = {
            id: Date.now(),
            role: 'agent',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMsg]);
        setInput('');
        addLog(`Agent : Envoi d'une réponse manuelle`, 'agent');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-mono">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="animate-pulse text-blue-400" size={32} />
                    <p className="text-sm tracking-widest">CHARGEMENT DU MOTEUR HAPPI...</p>
                </div>
            </div>
        );
    }

    const currentScenario = scenarios[currentScenarioId] || {};

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">

            {/* BARRE DE NAVIGATION */}
            <nav className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <Bot size={20} />
                        </div>
                        <span className="font-black text-lg tracking-tight">HAPPI <span className="text-blue-600 font-light lowercase">console</span></span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2" />
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                        <ShieldCheck size={14} className="text-blue-600" />
                        Live Scénarios
                    </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                    STATUS: ONLINE | {Object.keys(scenarios).length} ENTRIES
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">

                {/* LISTE DES SCÉNARIOS (BASÉE SUR LE JSON) */}
                <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bibliothèque Scénarios</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {Object.keys(scenarios).map(id => (
                            <button
                                key={id}
                                onClick={() => setCurrentScenarioId(id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${currentScenarioId === id
                                        ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-600/10'
                                        : 'border-slate-100 hover:border-slate-300 bg-white shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-white uppercase">
                                        {scenarios[id].type || 'GENERAL'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">#{id}</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800 leading-snug">
                                    {scenarios[id].summary || 'Sans titre'}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* PROFIL CLIENT DYNAMIQUE */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Interlocuteur</h2>
                        {currentScenario.client ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                                    <User size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-sm font-black text-slate-800 truncate">{currentScenario.client}</div>
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                                        {currentScenario.status || 'Client Actif'}
                                    </div>
                                </div>
                            </div>
                        ) : <span className="text-xs text-slate-400">Aucun profil</span>}
                    </div>
                </aside>

                {/* CHAT CENTRAL */}
                <main className="flex-1 flex flex-col bg-[#F1F5F9]/20 relative">
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {messages.length > 0 ? messages.map((m, idx) => (
                            <div key={idx} className={`flex flex-col ${m.role === 'client' ? 'items-start' : 'items-end'}`}>
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                        {m.role === 'client' ? currentScenario.client : 'HAPPI AGENT'}
                                    </span>
                                    <span className="text-[9px] text-slate-300 font-mono">{m.time || '--:--'}</span>
                                </div>
                                <div className={`max-w-md p-4 rounded-2xl shadow-sm border ${m.role === 'client'
                                        ? 'bg-white border-slate-100 rounded-tl-none text-slate-700'
                                        : 'bg-blue-600 border-blue-500 text-white rounded-tr-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                                Aucun message pour ce scénario.
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-6 bg-white border-t border-slate-200">
                        <div className="max-w-4xl mx-auto flex gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Saisissez votre réponse..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium px-4"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold text-sm"
                            >
                                Envoyer <Send size={16} />
                            </button>
                        </div>
                    </div>
                </main>

                {/* ANALYSE IA ET TERMINAL */}
                <aside className="w-80 border-l border-slate-200 flex flex-col bg-white overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <BrainCircuit size={14} className="text-blue-600" /> Analyse Cognitive
                        </h2>

                        {currentScenario.analysis ? (
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Irritation</span>
                                        <span className="text-lg font-black text-slate-800">{currentScenario.analysis.irritation || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-1000"
                                            style={{ width: `${currentScenario.analysis.irritation || 0}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Intention</div>
                                        <div className="text-xs font-bold text-slate-800">{currentScenario.analysis.intent || 'Indéterminée'}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Priorité</div>
                                        <div className={`text-xs font-bold ${currentScenario.analysis.risk === 'Elevé' ? 'text-red-600' : 'text-blue-600'}`}>
                                            {currentScenario.analysis.risk || 'Standard'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : <div className="text-xs text-slate-400 italic">Données d'analyse indisponibles</div>}
                    </div>

                    {/* CONSOLE DE LOGS */}
                    <div className="flex-1 bg-slate-900 m-4 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
                        <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                            <Terminal size={12} className="text-slate-400" />
                            <span className="text-[9px] font-mono text-slate-300 font-bold tracking-widest uppercase">Console System</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px]">
                            {logs.map(log => (
                                <div key={log.id} className="mb-2 break-words">
                                    <span className="text-slate-500">[{log.time}]</span>{' '}
                                    <span className={log.type === 'system' ? 'text-cyan-400' : log.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                                        {log.text}
                                    </span>
                                </div>
                            ))}
                            <div className="text-slate-600 animate-pulse">_</div>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default App;