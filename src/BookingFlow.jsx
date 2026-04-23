import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Check, ChevronRight, Info, Mail, Phone, User, Building2, MessageSquare, Sparkles, Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Manrope:wght@300;400;500;600;700;800&display=swap');
  .font-display { font-family: 'Fraunces', Georgia, serif; }
  .font-body { font-family: 'Manrope', system-ui, sans-serif; }
`;

const PRICES = {
  onboarding: { light: 390, full: 890 },
  package: { starter: 490, standard: 890, pro: 1590, enterprise: 2890 },
  module: { A: 90, B: 290, C: 790, D: 2400 },
  addons: {
    cm: { '4h': 360, '8h': 680, '15h': 1200 },
    ads: 390,
    blog: 240,
    newsletter: 290,
  },
  discount: { '3': 0, '6': 0.05, '12': 0.10 }
};

const LABELS = {
  platform: { meta: 'Instagram + Facebook', linkedin: 'LinkedIn' },
  onboarding: { light: 'Onboarding Light', full: 'Onboarding Full' },
  package: { starter: 'Social Starter', standard: 'Social Standard', pro: 'Social Pro', enterprise: 'Social Enterprise' },
  module: { A: 'Modul A · UGC-Briefing', B: 'Modul B · Foto-Shoot Quartal', C: 'Modul C · Content-Tag Quartal', D: 'Modul D · Content-Tag monatlich' },
  cm: { '4h': 'Community 4 h / Monat', '8h': 'Community 8 h / Monat', '15h': 'Community 15 h / Monat' },
};

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const SelectCard = ({ selected, onClick, children, accent = 'dark', disabled = false }) => {
  const accentColor = {
    starter: '#E59A82', standard: '#F2CBB8', pro: '#2E3A4A', enterprise: '#1A2330',
    modA: '#B8B5AB', modB: '#9FA88B', modC: '#5F6B50', modD: '#3A4233',
    dark: '#1A1D24', light: '#D4A78B',
  }[accent] || '#1A1D24';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative text-left w-full p-5 rounded-2xl border-2 transition-all duration-200 ${
        selected ? 'bg-white shadow-md scale-[1.01]' : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={selected ? { borderColor: accentColor } : {}}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </div>
      )}
      {children}
    </button>
  );
};

const SectionHeader = ({ num, title, subtitle, required }) => (
  <div className="mb-5 flex items-baseline justify-between gap-3 flex-wrap">
    <div className="flex items-baseline gap-3">
      <span className="font-display text-sm text-stone-500 tracking-wide">{num}</span>
      <h2 className="font-display text-2xl text-stone-900">{title}</h2>
      {required && <span className="text-[10px] font-bold tracking-widest uppercase text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Pflicht</span>}
    </div>
    {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
  </div>
);

export default function BookingFlow() {
  const [platform, setPlatform] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [mod, setMod] = useState(null);
  const [addons, setAddons] = useState({ cm: null, ads: false, blog: false, newsletter: false });
  const [duration, setDuration] = useState('6');
  const [contact, setContact] = useState({ name: '', email: '', company: '', phone: '', message: '', consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
const sidebarRef = useRef(null);
const [sidebarOffset, setSidebarOffset] = useState(0);

  // Höhen-Auto-Anpassung fürs iFrame
  useEffect(() => {
    const sendHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.scrollHeight;
        window.parent.postMessage({ type: 'lennart-booking-height', height }, '*');
      }
    };
    sendHeight();
    const observer = new ResizeObserver(sendHeight);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  });

// Sidebar folgt dem Scroll des Parent-Fensters (WordPress)
useEffect(() => {
    const calculateOffset = (scrollY, iframeTop) => {
      if (!sidebarRef.current || !containerRef.current) return 0;
      const sidebarHeight = sidebarRef.current.offsetHeight;
      const containerHeight = containerRef.current.scrollHeight;
      const sidebarInitialTop = sidebarRef.current.offsetTop;
      
      const relativeScroll = scrollY - iframeTop;
      let offset = 0;
      
      if (relativeScroll > sidebarInitialTop) {
        const maxOffset = containerHeight - sidebarHeight - sidebarInitialTop - 100;
        offset = Math.min(relativeScroll - sidebarInitialTop, maxOffset);
      }
      
      return window.innerWidth >= 1024 ? offset : 0;
    };

    // Fall 1: Im iFrame – hört auf Parent-Scroll-Nachrichten
    const handleParentScroll = (event) => {
      if (event.data && event.data.type === 'parent-scroll') {
        setSidebarOffset(calculateOffset(event.data.scrollY, event.data.iframeTop));
      }
    };
    
    // Fall 2: Direkter Aufruf (kein iFrame) – hört auf eigenen Window-Scroll
    const handleOwnScroll = () => {
      // Nur aktivieren, wenn wir NICHT in einem iFrame sind
      if (window.self === window.top) {
        setSidebarOffset(calculateOffset(window.scrollY, 0));
      }
    };
    
    window.addEventListener('message', handleParentScroll);
    window.addEventListener('scroll', handleOwnScroll, { passive: true });
    
    // Initial ausführen
    handleOwnScroll();
    
    return () => {
      window.removeEventListener('message', handleParentScroll);
      window.removeEventListener('scroll', handleOwnScroll);
    };
  }, []);
  
  const calc = useMemo(() => {
    const pkgPrice = pkg ? PRICES.package[pkg] : 0;
    const modPrice = mod ? PRICES.module[mod] : 0;
    const cmPrice = addons.cm ? PRICES.addons.cm[addons.cm] : 0;
    const adsPrice = addons.ads ? PRICES.addons.ads : 0;
    const blogPrice = addons.blog ? PRICES.addons.blog : 0;
    const newsletterPrice = addons.newsletter ? PRICES.addons.newsletter : 0;
    const base = pkgPrice + modPrice + cmPrice + adsPrice + blogPrice + newsletterPrice;
    const disc = base * PRICES.discount[duration];
    const final = base - disc;
    const onb = onboarding ? PRICES.onboarding[onboarding] : 0;
    return {
      monthlyBase: base, discountAmount: disc, discountPct: PRICES.discount[duration] * 100,
      monthlyFinal: final, onboardingFee: onb, firstMonth: onb + final,
      contractTotal: final * parseInt(duration) + onb,
    };
  }, [pkg, mod, addons, duration, onboarding]);

  const canSubmit = platform && onboarding && pkg && mod && contact.name && contact.email && contact.company && contact.consent;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        platform: LABELS.platform[platform],
        onboarding: { name: LABELS.onboarding[onboarding], price: PRICES.onboarding[onboarding] },
        package: { name: LABELS.package[pkg], price: PRICES.package[pkg] },
        module: { name: LABELS.module[mod], price: PRICES.module[mod] },
        addons: {
          cm: addons.cm ? { name: LABELS.cm[addons.cm], price: PRICES.addons.cm[addons.cm] } : null,
          ads: addons.ads ? { name: 'Ads-Betreuung', price: PRICES.addons.ads } : null,
          blog: addons.blog ? { name: 'Blog-Repurposing', price: PRICES.addons.blog } : null,
          newsletter: addons.newsletter ? { name: 'Newsletter-Produktion', price: PRICES.addons.newsletter } : null,
        },
        duration,
        calc,
        contact,
      };
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Versand fehlgeschlagen');
      setSubmitted(true);
    } catch (e) {
      setError('Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut oder melde dich direkt per E-Mail.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setPlatform(null); setOnboarding(null); setPkg(null); setMod(null);
    setAddons({ cm: null, ads: false, blog: false, newsletter: false });
    setDuration('6');
    setContact({ name: '', email: '', company: '', phone: '', message: '', consent: false });
    setSubmitted(false); setError(null);
  };

  if (submitted) {
    return (
      <div ref={containerRef} className="font-body bg-stone-100 p-6 lg:p-12">
        <style>{fontStyle}</style>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 lg:p-16 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <Check size={32} className="text-emerald-700" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl lg:text-5xl text-stone-900 leading-tight mb-4">Anfrage eingegangen.</h1>
          <p className="text-stone-600 text-lg mb-10">Danke, {contact.name.split(' ')[0]}. Wir melden uns innerhalb von 24 Stunden bei dir.</p>
          <div className="bg-stone-50 rounded-2xl p-6 lg:p-8 mb-8">
            <h3 className="font-display text-xl mb-4">Deine Auswahl</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Plattform</dt><dd className="font-medium text-stone-900">{LABELS.platform[platform]}</dd></div>
              <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Onboarding</dt><dd className="font-medium text-stone-900">{LABELS.onboarding[onboarding]} · {fmt(PRICES.onboarding[onboarding])}</dd></div>
              <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Paket</dt><dd className="font-medium text-stone-900">{LABELS.package[pkg]}</dd></div>
              <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Modul</dt><dd className="font-medium text-stone-900">{LABELS.module[mod]}</dd></div>
              {addons.cm && <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Community</dt><dd className="font-medium text-stone-900">{LABELS.cm[addons.cm]}</dd></div>}
              {addons.ads && <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Ads</dt><dd className="font-medium text-stone-900">Pauschale 390 €</dd></div>}
              {addons.blog && <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Blog</dt><dd className="font-medium text-stone-900">240 €/Monat</dd></div>}
              {addons.newsletter && <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Newsletter</dt><dd className="font-medium text-stone-900">290 €/Monat</dd></div>}
              <div className="flex justify-between py-2 border-b border-stone-200"><dt className="text-stone-500">Laufzeit</dt><dd className="font-medium text-stone-900">{duration} Monate</dd></div>
              <div className="flex justify-between py-3 mt-2"><dt className="font-display text-lg text-stone-900">Monatlich</dt><dd className="font-display text-2xl text-stone-900">{fmt(calc.monthlyFinal)}</dd></div>
            </dl>
          </div>
          <button onClick={resetAll} className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-2">
            <ArrowLeft size={16} /> Neue Anfrage starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="font-body bg-stone-100">
      <style>{fontStyle}</style>
      <div className="max-w-7xl mx-auto p-6 lg:p-12">

        <header className="mb-10 pb-8 border-b border-stone-200 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs tracking-widest text-stone-500 uppercase font-semibold mb-2">Social Media Anfrage</div>
            <h1 className="font-display text-4xl lg:text-6xl text-stone-900 leading-none">Angebot <em className="italic font-light text-stone-500">konfigurieren</em></h1>
          </div>
          <div className="text-right">
            <div className="font-display italic text-2xl text-stone-900">LennArt</div>
            <div className="text-xs text-stone-500 tracking-wide">Productions · Lebach</div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">

            <section>
              <SectionHeader num="01" title="Plattform wählen" required subtitle="Eine Plattform pro Paket" />
              <div className="grid grid-cols-2 gap-3">
                <SelectCard selected={platform === 'meta'} onClick={() => setPlatform('meta')}>
                  <div className="font-display text-lg text-stone-900 mb-1">Instagram + Facebook</div>
                  <div className="text-xs text-stone-500">Meta-Netzwerk · gleiches Format</div>
                </SelectCard>
                <SelectCard selected={platform === 'linkedin'} onClick={() => setPlatform('linkedin')}>
                  <div className="font-display text-lg text-stone-900 mb-1">LinkedIn</div>
                  <div className="text-xs text-stone-500">Business-Netzwerk · Thought Leadership</div>
                </SelectCard>
              </div>
              <p className="text-xs text-stone-500 mt-3 flex items-center gap-2"><Info size={12} /> TikTok und YouTube auf Anfrage.</p>
            </section>

            <section>
              <SectionHeader num="02" title="Onboarding" required subtitle="Einmalige Einrichtung" />
              <div className="grid md:grid-cols-2 gap-3">
                <SelectCard selected={onboarding === 'light'} onClick={() => setOnboarding('light')} accent="light">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-1">Einmalig</div>
                      <div className="font-display text-xl text-stone-900">Onboarding Light</div>
                    </div>
                    <div className="font-display text-2xl text-stone-900">390 €</div>
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">Bestehende Kanäle, vorhandenes CD. Strategie-Call, Zielgruppenanalyse, Kanal-Audit, Redaktionsplan.</div>
                </SelectCard>
                <SelectCard selected={onboarding === 'full'} onClick={() => setOnboarding('full')} accent="enterprise">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-1">Einmalig</div>
                      <div className="font-display text-xl text-stone-900">Onboarding Full</div>
                    </div>
                    <div className="font-display text-2xl text-stone-900">890 €</div>
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">Ohne Kanäle oder Relaunch. Alles aus Light + Kanal-Erstellung, Brand Guidelines, Bio-Setup.</div>
                </SelectCard>
              </div>
            </section>

            <section>
              <SectionHeader num="03" title="Basis-Paket" required subtitle="Verwertung & Posting" />
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { id: 'starter', name: 'Social Starter', posts: '4 Beiträge / Monat', reels: '1 Reel', price: 490, accent: 'starter' },
                  { id: 'standard', name: 'Social Standard', posts: '8 Beiträge / Monat', reels: '3 Reels · Stories 2×/W', price: 890, accent: 'standard' },
                  { id: 'pro', name: 'Social Pro', posts: '16 Beiträge / Monat', reels: '6 Reels · Stories 4×/W', price: 1590, accent: 'pro', badge: 'Empfohlen' },
                  { id: 'enterprise', name: 'Social Enterprise', posts: '20+ Beiträge / Monat', reels: 'Multi-Brand · individuell', price: 2890, prefix: 'ab', accent: 'enterprise' },
                ].map(p => (
                  <SelectCard key={p.id} selected={pkg === p.id} onClick={() => setPkg(p.id)} accent={p.accent}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {p.badge && <div className="inline-block text-[9px] tracking-widest uppercase font-bold text-white bg-stone-900 px-2 py-0.5 rounded-full mb-2">{p.badge}</div>}
                        <div className="font-display text-xl text-stone-900">{p.name}</div>
                      </div>
                      <div className="font-display text-2xl text-stone-900 whitespace-nowrap">
                        {p.prefix && <span className="text-sm">{p.prefix} </span>}{fmt(p.price)}
                      </div>
                    </div>
                    <div className="text-sm text-stone-700 font-medium">{p.posts}</div>
                    <div className="text-xs text-stone-500">{p.reels}</div>
                  </SelectCard>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader num="04" title="Content-Modul" required subtitle="Woher kommt das Material?" />
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { id: 'A', name: 'UGC-Briefing', desc: 'Kunde liefert Rohmaterial nach monatlicher Shotlist. Bei Nichtlieferung Stock-Fallback.', price: 90, accent: 'modA' },
                  { id: 'B', name: 'Foto-Shoot Quartal', desc: '1× pro Quartal 3h Foto-Termin. 30–50 bearbeitete Bilder. Keine Videos.', price: 290, accent: 'modB' },
                  { id: 'C', name: 'Content-Tag Quartal', desc: '1× pro Quartal ganztägiger Dreh (Foto + Video). ~40 Assets, 8–12 Reels.', price: 790, accent: 'modC' },
                  { id: 'D', name: 'Content-Tag monatlich', desc: 'Monatlich voller Content-Tag inkl. Schnitt, Musik, Farbkorrektur, Sound.', price: 2400, accent: 'modD', premium: true },
                ].map(m => (
                  <SelectCard key={m.id} selected={mod === m.id} onClick={() => setMod(m.id)} accent={m.accent}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-1">Modul {m.id}{m.premium ? ' · Premium' : ''}</div>
                        <div className="font-display text-xl text-stone-900">{m.name}</div>
                      </div>
                      <div className="font-display text-2xl text-stone-900 whitespace-nowrap">+ {fmt(m.price)}</div>
                    </div>
                    <div className="text-xs text-stone-600 leading-relaxed">{m.desc}</div>
                  </SelectCard>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader num="05" title="Add-ons" subtitle="Optional, frei kombinierbar" />
              <div className="mb-4">
                <div className="text-sm font-semibold text-stone-900 mb-2 flex items-center justify-between">
                  <span>Community Management</span>
                  {addons.cm && <button onClick={() => setAddons(a => ({ ...a, cm: null }))} className="text-xs text-stone-500 hover:text-stone-900">Entfernen</button>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ id: '4h', label: '4 h / Monat', price: 360 }, { id: '8h', label: '8 h / Monat', price: 680 }, { id: '15h', label: '15 h / Monat', price: 1200 }].map(t => (
                    <SelectCard key={t.id} selected={addons.cm === t.id} onClick={() => setAddons(a => ({ ...a, cm: a.cm === t.id ? null : t.id }))}>
                      <div className="text-sm font-medium text-stone-900">{t.label}</div>
                      <div className="font-display text-xl text-stone-900 mt-1">{fmt(t.price)}</div>
                      <div className="text-[10px] text-stone-500">/ Monat</div>
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <SelectCard selected={addons.ads} onClick={() => setAddons(a => ({ ...a, ads: !a.ads }))}>
                  <div className="flex items-start justify-between mb-2">
                    <div><div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-1">Performance</div><div className="font-display text-lg text-stone-900">Ads-Betreuung</div></div>
                    <div className="font-display text-xl text-stone-900">390 €</div>
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">Monatspauschale. Neue Kampagnen zusätzlich 89 € je Aufsatz. Ad-Budget zahlt Kunde direkt.</div>
                </SelectCard>
                <SelectCard selected={addons.blog} onClick={() => setAddons(a => ({ ...a, blog: !a.blog }))}>
                  <div className="flex items-start justify-between mb-2">
                    <div><div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-1">Repurposing</div><div className="font-display text-lg text-stone-900">Blog-Repurposing</div></div>
                    <div className="font-display text-xl text-stone-900">240 €</div>
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">2 SEO-Blogartikel pro Monat aus Social-Inhalten. Direkt ins CMS eingepflegt.</div>
                </SelectCard>
                <SelectCard selected={addons.newsletter} onClick={() => setAddons(a => ({ ...a, newsletter: !a.newsletter }))}>
                  <div className="flex items-start justify-between mb-2">
                    <div><div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-1">Repurposing</div><div className="font-display text-lg text-stone-900">Newsletter-Produktion</div></div>
                    <div className="font-display text-xl text-stone-900">290 €</div>
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">1 Newsletter monatlich. Text, Design, fertiger Entwurf. Versand übernimmt Kunde.</div>
                </SelectCard>
                <div className="p-5 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50">
                  <div className="text-[10px] tracking-widest uppercase font-bold text-stone-500 mb-2">Auf Anfrage</div>
                  <div className="font-display text-lg text-stone-700 mb-2">Einzelposten</div>
                  <div className="text-xs text-stone-600 leading-relaxed">Zusatz-Reel (140 €), Spontan-Dreh (ab 390 €), Workshop-Tag (890 €) ad-hoc dazubuchbar.</div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeader num="06" title="Laufzeit" subtitle="Commitment senkt die monatlichen Kosten" />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '3', label: '3 Monate', disc: '0 %', sub: 'Mindestlaufzeit', desc: 'Verlängerung nur auf aktive Zustimmung' },
                  { id: '6', label: '6 Monate', disc: '5 %', sub: 'Empfohlen', desc: 'Rabatt auf laufende Kosten' },
                  { id: '12', label: '12 Monate', disc: '10 %', sub: 'Beste Ersparnis', desc: 'Rabatt auf laufende Kosten' },
                ].map(d => (
                  <button key={d.id} onClick={() => setDuration(d.id)} className={`text-left p-5 rounded-2xl border-2 transition-all ${duration === d.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200 hover:border-stone-400'}`}>
                    <div className={`text-[10px] tracking-widest uppercase font-bold mb-2 ${duration === d.id ? 'text-stone-400' : 'text-stone-500'}`}>{d.sub}</div>
                    <div className="font-display text-lg mb-1">{d.label}</div>
                    <div className="font-display text-3xl mb-1">{d.disc}</div>
                    <div className={`text-xs ${duration === d.id ? 'text-stone-300' : 'text-stone-500'}`}>{d.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-3 flex items-start gap-2"><Info size={12} className="mt-0.5 flex-shrink-0" /> Rabatt gilt auf Paket, Content-Modul und laufende Add-ons. Nicht auf Onboarding oder Einzelposten.</p>
            </section>

            <section>
              <SectionHeader num="07" title="Kontaktdaten" required />
              <div className="bg-white rounded-2xl p-6 space-y-4 border border-stone-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-2"><User size={12} /> Name *</span>
                    <input type="text" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:outline-none text-sm" placeholder="Max Mustermann" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-2"><Building2 size={12} /> Firma *</span>
                    <input type="text" value={contact.company} onChange={e => setContact({ ...contact, company: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:outline-none text-sm" placeholder="Musterfirma GmbH" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-2"><Mail size={12} /> E-Mail *</span>
                    <input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:outline-none text-sm" placeholder="max@musterfirma.de" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-2"><Phone size={12} /> Telefon (optional)</span>
                    <input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:outline-none text-sm" placeholder="+49 …" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-2"><MessageSquare size={12} /> Anmerkungen (optional)</span>
                  <textarea value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:outline-none text-sm resize-none" placeholder="Besonderheiten, Wunschtermin für Erstgespräch …" />
                </label>
                <label className="flex items-start gap-3 text-xs text-stone-600 cursor-pointer">
                  <input type="checkbox" checked={contact.consent} onChange={e => setContact({ ...contact, consent: e.target.checked })} className="mt-0.5" />
                  <span>Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden.</span>
                </label>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
             <div ref={sidebarRef} style={{ transform: `translateY(${sidebarOffset}px)`, transition: 'transform 0.1s ease-out' }} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={16} className="text-amber-600" />
                <h3 className="font-display text-xl text-stone-900">Dein Angebot</h3>
              </div>
              <div className="space-y-3 text-sm">
                {platform && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><span className="text-stone-500 text-xs">Plattform</span><span className="font-medium text-stone-900 text-right text-xs">{LABELS.platform[platform]}</span></div>}
                {onboarding && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">{LABELS.onboarding[onboarding]}</div><div className="text-stone-400 text-[10px]">einmalig</div></div><span className="font-medium text-stone-900 text-xs">{fmt(PRICES.onboarding[onboarding])}</span></div>}
                {pkg && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">{LABELS.package[pkg]}</div><div className="text-stone-400 text-[10px]">Basispaket</div></div><span className="font-medium text-stone-900 text-xs">{pkg === 'enterprise' ? 'ab ' : ''}{fmt(PRICES.package[pkg])}</span></div>}
                {mod && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">{LABELS.module[mod]}</div><div className="text-stone-400 text-[10px]">Content</div></div><span className="font-medium text-stone-900 text-xs">+ {fmt(PRICES.module[mod])}</span></div>}
                {addons.cm && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">{LABELS.cm[addons.cm]}</div><div className="text-stone-400 text-[10px]">Add-on</div></div><span className="font-medium text-stone-900 text-xs">+ {fmt(PRICES.addons.cm[addons.cm])}</span></div>}
                {addons.ads && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">Ads-Betreuung</div><div className="text-stone-400 text-[10px]">Add-on</div></div><span className="font-medium text-stone-900 text-xs">+ {fmt(PRICES.addons.ads)}</span></div>}
                {addons.blog && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">Blog-Repurposing</div><div className="text-stone-400 text-[10px]">Add-on</div></div><span className="font-medium text-stone-900 text-xs">+ {fmt(PRICES.addons.blog)}</span></div>}
                {addons.newsletter && <div className="flex justify-between items-start pb-2 border-b border-stone-100"><div><div className="text-stone-900 font-medium text-xs">Newsletter</div><div className="text-stone-400 text-[10px]">Add-on</div></div><span className="font-medium text-stone-900 text-xs">+ {fmt(PRICES.addons.newsletter)}</span></div>}
                {!pkg && !mod && !onboarding && <div className="text-stone-400 text-xs italic py-4 text-center">Noch nichts ausgewählt</div>}
              </div>
              {calc.monthlyBase > 0 && (
                <div className="mt-5 pt-5 border-t border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-500"><span>Laufend monatlich</span><span>{fmt(calc.monthlyBase)}</span></div>
                  {calc.discountPct > 0 && <div className="flex justify-between text-emerald-700 font-medium"><span>Rabatt ({calc.discountPct}%)</span><span>− {fmt(calc.discountAmount)}</span></div>}
                  <div className="flex justify-between items-baseline pt-2 border-t border-stone-100"><span className="font-display text-sm text-stone-900">Monatlich</span><span className="font-display text-2xl text-stone-900">{fmt(calc.monthlyFinal)}</span></div>
                  {calc.onboardingFee > 0 && (<>
                    <div className="flex justify-between text-stone-500 pt-2"><span>+ Onboarding einmalig</span><span>{fmt(calc.onboardingFee)}</span></div>
                    <div className="flex justify-between items-baseline bg-amber-50 p-3 rounded-lg mt-2"><span className="text-xs text-stone-700 font-medium">Erster Monat gesamt</span><span className="font-display text-lg text-stone-900">{fmt(calc.firstMonth)}</span></div>
                  </>)}
                  <div className="flex justify-between text-[10px] text-stone-400 pt-2"><span>Gesamtvolumen {duration} Monate</span><span>{fmt(calc.contractTotal)}</span></div>
                  <div className="text-[10px] text-stone-400 italic pt-1">Alle Preise zzgl. 19 % MwSt.</div>
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <button onClick={handleSubmit} disabled={!canSubmit || submitting} className={`w-full mt-6 py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${canSubmit && !submitting ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
                {submitting ? (<><Loader2 size={16} className="animate-spin" /> Wird gesendet …</>) : canSubmit ? (<>Unverbindliche Anfrage senden <ChevronRight size={16} /></>) : (<><Lock size={14} /> Auswahl unvollständig</>)}
              </button>
              {!canSubmit && !submitting && (
                <div className="mt-3 text-[11px] text-stone-500 space-y-1">
                  {!platform && <div>• Plattform wählen</div>}
                  {!onboarding && <div>• Onboarding wählen</div>}
                  {!pkg && <div>• Basis-Paket wählen</div>}
                  {!mod && <div>• Content-Modul wählen</div>}
                  {(!contact.name || !contact.email || !contact.company) && <div>• Kontaktdaten ausfüllen</div>}
                  {!contact.consent && <div>• Zustimmung erteilen</div>}
                </div>
              )}
            </div>
          </aside>
        </div>

        <footer className="mt-16 pt-8 border-t border-stone-200 text-xs text-stone-500 flex justify-between flex-wrap gap-2">
          <span className="font-display italic text-base text-stone-700">LennArt Productions</span>
          <span>Konfigurator 2026</span>
        </footer>
      </div>
    </div>
  );
}
