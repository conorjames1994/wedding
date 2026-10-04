import { useState } from 'react';
import { api } from '../api/client';

const MEAL_OPTIONS = ['Chicken', 'Fish', 'Vegetarian', 'Vegan'];

const inputClass =
  'mt-1 w-full bg-transparent border border-paper/30 rounded-sm px-3 py-2 text-paper placeholder:text-paper/40';

export default function RSVP() {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState(null); // null = haven't searched yet
  const [householdId, setHouseholdId] = useState(null);
  const [guests, setGuests] = useState([]);
  // idle | searching | loadingHousehold | found | submitting | done
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setStatus('searching');
    setError('');
    try {
      setMatches(await api.searchGuests(query));
    } catch (err) {
      setError(err.message);
    }
    setStatus('idle');
  }

  async function chooseMatch(match) {
    setStatus('loadingHousehold');
    setError('');
    try {
      const data = await api.getHousehold(match.household_id);
      setHouseholdId(data.household.id);
      setGuests(
        data.guests.map((g) => ({
          ...g,
          meal_choice: g.meal_choice || '',
          dietary_notes: g.dietary_notes || '',
          song_request: g.song_request || '',
        }))
      );
      setStatus('found');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  function startOver() {
    setQuery('');
    setMatches(null);
    setGuests([]);
    setHouseholdId(null);
    setError('');
    setStatus('idle');
  }

  function updateGuest(id, patch) {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await api.submitRsvp({
        householdId,
        responses: guests.map((g) => ({
          guestId: g.id,
          attending: g.attending,
          mealChoice: g.attending ? g.meal_choice : null,
          dietaryNotes: g.attending ? g.dietary_notes : null,
          songRequest: g.song_request,
        })),
      });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('found');
    }
  }

  const showingForm = status === 'found' || status === 'submitting';

  return (
    <section id="rsvp" className="bg-ink text-paper">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl italic mb-2">RSVP</h2>

        {status === 'done' && (
          <p className="text-paper/90 mt-6">
            Thank you! Your RSVP is in. We can&apos;t wait to celebrate with you.
          </p>
        )}

        {showingForm && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="flex justify-between items-baseline gap-4">
              <p className="text-paper/70 text-sm">Let us know who can make it.</p>
              <button type="button" onClick={startOver} className="text-sm text-paper/60 underline-grow">
                Not you? Search again
              </button>
            </div>

            {guests.map((g) => (
              <div key={g.id} className="border-t border-paper/20 pt-6">
                <p className="font-display text-xl mb-3">
                  {g.first_name} {g.last_name}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`attending-${g.id}`}
                      checked={g.attending === true}
                      onChange={() => updateGuest(g.id, { attending: true })}
                    />
                    Joyfully attending
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`attending-${g.id}`}
                      checked={g.attending === false}
                      onChange={() => updateGuest(g.id, { attending: false })}
                    />
                    Regretfully declining
                  </label>
                </div>

                {g.attending === true && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="text-sm">
                      Meal choice
                      <select
                        className={inputClass}
                        value={g.meal_choice}
                        onChange={(e) => updateGuest(g.id, { meal_choice: e.target.value })}
                        required
                      >
                        <option value="" className="text-ink">Select one</option>
                        {MEAL_OPTIONS.map((m) => (
                          <option key={m} value={m} className="text-ink">{m}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      Dietary restrictions / allergies
                      <input
                        className={inputClass}
                        placeholder="e.g. nut allergy, gluten-free"
                        value={g.dietary_notes}
                        onChange={(e) => updateGuest(g.id, { dietary_notes: e.target.value })}
                      />
                    </label>
                    <label className="text-sm sm:col-span-2">
                      Song request (optional)
                      <input
                        className={inputClass}
                        value={g.song_request}
                        onChange={(e) => updateGuest(g.id, { song_request: e.target.value })}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}

            {error && <p className="text-clay text-sm">{error}</p>}

            <button
              type="submit"
              disabled={status === 'submitting' || guests.some((g) => g.attending === null || g.attending === undefined)}
              className="bg-clay text-paper px-6 py-3 rounded-sm hover:bg-blush hover:text-ink transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending…' : 'Send RSVP'}
            </button>
          </form>
        )}

        {!showingForm && status !== 'done' && (
          <div className="mt-8">
            <p className="text-paper/70 text-sm mb-4">
              Type your name to find your invitation.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                className="flex-1 bg-transparent border border-paper/30 rounded-sm px-3 py-2 text-paper placeholder:text-paper/40"
                placeholder="e.g. Sam Temporal"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={status === 'searching' || status === 'loadingHousehold'}
                className="bg-moss px-5 py-2 rounded-sm hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
              >
                {status === 'searching' ? 'Searching…' : 'Find me'}
              </button>
            </form>

            {matches && matches.length > 0 && (
              <ul className="mt-4 max-w-md divide-y divide-paper/20 border-y border-paper/20">
                {matches.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => chooseMatch(m)}
                      disabled={status === 'loadingHousehold'}
                      className="w-full text-left py-3 px-1 hover:text-blush transition-colors disabled:opacity-50"
                    >
                      {m.first_name} {m.last_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {matches && matches.length === 0 && (
              <p className="text-paper/70 text-sm mt-4">
                We couldn&apos;t find that name. Try just your first name or surname, or get in touch and we&apos;ll
                sort it out.
              </p>
            )}

            {error && <p className="text-clay text-sm mt-3">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
