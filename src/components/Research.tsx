import { useState } from 'react';
import { SOURCES } from '../data/sources';
import { t, UI } from '../i18n';
import type { Lang } from '../types';

export function ResearchList({ ids, lang }: { ids: string[]; lang: Lang }) {
  return (
    <div className="research">
      <p className="research-intro">{t(UI.researchIntro, lang)}</p>
      <div className="research-grid">
        {ids.map((id) => SOURCES[id] && <ResearchCard key={id} id={id} lang={lang} />)}
      </div>
    </div>
  );
}

function ResearchCard({ id, lang }: { id: string; lang: Lang }) {
  const s = SOURCES[id];
  const [open, setOpen] = useState(false);
  return (
    <article className="rcard">
      <header className="rcard-head">
        <span className="badge badge-example">{t(UI.exampleBadge, lang)}</span>
        <span className="rcard-subject">{t(s.subject, lang)}</span>
      </header>
      <h4 className="rcard-title">{t(s.title, lang)}</h4>
      <p className="rcard-applied">
        <strong>{t(UI.rApplied, lang)}</strong> {t(s.applied, lang)}
      </p>
      <div className="split">
        <div className="split-box split-research">
          <span className="split-label">📖 {t(UI.rFinding, lang)}</span>
          <p>{t(s.finding, lang)}</p>
        </div>
        <div className="split-box split-ai">
          <span className="split-label">🤖 {t(UI.rAi, lang)}</span>
          <p>{t(s.aiJudgment, lang)}</p>
        </div>
      </div>
      {open && (
        <dl className="rcard-meta">
          <dt>{t(UI.rYear, lang)}</dt>
          <dd>{s.year}</dd>
          <dt>{t(UI.rPublisher, lang)}</dt>
          <dd>{t(s.publisher, lang)}</dd>
          <dt>{t(UI.rLink, lang)}</dt>
          <dd>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a> : <span className="muted">{t(UI.rNoLink, lang)}</span>}</dd>
          <dt>{t(UI.rTarget, lang)}</dt>
          <dd>{t(s.subject, lang)}</dd>
          <dt>{t(UI.rScope, lang)}</dt>
          <dd>{t(s.scope, lang)}</dd>
          <dt>{t(UI.rLimits, lang)}</dt>
          <dd>{t(s.limits, lang)}</dd>
        </dl>
      )}
      <button type="button" className="link-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? t(UI.less, lang) : t(UI.more, lang)} {open ? '▴' : '▾'}
      </button>
    </article>
  );
}
