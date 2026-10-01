import { ACTIVITIES, GOALS, PERSON_ALLERGENS, PET_ALLERGENS, PET_HEALTH, SPECIES, t, UI, WEEKDAYS } from '../i18n';
import type { L, Lang, PersonInput, PetInput } from '../types';

function Seg<K extends string>({ options, value, onChange, lang }: { options: Record<K, L>; value: K; onChange: (k: K) => void; lang: Lang }) {
  return (
    <div className="seg" role="radiogroup">
      {(Object.keys(options) as K[]).map((k) => (
        <button type="button" role="radio" aria-checked={value === k} key={k} className={value === k ? 'seg-on' : ''} onClick={() => onChange(k)}>
          {t(options[k], lang)}
        </button>
      ))}
    </div>
  );
}

function Multi<K extends string>({ options, value, onChange, lang }: { options: Record<K, L>; value: K[]; onChange: (k: K[]) => void; lang: Lang }) {
  return (
    <div className="chips">
      {(Object.keys(options) as K[]).map((k) => {
        const on = value.includes(k);
        return (
          <button type="button" key={k} aria-pressed={on} className={on ? 'chip chip-on' : 'chip'} onClick={() => onChange(on ? value.filter((x) => x !== k) : [...value, k])}>
            {t(options[k], lang)}
          </button>
        );
      })}
    </div>
  );
}

function Num({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" inputMode="decimal" value={Number.isNaN(value) ? '' : value} min={min} max={max} step={step} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <span>{label}</span>
      {children}
    </div>
  );
}

const clamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo);

export function sanitizePerson(p: PersonInput): PersonInput {
  return {
    ...p,
    age: clamp(p.age, 15, 100),
    heightCm: clamp(p.heightCm, 120, 230),
    weightKg: clamp(p.weightKg, 30, 250),
    budgetKRW: clamp(p.budgetKRW, 3000, 200000),
    days: clamp(Math.round(p.days), 1, 14),
  };
}

export function sanitizePet(p: PetInput): PetInput {
  return { ...p, ageYears: clamp(p.ageYears, 0.1, 30), weightKg: clamp(p.weightKg, 0.5, 90) };
}

export function PersonForm({ value, onChange, onSubmit, lang }: { value: PersonInput; onChange: (v: PersonInput) => void; onSubmit: () => void; lang: Lang }) {
  const set = <K extends keyof PersonInput>(k: K, v: PersonInput[K]) => onChange({ ...value, [k]: v });
  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h2>{t(UI.personFormTitle, lang)}</h2>

      <fieldset>
        <legend>{t(UI.bodyInfo, lang)}</legend>
        <Field label={t(UI.sex, lang)}>
          <Seg options={{ male: UI.male, female: UI.female }} value={value.sex} onChange={(v) => set('sex', v)} lang={lang} />
        </Field>
        <div className="grid3">
          <Num label={t(UI.age, lang)} value={value.age} onChange={(n) => set('age', n)} min={15} max={100} />
          <Num label={t(UI.height, lang)} value={value.heightCm} onChange={(n) => set('heightCm', n)} min={120} max={230} />
          <Num label={t(UI.weight, lang)} value={value.weightKg} onChange={(n) => set('weightKg', n)} min={30} max={250} step={0.1} />
        </div>
        <Field label={t(UI.goal, lang)}>
          <Seg options={GOALS} value={value.goal} onChange={(v) => set('goal', v)} lang={lang} />
        </Field>
        <Field label={t(UI.activity, lang)}>
          <Seg options={ACTIVITIES} value={value.activity} onChange={(v) => set('activity', v)} lang={lang} />
        </Field>
      </fieldset>

      <fieldset>
        <legend>{t(UI.preferences, lang)}</legend>
        <div className="grid2">
          <label className="field">
            <span>{t(UI.likes, lang)}</span>
            <input value={value.likes} placeholder={t(UI.commaHint, lang)} onChange={(e) => set('likes', e.target.value)} />
          </label>
          <label className="field">
            <span>{t(UI.dislikes, lang)}</span>
            <input value={value.dislikes} placeholder={t(UI.commaHint, lang)} onChange={(e) => set('dislikes', e.target.value)} />
          </label>
        </div>
        <Field label={t(UI.allergies, lang)}>
          <Multi options={PERSON_ALLERGENS} value={value.allergies} onChange={(v) => set('allergies', v)} lang={lang} />
        </Field>
        <Num label={t(UI.budget, lang)} value={value.budgetKRW} onChange={(n) => set('budgetKRW', n)} min={3000} max={200000} step={1000} />
      </fieldset>

      <fieldset>
        <legend>{t(UI.period, lang)}</legend>
        <Seg options={{ days: UI.byDays, weekdays: UI.byWeekdays }} value={value.periodMode} onChange={(v) => set('periodMode', v)} lang={lang} />
        {value.periodMode === 'days' ? (
          <Num label={t(UI.daysCount, lang)} value={value.days} onChange={(n) => set('days', n)} min={1} max={14} />
        ) : (
          <Multi options={WEEKDAYS} value={value.weekdays} onChange={(v) => set('weekdays', v)} lang={lang} />
        )}
        <label className="check">
          <input type="checkbox" checked={value.lunchbox} onChange={(e) => set('lunchbox', e.target.checked)} />
          {t(UI.lunchbox, lang)}
        </label>
      </fieldset>

      <button type="submit" className="btn-primary btn-block">
        {t(UI.makePlan, lang)}
      </button>
    </form>
  );
}

export function PetForm({ value, onChange, onSubmit, lang }: { value: PetInput; onChange: (v: PetInput) => void; onSubmit: () => void; lang: Lang }) {
  const set = <K extends keyof PetInput>(k: K, v: PetInput[K]) => onChange({ ...value, [k]: v });
  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid2">
        <label className="field">
          <span>{t(UI.petName, lang)}</span>
          <input value={value.name} onChange={(e) => set('name', e.target.value)} />
        </label>
        <Field label={t(UI.species, lang)}>
          <Seg options={SPECIES} value={value.species} onChange={(v) => set('species', v)} lang={lang} />
        </Field>
      </div>
      <div className="grid2">
        <Num label={t(UI.ageYears, lang)} value={value.ageYears} onChange={(n) => set('ageYears', n)} min={0.1} max={30} step={0.1} />
        <Num label={t(UI.weight, lang)} value={value.weightKg} onChange={(n) => set('weightKg', n)} min={0.5} max={90} step={0.1} />
      </div>
      <Field label={t(UI.activity, lang)}>
        <Seg options={ACTIVITIES} value={value.activity} onChange={(v) => set('activity', v)} lang={lang} />
      </Field>
      <label className="check">
        <input type="checkbox" checked={value.neutered} onChange={(e) => set('neutered', e.target.checked)} />
        {t(UI.neutered, lang)}
      </label>
      <Field label={t(UI.health, lang)}>
        <Seg options={PET_HEALTH} value={value.health} onChange={(v) => set('health', v)} lang={lang} />
      </Field>
      <Field label={t(UI.allergies, lang)}>
        <Multi options={PET_ALLERGENS} value={value.allergies} onChange={(v) => set('allergies', v)} lang={lang} />
      </Field>
      <label className="field">
        <span>{t(UI.traits, lang)}</span>
        <input value={value.traits} placeholder={t(UI.traitsHint, lang)} onChange={(e) => set('traits', e.target.value)} />
      </label>
      <button type="submit" className="btn-primary btn-block">
        {t(UI.makePetPlan, lang)}
      </button>
    </form>
  );
}
