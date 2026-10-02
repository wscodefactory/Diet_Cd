import { PET_ALLERGENS, type PetAllergen } from './data.ts'
import { SPECIES, petGuide, speciesOf, usesEnergyModel } from './pet.ts'
import type { Health, Pet as P } from './plan.ts'
import { Chips, Evidence, Field, Hero, Num, Section, Seg, Text, useLocal, useT } from './ui.tsx'

const newPet = (n: number): P => ({
  id: String(Date.now()) + n, name: '', species: 'dog', age: 3, weight: 5, activity: 'mid',
  neutered: true, health: 'none', allergies: [], diet: 'dry',
})

type Store = { pets: P[]; current: string }

export default function Pet() {
  const t = useT()
  const [store, setStore] = useLocal<Store>('diet.pets', { pets: [{ ...newPet(0), id: 'first' }], current: 'first' })
  const pet = store.pets.find(p => p.id === store.current) ?? store.pets[0]
  const set = (patch: Partial<P>) => setStore({ ...store, pets: store.pets.map(p => (p.id === pet.id ? { ...p, ...patch } : p)) })
  const speciesName = (p: P) => (p.species === 'other' && p.customSpecies?.trim()) || t(speciesOf(p).name)
  const label = (p: P, i: number) => `${speciesOf(p).emoji} ${p.name || t(`동물 ${i + 1}`, `Pet ${i + 1}`)}`
  const energy = usesEnergyModel(pet)

  const add = () => {
    const p = newPet(store.pets.length)
    setStore({ pets: [...store.pets, p], current: p.id })
  }
  const remove = () => {
    const pets = store.pets.filter(p => p.id !== pet.id)
    setStore({ pets, current: pets[0].id })
  }

  const healthOptions: [Health, string][] = [
    ['none', t('특이사항 없음', 'None')], ['overweight', t('과체중', 'Overweight')], ['kidney', t('신장 질환', 'Kidney disease')],
    ['skin', t('피부·모질(깃털·등껍질)', 'Skin, coat, feathers or shell')], ['gi', t('소화기 민감', 'Sensitive digestion')],
  ]

  return (
    <>
      <div className="intro">
        <h1>{t('우리 아이에게 맞는 급여 정보', 'Feeding guidance for your pet')}</h1>
        <p>{t('여러 마리를 등록하면 한 마리씩 따로 관리해요.', 'Register several pets and manage each one separately.')}</p>
      </div>

      <div className="layout">
      <aside className="inputs" aria-label={t('입력 조건', 'Your conditions')}>
      <div className="chips" role="group" aria-label={t('등록된 동물', 'Registered pets')}>
        {store.pets.map((p, i) => (
          <button key={p.id} className="chip" aria-pressed={p.id === pet.id} onClick={() => setStore({ ...store, current: p.id })}>
            {label(p, i)}
          </button>
        ))}
        <button className="chip soft" onClick={add}>{t('+ 동물 추가', '+ Add pet')}</button>
      </div>

      <Section title={t('기본 정보', 'Basics')}>
        <div className="form">
          <Field label={t('종', 'Species')} wide>
            <Seg value={speciesOf(pet).id} onChange={species => set({ species })} options={SPECIES.map(s => [s.id, `${s.emoji} ${t(s.name)}`])} />
          </Field>
          {pet.species === 'other' && (
            <Text wide label={t('종 이름 직접 입력', 'Type the species')} value={pet.customSpecies ?? ''} placeholder={t('예: 고슴도치', 'e.g. hedgehog')} onChange={customSpecies => set({ customSpecies })} />
          )}
          <Text label={t('이름', 'Name')} value={pet.name} placeholder={t('예: 보리', 'e.g. Bori')} onChange={name => set({ name })} />
          <Num label={t('나이 (년, 6개월은 0.5)', 'Age (years, 6 mo = 0.5)')} value={pet.age} min={0.1} max={100} step={0.1} onChange={age => set({ age })} />
          <Num label={t('체중 (kg, 120 g은 0.12)', 'Weight (kg, 120 g = 0.12)')} value={pet.weight} min={0.01} max={100} step={0.01} onChange={weight => set({ weight })} />
          <Field label={t('활동량', 'Activity')} wide>
            <Seg value={pet.activity} onChange={activity => set({ activity })} options={[['low', t('적음', 'Low')], ['mid', t('보통', 'Moderate')], ['high', t('많음', 'High')]]} />
          </Field>
          {energy && (
            <Field label={t('중성화', 'Neutered')}>
              <Seg value={pet.neutered ? 'y' : 'n'} onChange={v => set({ neutered: v === 'y' })} options={[['y', t('했음', 'Yes')], ['n', t('안 함', 'No')]]} />
            </Field>
          )}
        </div>
      </Section>

      <Section title={t('건강과 식이', 'Health and diet')}>
        <div className="form">
          <label className="field">
            <span>{t('건강 상태', 'Health condition')}</span>
            <select value={pet.health} onChange={e => set({ health: e.target.value as Health })}>
              {healthOptions.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
            </select>
          </label>
          {energy && (
            <Field label={t('식이 특성', 'Diet type')}>
              <Seg value={pet.diet} onChange={diet => set({ diet })} options={[['dry', t('건식', 'Dry')], ['wet', t('습식', 'Wet')], ['mixed', t('혼합', 'Mixed')]]} />
            </Field>
          )}
          <Field label={t('알레르기', 'Allergies')} wide>
            <Chips value={pet.allergies} onChange={allergies => set({ allergies })}
              options={(Object.keys(PET_ALLERGENS) as PetAllergen[]).map(a => [a, t(PET_ALLERGENS[a])])} />
          </Field>
        </div>
        {store.pets.length > 1 && (
          <button className="btn ghost small" style={{ marginTop: 12 }} onClick={remove}>{t('이 동물 삭제', 'Remove this pet')}</button>
        )}
      </Section>
      </aside>

      <div className="results">
        {pet.weight > 0 && pet.age > 0 ? <Result pet={pet} title={label(pet, store.pets.indexOf(pet))} speciesName={speciesName(pet)} /> : (
          <div className="tray empty"><p>{t('나이와 체중을 입력하면 급여 정보가 나와요.', 'Enter age and weight to see feeding guidance.')}</p></div>
        )}
      </div>
      </div>
    </>
  )
}

function Result({ pet, title, speciesName }: { pet: P; title: string; speciesName: string }) {
  const t = useT()
  const guide = petGuide(pet)
  const energy = usesEnergyModel(pet)
  const vet = pet.health === 'kidney' || pet.health === 'gi'
  const healthNote = {
    none: '',
    overweight: energy
      ? t('과체중이라 유지량보다 낮은 계수를 썼어요. 감량 속도는 수의사와 정하세요.', 'Used a lower factor for overweight. Set the pace of weight loss with your vet.')
      : t('과체중이면 간식과 펠릿부터 줄이되, 감량 속도는 수의사와 정하세요.', 'For overweight, cut treats and pellets first, and set the pace with your vet.'),
    kidney: t('신장 질환은 처방식과 수의사 지시가 우선이에요. 여기서는 일반 급여 기준만 보여드려요.', 'With kidney disease, prescription diets and veterinary advice come first. Only general guidance is shown here.'),
    skin: t('알레르기 원인으로 표시한 식재료를 빼는 것부터 반영했어요.', 'The plan starts by removing the ingredients you marked as allergens.'),
    gi: t('소화기가 민감하면 먹이를 바꿀 때 7일 이상 천천히 섞어 주세요. 증상이 이어지면 진료가 필요해요.', 'With sensitive digestion, transition foods over 7+ days. See a vet if symptoms persist.'),
  }[pet.health]
  const conditions = [
    speciesName, t(guide.stageName), `${pet.weight} kg`,
    { low: t('활동 적음', 'Low activity'), mid: t('활동 보통', 'Moderate activity'), high: t('활동 많음', 'High activity') }[pet.activity],
    ...(energy ? [
      pet.neutered ? t('중성화함', 'Neutered') : t('중성화 안 함', 'Intact'),
      { dry: t('건식', 'Dry'), wet: t('습식', 'Wet'), mixed: t('건식+습식 혼합', 'Dry + wet') }[pet.diet],
    ] : []),
  ]

  return (
    <>
      <div className="tray">
      <Hero emojis={[speciesOf(pet).emoji, ...guide.lines.map(l => l.emoji)]} kicker={`${title} · ${speciesName} · ${t(guide.stageName)}`}
        big={guide.stats[0]?.value ?? ''} unit={guide.stats[0] && t(guide.stats[0].label)} caption={t(guide.headline)} />

      <Section no={1} area="meals" title={t('추천 급여 구성', 'Recommended feeding')}>
        <ul className="rows">
          {guide.lines.map((l, i) => <li key={i}><span>{l.emoji}</span><span className="grow">{t(l.text)}</span></li>)}
        </ul>
      </Section>

      <Section no={2} area="nut" title={t('급여량과 주요 정보', 'Amounts and key numbers')}>
        <div className="stats">
          {guide.stats.map((s, i) => <div className="stat" key={i}><b>{s.value}</b><span>{t(s.label)}</span></div>)}
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{t(guide.assumption)}</p>
      </Section>

      <Section no={3} area="why" title={t('추천 이유', 'Why this plan')}>
        <ul className="reasons">
          {guide.reasons.map((r, i) => <li key={i}>{t(r)}</li>)}
          {healthNote && <li>{healthNote}</li>}
        </ul>
        {vet && <p className="warn" style={{ marginTop: 8 }}>{t('이 건강 상태는 수의사 상담이 먼저예요.', 'With this condition, consult your veterinarian first.')}</p>}
      </Section>

      <Section no={4} area="cond" title={t('반영된 조건과 제외 식재료', 'Applied conditions and excluded ingredients')}>
        <div className="chips">{conditions.map(c => <span key={c} className="chip soft">{c}</span>)}</div>
        <p className="muted" style={{ margin: '12px 0 6px' }}>{t('제외한 식재료', 'Excluded ingredients')}</p>
        <div className="chips">
          {pet.allergies.length ? pet.allergies.map(a => <span key={a} className="chip out">{t(PET_ALLERGENS[a])}</span>) : <span className="muted">{t('없음', 'None')}</span>}
        </div>
      </Section>

      <Evidence target="animal" species={speciesOf(pet).id} />
      </div>
      <p className="muted">{t('이 정보는 참고용이며 수의사의 진료를 대신하지 않아요.', 'This is for reference and does not replace veterinary care.')}</p>
    </>
  )
}
