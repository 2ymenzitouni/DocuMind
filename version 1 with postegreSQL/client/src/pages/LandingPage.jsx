import React from 'react';
import { Link } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      <TopNavBar />

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-2xl pb-32 overflow-hidden hero-gradient">
          <div className="max-w-container-max mx-auto px-gutter relative z-10 flex flex-col items-center text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/50 text-primary font-label-md text-label-md mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Introducing DocuMind 2.0
            </div>

            {/* Hero Heading */}
            <h1 className="font-display-lg text-display-lg md:text-[64px] md:leading-[72px] max-w-4xl mb-6 text-on-surface">
              Unlock the Knowledge in <br className="hidden md:block" /> Your Documents
            </h1>

            {/* Hero Paragraph */}
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
              Transform your files into an interactive AI knowledge base with our advanced RAG system. Stop searching, start asking.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/signup"
                className="bg-primary-container text-on-primary font-label-md text-label-md py-4 px-8 rounded-lg hover:bg-primary transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                Get Started for Free
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <button
                onClick={() => alert('Demo video simulation started!')}
                className="bg-surface border border-outline-variant text-on-surface-variant font-label-md text-label-md py-4 px-8 rounded-lg hover:bg-surface-container-low hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                Watch Demo
              </button>
            </div>

            {/* Abstract Hero Visual (Simulating App UI) */}
            <div className="w-full max-w-5xl mt-20 relative animate-float">
              <div className="aspect-[16/9] w-full rounded-2xl border border-outline-variant/50 bg-surface/50 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest to-surface-container-low opacity-90"></div>

                {/* Mock UI Elements */}
                <div className="absolute inset-4 md:inset-8 border border-outline-variant/30 rounded-xl bg-surface/80 flex flex-col shadow-sm overflow-hidden">
                  {/* Mock Window Controls */}
                  <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 bg-surface-container-lowest">
                    <div className="w-3 h-3 rounded-full bg-error-container"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                    <div className="mx-auto w-1/3 h-4 rounded bg-surface-container-high"></div>
                  </div>

                  {/* Mock Workspace Panel */}
                  <div className="flex-grow flex p-4 gap-4">
                    {/* Mock Sidebar */}
                    <div className="w-48 hidden md:flex flex-col gap-2 border-r border-outline-variant/20 pr-4 text-left">
                      <div className="h-6 rounded bg-surface-container-high w-full"></div>
                      <div className="h-6 rounded bg-surface-container-low w-3/4"></div>
                      <div className="h-6 rounded bg-surface-container-low w-5/6"></div>
                    </div>

                    {/* Mock Message Container */}
                    <div className="flex-grow flex flex-col gap-4 text-left">
                      <div className="self-end max-w-[80%] bg-surface-container-highest rounded-2xl rounded-tr-sm p-4 text-sm text-on-surface">
                        Summarize the Q3 financial report focusing on operating margins.
                      </div>
                      <div className="self-start max-w-[90%] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                            smart_toy
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <div className="h-3 rounded bg-surface-container-high w-full"></div>
                          <div className="h-3 rounded bg-surface-container-high w-5/6"></div>
                          <div className="h-3 rounded bg-surface-container-high w-4/6"></div>
                          <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary bg-primary-fixed-dim/20 px-2 py-1 rounded w-max">
                            <span className="material-symbols-outlined text-[12px]">description</span>
                            Q3_Report.pdf (Page 4)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid Section */}
        <section className="py-24 bg-surface-container-lowest" id="features">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <h2 className="font-headline-md text-headline-lg md:text-[40px] md:leading-[48px] text-on-surface mb-4">
                Powerful tools to understand your data
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Stop reading hundreds of pages. Let our AI read, comprehend, and synthesize your documents instantly.
              </p>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
              {/* Feature 1: Upload */}
              <div className="col-span-1 md:col-span-2 bg-surface border border-outline-variant/50 rounded-3xl p-8 bento-card-hover flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-500 group-hover:bg-primary-container/10"></div>
                <div className="relative z-10 w-full mb-8 flex-grow">
                  <div className="w-full h-48 border-2 border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low flex flex-col items-center justify-center gap-3 transition-colors group-hover:border-primary/50 group-hover:bg-surface-container-high">
                    <span className="material-symbols-outlined text-4xl text-primary fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                      cloud_upload
                    </span>
                    <p className="font-label-md text-label-md text-on-surface-variant">Drag and drop files here</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-[10px] font-bold rounded bg-surface border border-outline-variant/30 text-secondary">PDF</span>
                      <span className="px-2 py-1 text-[10px] font-bold rounded bg-surface border border-outline-variant/30 text-secondary">DOCX</span>
                      <span className="px-2 py-1 text-[10px] font-bold rounded bg-surface border border-outline-variant/30 text-secondary">TXT</span>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 text-left">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Seamless Upload</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Securely ingest PDFs, Word documents, and text files in seconds. Our system automatically parses and indexes your content.
                  </p>
                </div>
              </div>

              {/* Feature 2: Intelligent Search */}
              <div className="col-span-1 bg-surface border border-outline-variant/50 rounded-3xl p-8 bento-card-hover flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl -mr-10 -mb-10 transition-all duration-500 group-hover:bg-secondary-container/40"></div>
                <div className="relative z-10 w-full mb-8 flex-grow">
                  <div className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-3 shadow-sm flex items-center gap-2 transition-transform duration-300 group-hover:scale-[1.02]">
                    <span className="material-symbols-outlined text-outline">search</span>
                    <div className="h-4 w-3/4 bg-surface-container-high rounded animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="w-full bg-surface-container-low rounded-lg p-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <div className="h-2 w-1/2 bg-surface-variant rounded"></div>
                    </div>
                    <div className="w-full bg-surface-container-low rounded-lg p-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[16px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      <div className="h-2 w-2/3 bg-surface-variant rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 text-left">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Intelligent Search</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Find exact passages and conceptual matches across thousands of documents instantly using semantic search.
                  </p>
                </div>
              </div>

              {/* Feature 3: Q&A Engine */}
              <div className="col-span-1 md:col-span-3 bg-surface border border-outline-variant/50 rounded-3xl p-8 bento-card-hover flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden">
                <div className="md:w-1/3 flex flex-col justify-center text-left">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">AI Q&A</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Chat with your data. Ask complex questions and get synthesized answers with precise citations back to the source documents.
                  </p>
                  <Link
                    to="/signup"
                    className="font-label-md text-label-md text-primary flex items-center gap-1 hover:text-primary-container transition-colors w-max"
                  >
                    See it in action
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="md:w-2/3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 shadow-sm text-left">
                  <div className="flex flex-col gap-4">
                    <div className="self-end bg-surface-container-highest rounded-2xl rounded-tr-sm p-3 px-4 text-sm text-on-surface w-max max-w-full">
                      What are the key risks mentioned in the latest contract?
                    </div>
                    <div className="self-start bg-surface border border-outline-variant/30 rounded-2xl rounded-tl-sm p-4 text-sm text-on-surface shadow-sm w-full">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                            smart_toy
                          </span>
                        </div>
                        <div>
                          <p className="mb-2 font-medium">Based on the uploaded documents, there are three key risks identified:</p>
                          <ul className="list-disc pl-4 space-y-1 text-on-surface-variant mb-3">
                            <li>
                              Liability limits are capped at $50,000{' '}
                              <span className="text-[10px] bg-surface-variant px-1.5 py-0.5 rounded text-primary font-semibold">MSA_v2.pdf p.12</span>
                            </li>
                            <li>
                              Termination requires 90 days notice{' '}
                              <span className="text-[10px] bg-surface-variant px-1.5 py-0.5 rounded text-primary font-semibold">MSA_v2.pdf p.15</span>
                            </li>
                            <li>Intellectual property rights for derived works remain with the vendor.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
