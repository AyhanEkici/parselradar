import React from 'react';
import { Link } from 'react-router-dom';

const howItWorksSteps = [
  'Add property/listing',
  'Upload evidence',
  'See missing checks',
  'Prepare next step/report'
];

const checkItems = [
  'Ada/parsel identity',
  'TKGM evidence',
  'Municipality/e-Imar/e-Plan evidence',
  'Uploaded screenshots/PDF/KML/GeoJSON',
  'Market signals',
  'Missing evidence/readiness'
];

const professionals = [
  {
    title: 'Real estate agents',
    description: 'Create cleaner pre-qualification packs, reduce repetitive follow-up, and provide buyers with evidence-organized listing context.'
  },
  {
    title: 'Developers / mutaahhit',
    description: 'Filter opportunities faster with evidence-readiness visibility before spending time on deeper technical and legal feasibility.'
  },
  {
    title: 'Architects / imar consultants',
    description: 'Start client intake with a clearer evidence baseline and reduce project friction caused by missing municipal planning context.'
  },
  {
    title: 'Due-diligence professionals',
    description: 'Receive better structured case inputs so legal and formal review begins from a more complete pre-check package.'
  }
];

export default function PublicHomepage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/80 p-8 sm:p-12 shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Evidence-first pre-check workspace
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Check Turkish land, parcels and property opportunities before you buy.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Upload a listing, parcel details or evidence. ParselRadar helps you organize source documents, identify missing checks and prepare a safer next step.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Start Property Check
              </Link>
              <a
                href="#for-professionals"
                className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800/50"
              >
                For Real Estate Professionals
              </a>
            </div>

            <div className="mt-4 space-y-1 text-sm text-slate-300">
              <p>Check a land/property opportunity</p>
              <p>Upload listing, parcel details or evidence</p>
            </div>

            <p className="mt-6 max-w-4xl rounded-xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
              ParselRadar provides informational pre-checks and evidence organization. It does not replace official TKGM, municipality, tapu, zoning, legal or professional verification.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">How it works</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step, index) => (
              <article key={step} className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Step {index + 1}</p>
                <p className="mt-2 text-sm font-medium text-slate-100">{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">What you can check</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {checkItems.map((item) => (
              <div key={item} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">For buyers and investors</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200 sm:text-base">
            ParselRadar helps private buyers and investors reduce pre-purchase uncertainty by turning scattered listing details and screenshots into a structured evidence trail. You can identify missing documents, organize evidence, understand readiness, and prepare better questions for municipality, TKGM, and professional review.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Property Check
            </Link>
            <span className="text-sm text-slate-300">Use this path to start from a listing, parcel detail, or supporting evidence.</span>
          </div>
        </section>

        <section id="for-professionals" className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">For professionals</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Prepare client evidence packages, review incoming opportunities, and move toward cleaner intake workflows. Future deal-flow and professional dashboards remain opt-in and consent-based.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {professionals.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#for-professionals"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-200/50 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/10"
            >
              For Real Estate Professionals
            </a>
            <span className="text-sm text-slate-300">No hidden data use. Consent is required before any deal data sharing.</span>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Simple credits for property pre-checks</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Use credits to start property checks, organize evidence and review readiness. Credits help you prepare smarter next steps before paying professionals or making decisions. Full official/legal/tapu/imar verification remains external and professional.
          </p>
          <p className="mt-3 text-sm text-slate-300">
            ParselRadar uses credit-based access. Final public pricing can be configured before public launch.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-white">Quick Check</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                For early listing/property screening. Good for buyers checking one opportunity.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Start Property Check
              </Link>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-white">Evidence Readiness</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                For collecting TKGM, municipality/e-Imar/e-Plan and supporting documents. Shows what is missing and what to gather next.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-cyan-200/50 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/10"
              >
                Upload Evidence
              </Link>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold text-white">Professional Review Ready</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                For preparing a cleaner case for real estate agents, architects, developers, or legal/due-diligence professionals.
              </p>
              <a
                href="#for-professionals"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-cyan-200/50 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/10"
              >
                For Professionals
              </a>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Evidence-first trust</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm leading-relaxed text-slate-200">
              ParselRadar is built around supporting evidence collection, source guidance, and pre-check readiness. The platform helps organize what you have and identify what is still required.
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm leading-relaxed text-slate-200">
              ParselRadar does not issue fake official proof, does not impersonate institutions, and does not replace formal tapu, zoning, legal, or professional verification workflows. It does not provide official valuation proof and does not claim live TKGM/TUCBS/CSB official-layer automation.
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm leading-relaxed text-slate-200 sm:col-span-2">
              Data use is bounded by user trust principles. No hidden data use is permitted for backdoor lead routing or undisclosed sharing. Official and professional verification remains external.
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Consent/deal-flow preview</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
            A future professional matching model can be enabled only through explicit user permission. Any deal-flow participation is opt-in, transparent, and revocable. No hidden backdoor data use is allowed.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Start with a safer property pre-check</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-cyan-50 sm:text-base">
            Controlled beta continues while public launch gates remain in progress. You can start evidence organization today and continue official verification through authorized institutions and professionals.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Property Check
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-100/50 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/10"
            >
              Login
            </Link>
            <a
              href="#for-professionals"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-100/50 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/10"
            >
              Learn for Professionals
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}