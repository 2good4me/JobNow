import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Tìm việc nhanh chóng theo GPS</h2>
                <p className="text-slate-600 text-lg mb-6">
                    Nền tảng tìm kiếm việc làm thời vụ tốt nhất hiện nay.
                </p>
                <button className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer">
                    Tìm kiếm công việc
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-500 rounded-full text-sm font-medium mb-4">Hot Job</span>
                        <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Nhân viên phục vụ part-time</h3>
                        <p className="text-slate-500 text-sm mb-4">Cách bạn 2.5km • 25k/giờ</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
