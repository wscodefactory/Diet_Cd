import { useEffect, useRef, useState } from 'react';
import { PersonForm, PetForm, sanitizePerson, sanitizePet } from './components/Forms';
import { ResultView, type SwapTarget } from './components/ResultView';
import { buildPersonPlan, composePersonDay, personCandidates, personFoodById } from './engine/person';
import { buildPetPlan, composePetDay, lifeStage, petCandidates, petFoodById } from './engine/pet';
import { LIFE_STAGES, SPECIES, t, UI } from './i18n';
import type { FoodDef, Lang, PersonInput, PetInput, Plan, Target } from './types';

const DEFAULT_PERSON: PersonInput = {
  sex: 'female',
  age: 30,
  heightCm: 163,
  weightKg: 60,
  goal: 'lose',
  activity: 'mid',
  likes: '',
  dislikes: '',
  allergies: [],
  budgetKRW: 20000,
  periodMode: 'days',
  days: 3,
  weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  lunchbox: true,
};

const newPet = (n: number): PetInput => ({
  id: `pet-${Date.now().toString(36)}-${n}`,
  name: n === 0 ? '초코' : `반려동물 ${n + 1}`,
  species: 'dog',
  ageYears: 3,
  weightKg: 8,
  activity: 'mid',
  neutered: true,
  health: 'normal',
  allergies: [],
  traits: '',
});

interface Saved {
  lang: Lang;
  target: Target;
  person: PersonInput;
  personPlan: Plan | null;
  pets: PetInput[];
  petPlans: Record<string, Plan>;
  selectedPet: string | null;
}

const KEY = 'diet-cd/v1';

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const saved = useRef(load()).current;
  const [lang, setLang] = useState<Lang>(saved?.lang ?? 'ko');
  const [target, setTarget] = useState<Target>(saved?.target ?? 'person');
  const [person, setPerson] = useState<PersonInput>(saved?.person ?? DEFAULT_PERSON);
  const [personPlan, setPersonPlan] = useState<Plan | null>(saved?.personPlan ?? null);
  const [pets, setPets] = useState<PetInput[]>(saved?.pets ?? [newPet(0)]);
  const [petPlans, setPetPlans] = useState<Record<string, Plan>>(saved?.petPlans ?? {});
  const [selectedPet, setSelectedPet] = useState<string | null>(saved?.selectedPet ?? null);
  const resultRef = useRef<HTMLDivElement>(null);

  const pet = pets.find((p) => p.id === selectedPet) ?? pets[0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.target = target;
  }, [lang, target]);

  useEffect(() => {
    try {
      const s: Saved = { lang, target, person, personPlan, pets, petPlans, selectedPet };
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable: app still works for this visit */
    }
  }, [lang, target, person, personPlan, pets, petPlans, selectedPet]);

  const scrollToResult = () =>
    requestAnimationFrame(() => {
      if (window.innerWidth < 960) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

  // ----- person -----
  const submitPerson = () => {
    const clean = sanitizePerson(person);
    setPerson(clean);
    setPersonPlan(buildPersonPlan(clean));
    scrollToResult();
  };
  const personAlternatives = (s: SwapTarget): FoodDef[] => {
    const meal = personPlan?.days[s.day].meals[s.meal];
    const cur = meal && personFoodById(meal.items[s.item].foodId);
    return meal && cur ? personCandidates(person, meal.slot, cur.role) : [];
  };
  const swapPerson = (s: SwapTarget, foodId: string) => {
    if (!personPlan) return;
    const day = personPlan.days[s.day];
    const picks = day.meals.map((m, mi) => ({
      slot: m.slot,
      foods: m.items.map((it, ii) => personFoodById(mi === s.meal && ii === s.item ? foodId : it.foodId)!).filter(Boolean),
    }));
    const days = personPlan.days.slice();
    days[s.day] = composePersonDay(person, day.label, picks);
    setPersonPlan({ ...personPlan, days });
  };

  // ----- pets -----
  const updatePet = (p: PetInput) => setPets(pets.map((x) => (x.id === p.id ? p : x)));
  const addPet = () => {
    const p = newPet(pets.length);
    setPets([...pets, p]);
    setSelectedPet(p.id);
  };
  const removePet = (id: string) => {
    const rest = pets.filter((p) => p.id !== id);
    setPets(rest);
    const { [id]: _drop, ...plans } = petPlans;
    void _drop;
    setPetPlans(plans);
    setSelectedPet(rest[0]?.id ?? null);
  };
  const submitPet = () => {
    if (!pet) return;
    const clean = sanitizePet(pet);
    updatePet(clean);
    setPetPlans({ ...petPlans, [clean.id]: buildPetPlan(clean) });
    scrollToResult();
  };
  const petPlan = pet ? petPlans[pet.id] : undefined;
  const petAlternatives = (s: SwapTarget): FoodDef[] => {
    const it = petPlan?.days[s.day].meals[0].items[s.item];
    const cur = it && petFoodById(it.foodId);
    if (!pet || !cur) return [];
    const slot = cur.slots[0];
    return petCandidates(pet, slot);
  };
  const swapPet = (s: SwapTarget, foodId: string) => {
    if (!pet || !petPlan) return;
    const day = petPlan.days[s.day];
    const foods = day.meals[0].items.map((it, ii) => petFoodById(ii === s.item ? foodId : it.foodId)!).filter(Boolean);
    const days = petPlan.days.slice();
    days[s.day] = composePetDay(pet, day.label, foods);
    setPetPlans({ ...petPlans, [pet.id]: { ...petPlan, days } });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">🥕</span>
            <div>
              <strong>{t(UI.brand, lang)}</strong>
              <span className="brand-tag">{t(UI.tagline, lang)}</span>
            </div>
          </div>
          <nav className="target-switch" aria-label="target">
            <button className={target === 'person' ? 'on' : ''} onClick={() => setTarget('person')} aria-pressed={target === 'person'}>
              🧑 {t(UI.person, lang)}
            </button>
            <button className={target === 'pet' ? 'on' : ''} onClick={() => setTarget('pet')} aria-pressed={target === 'pet'}>
              🐾 {t(UI.pet, lang)}
            </button>
          </nav>
          <button className="lang-btn" onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} lang={lang === 'ko' ? 'en' : 'ko'}>
            {lang === 'ko' ? 'EN' : '한국어'}
          </button>
        </div>
      </header>

      <div className="banner">⚠️ {t(UI.prototypeBanner, lang)}</div>

      <main className="layout">
        {target === 'person' ? (
          <>
            <div className="col-form">
              <PersonForm value={person} onChange={setPerson} onSubmit={submitPerson} lang={lang} />
            </div>
            <div className="col-result" ref={resultRef}>
              {personPlan ? (
                <ResultView key={JSON.stringify(personPlan.conditions)} plan={personPlan} lang={lang} getAlternatives={personAlternatives} onSwap={swapPerson} />
              ) : (
                <Empty lang={lang} emoji="🥗" />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="col-form">
              <div className="card pets">
                <div className="pets-head">
                  <h2>{t(UI.petListTitle, lang)}</h2>
                  <button type="button" className="btn-ghost" onClick={addPet}>
                    ＋ {t(UI.addPet, lang)}
                  </button>
                </div>
                <p className="small muted">{t(UI.separateNote, lang)}</p>
                {pets.length === 0 && <p className="muted">{t(UI.noPets, lang)}</p>}
                <div className="pet-tabs">
                  {pets.map((p) => (
                    <div key={p.id} className={p.id === pet?.id ? 'pet-tab on' : 'pet-tab'}>
                      <button type="button" onClick={() => setSelectedPet(p.id)}>
                        {p.species === 'dog' ? '🐶' : '🐱'} {p.name || '—'}
                        <span className="small muted">
                          {' '}
                          {t(SPECIES[p.species], lang)} · {t(LIFE_STAGES[lifeStage(p)], lang)}
                        </span>
                      </button>
                      {pets.length > 1 && (
                        <button type="button" className="pet-remove" aria-label={t(UI.removePet, lang)} onClick={() => removePet(p.id)}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {pet && <PetForm key={pet.id} value={pet} onChange={updatePet} onSubmit={submitPet} lang={lang} />}
            </div>
            <div className="col-result" ref={resultRef}>
              {pet && petPlan ? (
                <ResultView key={pet.id + JSON.stringify(petPlan.conditions)} plan={petPlan} lang={lang} getAlternatives={petAlternatives} onSwap={swapPet} />
              ) : (
                <Empty lang={lang} emoji="🐾" />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer small muted">
        {lang === 'ko'
          ? '이 프로토타입은 의료·수의학적 조언이 아닙니다. 모든 참고자료는 예시입니다.'
          : 'This prototype is not medical or veterinary advice. All references are examples.'}
      </footer>
    </div>
  );
}

function Empty({ lang, emoji }: { lang: Lang; emoji: string }) {
  return (
    <div className="card empty">
      <div className="empty-emoji">{emoji}</div>
      <p>{t(UI.emptyResult, lang)}</p>
    </div>
  );
}
