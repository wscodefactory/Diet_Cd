import { useState } from 'react';
import { sumItems } from '../engine/common';
import { t, UI } from '../i18n';
import type { FoodDef, Lang, Plan } from '../types';
import { ResearchList } from './Research';

export interface SwapTarget {
  day: number;
  meal: number;
  item: number;
}

interface Props {
  plan: Plan;
  lang: Lang;
  getAlternatives: (s: SwapTarget) => FoodDef[];
  onSwap: (s: SwapTarget, foodId: string) => void;
}

export function ResultView({ plan, lang, getAlternatives, onSwap }: Props) {
  const [day, setDay] = useState(0);
  const [showResearch, setShowResearch] = useState(false);
  const [swap, setSwap] = useState<SwapTarget | null>(null);
  const d = plan.days[Math.min(day, plan.days.length - 1)];
  const isPet = plan.kind === 'pet';
  const totals = sumItems(d.meals.flatMap((m) => m.items));
  const heroEmojis = [...new Set(d.meals.flatMap((m) => m.items.map((i) => i.emoji)))].slice(0, 7);

  return (
    <section className="result" aria-label={t(UI.resultTitle, lang)}>
      {plan.days.length > 1 && (
        <div className="day-tabs" role="tablist">
          {plan.days.map((x, k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === day}
              className={k === day ? 'chip chip-on' : 'chip'}
              onClick={() => setDay(k)}
            >
              {t(x.label, lang)}
            </button>
          ))}
        </div>
      )}

      {/* Photo + composition first */}
      <div className="hero">
        <div className="hero-plate" aria-hidden>
          {heroEmojis.map((e, k) => (
            <span key={k} className="hero-food" style={{ ['--k' as string]: k, ['--n' as string]: heroEmojis.length }}>
              {e}
            </span>
          ))}
        </div>
        <div className="hero-text">
          <h2>{t(d.label, lang)} · {totals.kcal.toLocaleString()} kcal</h2>
          <p className="hero-list">
            {d.meals
              .slice(0, isPet ? 1 : undefined)
              .map((m) => m.items.map((i) => t(i.name, lang)).join(' + '))
              .join(' / ')}
          </p>
          <p className="muted small">📷 {t(UI.photoNote, lang)}</p>
        </div>
      </div>

      {/* 1) meals */}
      <Section n={1} title={t(isPet ? UI.s1pet : UI.s1, lang)}>
        <div className="meals">
          {(isPet ? d.meals.slice(0, 1) : d.meals).map((m, mi) => (
            <div key={m.slot} className="meal">
              <div className="meal-head">
                <span>{isPet ? (lang === 'ko' ? `한 끼 구성 × ${d.meals.length}회` : `Each meal × ${d.meals.length}`) : t(m.label, lang)}</span>
                {m.lunchbox && <span className="badge">🍱 {t(UI.lunchboxBadge, lang)}</span>}
              </div>
              <ul>
                {m.items.map((it, ii) => (
                  <li key={it.foodId + ii} className="food">
                    <span className="food-emoji">{it.emoji}</span>
                    <span className="food-name">{t(it.name, lang)}</span>
                    <button type="button" className="btn-ghost" onClick={() => setSwap({ day, meal: mi, item: ii })}>
                      {t(UI.change, lang)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* 2) portions and nutrition */}
      <Section n={2} title={t(isPet ? UI.s2pet : UI.s2, lang)}>
        <div className="table-wrap">
          <table className="ntable">
            <thead>
              <tr>
                <th />
                <th>g</th>
                <th>kcal</th>
                <th>{t(UI.protein, lang)}</th>
                <th>{t(UI.carbs, lang)}</th>
                <th>{t(UI.fat, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {(isPet ? d.meals.slice(0, 1) : d.meals).flatMap((m) =>
                m.items.map((it, k) => (
                  <tr key={m.slot + k}>
                    <td>
                      {k === 0 && !isPet && <span className="muted small">{t(m.label, lang)} · </span>}
                      {t(it.name, lang)}
                    </td>
                    <td>{it.grams}</td>
                    <td>{it.kcal}</td>
                    <td>{it.protein}g</td>
                    <td>{it.carbs}g</td>
                    <td>{it.fat}g</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
        <div className="bars">
          <Bar label={`${t(UI.dayTotal, lang)} kcal`} value={totals.kcal} max={plan.targetKcal} unit="kcal" lang={lang} />
          {plan.targetProtein > 0 && <Bar label={t(UI.protein, lang)} value={totals.protein} max={plan.targetProtein} unit="g" lang={lang} />}
        </div>
        {!isPet && totals.costKRW > 0 && (
          <p className="small muted">
            {t(UI.estCost, lang)}: ₩{totals.costKRW.toLocaleString()}
          </p>
        )}
        {plan.feeding && (
          <div className="feeding">
            <h4>{t(UI.feeding, lang)}</h4>
            <ul>
              {plan.feeding.map((f, k) => (
                <li key={k}>{t(f, lang)}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* 3) reasons */}
      <Section n={3} title={t(isPet ? UI.s3pet : UI.s3person, lang)}>
        <ul className="reasons">
          {plan.reasons.map((r, k) => (
            <li key={k}>{t(r.text, lang)}</li>
          ))}
        </ul>
      </Section>

      {/* 4) conditions / excluded */}
      <Section n={4} title={t(UI.s4, lang)}>
        <div className="chips-block">
          <span className="chips-label">{t(UI.conditions, lang)}</span>
          <div className="chips">
            {plan.conditions.map((c, k) => (
              <span key={k} className="chip chip-static">✓ {t(c, lang)}</span>
            ))}
          </div>
        </div>
        <div className="chips-block">
          <span className="chips-label">{t(UI.excluded, lang)}</span>
          <div className="chips">
            {plan.excluded.length === 0 && <span className="muted">{t(UI.none, lang)}</span>}
            {plan.excluded.map((c, k) => (
              <span key={k} className="chip chip-excluded">✕ {t(c, lang)}</span>
            ))}
          </div>
        </div>
        <div className="notes">
          <strong>{t(UI.notes, lang)}</strong>
          <ul>
            {plan.notes.map((n, k) => (
              <li key={k}>{t(n, lang)}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 5) research */}
      <button type="button" className="btn-research" onClick={() => setShowResearch(!showResearch)} aria-expanded={showResearch}>
        📚 {showResearch ? t(UI.s5hide, lang) : t(UI.s5, lang)} ({plan.sourceIds.length})
      </button>
      {showResearch && <ResearchList ids={plan.sourceIds} lang={lang} />}

      {swap && (
        <SwapSheet
          lang={lang}
          current={d.meals[swap.meal]?.items[swap.item]?.foodId}
          options={getAlternatives(swap)}
          onClose={() => setSwap(null)}
          onPick={(id) => {
            onSwap(swap, id);
            setSwap(null);
          }}
        />
      )}
    </section>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="section">
      <h3 className="section-title">
        <span className="section-n">{n}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Bar({ label, value, max, unit, lang }: { label: string; value: number; max: number; unit: string; lang: Lang }) {
  const pct = Math.min(130, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="bar">
      <div className="bar-top">
        <span>{label}</span>
        <span>
          {value.toLocaleString()}
          {unit} / {t(UI.target, lang)} {max.toLocaleString()}
          {unit}
        </span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

function SwapSheet({
  lang,
  current,
  options,
  onClose,
  onPick,
}: {
  lang: Lang;
  current?: string;
  options: FoodDef[];
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const list = options.filter((o) => o.id !== current);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{t(UI.alternatives, lang)}</h3>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label={t(UI.close, lang)}>
            ✕
          </button>
        </div>
        {list.length === 0 && <p className="muted">{t(UI.noAlternatives, lang)}</p>}
        <ul className="alt-list">
          {list.map((o) => (
            <li key={o.id} className="alt">
              <span className="food-emoji">{o.emoji}</span>
              <div className="alt-body">
                <strong>{t(o.name, lang)}</strong>
                <span className="small muted">
                  {o.baseGrams}g · {o.kcal}kcal · {t(UI.protein, lang)} {o.protein}g
                  {o.costKRW ? ` · ₩${o.costKRW.toLocaleString()}` : ''}
                </span>
              </div>
              <button type="button" className="btn-primary btn-sm" onClick={() => onPick(o.id)}>
                {t(UI.select, lang)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
