'use client';

import React from 'react';
import CustomDesignRequestForm from '@/components/CustomDesignRequestForm';

export default function CustomDesignView() {
  return (
    <div id="custom-design-page" className="pt-20 sm:pt-28 pb-20 sm:pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="py-6 sm:py-12 border-b border-[#EAE4DC] max-w-3xl space-y-2.5 sm:space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">
            Custom Design
          </span>
          <h1 className="text-3xl sm:text-6xl font-normal tracking-tight text-[#1C1A19]">
            MADE AROUND YOUR IDEA
          </h1>
          <p className="text-sm sm:text-base text-[#524B45] font-light leading-relaxed">
            Because some spaces call for something that doesn’t already exist.
          </p>
          <p className="text-xs sm:text-lg text-[#524B45] font-light leading-relaxed">
            From the initial concept to the final piece, we develop custom designs tailored to the
            space, function, dimensions, materials, and visual identity.
          </p>
        </div>

        <div className="py-7 sm:py-10 border-b border-[#EAE4DC]">
          <p className="mb-4 text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-[#8F8880]">
            From first thought to finished piece
          </p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
            {['Concept', 'Design', 'Development', 'Production', 'Final Piece'].map((stage, index) => (
              <li
                key={stage}
                className="space-y-1.5 rounded-xl border border-[#E8E1D5] bg-[#F5F2EB] p-4 sm:space-y-3 sm:rounded-2xl sm:p-5"
              >
                <span className="block font-mono text-xl font-light text-[#B85D38] sm:text-2xl">
                  0{index + 1}
                </span>
                <span className="block text-xs font-medium uppercase tracking-wider text-[#1C1A19] sm:text-sm">
                  {stage}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Custom Inquiry Section: Direct WhatsApp Consultation */}
        <div className="py-8 sm:py-16">
          <CustomDesignRequestForm requestType="CLIENT" />
        </div>
      </div>
    </div>
  );
}
