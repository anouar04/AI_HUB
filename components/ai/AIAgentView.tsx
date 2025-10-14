import React, { useState, useEffect } from 'react';
import Header from '../Header';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';

const AIAgentView: React.FC = () => {
    const { aiConfig, updateAiConfig } = useAppContext();
    const [knowledgeBase, setKnowledgeBase] = useState('');
    const [afterHoursResponse, setAfterHoursResponse] = useState('');
    const [afterHoursEnabled, setAfterHoursEnabled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (aiConfig) {
            setKnowledgeBase(aiConfig.knowledgeBase);
            setAfterHoursResponse(aiConfig.afterHoursResponse);
            setAfterHoursEnabled(aiConfig.afterHoursEnabled);
        }
    }, [aiConfig]);

    const handleSave = async () => {
        setIsSaving(true);
        if (aiConfig && updateAiConfig) {
            try {
                const updatedConfig = { ...aiConfig, knowledgeBase, afterHoursResponse, afterHoursEnabled };
                await updateAiConfig(updatedConfig);
                console.log("Saved AI config:", updatedConfig);
                alert("AI settings saved!");
            } catch (error) {
                console.error("Failed to save AI config:", error);
                alert("Failed to save settings.");
            } finally {
                setIsSaving(false);
            }
        } else {
            alert("AI configuration not loaded yet or update function not available.");
            setIsSaving(false);
        }
    };

    if (!aiConfig) {
        return (
            <div className="p-8">
                <Header title="Intelligent AI Agent" />
                <div className="text-center py-20">
                    <p>Loading AI configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <Header title="Intelligent AI Agent" />

            <div className="max-w-4xl mx-auto space-y-8">
                 {/* Capabilities */}
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Capabilities</h2>
                    <ul className="space-y-2 text-slate-600">
                        <li className="flex items-center">
                            <Icon className="w-5 h-5 text-green-500 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
                            <span>Answers questions from the knowledge base.</span>
                        </li>
                        <li className="flex items-center">
                            <Icon className="w-5 h-5 text-green-500 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
                            <span>Books appointments directly in the conversation.</span>
                        </li>
                    </ul>
                </div>
                
                {/* Knowledge Base */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Knowledge Base</h2>
                    <p className="text-slate-500 mb-4">
                        Provide the AI with information about your business. It will use this to answer client questions. 
                        Include details like business hours, services, pricing, location, and FAQs.
                    </p>
                    <textarea 
                        value={knowledgeBase}
                        onChange={(e) => setKnowledgeBase(e.target.value)}
                        rows={10}
                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="e.g., Our business hours are Monday-Friday, 9am to 5pm."
                    />
                </div>

                {/* Automated Responder */}
                {/*
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">After-Hours Responder</h2>
                            <p className="text-slate-500">Automatically reply to clients who message outside of business hours.</p>
                        </div>
                        <label htmlFor="toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="toggle" className="sr-only" checked={afterHoursEnabled} onChange={() => setAfterHoursEnabled(!afterHoursEnabled)} />
                                <div className="block bg-slate-200 w-14 h-8 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${afterHoursEnabled ? 'translate-x-full bg-indigo-600' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                     <textarea 
                        value={afterHoursResponse}
                        onChange={(e) => setAfterHoursResponse(e.target.value)}
                        rows={3}
                        className={`w-full p-3 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition ${!afterHoursEnabled ? 'bg-slate-50 opacity-50' : ''}`}
                        placeholder="e.g., Thanks for reaching out! We're closed now but will get back to you in the morning."
                        disabled={!afterHoursEnabled}
                    />
                </div>
                */}
                
                <div className="flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save AI Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAgentView;