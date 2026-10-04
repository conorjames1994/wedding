import { wedding } from '../weddingConfig';

export default function Schedule() {
  return (
    <section id="schedule" className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="font-display text-3xl italic mb-10">The day</h2>
      <ol className="divide-y divide-line border-t border-b border-line">
        {wedding.schedule.map((item, i) => (
          <li key={item.time} className="flex items-baseline gap-6 py-4">
            <span className="text-moss text-sm w-6">{String(i + 1).padStart(2, '0')}</span>
            <span className="w-24 text-sm text-ink/60">{item.time}</span>
            <span className="font-display text-xl">{item.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
