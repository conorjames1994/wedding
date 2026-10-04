import { wedding } from '../weddingConfig';

export default function Travel() {
  return (
    <section id="travel" className="bg-paper">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl italic mb-4">Getting there</h2>
          <p className="text-ink/80 leading-relaxed mb-1">{wedding.ceremony.address}</p>
          <p className="text-ink/60 text-sm">{wedding.travel.airport}</p>
        </div>
        <div>
          <h2 className="font-display text-3xl italic mb-4">Staying over</h2>
          <p className="text-ink/80 leading-relaxed">{wedding.travel.hotelBlock}</p>
        </div>
      </div>
    </section>
  );
}
