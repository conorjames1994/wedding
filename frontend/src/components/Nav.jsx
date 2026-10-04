import { wedding } from '../weddingConfig';

const links = [
  ['Our story', '#story'],
  ['Schedule', '#schedule'],
  ['Travel', '#travel'],
  ['RSVP', '#rsvp'],
  ['Gallery', '#gallery'],
  ['FAQ', '#faq'],
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#top" className="font-display text-lg tracking-tight">
          {wedding.partner1} & {wedding.partner2}
        </a>
        <ul className="hidden md:flex gap-6 text-sm">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="underline-grow">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#rsvp"
          className="text-sm bg-moss text-paper px-4 py-2 rounded-sm hover:bg-ink transition-colors"
        >
          RSVP
        </a>
      </nav>
    </header>
  );
}
