'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { img } from '../../lib/sanity';

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SORTS = {
  new: ['Newest', (a, b) => b._createdAt.localeCompare(a._createdAt)],
  low: ['Price: low to high', (a, b) => a.price - b.price],
  high: ['Price: high to low', (a, b) => b.price - a.price],
  az: ['Name: A to Z', (a, b) => a.name.localeCompare(b.name)],
};
const uniq = (list, key) => [...new Set(list.map((j) => j[key]).filter(Boolean))].sort();
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

function Select({ label, value, onChange, options }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm sm:w-auto">
      <option value="">{label}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function Catalog({ jerseys }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState({ club: '', season: '', type: '', version: '', size: '' });
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('new');
  const [open, setOpen] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hidden, setHidden] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const activeCount = Object.values(f).filter(Boolean).length + (inStock ? 1 : 0);

  // Hide the sticky bar while scrolling down, bring it back on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return jerseys
      .filter((j) => !t || `${j.name} ${j.club}`.toLowerCase().includes(t))
      .filter((j) => ['club', 'season', 'type', 'version'].every((k) => !f[k] || j[k] === f[k]))
      .filter((j) => !f.size || j.sizes?.includes(f.size))
      .filter((j) => !inStock || j.status === 'active')
      .sort(SORTS[sort][1]);
  }, [jerseys, q, f, inStock, sort]);

  const reset = () => { setQ(''); setF({ club: '', season: '', type: '', version: '', size: '' }); setInStock(false); };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <header className="flex items-baseline justify-between py-3">
        <h1 className="text-xl font-extrabold tracking-tight">WishXI</h1>
        <p className="text-xs text-mute">{list.length} jerseys</p>
      </header>

      <div className={`sticky top-0 z-10 -mx-4 border-b border-line bg-paper/95 px-4 py-2 backdrop-blur transition-transform duration-200 ${hidden && !showFilters ? '-translate-y-full' : ''}`}>
        <div className="flex gap-2">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jersey or club"
            className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-sm" />
          <button onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold">
            Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}
            className="w-28 rounded-lg border border-line bg-white px-2 py-1.5 text-sm sm:w-auto">
            {Object.entries(SORTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        {showFilters && (
          <div className="mt-2 grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
            <Select label="Club" value={f.club} onChange={set('club')} options={uniq(jerseys, 'club')} />
            <Select label="Season" value={f.season} onChange={set('season')} options={uniq(jerseys, 'season').reverse()} />
            <Select label="Type" value={f.type} onChange={set('type')} options={uniq(jerseys, 'type')} />
            <Select label="Version" value={f.version} onChange={set('version')} options={uniq(jerseys, 'version')} />
            <Select label="Size" value={f.size} onChange={set('size')} options={SIZES} />
            <label className="flex items-center gap-2 px-1 text-sm">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only
            </label>
            {activeCount > 0 && (
              <button onClick={reset} className="col-span-2 text-left text-sm text-brand underline sm:col-span-1">Clear all</button>
            )}
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-semibold">No jerseys match these filters</p>
          <button onClick={reset} className="mt-3 text-sm text-brand underline">Clear filters</button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((j) => (
            <li key={j._id}>
              <button onClick={() => setOpen(j)} className="group w-full text-left">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white">
                  {j.images?.[0] && <Image src={img(j.images[0], 600)} alt={j.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover" />}
                  {j.status === 'out_of_stock' && (
                    <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-1 text-xs font-semibold text-white">Sold out</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug group-hover:underline">{j.name}</p>
                <p className="text-xs text-mute">{j.club} {j.season && `• ${j.season}`}</p>
                <p className="mt-0.5 text-sm font-bold">{inr(j.price)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <Detail j={open} onClose={() => setOpen(null)} />}
    </main>
  );
}

function Detail({ j, onClose }) {
  const [size, setSize] = useState('');
  const [pic, setPic] = useState(0);
  const sold = j.status === 'out_of_stock';
  const link = `${SITE}/catalog`;

  const message = (withSize) =>
    `Hi WishXI, I'm interested in this jersey:\n${j.name}\n${[j.type, j.version].filter(Boolean).join(' / ')}\nSize: ${withSize || 'not selected'}\nPrice: ${inr(j.price)}\nLink: ${link}`;

  const buy = () => window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message(size))}`, '_blank');
  const share = async () => {
    const text = `${j.name} - ${inr(j.price)} at WishXI\n${link}`;
    if (navigator.share) { try { await navigator.share({ text }); return; } catch { return; } }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40 sm:items-center sm:justify-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={j.name} onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-3xl sm:rounded-2xl">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper">
              {j.images?.[pic] && <Image src={img(j.images[pic], 900)} alt={j.name} fill sizes="400px" className="object-cover" />}
            </div>
            {j.images?.length > 1 && (
              <div className="mt-2 flex gap-2">
                {j.images.map((im, i) => (
                  <button key={i} onClick={() => setPic(i)} aria-label={`Photo ${i + 1}`}
                    className={`relative h-14 w-12 overflow-hidden rounded-md border-2 ${i === pic ? 'border-brand' : 'border-transparent'}`}>
                    <Image src={img(im, 120)} alt="" fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold leading-tight">{j.name}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-md px-2 text-xl text-mute">×</button>
            </div>
            <p className="mt-1 text-sm text-mute">{[j.club, j.season, j.type, j.version].filter(Boolean).join(' • ')}</p>
            <p className="mt-3 text-2xl font-bold">{inr(j.price)}</p>
            {j.description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mute">{j.description}</p>}

            <p className="mt-5 text-sm font-semibold">Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const ok = j.sizes?.includes(s) && !sold;
                return (
                  <button key={s} disabled={!ok} onClick={() => setSize(s)} aria-pressed={size === s}
                    className={`h-10 min-w-[2.75rem] rounded-lg border px-3 text-sm font-semibold ${size === s ? 'border-ink bg-ink text-white' : 'border-line'} disabled:text-mute/50 disabled:line-through`}>
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex gap-2 pt-6">
              <button onClick={buy} disabled={sold || !size}
                className="flex-1 rounded-lg bg-[#1FA855] py-3 text-sm font-bold text-white disabled:bg-line disabled:text-mute">
                {sold ? 'Sold out' : size ? 'Buy on WhatsApp' : 'Select a size'}
              </button>
              <button onClick={share} className="rounded-lg border border-line px-5 py-3 text-sm font-bold">Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
