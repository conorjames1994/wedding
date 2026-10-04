import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function AdminDashboard() {
  const [password, setPassword] = useState(sessionStorage.getItem('adminPassword') || '');
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('adminPassword'));
  const [households, setHouseholds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authed) loadHouseholds();
  }, [authed]);

  async function loadHouseholds() {
    try {
      const res = await fetch(`${API_BASE}/admin/households`, {
        headers: { 'x-admin-password': password },
      });
      if (!res.ok) throw new Error('Wrong password');
      setHouseholds(await res.json());
      sessionStorage.setItem('adminPassword', password);
      setAuthed(true);
      setError('');
    } catch (err) {
      setError(err.message);
      setAuthed(false);
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24">
        <h1 className="font-display text-2xl italic mb-4">Admin</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadHouseholds();
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="password"
            className="border border-line rounded-sm px-3 py-2"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="bg-moss text-paper px-4 py-2 rounded-sm">Enter</button>
          {error && <p className="text-clay text-sm">{error}</p>}
        </form>
      </div>
    );
  }

  const totalGuests = households.reduce((sum, h) => sum + h.guests.filter((g) => g.id).length, 0);
  const confirmed = households.reduce((sum, h) => sum + h.guests.filter((g) => g.attending === true).length, 0);
  const declined = households.reduce((sum, h) => sum + h.guests.filter((g) => g.attending === false).length, 0);
  const pending = totalGuests - confirmed - declined;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl italic">Guest list</h1>
        <a
          href={`${API_BASE}/admin/export.csv`}
          onClick={(e) => {
            // append password via fetch+blob since it needs a header, not a query param
            e.preventDefault();
            fetch(`${API_BASE}/admin/export.csv`, { headers: { 'x-admin-password': password } })
              .then((r) => r.blob())
              .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rsvp-export.csv';
                a.click();
              });
          }}
          className="text-sm underline-grow"
        >
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10 text-center">
        <Stat label="Confirmed" value={confirmed} />
        <Stat label="Declined" value={declined} />
        <Stat label="Pending" value={pending} />
      </div>

      <div className="space-y-6">
        {households.map((h) => (
          <div key={h.household_id} className="border border-line rounded-sm p-4">
            <p className="font-display text-lg">{h.household_name}</p>
            {h.notes && <p className="text-xs text-ink/50">{h.notes}</p>}
            <ul className="mt-2 text-sm divide-y divide-line">
              {h.guests.map((g) => (
                <li key={g.id} className="py-2 flex justify-between">
                  <span>{g.first_name} {g.last_name}</span>
                  <span className="text-ink/60">
                    {g.attending === true ? `Attending · ${g.meal_choice || 'no meal selected'}${g.dietary_notes ? ` · ${g.dietary_notes}` : ''}` : g.attending === false ? 'Declined' : 'No response'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-line rounded-sm py-4">
      <p className="font-display text-3xl">{value}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}
