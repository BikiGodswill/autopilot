"use client";

import { useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi";
import SectionHeading from "@/components/marketing/SectionHeading";

const FAQS = [
  { q: "What is SEO Autopilot?", a: "An AI-powered platform that analyzes your website's SEO, generates content and fixes, and continuously monitors your search performance." },
  { q: "Can SEO Autopilot automatically fix my website?", a: "For connected platforms like GitHub or WordPress, it can propose fixes for your review — nothing is published automatically unless you enable it." },
  { q: "Does it work with WordPress?", a: "Yes — SEO Autopilot integrates with the WordPress REST API and common SEO plugins to update metadata directly." },
  { q: "Can it generate blog posts?", a: "Yes. The AI content engine generates full articles, landing pages, product descriptions, and more, based on your target keywords." },
  { q: "Can I connect multiple websites?", a: "Yes, depending on your plan. Free supports 1 website; paid plans support more." },
  { q: "Does it guarantee Google rankings?", a: "No tool can guarantee rankings. SEO Autopilot improves the technical and content factors within your control." },
  { q: "How does AI content generation work?", a: "You provide a target keyword and a few preferences; the AI researches search intent and produces a structured, SEO-optimized draft for you to review and edit." },
  { q: "Can I review changes before publishing?", a: "Yes — every AI-generated fix and article is a draft until you explicitly approve and publish it." },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-page mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />

        <div className="mt-12 divide-y divide-ash-200 border-y border-ash-200">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="font-medium text-ink">{item.q}</span>
                  <HiOutlineChevronDown
                    className={`shrink-0 text-ash-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-ash-500">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
