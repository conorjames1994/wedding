import { wedding } from '../weddingConfig';

export default function FAQ() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="font-display text-3xl italic mb-8">Questions</h2>
      <div className="divide-y divide-line border-t border-b border-line">
        {wedding.faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between items-center font-display text-lg">
              {f.q}
              <span className="text-moss group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
            </summary>
            <p className="mt-2 text-ink/70 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
