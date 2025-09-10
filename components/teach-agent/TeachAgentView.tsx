import React, { useState, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';
import { format } from 'date-fns';

const TeachAgentView: React.FC = () => {
    const { knowledgeFiles, addKnowledgeFile, deleteKnowledgeFile } = useAppContext();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isUploading) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const processFile = async (file: File | null) => {
        if (!file) return;
        setIsUploading(true);
        try {
            await addKnowledgeFile(file);
        } catch (err) {
            alert(`File upload failed: ${err}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isUploading) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [addKnowledgeFile, isUploading]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    };
    
    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Teach Agent</h1>
                <p className="text-sm text-slate-500">Home &gt; Teach Agent</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-2">Agent</h2>
                <p className="text-slate-500 mb-6">
                    Teach your agent by uploading PDF file containing your offers, Business Information, FAQs, Opening Hours...
                </p>

                {/* Drag and Drop Area */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
                        isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'
                    } ${isUploading ? 'cursor-not-allowed' : ''}`}
                >
                    {isUploading ? (
                         <div className="flex flex-col items-center">
                            <p className="text-lg font-semibold text-slate-700">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <Icon className="w-10 h-10 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></Icon>
                            </div>
                            <p className="mt-4 text-lg font-semibold text-slate-700">Drag & Drop File Here</p>
                            <p className="text-sm text-slate-500 mt-1">Drag and drop your PNG, JPG, WebP, SVG images here or browse</p>
                            <button onClick={handleBrowseClick} className="mt-4 text-indigo-600 font-semibold hover:underline">
                                Browse File
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="application/pdf,image/png,image/jpeg,image/webp,image/svg+xml"
                                disabled={isUploading}
                            />
                        </div>
                    )}
                </div>

                {/* File List */}
                <div className="mt-8">
                    <div className="mb-4">
                        <input type="text" placeholder="Rechercher une pièce jointe..." className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Aperçu</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Nom du fichier</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Type</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Taille</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {knowledgeFiles.length > 0 ? (
                                    knowledgeFiles.map(file => (
                                        <tr key={file.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-md">
                                                    <Icon className="w-6 h-6 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></Icon>
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-slate-800">{file.name}</td>
                                            <td className="p-4 text-slate-500">{file.type || 'N/A'}</td>
                                            <td className="p-4 text-slate-500">{formatBytes(file.size)}</td>
                                            <td className="p-4 text-slate-500">{format(new Date(file.uploadedAt), 'MMM d, yyyy')}</td>
                                            <td className="p-4">
                                                <button onClick={() => deleteKnowledgeFile(file.id)} className="text-red-500 hover:text-red-700" aria-label="Delete file">
                                                    <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-3.232 0l.346 9M5.25 6H18.75m-13.5 0a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V6z" /></Icon>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-slate-500">
                                            No files uploaded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeachAgentView;