import React, { useState, useEffect } from 'react';
import { Bot, User, UserCheck, ShieldCheck, Send, ArrowRightLeft, Gift, MessageSquare, Terminal, Activity } from 'lucide-react';

const App = () => {
    // --- ÉTAT DES MESSAGES ---
    const [messages, setMessages] = useState([
        { id: 1, role: 'client', sender: 'Jean Martin', text: "Bonjour, je souhaiterais un geste commercial suite au retard de ma commande.", time: '10:00' },
        { id: 2, role: 'happi', sender: 'HAPPI', text: "Bonjour ! Je comprends votre frustration. Je vérifie les détails de votre commande #4589.", time: '10:01' },
        { id: 3, role: 'happi', sender: 'HAPPI', text: "Votre commande a effectivement eu 4 jours de retard. Je peux vous proposer un bon d'achat de 5€ ou la gratuité des frais de port sur votre prochaine commande.", time: '10:01' },
        { id: 4, role: 'client', sender: 'Jean Martin', text: "C'est un peu faible compte tenu du préjudice... Je suis client depuis 5 ans !", time: '10:02' },
        { id: 5, role: 'conseiller', sender: 'Lucas', text: "Je reprends la main. Bonjour M. Martin, je vais regarder si je peux faire mieux pour vous.", time: '10:03' }
    ]);

    const [input, setInput] = useState('');

    // --- ÉTAT DES LOGS SYSTÈME ---
    const [logs, setLogs] = useState([
        { id: 1, type: 'info', msg: "Session initialisée - Client ID #7842", time: '10:00:01' },
        { id: 2, type: 'success', msg: "HAPPI Context Engine : Prêt", time: '10:00:02' },
        { id: 3, type: 'warning', msg: "Détection Sentiment : Irritation détectée (Score 0.82)", time: '10:02:15' },
    ]);

    const addLog = (msg, type = 'info') => {
        const newLog = {
            id: Date.now(),
            type,
            msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
    };

    // --- ACTIONS ---
    const sendMessage = (role = 'conseiller') => {
        if (!input.trim()) return;
        const newMessage = {
            id: Date.now(),
            role: role,
            sender: role === 'happi' ? 'HAPPI' : 'Lucas',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        addLog(`Message envoyé par ${role.toUpperCase()}`, 'success');
        setInput('');
    };

    const validerGratuite = () => {
        const msg = "Note de Supervision : Gratuité exceptionnelle des frais de port validée par le superviseur.";
        const superMsg = {
            id: Date.now(),
            role: 'superviseur',
            sender: 'Superviseur (Auto)',
            text: msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, superMsg]);
        addLog("Action Superviseur : Gratuité validée", 'warning');
    };

    // --- COMPOSANTS UI ---
    const RoleBadge = ({ role }) => {
        const config = {
            happi: { bg: "bg-blue-600", label: "HAPPI", icon: <Bot size={10} /> },
            conseiller: { bg: "bg-emerald-600", label: "CONSEILLER", icon: <UserCheck size={10} /> },
            superviseur: { bg: "bg-amber-600", label: "SUPERVISEUR", icon: <ShieldCheck size={10} /> }
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
        <div className="flex flex-col h-screen bg-slate-900 font-sans text-slate-200 overflow-hidden">

            {/* HEADER BAR */}
            <header className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500 rounded text-white shadow-lg shadow-blue-500/20">
                        <Bot size={20} />
                    </div>
                    <h1 className="text-lg font-black tracking-tight uppercase">
                        HAPPI <span className="text-blue-400 font-light italic lowercase">Omni-Console</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> LUCAS (Conseiller Expert)
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* COLONNE GAUCHE : CHAT (L'ÉCHANGE) */}
                <section className="flex-1 flex flex-col bg-slate-800/50 backdrop-blur-sm relative">
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'client' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] flex flex-col ${msg.role === 'client' ? 'items-start' : 'items-end'}`}>
                                    <RoleBadge role={msg.role} />
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-xl transition-all hover:scale-[1.01] ${msg.role === 'client'
                                            ? 'bg-slate-700 text-white rounded-tl-none border border-slate-600'
                                            : msg.role === 'superviseur'
                                                ? 'bg-amber-900/40 border border-amber-500/50 text-amber-200 rounded-tr-none italic font-medium'
                                                : 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 px-1">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{msg.sender}</span>
                                        <span className="text-[9px] text-slate-600">•</span>
                                        <span className="text-[9px] text-slate-600">{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-slate-800 border-t border-slate-700 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                        <div className="flex gap-2 max-w-4xl mx-auto w-full">
                            <input
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 focus:border-blue-500 focus:outline-none bg-slate-900 text-sm transition-all"
                                placeholder="Écrire en tant que Conseiller..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button
                                onClick={() => sendMessage()}
                                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* COLONNE DROITE : INTELLIGENCE & LOGS (HORS ÉCHANGE) */}
                <section className="w-[400px] border-l border-slate-700 bg-slate-900 flex flex-col overflow-hidden">

                    {/* SECTION 1 : PILOTAGE & ACTIONS */}
                    <div className="p-5 border-b border-slate-800 space-y-4">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" /> Pilotage Décisionnel
                        </h2>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={validerGratuite}
                                className="group relative overflow-hidden p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-left"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-amber-500 font-bold text-xs flex items-center gap-1 italic">
                                        <Gift size={14} /> Geste Commercial
                                    </span>
                                    <ShieldCheck size={16} className="text-amber-500 opacity-50" />
                                </div>
                                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                                    Valider la gratuité exceptionnelle suggérée par l'analyse contextuelle.
                                </p>
                                <div className="text-[10px] font-black text-amber-500 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                    Approuver la demande →
                                </div>
                            </button>

                            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                                <span className="text-blue-400 font-bold text-xs flex items-center gap-1 italic">
                                    <ArrowRightLeft size={14} /> Escalade / Transfert
                                </span>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px] outline-none text-slate-300">
                                    <option>Niveau 2 : Logistique</option>
                                    <option>Niveau 3 : Direction Relation Client</option>
                                    <option>Service Contentieux</option>
                                </select>
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                    Transférer le Dossier
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 : INTELLIGENCE CONTEXTUELLE */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-800 bg-slate-800/20">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                <Terminal size={14} className="text-blue-500" /> Intelligence & Logs
                            </h2>
                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Analyse Sentimentale</span>
                                    <span className="text-[10px] font-mono text-blue-500">SCORE: 0.82</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[82%] animate-pulse"></div>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-2 font-medium italic">
                                    HAPPI : "Le client exprime un fort sentiment d'appartenance (5 ans d'ancienneté). Risque de churn détecté."
                                </p>
                            </div>
                        </div>

                        {/* LOGS SYSTEME */}
                        <div className="flex-1 overflow-y-auto font-mono text-[9px] p-4 space-y-1.5">
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-2 border-l-2 border-slate-700 pl-2 py-0.5">
                                    <span className="text-slate-600">[{log.time}]</span>
                                    <span className={`font-bold uppercase ${log.type === 'success' ? 'text-emerald-500' :
                                            log.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                        }`}>
                                        {log.type}:
                                    </span>
                                    <span className="text-slate-400">{log.msg}</span>
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