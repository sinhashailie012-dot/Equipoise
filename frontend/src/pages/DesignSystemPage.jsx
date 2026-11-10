import React from 'react';
import { Scale, Users, Search, Check } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export function DesignSystemPage() {
  return (
    <div className="space-y-10 select-none pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2 text-brand-800 font-serif text-xl tracking-tight">
          <Scale className="w-5 h-5 stroke-[1.8]" />
          <span>Equipoise</span>
        </div>
        <div className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
          PRODUCT LANGUAGE / STATIC STATE REFERENCE
        </div>
      </div>

      {/* Main Heading */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-serif text-ink-primary font-normal tracking-tight">
          Quiet controls. Clear feedback.
        </h1>
        <p className="text-sm text-ink-secondary mt-2">
          A compact reference for navigation, actions, inputs, and selection. All states below are visual examples only.
        </p>
      </div>

      {/* State Matrix Table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border-subtle/80 text-[10px] uppercase tracking-wider text-ink-muted">
              <th className="py-3 pr-4 font-semibold w-36">Component</th>
              <th className="py-3 px-3 font-semibold text-center w-48">Default</th>
              <th className="py-3 px-3 font-semibold text-center w-48">Hover</th>
              <th className="py-3 px-3 font-semibold text-center w-48">Focus</th>
              <th className="py-3 px-3 font-semibold text-center w-48">Selected</th>
              <th className="py-3 pl-3 font-semibold text-center w-48">Disabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {/* Sidebar item */}
            <tr>
              <td className="py-4 pr-4 font-medium text-ink-primary">Sidebar item</td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-800 text-[#B8C8C2] text-xs font-medium w-40">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Team workload</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-700 text-white text-xs font-medium w-40">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Team workload</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-800 text-white text-xs font-medium w-40 focus-ochre">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Team workload</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center justify-between px-3 py-2 rounded bg-[#2D5345] text-white text-xs font-medium w-40 border-r-2 border-ochre-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Team workload</span>
                  </div>
                  <span className="w-1 h-3 bg-ochre-500 rounded-full" />
                </div>
              </td>
              <td className="py-4 pl-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-800 text-[#546A61] text-xs font-medium w-40 opacity-60">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Team workload</span>
                </div>
              </td>
            </tr>

            {/* Primary action */}
            <tr>
              <td className="py-4 pr-4 font-medium text-ink-primary">Primary action</td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-brand-800 text-white text-xs font-medium w-36">
                  Save changes
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-brand-700 text-white text-xs font-medium w-36">
                  Save changes
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-brand-800 text-white text-xs font-medium w-36 focus-ochre">
                  Save changes
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#1B342A] text-white text-xs font-medium w-36">
                  <Check className="w-3.5 h-3.5" />
                  <span>Changes saved</span>
                </div>
              </td>
              <td className="py-4 pl-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-[#E8E2D5] text-[#9C9689] text-xs font-medium w-36">
                  Save changes
                </div>
              </td>
            </tr>

            {/* Secondary action */}
            <tr>
              <td className="py-4 pr-4 font-medium text-ink-primary">Secondary action</td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-[#FBF8F2] border border-[#DFD8CB] text-ink-primary text-xs font-medium w-36">
                  Week view
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-[#F5EEE2] border border-[#DFD8CB] text-ink-primary text-xs font-medium w-36">
                  Week view
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-[#FBF8F2] border border-[#DFD8CB] text-ink-primary text-xs font-medium w-36 focus-ochre">
                  Week view
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-brand-800 border border-brand-800 text-white text-xs font-medium w-36">
                  Week selected
                </div>
              </td>
              <td className="py-4 pl-3 text-center">
                <div className="inline-block px-4 py-2 rounded bg-[#F7F3EB] border border-[#E3DCCE] text-[#A3ACA7] text-xs font-medium w-36">
                  Week view
                </div>
              </td>
            </tr>

            {/* Search input */}
            <tr>
              <td className="py-4 pr-4 font-medium text-ink-primary">Search input</td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#FBF8F2] border border-[#DFD8CB] text-ink-muted text-xs w-44">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Search people</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#FBF8F2] border border-[#C5BCAB] text-ink-muted text-xs w-44">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Search people</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white text-ink-primary text-xs w-44 focus-ochre border border-[#D4A537]">
                  <Search className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                  <span>Search people |</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white border border-brand-800 text-ink-primary text-xs w-44">
                  <Search className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
                  <span>Asha Patel</span>
                </div>
              </td>
              <td className="py-4 pl-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#F4EFE6] border border-[#E3DCCE] text-ink-muted text-xs w-44 opacity-60">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Search people</span>
                </div>
              </td>
            </tr>

            {/* Checkbox */}
            <tr>
              <td className="py-4 pr-4 font-medium text-ink-primary">Checkbox</td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-ink-primary">
                  <div className="w-4 h-4 rounded border border-[#C2BAB0] bg-[#FBF8F2]" />
                  <span>Notify assignees</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-ink-primary">
                  <div className="w-4 h-4 rounded border border-[#8E867B] bg-[#FBF8F2]" />
                  <span>Notify assignees</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-ink-primary">
                  <div className="w-4 h-4 rounded border border-ochre-500 bg-[#FBF8F2] focus-ochre" />
                  <span>Notify assignees</span>
                </div>
              </td>
              <td className="py-4 px-3 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-ink-primary">
                  <div className="w-4 h-4 rounded border border-brand-800 bg-brand-800 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Notify assignees</span>
                </div>
              </td>
              <td className="py-4 pl-3 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-ink-muted">
                  <div className="w-4 h-4 rounded border border-[#D5CEC2] bg-[#F4EFE6]" />
                  <span>Notify assignees</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Meaning, not decoration */}
      <div className="pt-6 border-t border-border-subtle space-y-4">
        <div>
          <h2 className="text-2xl font-serif text-ink-primary">
            Meaning, not decoration.
          </h2>
          <p className="text-xs text-ink-secondary mt-1">
            Every status pairs a color mark with a readable label. Risk and workload are distinct measures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <StatusBadge status="spare" label="Spare capacity" />
          <StatusBadge status="balanced" label="Balanced" />
          <StatusBadge status="stretched" label="Stretched" />
          <StatusBadge status="overloaded" label="Overloaded" />
          <StatusBadge status="critical" label="Critical" />
        </div>
      </div>

      {/* 3 Reference Note Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border-subtle bg-card p-6 rounded-xl border border-border-subtle">
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            Visible focus
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            A 2px ochre outline distinguishes keyboard focus from hover or selection.
          </p>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            Purposeful disabled states
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Apply changes is unavailable until a transfer is proposed. Readable labels explain the action.
          </p>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            Static by design
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            These screens show intended appearances. Navigation, exports, and drag-and-drop are fully functional in this implementation.
          </p>
        </div>
      </div>
    </div>
  );
}

