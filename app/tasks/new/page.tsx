'use client';

import AppShell from '@/components/AppShell';
import CustomDropdown from '@/components/CustomDropdown';
import LocationPicker from '@/components/LocationPicker';
import {useLanguage} from '@/components/LanguageProvider';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Building2, CalendarClock, Clock3, MapPin, ShieldCheck} from 'lucide-react';

const locations = [
  'Kigali - Gasabo',
  'Kigali - Kicukiro',
  'Kigali - Nyarugenge',
  'Musanze',
  'Huye',
  'Rubavu',
  'Muhanga',
  'Rwamagana',
];

const copy = {
  en: {
    postAs: 'Post as',
    personal: 'Personal account',
    everyday: 'Everyday task',
    market: 'Market shopping',
    pickup: 'Pickup & delivery',
    repair: 'Repair',
    laundry: 'Laundry & cleaning',
    documents: 'Documents',
    photoNote: 'Photo + note',
    receiptPhoto: 'Receipt + photo',
    handoff: 'Pickup + handoff photo',
    confirmation: 'Customer confirmation',
    intro: 'Choose the service area and, when useful, attach an exact map pin so the assigned runner can navigate to the right place.',
    privacy: 'LOCATION & PRIVACY',
    privacyTitle: 'Share only the location needed for the task',
    privacyBody: 'Exact coordinates are personal location data. Add a precise pin only when it helps complete the task, and avoid publishing unnecessary private location details in the description.',
    publishing: 'Publishing task...',
    validation: 'Add clear details, a budget of at least 500 RWF and a deadline.',
    unavailable: 'Unable to reach UMUNOTA. Try again.',
    titlePlaceholder: 'Buy groceries from Kimironko market',
    detailsPlaceholder: 'Describe items, pickup instructions and completion requirements.',
  },
  rw: {
    postAs: 'Tangaza nka',
    personal: 'Konti bwite',
    everyday: 'Akazi gasanzwe',
    market: 'Guhaha ku isoko',
    pickup: 'Gufata no kugeza',
    repair: 'Gusana',
    laundry: 'Imesa & isuku',
    documents: 'Inyandiko',
    photoNote: 'Ifoto + ibisobanuro',
    receiptPhoto: 'Resi + ifoto',
    handoff: 'Ifoto yo gufata no gutanga',
    confirmation: 'Kwemezwa n’umukiriya',
    intro: 'Hitamo agace akazi gakorerwamo kandi, igihe bikenewe, shyiraho ikimenyetso nyacyo ku ikarita kugira ngo umufasha abashe kuhagera neza.',
    privacy: 'AHANTU & IBANGA',
    privacyTitle: 'Sangiza gusa ahantu hakenewe kugira ngo akazi gakorwe',
    privacyBody: 'Ahantu nyako ni amakuru yihariye. Shyiraho ikimenyetso nyacyo gusa igihe gifasha kurangiza akazi kandi wirinde gushyira amakuru menshi y’aho uba mu bisobanuro.',
    publishing: 'Akazi karimo gutangazwa...',
    validation: 'Shyiramo ibisobanuro bihagije, ingengo y’imari nibura 500 RWF n’igihe ntarengwa.',
    unavailable: 'Ntibishobotse kugera kuri UMUNOTA. Ongera ugerageze.',
    titlePlaceholder: 'Gura ibiribwa ku isoko rya Kimironko',
    detailsPlaceholder: 'Sobanura ibyo kugura, amabwiriza yo gufata n’ibisabwa kugira ngo akazi karangire.',
  },
  fr: {
    postAs: 'Publier en tant que',
    personal: 'Compte personnel',
    everyday: 'Tâche quotidienne',
    market: 'Courses au marché',
    pickup: 'Collecte & livraison',
    repair: 'Réparation',
    laundry: 'Lessive & nettoyage',
    documents: 'Documents',
    photoNote: 'Photo + note',
    receiptPhoto: 'Reçu + photo',
    handoff: 'Photo de collecte + remise',
    confirmation: 'Confirmation du client',
    intro: 'Choisissez la zone de service et, si utile, ajoutez un point précis sur la carte pour permettre au runner assigné de se rendre au bon endroit.',
    privacy: 'LOCALISATION & CONFIDENTIALITÉ',
    privacyTitle: 'Partagez uniquement la localisation nécessaire à la tâche',
    privacyBody: 'Les coordonnées exactes sont des données personnelles. Ajoutez un point précis seulement s’il aide à accomplir la tâche et évitez de publier des détails privés inutiles dans la description.',
    publishing: 'Publication de la tâche...',
    validation: 'Ajoutez des détails clairs, un budget d’au moins 500 RWF et une échéance.',
    unavailable: 'Impossible de joindre UMUNOTA. Réessayez.',
    titlePlaceholder: 'Acheter des courses au marché de Kimironko',
    detailsPlaceholder: 'Décrivez les articles, les instructions de collecte et les exigences de réalisation.',
  },
  sw: {
    postAs: 'Chapisha kama',
    personal: 'Akaunti binafsi',
    everyday: 'Kazi ya kawaida',
    market: 'Ununuzi sokoni',
    pickup: 'Kuchukua & kupeleka',
    repair: 'Matengenezo',
    laundry: 'Kufua & usafi',
    documents: 'Nyaraka',
    photoNote: 'Picha + maelezo',
    receiptPhoto: 'Risiti + picha',
    handoff: 'Picha ya kuchukua + kukabidhi',
    confirmation: 'Uthibitisho wa mteja',
    intro: 'Chagua eneo la huduma na, inapofaa, weka pini sahihi kwenye ramani ili msaidizi aliyepewa kazi afike mahali sahihi.',
    privacy: 'MAHALI & FARAGHA',
    privacyTitle: 'Shiriki tu mahali panapohitajika kwa kazi',
    privacyBody: 'Kuratibu mahali kamili ni taarifa binafsi. Weka pini sahihi tu inaposaidia kukamilisha kazi na epuka kuweka maelezo binafsi yasiyohitajika kwenye maelezo ya kazi.',
    publishing: 'Inachapisha kazi...',
    validation: 'Weka maelezo ya kutosha, bajeti ya angalau 500 RWF na muda wa mwisho.',
    unavailable: 'Imeshindikana kufikia UMUNOTA. Jaribu tena.',
    titlePlaceholder: 'Nunua vyakula katika soko la Kimironko',
    detailsPlaceholder: 'Eleza bidhaa, maelekezo ya kuchukua na masharti ya kukamilisha kazi.',
  },
} as const;

type Business = {id: string; business_name: string; status: string};

export default function NewTask() {
  const router = useRouter();
  const {t, lang} = useLanguage();
  const c = copy[lang];

  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    location: locations[0],
    category: 'Everyday task',
    dueAt: '',
    proofRequirement: 'Photo + note',
    businessId: '',
    latitude: null as number | null,
    longitude: null as number | null,
    locationAccuracyM: null as number | null,
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const q = new URLSearchParams(window.location.search);
      setForm((current) => ({
        ...current,
        title: q.get('title') || current.title,
        description: q.get('description') || current.description,
        budget: q.get('budget') || current.budget,
        location: q.get('location') || current.location,
        category: q.get('category') || current.category,
        proofRequirement: q.get('proof') || current.proofRequirement,
        businessId: q.get('business') || current.businessId,
      }));

      try {
        const res = await fetch('/api/business', {cache: 'no-store'});
        if (res.ok) {
          const data = await res.json();
          setBusinesses((data.businesses || []).filter((business: Business) => business.status === 'active'));
        }
      } catch {
        // Business workspaces are optional on the personal task form.
      }
    })();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (
      form.title.trim().length < 5 ||
      form.description.trim().length < 10 ||
      Number(form.budget) < 500 ||
      !form.dueAt
    ) {
      setError(c.validation);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          budgetRwf: Number(form.budget),
          location: form.location,
          category: form.category,
          dueAt: new Date(form.dueAt).toISOString(),
          proofRequirement: form.proofRequirement,
          businessId: form.businessId || null,
          latitude: form.latitude,
          longitude: form.longitude,
          locationAccuracyM: form.locationAccuracyM,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'KYC_REQUIRED') {
          router.push('/kyc');
          return;
        }
        setError(data.error || c.unavailable);
        return;
      }

      router.push(`/tasks/${data.task.id}`);
      router.refresh();
    } catch {
      setError(c.unavailable);
    } finally {
      setBusy(false);
    }
  }

  const categories = [
    {value: 'Everyday task', label: c.everyday},
    {value: 'Market shopping', label: c.market},
    {value: 'Pickup & delivery', label: c.pickup},
    {value: 'Repair', label: c.repair},
    {value: 'Laundry & cleaning', label: c.laundry},
    {value: 'Documents', label: c.documents},
  ];
  const proofs = [
    {value: 'Photo + note', label: c.photoNote},
    {value: 'Receipt + photo', label: c.receiptPhoto},
    {value: 'Pickup + handoff photo', label: c.handoff},
    {value: 'Customer confirmation', label: c.confirmation},
  ];
  const locationOptions = locations.map((value) => ({value, label: value}));
  const businessOptions = [
    {value: '', label: c.personal},
    ...businesses.map((business) => ({
      value: business.id,
      label: `${business.business_name} — UMUNOTA Business`,
    })),
  ];

  return (
    <AppShell>
      <div className="pageHead">
        <div>
          <span className="eyebrow">{t('createTask').toUpperCase()}</span>
          <h1>{t('createTask')}</h1>
          <p>{c.intro}</p>
        </div>
      </div>

      <div className="newTaskLayout">
        <form className="card formCard customForm" onSubmit={submit}>
          {businesses.length > 0 && (
            <div className="field iconField">
              <CustomDropdown
                icon={Building2}
                label={c.postAs}
                value={form.businessId}
                onChange={(businessId) => setForm((current) => ({...current, businessId}))}
                options={businessOptions}
              />
            </div>
          )}

          <div className="field">
            <label>{t('taskTitle')}</label>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({...current, title: event.target.value}))}
              placeholder={c.titlePlaceholder}
            />
          </div>

          <div className="field">
            <label>{t('taskDetails')}</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({...current, description: event.target.value}))}
              placeholder={c.detailsPlaceholder}
            />
          </div>

          <div className="grid twocol">
            <div className="field">
              <label>{t('budget')}</label>
              <input
                value={form.budget}
                onChange={(event) => setForm((current) => ({...current, budget: event.target.value.replace(/\D/g, '')}))}
                inputMode="numeric"
                placeholder="5000"
              />
            </div>
            <div className="field">
              <CustomDropdown
                label={t('category')}
                value={form.category}
                onChange={(category) => setForm((current) => ({...current, category}))}
                options={categories}
              />
            </div>
          </div>

          <div className="grid twocol">
            <div className="field iconField">
              <CustomDropdown
                icon={MapPin}
                label={t('serviceLocation')}
                value={form.location}
                onChange={(location) => setForm((current) => ({...current, location}))}
                options={locationOptions}
              />
            </div>
            <div className="field iconField">
              <label>
                <CalendarClock size={15} /> {t('deadline')}
              </label>
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => setForm((current) => ({...current, dueAt: event.target.value}))}
              />
            </div>
          </div>

          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(latitude, longitude, accuracy) =>
              setForm((current) => ({
                ...current,
                latitude,
                longitude,
                locationAccuracyM: accuracy ?? current.locationAccuracyM,
              }))
            }
          />

          <div className="field">
            <CustomDropdown
              label={t('completionProof')}
              value={form.proofRequirement}
              onChange={(proofRequirement) => setForm((current) => ({...current, proofRequirement}))}
              options={proofs}
            />
          </div>

          {error && <div className="errorBox">{error}</div>}

          <button disabled={busy} className="btn btn-gold btn-wide asyncBtn" aria-busy={busy}>
            {busy ? (
              <>
                <Clock3 size={18} className="spinIcon" /> {c.publishing}
              </>
            ) : (
              <>
                <Clock3 size={18} /> {t('publishTask')}
              </>
            )}
          </button>
        </form>

        <aside className="card stickyCard protectedFlow">
          <ShieldCheck className="goldIcon" size={28} />
          <span className="eyebrow">{c.privacy}</span>
          <h3>{c.privacyTitle}</h3>
          <p>{c.privacyBody}</p>
        </aside>
      </div>
    </AppShell>
  );
}
