'use client';

import React, { useState } from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import {
  Truck,
  ShieldCheck,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

export function ShippingView() {
  const { settings } = useToccoStore();

  return (
    <div id="shipping-page" className="pt-28 pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="py-12 border-b border-[#EAE4DC] space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">
            Client Service
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#1C1A19]">
            Shipping & White-Glove Delivery
          </h1>
          <p className="text-base text-[#736B63] font-light">
            Every Tocco House object is a sculpted work of art. We ensure it reaches your home in
            immaculate condition.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[#524B45] font-light leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-[#1C1A19]">1. Production & Delivery</h3>
            <p>
              Each piece is carefully crafted to order, with a standard delivery timeline of 2–3 weeks.
            </p>
            <p>
              For custom-designed pieces, production and delivery may take 3 weeks or more, depending
              on the design and specifications.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-[#1C1A19]">2. Location & Delivery</h3>
            <p>
              Based in Cairo, we offer delivery across Egypt. Shipping fees vary depending on the
              delivery location and order size.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-[#1C1A19]">3. Inspection & Final {100 - settings.depositPercentage}% Settlement</h3>
            <p>
              Upon delivery, please inspect the piece and confirm its surface finish and structural
              integrity before accepting it and settling the remaining {100 - settings.depositPercentage}% balance via InstaPay or the
              agreed payment method. Any concerns must be reported at the time of delivery.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ReturnsView() {
  return (
    <div id="returns-page" className="pt-28 pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="py-12 border-b border-[#EAE4DC] space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">
            Customer Care
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#1C1A19]">
            Returns & Replacement Policy
          </h1>
          <p className="text-base text-[#736B63] font-light">
            Returns and replacements are available only for pieces that arrive damaged.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[#524B45] font-light leading-relaxed">
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-[#1C1A19]">1. Damaged Products Only</h3>
            <p>
              Returns or replacements are accepted only when a piece arrives damaged. The damage must be
              reported to our team during delivery inspection, with clear photos or video showing the
              condition of the product.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-medium text-[#1C1A19]">2. Available Resolution</h3>
            <p>
              If the damage is confirmed, you may choose one of the following resolutions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>A newly manufactured replacement piece at no additional cost</li>
              <li>A refund of the paid deposit</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function FaqView() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { settings } = useToccoStore();

  const faqs = [
    {
      q: 'Can I request custom dimensions, colors, or RAL paint codes?',
      a: 'Absolutely. We collaborate directly with private homeowners, interior architects, and hospitality groups. You can specify custom table lengths, bench radii, or exact RAL paint codes through our Custom Design page or directly on WhatsApp.',
    },
    {
      q: 'What is the difference between Matte and Glossy finishes?',
      a: 'Matte offers a soft, non-reflective finish ideal for indoor living salons. Glossy features a smooth, reflective shine that brings out the color and character of each piece.',
    },
    {
      q: 'How do I clean and maintain my Tocco House pieces?',
      a: 'Daily care requires only a soft microfiber cloth and mild warm soapy water. Avoid abrasive metal scourers. High-gloss pieces can be buffed occasionally with automotive carnauba wax to maintain a brilliant showroom reflection.',
    },
    {
      q: 'Can pieces remain outdoors during winter rain?',
      a: 'Yes. Our fiberglass forms are 100% waterproof and non-porous. Water simply beads off the surface.',
    },
  ];

  return (
    <div id="faq-page" className="pt-28 pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="py-12 border-b border-[#EAE4DC] space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">
            Inquiries
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#1C1A19]">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[#736B63] font-light">
            Everything you need to know about our materials, finishes, and product care.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-[#EAE4DC] rounded-2xl bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-normal text-base sm:text-lg text-[#1C1A19]"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#643D26] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8F8880] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#524B45] font-light leading-relaxed border-t border-[#F2EDE4]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ContactView() {
  const { settings } = useToccoStore();

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'Hello Tocco House, I would like to arrange a design consultation or inquire about your pieces.'
  )}`;

  return (
    <div id="contact-page" className="pt-28 pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="py-12 border-b border-[#EAE4DC] max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">
            Design Concierge
          </span>
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#1C1A19]">
            Connect with Tocco House
          </h1>
          <p className="text-base text-[#736B63] font-light">
            For design appointments and enquiries, contact the team directly using the details below.
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-[#EAE4DC] bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#B85D38]" />
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1C1A19]">
                      Cairo Studio & Showroom
                    </h2>
                    <a
                      href={settings.contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-xs leading-relaxed text-[#524B45] underline decoration-[#D8CEBF] underline-offset-2 hover:text-[#643D26]"
                    >
                      {settings.contact.atelierAddress}
                    </a>
                    <p className="mt-1 text-[11px] text-[#8F8880]">
                      Viewings by private appointment: Sun – Thu, 10 AM – 6 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-[#B85D38]" />
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1C1A19]">
                      Direct Telephone
                    </h2>
                    <a href={`tel:${settings.contact.phone}`} className="mt-0.5 text-xs font-mono text-[#524B45] hover:text-[#643D26]">
                      {settings.contact.phone}
                    </a>
                  </div>
                </div>

                {settings.contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-[#B85D38]" />
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1C1A19]">
                        Email Enquiries
                      </h2>
                      <a href={`mailto:${settings.contact.email}`} className="mt-0.5 text-xs font-mono text-[#524B45] hover:text-[#643D26]">
                        {settings.contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2A2624] py-3.5 text-xs font-medium uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#383330]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>Start WhatsApp Conversation</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyView() {
  return (
    <div id="privacy-page" className="pt-28 pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-[#524B45] font-light leading-relaxed">
        <div className="py-8 border-b border-[#EAE4DC] space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">Legal</span>
          <h1 className="text-3xl font-normal text-[#1C1A19]">Privacy Policy</h1>
          <p className="text-xs text-[#736B63]">Last updated March 2026</p>
        </div>

        <p>
          At Tocco House, we respect the privacy of our clients and collectors. We only gather contact
          and delivery destination details necessary to execute your commissioned pieces and deliver
          them via our dedicated white-glove transport.
        </p>
        <p>
          We do not sell, rent, or lease your personal information to third parties. All transaction
          records and proof of deposits are stored in accordance with Egyptian commercial standards.
        </p>
      </div>
    </div>
  );
}

export function TermsView() {
  const { settings } = useToccoStore();

  return (
    <div id="terms-page" className="pt-28 pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-[#524B45] font-light leading-relaxed">
        <div className="py-8 border-b border-[#EAE4DC] space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#B85D38]">Legal</span>
          <h1 className="text-3xl font-normal text-[#1C1A19]">Terms & Conditions</h1>
          <p className="text-xs text-[#736B63]">Tocco House LLC · Handcrafted in Egypt</p>
        </div>

        <p>
          <strong>1. Deposit & Commissioning:</strong> Orders are confirmed upon receipt of a {settings.depositPercentage}%
          deposit. Once raw materials are allocated and casting initiates, deposits are non-refundable.
        </p>
        <p>
          <strong>2. Handcrafted Tolerances:</strong> Minor textural nuances, mineral pigment variations,
          and micro-variations in glaze are natural hallmarks of hand-finished fiberglass and are not
          considered defects.
        </p>
        <p>
          <strong>3. Final Balance:</strong> The remaining {100 - settings.depositPercentage}% order balance is strictly due upon arrival
          of our delivery team before handover.
        </p>
      </div>
    </div>
  );
}
