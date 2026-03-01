import { createRootRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Test Base Application Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-2xl font-bold font-heading text-primary-600">JobNow</h1>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
            </main>
        </div>
    ),
});
