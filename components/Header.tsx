
import React from 'react';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            <div className="flex items-center space-x-4">
                {children}
            </div>
        </div>
    );
}

export default Header;
