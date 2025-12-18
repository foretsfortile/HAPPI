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
    AlertTriangle
} from 'lucide-react';

/**
 * Composant principal HAPPI DEMO
 * Structure : 3 colonnes (Échange / Pilotage / Intelligence)
 */
const App = () => {
    // --- ÉTAT DES MESSAGES (L'ÉCHANGE) ---
    const [messages, setMessages] = useState([
        { id: 1, role: 'client', sender: 'Jean Martin', text: "Bonjour, je n'ai toujours pas reçu ma commande passée il y a 5 jours. C'est inadmissible !", time: '10:30' },
        { id: 2, role: 'happi', sender: 'HAPPI', text: "Bonjour Jean. Je regrette sincèrement ce retard. Je vois que votre colis est bloqué au centre de tri de Lyon. Souhaitez-vous un remboursement des frais de port ?", time: '10:31' },
        { id: 3, role: 'client', sender: 'Jean Martin', text: "C'est un début, mais je suis client fidèle depuis 5 ans, j'attendais un meilleur suivi.", time: '10:32' },
    ]);

    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    // --- ÉTAT DES LOGS SYSTÈME ---
    const [logs, setLogs] = useState([
        { id: 1, type: 'info', msg: "Session initialisée - Client ID #7842", time: '10:30:01' },
        { id: 2, type: 'success', msg: "HAPPI NlpEngine : Prêt", time: '10:30:05' },
        { id: 3, type: 'warning', msg: "SentimentScore > 0.75 (Frustration détectée)", time: '10:30:12' },
        { id: 4, type: 'info', msg: "Requête SQL : Fetching_Logistics_DB...", time: '10:31:00' },
    ]);

    // Scroll automatique vers le bas du chat
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
        setLogs(prev => [newLog, ...prev].slice(0, 15));
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
        addLog("Message envoyé par le conseiller", "success");
        setInput('');
    };

    const triggerGeste = () => {
        addLog("Action : Validation geste commercial 10%", "warning");
        const systemMsg = {
            id: Date.now(),
            role: 'superviseur',
            sender: 'Système',
            text: "Action validée : Un coupon de réduction de 10% a été envoyé au client.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMsg]);
    };

    // --- RENDU DES BADGES ---
    const RoleBadge = ({ role }) => {
        const badges = {
            happi: { bg: "bg-blue-600", label: "HAPPI", icon: <Bot size={10} /> },
            conseiller: { bg: "bg-emerald-600", label: "CONSEILLER", icon: <ShieldCheck size={10} /> },
            superviseur: { bg: "bg-purple-600", label: "SYSTÈME", icon: <Zap size={10} /> }
        };
        if (role === 'client') return null;
        const item = badges[role];
        return (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black text-white mb-1 uppercase tracking-tighter ${item.bg}`}>
                {item.icon} {item.label}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">

            {/* BARRE DE NAVIGATION SUPÉRIEURE */}
            <header className="h-14 bg-white border-b border-slate-200 px-6 flex justify-between items-center shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded text-white shadow-lg shadow-blue-200">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <h1 className="text-lg font-black tracking-tighter text-slate-800 uppercase">
                        HAPPI <span className="text-blue-600 font-light lowercase italic">Omni-Console</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> LUCAS (Conseiller)
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">

                {/* COLONNE 1 : ÉCHANGE (FOND CLAIR) */}
                <section className="flex-1 flex flex-col bg-white border-r border-slate-200 shadow-inner min-w-[450px]">
                    <div className="px-6 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 font-bold text-[11px] text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><MessageSquare size={14} /> Flux Conversationnel</div>
                        <div className="text-blue-600 italic lowercase tracking-normal font-normal">canal: whatsapp</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'client' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] flex flex-col ${msg.role === 'client' ? 'items-start' : 'items-end'}`}>
                                    <RoleBadge role={msg.role} />
                                    <div className={`px-5 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${msg.role === 'client'
                                            ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none hover:bg-white'
                                            : msg.role === 'superviseur'
                                                ? 'bg-purple-50 border border-purple-100 text-purple-900 rounded-tr-none italic'
                                                : 'bg-blue-600 text-white rounded-tr-none shadow-blue-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-wider">
                                        <span>{msg.sender}</span> • <span>{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                        <div className="flex gap-3 max-w-4xl mx-auto">
                            <input
                                className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none bg-slate-50 text-sm transition-all"
                                placeholder="Répondre au client..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition shadow-xl shadow-blue-600/20 active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* COLONNE 2 : PILOTAGE & ACTIONS (FOND NEUTRE) */}
                <section className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col p-6 space-y-8 shrink-0">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Activity size={14} className="text-blue-600" /> Actions Pilotage
                        </h2>

                        <div className="space-y-4">
                            <button
                                onClick={triggerGeste}
                                className="w-full text-left p-4 rounded-2xl border border-white bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                            >
                                <div className="flex items-center gap-2 text-blue-700 font-bold text-[11px] mb-2 italic">
                                    <Gift size={16} /> Geste Commercial
                                </div>
                                <p className="text-[10px] text-slate-500 mb-4 leading-snug font-medium">
                                    Appliquer la remise de 10% suggérée par HAPPI.
                                </p>
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Valider l'envoi →
                                </div>
                            </button>

                            <button className="w-full text-left p-4 rounded-2xl border border-white bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px] mb-2 italic">
                                    <ArrowRightLeft size={16} /> Escalade Dossier
                                </div>
                                <p className="text-[10px] text-slate-500 mb-4 leading-snug font-medium">
                                    Transférer l'historique au service logistique N2.
                                </p>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Transférer →
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Profil Client</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Ancienneté</span>
                                <span className="text-xs font-black">5 ans</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Score Valeur</span>
                                <span className="text-xs font-black text-emerald-600">A+ (Premium)</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={16} /></div>
                                <div>
                                    <p className="text-[10px] font-black">Jean Martin</p>
                                    <p className="text-[9px] text-slate-400">ID: #7842-X</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COLONNE 3 : INTELLIGENCE & LOGS (FOND DARK) */}
                <section className="w-96 bg-slate-900 flex flex-col text-slate-300 shrink-0">

                    <div className="p-8 border-b border-slate-800 bg-slate-900/50">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <BrainCircuit size={14} className="text-blue-400" /> IA Contextuelle
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Indice d'agacement</span>
                                    <span className="text-[11px] font-mono text-blue-400 font-black underline decoration-blue-900">82%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[82%] animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                                </div>
                                <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity"><AlertTriangle size={14} className="text-amber-500" /></div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic font-medium">
                                        "HAPPI a détecté un risque élevé de désabonnement. La réclamation porte sur une commande bloquée. Le client rappelle son ancienneté (5 ans)."
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/50 text-center">
                                    <span className="text-[8px] text-slate-500 block uppercase font-black mb-1 tracking-widest">Intention</span>
                                    <span className="text-[10px] text-blue-200 font-black">Réclamation</span>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/50 text-center">
                                    <span className="text-[8px] text-slate-500 block uppercase font-black mb-1 tracking-widest">Urgence</span>
                                    <span className="text-[10px] text-amber-500 font-black uppercase">Haute</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/30">
                        <div className="px-8 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Terminal size={14} /> Console Logs
                            </h2>
                            <span className="text-[8px] font-mono text-slate-800">happi_v1.0.4</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 font-mono text-[9px] space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-3 group border-l border-slate-800 pl-3 py-0.5">
                                    <span className="text-slate-700 tracking-tighter">[{log.time}]</span>
                                    <span className={`font-black uppercase ${log.type === 'success' ? 'text-emerald-600' :
                                            log.type === 'warning' ? 'text-amber-600' : 'text-blue-700'
                                        }`}>
                                        {log.type}:
                                    </span>
                                    <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{log.msg}</span>
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