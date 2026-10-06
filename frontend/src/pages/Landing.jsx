import { BellRing, Camera, Cpu, FileText, History, LayoutDashboard, ShieldCheck, Sprout, Upload } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const CROPS = [
  { name: 'Tomato', diseases: ['Early blight', 'Late blight', 'Leaf mold', 'Bacterial spot'] },
  { name: 'Potato', diseases: ['Early blight', 'Late blight'] },
  { name: 'Apple', diseases: ['Apple scab', 'Black rot'] },
  { name: 'Corn', diseases: ['Northern leaf blight', 'Common rust'] },
  { name: 'Grape', diseases: ['Black rot'] },
  { name: 'Pepper', diseases: ['Bacterial spot'] },
];
const DISEASE_COUNT = CROPS.reduce((n, c) => n + c.diseases.length, 0);

const STEPS = [
  { icon: Camera, title: 'Photograph one leaf', text: 'Use daylight and keep the affected area in focus.' },
  { icon: Upload, title: 'Upload it', text: 'Drop a JPG or PNG up to 10 MB.' },
  { icon: Cpu, title: 'The model reads it', text: 'A neural network compares the leaf against known disease patterns.' },
  { icon: FileText, title: 'Get a plan', text: 'See the likely disease, symptoms, treatment and how to prevent it.' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Confidence you can judge', text: 'Every result shows how sure the model is and the next-best guesses, so a shaky answer looks shaky.' },
  { icon: History, title: 'A record per field visit', text: 'Each scan is saved with its photo, so you can compare how a patch changes week to week.' },
  { icon: LayoutDashboard, title: 'Patterns at a glance', text: 'The dashboard shows which diseases keep showing up and how often you are scanning.' },
  { icon: BellRing, title: 'Advice, not just a label', text: 'Treatment and prevention steps come with every diagnosis, with a reminder to confirm locally.' },
];

function LeafScan() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-paddy-900" aria-hidden>
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full">
        <path d="M200 460C110 380 70 260 130 150 160 95 190 60 200 40c10 20 40 55 70 110 60 110 20 230-70 310z" fill="#3F7D45" />
        <path d="M200 460V90M200 380l-60-60M200 330l70-65M200 270l-55-55M200 220l50-48" stroke="#8FBF7A" strokeWidth="3" strokeLinecap="round" fill="none" />
        <g fill="#6B4A2F"><circle cx="150" cy="230" r="22" /><circle cx="255" cy="300" r="15" /><circle cx="228" cy="170" r="11" /></g>
        <g fill="none" stroke="#F2CB63" strokeWidth="2"><circle cx="150" cy="230" r="32" strokeDasharray="6 5" /><circle cx="255" cy="300" r="25" strokeDasharray="6 5" /></g>
      </svg>
      <div className="absolute inset-x-6 h-0.5 animate-scan bg-turmeric-300 shadow-[0_0_14px_3px_rgba(242,203,99,.7)]" />
      <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-cream/95 px-4 py-3 text-paddy-900">
        <p className="text-sm font-semibold">Example: Tomato, early blight</p>
        <p className="text-xs text-soil-600">Illustration only. Not a real result.</p>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl">Spot the blight before it spreads.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-soil-600">
            Photograph a crop leaf and KhetScan names the likely disease, shows how confident it is, and tells you what to do about it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/detect" size="lg"><Upload size={20} aria-hidden />Upload a leaf photo</Button>
            <Button to="#how" size="lg" variant="secondary" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</Button>
          </div>
        </div>
        <LeafScan />
      </section>

      <section id="how" className="bg-paddy-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-xl text-4xl font-bold">From photo to plan in four steps</h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl bg-cream p-6">
                <span className="font-display text-sm font-bold text-paddy-500">Step {i + 1}</span>
                <Icon size={26} className="mt-3 text-paddy-700" aria-hidden />
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soil-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-4xl font-bold">Crops and diseases covered</h2>
            <p className="mt-4 text-soil-600">Built on the PlantVillage research dataset, with disease guidance written for each condition below. Healthy leaves are recognised too.</p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[[CROPS.length, 'crops'], [DISEASE_COUNT, 'diseases'], ['10 MB', 'max photo']].map(([v, l]) => (
                <div key={l}><dt className="sr-only">{l}</dt><dd className="font-display text-4xl font-bold text-paddy-700">{v}</dd><dd className="text-sm text-soil-600">{l}</dd></div>
              ))}
            </dl>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {CROPS.map((c) => (
              <li key={c.name}>
                <Card className="h-full">
                  <h3 className="flex items-center gap-2 text-xl font-bold"><Sprout size={18} className="text-paddy-500" aria-hidden />{c.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soil-600">{c.diseases.join(', ')}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-xl text-4xl font-bold">Useful the day you find a bad leaf, and the month after</h2>
        <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paddy-100 text-paddy-700"><Icon size={22} aria-hidden /></span>
              <div><h3 className="text-xl font-bold">{title}</h3><p className="mt-1 leading-relaxed text-soil-600">{text}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="rounded-[2rem] bg-paddy-700 px-6 py-14 text-center text-cream sm:px-12">
          <h2 className="mx-auto max-w-xl text-4xl font-bold">Got a leaf that looks wrong?</h2>
          <p className="mx-auto mt-4 max-w-md text-paddy-100">It takes one photo. Results are saved so you can come back to them.</p>
          <Button to="/detect" variant="accent" size="lg" className="mt-8">Scan a leaf</Button>
        </div>
      </section>
    </>
  );
}
