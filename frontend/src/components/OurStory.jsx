import { wedding } from '../weddingConfig';

export default function OurStory() {
  return (
    <section id="story" className="bg-ink text-paper">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-[1fr_2fr] gap-10">
        <h2 className="font-display text-3xl italic">Our story</h2>
        <p className="max-w-prose text-lg leading-relaxed text-paper/90">{wedding.story}</p>
      </div>
    </section>
  );
}
