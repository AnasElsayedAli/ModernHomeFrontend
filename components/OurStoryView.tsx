'use client';

import { useToccoStore } from '@/lib/store';
import { ToccoMark } from './ToccoLogo';
import Image from '@/components/SafeImage';

export default function OurStoryView() {
  const { navigateTo } = useToccoStore();

  return (
    <div id="our-story-page" className="pt-20 sm:pt-28 pb-20 sm:pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-16 border-b border-[#EAE4DC] max-w-4xl space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ToccoMark size={30} fillColor="#FFFFFF" circleBg="#5E3B26" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">
              The Tocco House Philosophy
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-normal tracking-tight text-[#1C1A19] leading-[1.15]">
            Objects with character. <br />
            <span className="text-[#643D26]">The touch that elevates.</span>
          </h1>

          <p className="text-sm sm:text-xl text-[#524B45] font-light leading-relaxed">
            Tocco House was founded in Cairo as an antidote to disposable mass production.
            We approach furniture not as background utilities, but as bold architectural sculptures
            with emotional resonance.
          </p>
        </div>

        <div className="py-10 sm:py-20 border-b border-[#EAE4DC] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-4xl font-normal tracking-tight text-[#1C1A19]">
              The idea
            </h2>
            <p className="text-sm sm:text-xl text-[#1C1A19] font-light leading-relaxed">
              tocco is a design house built on one belief: great spaces begin with extraordinary ideas
            </p>
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-base text-[#524B45] font-light leading-relaxed">
              <p>At Tocco, we believe that design is more than creating beautiful pieces.</p>
              <p>
                It is about imagining something different, giving it form, and creating a presence
                that transforms the space around it.
              </p>
              <p>Because the most memorable spaces are the ones that have something of their own.</p>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-[280px] sm:h-[520px] rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85"
              alt="Sculptural fiberglass form"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="py-10 sm:py-20 border-b border-[#EAE4DC] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 relative h-[280px] sm:h-[520px] rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85"
              alt="Artisans finishing fiberglass surfaces in the Cairo workshop"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4 sm:space-y-6">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-[#8F8880]">
              — ABOUT TOCCO
            </span>
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-base text-[#524B45] font-light leading-relaxed">
              <p>
                Tocco is a design house founded in 2023 by Hadeer Ezz and Sara Elguneidy, born from
                a shared passion for furniture design and distinctive spaces.
              </p>
              <p>
                We turn ideas into distinctive furniture and spatial pieces — combining creativity,
                craftsmanship, materials, and function to create designs that feel truly unique.
              </p>
              <p>From an idea to a signature piece, Tocco brings imagination into reality.</p>
            </div>
          </div>
        </div>

        <div className="py-12 sm:py-20 text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-4xl font-normal tracking-tight text-[#1C1A19]">
            Designed to elevate your everyday ritual.
          </h2>
          <p className="text-xs sm:text-base text-[#736B63] font-light leading-relaxed">
            From the shores of Sidi Abdel Rahman to the historic high-ceilinged apartments of
            Cairo, Tocco House pieces are conversation starters that anchor residential and
            hospitality interiors.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigateTo('shop')}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-[0.25em] font-medium hover:bg-[#332F2D] transition-all"
            >
              Explore the Archive
            </button>
            <button
              onClick={() => navigateTo('custom-design')}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full border border-[#D8CEBF] text-[#1C1A19] text-xs uppercase tracking-[0.25em] font-medium hover:border-[#1C1A19] transition-all"
            >
              Commission Bespoke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
