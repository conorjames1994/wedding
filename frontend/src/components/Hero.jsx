import { wedding } from '../weddingConfig';

export default function Hero() {
  return (
    <section id="top" className="max-w-5xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-[2fr_1fr] gap-10 items-end">
      <div>
        <p className="text-moss text-sm mb-4">{wedding.date}</p>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] italic">
          {wedding.partner1}
          <span className="not-italic text-clay"> & </span>
          {wedding.partner2}
        </h1>
      </div>
      <div className="border-l border-line pl-6 text-sm space-y-3 pb-2">
        <div>
          <p className="text-ink/60">Ceremony</p>
          <p>{wedding.ceremony.time} · {wedding.ceremony.venue}</p>
        </div>
        <div>
          <p className="text-ink/60">Reception</p>
          <p>{wedding.reception.time} · {wedding.reception.venue}</p>
        </div>
        <a href="#rsvp" className="inline-block mt-2 underline-grow">
          Please RSVP by {wedding.rsvpDeadline}
        </a>
      </div>
    </section>
  );
}
