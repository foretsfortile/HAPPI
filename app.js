import React, { useState, useEffect } from 'react';
import { Bot, User, UserCheck, ShieldCheck, Send, ArrowRightLeft, Gift, MessageSquare, Terminal, Activity, BrainCircuit, Zap } from 'lucide-react';

const App = () => {
    // --- ÉTAT DES MESSAGES (L'ÉCHANGE) ---
    const [messages, setMessages] = useState([
        { id: 1, role: 'client', sender: 'Jean Martin', text: "Bonjour, je souhaiterais un geste commercial suite au retard de ma commande.", time: '10:00' },
        { id: 2, role: 'happi', sender: 'HAPPI', text: "Bonjour ! Je comprends votre frustration. Je vérifie les détails de votre commande #4589.", time: '10:01' },
        { id: 3, role: 'happi', sender: 'HAPPI', text: "Votre commande a effectivement eu 4 jours de retard. Je peux vous proposer un bon d'achat de 5€ ou la gratuité des frais de port.", time: '10:01' },
        { id: 4, role: 'client', sender: 'Jean Martin', text: "C'est un peu faible... Je suis client fidèle depuis 5 ans !", time: '10:02' },
    ]);

    const [input, setInput] = useState('');

    // --- ÉTAT DES LOGS SYSTÈME ---
    const [logs, setLogs] = useState([
        { id: 1, type: 'info', msg: "Session initialisée - Client ID #7842", time: '10:00:01' },
        { id: 2, type: 'success', msg: "HAPPI Context Engine : Opérationnel", time: '10:00:02' },
        { id: 3, type: 'warning', msg: "Sentiment : Irritation détectée (Score 0.82)", time: '10:02:15' },
        { id: 4, type: 'info', msg: "Requête SQL : Fetching_History_User_7842", time: '10:02:20' },
    ]);

    const addLog = (msg, type = 'info') => {
        const newLog = {
            id: Date.now(),
            type,
            msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setLogs(prev => [newLog, ...prev].slice(0, 15));
    };

    // --- ACTIONS ---
    const sendMessage = (role = 'conseiller') => {
        if (!input.trim()) return;
        const newMessage = {
            id: Date.now(),
            role: role,
            sender: 'Lucas',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        addLog(`Message envoyé par CONSEILLER`, 'success');
        setInput('');
    };

    const validerGesteCom = () => {
        const superMsg = {
            id: Date.now(),
            role: 'superviseur',
            sender: 'Système (Approbation)',
            text: "Action validée : Un remboursement de 15€ a été crédité sur le compte du client.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, superMsg]);
        addLog("Action Critique : Remboursement 15€ validé", 'warning');
    };

    // --- COMPOSANTS UI ---
    const RoleBadge = ({ role }) => {
        const config = {
            happi: { bg: "bg-blue-600", label: "HAPPI", icon: <Bot size={10} /> },
            conseiller: { bg: "bg-emerald-600", label: "CONSEILLER", icon: <UserCheck size={10} /> },
            superviseur: { bg: "bg-purple-600", label: "SYSTÈME", icon: <ShieldCheck size={10} /> }
        };
        if (role === 'client') return null;
        const { bg, label, icon } = config[role];
        return (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black text-white mb-1 uppercase ${bg}`}>
                {icon} {label}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* HEADER GLOBAL */}
            <header className="h-14 bg-white border-b border-slate-200 px-6 flex justify-between items-center shadow-sm z-30">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-600 rounded text-white shadow-md">
                        <Zap size={20} />
                    </div>
                    <h1 className="text-lg font-black tracking-tight text-slate-800">
                        HAPPI <span className="text-blue-600 font-light">OMNICANAL</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Status: <span className="text-emerald-500 flex items-center gap-1 ml-1"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live</span>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* COLONNE 1 : ÉCHANGE (FOND CLAIR) */}
                <section className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200 shadow-inner">
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'client' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] flex flex-col ${msg.role === 'client' ? 'items-start' : 'items-end'}`}>
                                    <RoleBadge role={msg.role} />
                                    <div className={`px-5 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'client'
                                            ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                            : msg.role === 'superviseur'
                                                ? 'bg-purple-50 border border-purple-200 text-purple-900 rounded-tr-none italic'
                                                : 'bg-blue-600 text-white rounded-tr-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{msg.sender}</span>
                                        <span className="text-[10px]">{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-200">
                        <div className="flex gap-3 max-w-3xl mx-auto">
                            <input
                                className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-sm transition-all shadow-inner"
                                placeholder="Répondre au client..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={() => sendMessage()} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition shadow-lg shadow-blue-600/20">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* COLONNE 2 : PILOTAGE & ACTIONS (FOND NEUTRE) */}
                <section className="w-80 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 shadow-xl z-10">
                    <div>
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Activity size={14} className="text-blue-600" /> Actions Immédiates
                        </h2>

                        <div className="space-y-4">
                            <button
                                onClick={validerGesteCom}
                                className="w-full text-left p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all group"
                            >
                                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-2 italic">
                                    <Gift size={16} /> Geste Commercial
                                </div>
                                <p className="text-[11px] text-slate-500 mb-3 leading-snug">
                                    Approuver le remboursement de 15€ pour compenser le retard.
                                </p>
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Valider →
                                </div>
                            </button>

                            <button className="w-full text-left p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all group">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-2 italic">
                                    <ArrowRightLeft size={16} /> Escalader
                                </div>
                                <p className="text-[11px] text-slate-500 mb-3 leading-snug">
                                    Transférer l'échange au service Logistique de niveau 2.
                                </p>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Transférer →
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Détails Client</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px]"><span className="text-slate-400">Ancienneté</span> <span className="font-bold">5 ans</span></div>
                            <div className="flex justify-between text-[11px]"><span className="text-slate-400">Score Fidélité</span> <span className="font-bold text-emerald-600">A+</span></div>
                            <div className="flex justify-between text-[11px]"><span className="text-slate-400">Dernière Cde</span> <span className="font-bold">#4589</span></div>
                        </div>
                    </div>
                </section>

                {/* COLONNE 3 : INTELLIGENCE & LOGS (FOND DARK) */}
                <section className="w-96 bg-slate-900 flex flex-col text-slate-300">

                    {/* Intelligence Artificielle */}
                    <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <BrainCircuit size={14} className="text-blue-400" /> IA Contextuelle
                        </h2>

                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Sentiment Client</span>
                                    <span className="text-[10px] font-mono text-blue-400 italic">SCORE: 0.82</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 w-[82%] animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
                                    "Le client manifeste une frustration légitime liée à sa fidélité. Un geste symbolique est fortement recommandé pour éviter le churn."
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                                    <span className="text-[9px] text-slate-500 block uppercase mb-1">Intention</span>
                                    <span className="text-[10px] text-slate-200 font-bold">Réclamation</span>
                                </div>
                                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                                    <span className="text-[9px] text-slate-500 block uppercase mb-1">Urgence</span>
                                    <span className="text-[10px] text-amber-500 font-bold">Haute</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs Système */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Terminal size={14} /> Console Logs
                            </h2>
                            <span className="text-[9px] font-mono text-slate-600">v2.4.0_STABLE</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 font-mono text-[9px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-2 group hover:bg-white/5 p-1 rounded transition-colors">
                                    <span className="text-slate-600">[{log.time}]</span>
                                    <span className={`font-bold uppercase ${log.type === 'success' ? 'text-emerald-500' :
                                            log.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                        }`}>
                                        {log.type}:
                                    </span>
                                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default App;