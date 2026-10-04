import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMessages().then(setMessages).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const saved = await api.postMessage({ guestName: name, message });
      setMessages((prev) => [saved, ...prev]);
      setName('');
      setMessage('');
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <section className="bg-paper">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl italic mb-8">Leave us a note</h2>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_2fr] gap-3 mb-3">
          <input
            className="border border-line rounded-sm px-3 py-2 bg-white"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="border border-line rounded-sm px-3 py-2 bg-white"
            placeholder="Say something nice…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="sm:col-span-2 justify-self-start bg-moss text-paper px-5 py-2 rounded-sm hover:bg-ink transition-colors disabled:opacity-50"
          >
            {status === 'sending' ? 'Posting…' : 'Post message'}
          </button>
        </form>
        {error && <p className="text-clay text-sm mb-6">{error}</p>}

        <ul className="space-y-4 mt-8">
          {messages.map((m) => (
            <li key={m.id} className="border-t border-line pt-4">
              <p className="text-ink/90">{m.message}</p>
              <p className="text-sm text-ink/50 mt-1">— {m.guest_name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
