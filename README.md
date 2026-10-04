# Wedding Website — Setup Guide

A step-by-step guide, written for "it's been 6 months since I've coded." Follow it top to bottom in order.

## What you're building

- A website with your wedding info (story, schedule, travel, FAQ)
- An RSVP form where guests type their name, find themselves, and respond
- A guestbook wall
- A password-protected admin page for you to see who's coming and export a list for your caterer

Two parts: a **frontend** (what guests see) and a **backend** (stores the data). They talk to a **database** (Postgres) that lives online.

---

## Step 0: Things to install first

You only do this once.

1. **Node.js** — check if you already have it by opening a terminal and typing:
   ```bash
   node -v
   ```
   If you see a version number (v18 or higher), you're set. If not, download it from [nodejs.org](https://nodejs.org) (choose the "LTS" version) and install it like any other app.

2. **A code editor** — [VS Code](https://code.visualstudio.com) if you don't already have one.

3. **A terminal** — On Mac, use the built-in "Terminal" app. On Windows, use "Command Prompt", "PowerShell", or VS Code's built-in terminal (View → Terminal).

Open the `wedding-website` folder (the one you unzipped) in VS Code now: File → Open Folder.

---

## Step 1: Create your database

This is the online storage that holds your guest list and RSVPs.

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project**. Give it any name, set a database password (write it down somewhere), pick a region close to you, and click **Create**.
3. Wait a minute or two for it to finish setting up.
4. Once it's ready, click the **Connect** button near the top of the project page (or go to **Project Settings → Database**).
5. Look for **Connection string** and choose the one labeled for a "URI" or general Node.js connection — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Copy it, and replace `[YOUR-PASSWORD]` with the database password you set in step 2.
7. Keep this tab open — you'll need this connection string in a moment.

---

## Step 2: Set up the backend (the part that stores data)

Open a terminal **inside VS Code** (View → Terminal) so you're already in the right folder.

1. Move into the backend folder:
   ```bash
   cd backend
   ```

2. Make a copy of the example settings file:
   ```bash
   cp .env.example .env
   ```

3. Open the new `.env` file in VS Code (find it in the file list on the left, inside `backend`). It looks like this:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/wedding
   PGSSL=true
   PORT=4000
   CORS_ORIGIN=http://localhost:5173
   ADMIN_PASSWORD=change-me
   ```
   Edit two lines:
   - Replace the `DATABASE_URL` value with the connection string you copied from Supabase in Step 1.
   - Replace `change-me` with a password only you and your partner know — this protects your admin page.

   Save the file (Cmd+S / Ctrl+S).

4. Install the backend's dependencies (the code libraries it needs):
   ```bash
   npm install
   ```
   This takes a minute and creates a `node_modules` folder — that's normal, ignore it.

5. Create the database tables:
   ```bash
   npm run migrate
   ```
   You should see `Schema applied`. If you see an error instead, double check your `DATABASE_URL` in `.env` — that's almost always the cause.

6. Start the backend server:
   ```bash
   npm run dev
   ```
   You should see `Wedding API listening on port 4000`. Leave this terminal window running — don't close it. This server needs to stay on while you use the site.

7. **Check it worked**: open a web browser and go to `http://localhost:4000/api/health`. You should see `{"ok":true}`. If so, your backend is running correctly.

---

## Step 3: Set up the frontend (what guests see)

Open a **second, separate** terminal window (keep the first one running from Step 2 — don't close it). In VS Code you can click the `+` in the terminal panel to open a new one.

1. Move into the frontend folder (from the project root, not from inside `backend`):
   ```bash
   cd frontend
   ```

2. Install its dependencies:
   ```bash
   npm install
   ```

3. Start it:
   ```bash
   npm run dev
   ```
   You'll see a message with a link like `http://localhost:5173`.

4. Open that link in your browser. You should see your wedding website, with placeholder names "Alex & Jordan" — that's expected for now, you'll change that next.

You now have two terminal windows running at once: one for the backend (Step 2), one for the frontend (Step 3). Both need to stay open while you're working on the site. To stop either one, click into that terminal and press `Ctrl+C`.

---

## Step 4: Add your real wedding details

1. In VS Code, open `frontend/src/weddingConfig.js`.
2. Edit the values — your names, date, venue, schedule, FAQ answers. It's plain text, no code knowledge needed, just don't delete any quote marks `"..."` or commas.
3. Save the file. Your browser tab (from Step 3) should update automatically within a second or two — no restart needed.

---

## Step 5: Add your guest list

Your guest list is already filled in at `backend/scripts/real-guests.csv` (105 guests). Guests find themselves by typing their name, so there are no codes to send out.

1. **Update your database first.** In the backend terminal (`cd backend` if it's a fresh terminal), run these two commands:
   ```bash
   npm install
   npm run migrate
   ```
   `npm install` picks up one new library. `npm run migrate` updates your database to the "no codes" version, and you should see `Schema applied`.

2. **Check the CSV.** Open `backend/scripts/real-guests.csv` in VS Code. Each row is one guest. Rows with the same `household_name` are grouped, which means one person can RSVP for everyone in that household. A few things to fix by hand if needed:
   - To put two people in the same household, give them exactly the same `household_name`.
   - Change `age_category` from `adult` to `child` for any children.
   - Add `email` / `phone` if you want them for your own reference.

3. **Import it:**
   ```bash
   npm run import-guests -- scripts/real-guests.csv
   ```
   You'll see a `+` line for each household added. It's safe to run again later, because it skips households that already exist.

---

## Step 6: Try it yourself

1. On your site (`http://localhost:5173`), scroll to the RSVP section and type your own name, then tap yourself in the results.
2. Fill out the form as if you were that guest and submit.
3. Go to `http://localhost:5173/#admin`, enter the admin password you set in Step 2, and confirm you can see the RSVP you just submitted.

If all of that works, everything is wired up correctly. (You can delete test RSVPs later by re-running the import on a fresh database, or just ask and we'll add a reset button.)

---

## Step 7: Put it online so guests can actually use it

Right now the site only works on your own computer. To make it a real website:

### 7a. Put your code on GitHub
1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Create a new repository, then follow GitHub's instructions to push this project folder to it (VS Code has a built-in "Source Control" tab that can do this for you with a few clicks — look for the branch icon in the left sidebar).

### 7b. Deploy the backend (Railway)
1. Go to [railway.app](https://railway.app), sign up, and create a new project from your GitHub repo.
2. When it asks which folder to deploy, point it at `backend`.
3. In the project's **Variables** settings, add the same values from your local `backend/.env` file: `DATABASE_URL`, `ADMIN_PASSWORD`, and set `CORS_ORIGIN` to your future Vercel site URL (you can update this after Step 7c).
4. Once deployed, Railway gives you a URL like `https://your-app.up.railway.app` — save it, you'll need it next.

### 7c. Deploy the frontend (Vercel)
1. Go to [vercel.com](https://vercel.com), sign up, and import the same GitHub repo.
2. When it asks for the root directory, choose `frontend`.
3. Add an environment variable: `VITE_API_URL` = `https://your-app.up.railway.app/api` (using the URL from step 7b).
4. Click Deploy. Vercel gives you a live link — that's your wedding website!

5. Go back to Railway and update `CORS_ORIGIN` to your new Vercel link, so the backend allows requests from it.

---

---

## Step 8: Make your QR code

Once your site is live (Step 7), you need one link for everyone:

1. Take your Vercel link and add `#rsvp` on the end, e.g. `https://our-wedding.vercel.app/#rsvp`. That takes people straight to the RSVP section.
2. Paste it into any free QR generator (search "QR code generator" — pick one that doesn't make you sign up) and download the image.
3. Put that image on your invitations. Test it by scanning it with your own phone before you print.

---

## If something breaks

- **"Cannot connect to database"** → check `DATABASE_URL` in `backend/.env` for typos, especially the password.
- **Searching for a name finds nothing** → the guest list probably isn't imported yet (Step 5), or try just a surname.
- **Frontend loads but RSVP/guestbook don't work** → make sure the backend terminal (Step 2) is still running.
- **"command not found: npm"** → Node.js isn't installed correctly; revisit Step 0.
- Stuck on anything else — copy the exact error message and ask, it'll usually point straight at the fix.
#   w e d d i n g  
 