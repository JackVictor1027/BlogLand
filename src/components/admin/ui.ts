/** 管理端共享的 Risograph 样式（与浏览端同一套设计 token） */

export const btnPrimary =
  'riso-interactive riso-press inline-flex items-center justify-center gap-2 rounded-sm font-mono font-bold uppercase tracking-wider px-4 py-2 text-sm bg-riso-pink text-ink border-2 border-ink shadow-riso hover:shadow-riso-hover disabled:opacity-50 disabled:pointer-events-none';

export const btnGhost =
  'riso-interactive riso-press inline-flex items-center justify-center gap-2 rounded-sm font-mono font-bold uppercase tracking-wider px-4 py-2 text-sm bg-paper text-ink border-2 border-ink shadow-riso-sm hover:shadow-riso-hover disabled:opacity-50 disabled:pointer-events-none';

export const btnDanger =
  'riso-interactive riso-press inline-flex items-center justify-center gap-2 rounded-sm font-mono font-bold uppercase tracking-wider px-4 py-2 text-sm bg-paper text-riso-orange border-2 border-riso-orange shadow-[3px_3px_0_0_#ff8a00] hover:shadow-riso-hover disabled:opacity-50';

export const btnSmall =
  'riso-interactive riso-press inline-flex items-center justify-center rounded-sm font-mono font-bold uppercase tracking-wider px-3 py-1.5 text-xs bg-paper text-ink border-2 border-ink shadow-riso-sm hover:shadow-riso-hover';

export const btnSmallActive =
  'riso-interactive riso-press inline-flex items-center justify-center rounded-sm font-mono font-bold uppercase tracking-wider px-3 py-1.5 text-xs bg-riso-pink text-ink border-2 border-ink shadow-riso-sm hover:shadow-riso-hover';

export const inputCls =
  'w-full rounded-sm border-2 border-ink bg-paper font-mono px-3 py-2 focus:outline-none focus:shadow-riso-focus riso-interactive placeholder:text-gray-500';

export const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wider';

export const cardCls =
  'rounded-sm bg-paper border-2 md:border-4 border-ink shadow-riso-lg md:shadow-riso-2xl p-5 md:p-6';

export const navLinkCls = (active: boolean) =>
  `block rounded-sm border-2 px-3 py-2 text-sm font-bold uppercase tracking-wider riso-interactive riso-press ${
    active
      ? 'bg-riso-pink border-ink shadow-riso-sm'
      : 'bg-paper border-ink hover:shadow-riso-hover'
  }`;
