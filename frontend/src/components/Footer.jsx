import { wedding } from '../weddingConfig';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/60 text-sm">
      <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
        <span>{wedding.partner1} & {wedding.partner2} · {wedding.date}</span>
        <span>With love, and a little bit of code.</span>
      </div>
    </footer>
  );
}
