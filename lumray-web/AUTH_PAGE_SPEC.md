# Auth Page — Build Spec

## Your task
Create one file: `src/app/login/page.tsx`

This is a single page with a login form and a signup form. A tab switcher at the top of the right column toggles between them. No backend needed — the forms don't need to submit anything real yet.

---

## What it looks like

Two screenshots are in the team group chat. Here's what each part is:

- **Left side** (purple): logo, tagline, back button — never changes
- **Right side** (dark): has "Log In" and "Sign Up" tabs at the top. Clicking a tab swaps the form below it

---

## Step 1 — Create the folder and file

Inside `lumray-web/src/app/`, create a new folder called `login`.
Inside that folder create a file called `page.tsx`.

The full path should be: `lumray-web/src/app/login/page.tsx`

---

## Step 2 — Paste this starting skeleton

```tsx
'use client'

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function LoginPage() {
    const [tab, setTab] = useState<'login' | 'signup'>('login')

    return (
        <div className="min-h-screen bg-[#12101f] flex items-center justify-center p-6">
            <div className="w-full max-w-[820px] flex rounded-2xl overflow-hidden">

                {/* LEFT COLUMN — build this in Step 3 */}

                {/* RIGHT COLUMN — build this in Step 4 */}

            </div>
        </div>
    )
}
```

---

## Step 3 — Build the left column

Replace the `{/* LEFT COLUMN */}` comment with this:

```tsx
<div className="w-[340px] flex-shrink-0 bg-[#714ee4] p-8 flex flex-col justify-between relative overflow-hidden">

    {/* Top: logo + circle decoration */}
    <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
            <Image src="/images/lumray-icon.svg" alt="Lumray" width={28} height={28} />
            <span className="font-outfit font-semibold text-white text-lg">lumray</span>
        </div>
        <Image
            src="/images/circle pattern2.svg"
            alt=""
            width={120}
            height={120}
            className="absolute -top-6 -right-6 opacity-40"
        />
    </div>

    {/* Middle: tagline */}
    <div className="relative z-10">
        <h1 className="font-outfit font-bold text-[38px] text-white leading-tight mb-4">
            A diary for everything you watch.
        </h1>
        <p className="text-white/70 text-sm leading-relaxed">
            Log films. Rate them. Join a community that takes cinema seriously
            — without taking itself too seriously.
        </p>
    </div>

    {/* Bottom: back button */}
    <div className="relative z-10">
        <Link
            href="/"
            className="flex items-center gap-1 text-white/80 text-sm border border-white/30 rounded-full px-4 py-2 w-fit hover:bg-white/10 transition-colors"
        >
            <ChevronLeft size={16} />
            Back
        </Link>
    </div>

</div>
```

---

## Step 4 — Build the right column

Replace the `{/* RIGHT COLUMN */}` comment with this:

```tsx
<div className="flex-1 bg-[#1a1b21] p-10 flex flex-col">

    {/* Tab switcher */}
    <div className="flex gap-6 border-b border-[#ede9fc]/10 mb-8">
        <button
            onClick={() => setTab('login')}
            className={`pb-3 text-sm font-medium transition-colors ${
                tab === 'login'
                    ? 'text-white border-b-2 border-[#714ee4]'
                    : 'text-[#7a7882]'
            }`}
        >
            Log In
        </button>
        <button
            onClick={() => setTab('signup')}
            className={`pb-3 text-sm font-medium transition-colors ${
                tab === 'signup'
                    ? 'text-white border-b-2 border-[#714ee4]'
                    : 'text-[#7a7882]'
            }`}
        >
            Sign Up
        </button>
    </div>

    {/* Show login or signup depending on active tab */}
    {tab === 'login' ? <LoginForm /> : <SignupForm />}

</div>
```

---

## Step 5 — Build the LoginForm component

Add this **above** the `export default function LoginPage()` line:

```tsx
function LoginForm() {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="font-outfit font-bold text-[28px] text-white">Welcome back</h2>
                <p className="text-[#7a7882] text-sm mt-1">Pick up where you left off</p>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Username</label>
                <input
                    type="text"
                    placeholder="username"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Email</label>
                <input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[#ede9fc] text-sm cursor-pointer">
                    <input type="checkbox" className="accent-[#714ee4]" />
                    Remember me
                </label>
                <button className="text-[#b9a4fc] text-sm hover:underline">
                    Forgot password?
                </button>
            </div>

            {/* Submit */}
            <button className="bg-[#714ee4] text-white rounded-lg py-3 font-medium hover:bg-[#5f3ecf] transition-colors">
                Log In
            </button>

            <OAuthButtons />
        </div>
    )
}
```

---

## Step 6 — Build the SignupForm component

Add this right below the `LoginForm` function:

```tsx
function SignupForm() {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="font-outfit font-bold text-[28px] text-white">Join Lumray</h2>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Username</label>
                <input
                    type="text"
                    placeholder="username"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Email</label>
                <input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Confirm Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    className="bg-[#2c2d38] border border-[#ede9fc]/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-[#7a7882] focus:outline-none focus:border-[#714ee4]"
                />
            </div>

            {/* Submit */}
            <button className="bg-[#714ee4] text-white rounded-lg py-3 font-medium hover:bg-[#5f3ecf] transition-colors">
                Create Account
            </button>

            <OAuthButtons />
        </div>
    )
}
```

---

## Step 7 — Build the OAuthButtons component

Add this right below the `SignupForm` function:

```tsx
function OAuthButtons() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#ede9fc]/10" />
                <span className="text-[#7a7882] text-xs">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-[#ede9fc]/10" />
            </div>
            <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 border border-[#ede9fc]/15 text-white rounded-lg py-2.5 text-sm hover:bg-[#ede9fc]/5 transition-colors">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                    Google
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-[#ede9fc]/15 text-white rounded-lg py-2.5 text-sm hover:bg-[#ede9fc]/5 transition-colors">
                    <span className="text-base"></span>
                    Apple
                </button>
            </div>
        </div>
    )
}
```

---

## Final check

Go to **http://localhost:3000/login** in your browser.

You should see:
- [ ] Purple left column with logo, tagline, and Back button
- [ ] Dark right column with "Log In" and "Sign Up" tabs
- [ ] Clicking "Sign Up" tab shows the signup form
- [ ] Clicking "Log In" tab goes back to the login form
- [ ] All input fields are visible and styled correctly
- [ ] Buttons are purple

If something looks wrong, compare the colors in the code to the screenshots. Most issues are a wrong color value or a missing className.
