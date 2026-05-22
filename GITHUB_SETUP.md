# GitHub Setup — Getting the Project Running

## What you need to install first

Before anything, make sure you have these installed on your computer:

1. **Node.js** — download from https://nodejs.org (download the LTS version)
   - To check if it's already installed, open a terminal and type: `node -v`
   - You should see something like `v20.x.x`

2. **Git** — download from https://git-scm.com
   - To check if it's already installed: `git --version`

3. **VS Code** — download from https://code.visualstudio.com (recommended editor)

---

## Step 1 — Clone the repo

Open a terminal and run:

```bash
git clone https://github.com/ame-nexus/Lumray.git
```

This downloads the project to your computer into a folder called `Lumray`.

Then go into the folder:

```bash
cd Lumray
```

---

## Step 2 — Create your own branch

Do NOT work directly on `main`. Create your own branch with your name:

```bash
git checkout -b yourname
```

For example:
```bash
git checkout -b sarah
```

You should see: `Switched to a new branch 'sarah'`

---

## Step 3 — Install dependencies

You only need to work on the frontend (`lumray-web`). Run:

```bash
cd lumray-web
npm install
```

This will take a minute. You'll see a lot of text — that's normal.

---

## Step 4 — Create the environment file

Inside the `lumray-web` folder, create a new file called `.env.local` (exactly that name).

Paste this inside it:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Save the file. This tells the frontend where the backend is. You don't need the backend running for the auth page task.

---

## Step 5 — Start the dev server

Make sure you're inside the `lumray-web` folder, then run:

```bash
npm run dev
```

You should see:
```
▲ Next.js 14
- Local: http://localhost:3000
```

Open your browser and go to **http://localhost:3000** — you should see the Lumray landing page.

---

## Step 6 — Open the project in VS Code

From the `Lumray` root folder run:

```bash
code .
```

Or open VS Code manually and use File → Open Folder → select the `Lumray` folder.

---

## How to save your work (commit and push)

After you make changes and want to save them to GitHub:

```bash
# 1. See what files you changed
git status

# 2. Stage your changes (add the files you want to save)
git add lumray-web/src/app/login/page.tsx

# 3. Write a commit message describing what you did
git commit -m "feat: build login and signup page"

# 4. Push to GitHub
git push origin yourname
```

Replace `yourname` with your actual branch name.

---

## When you're done and want to merge into main

Tell Omar — he will review and merge it via a Pull Request on GitHub. Do not push directly to `main`.

---

## Folder structure — what you need to know

You only need to touch `lumray-web/`:

```
lumray-web/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← landing page (don't touch)
│   │   └── login/
│   │       └── page.tsx      ← CREATE THIS (your task)
│   ├── components/
│   │   └── landing/          ← don't touch
│   └── services/
│       └── api.ts            ← don't touch
├── public/
│   └── images/               ← logo and assets are here
└── package.json
```

Your only job is to create the file `src/app/login/page.tsx`.

---

## If something doesn't work

- `npm install` fails → make sure Node.js is installed correctly
- Port 3000 already in use → run `npm run dev -- -p 3001` to use port 3001
- Can't push to GitHub → make sure you're on your own branch, not `main`
