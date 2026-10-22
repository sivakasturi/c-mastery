# C Mastery: learn C from zero to pro

A swipeable, card-based web app that takes you from "what is C?" to pro-level systems programming.

**▶ Live site: https://sivakasturi.github.io/c-mastery/**

## What's inside

- **101 concept cards** in **14 modules**, grouped into four levels: Beginner → Intermediate → Advanced → Pro
- A **checkpoint quiz** at the end of every module (51 questions, each with an explanation)
- Real, complete programs with syntax highlighting, a copy button and their **exact output**. Every runnable sample is compiled with `gcc -std=c17 -Wall -Wextra -Werror` and its output checked.
- "Pro tip" and "Watch out" callouts on the pitfalls professionals care about

| Level | Modules |
|---|---|
| Beginner | Getting Started · Variables & Types · Operators · Control Flow · Functions |
| Intermediate | Arrays & Strings · Pointers · Dynamic Memory · Structs, Unions & Enums |
| Advanced | Files & I/O · Preprocessor & Multi-file Builds · Advanced Pointers · Data Structures |
| Pro | Undefined behavior, sanitizers, gdb, bit tricks, cache performance, secure C, portability, threads, C standards, project roadmap |

## Using it

- **Swipe** left/right on a card (touch or mouse drag), or use the **← →** keys or the on-screen buttons
- **L** marks a card as learned, and **M** opens the course map
- Progress, quiz answers and theme are saved in your browser (localStorage)
- Deep links: `…/c-mastery/#42` opens card 42

## Tech

Plain HTML, CSS and JavaScript, with no build step and no dependencies. Course content lives in `js/cards-*.js`. To add a card, append an object to a module's `cards` array:

```js
{ title: "…", body: R`<p>…</p>`, code: R`…C code…`, out: "expected output\n", tip: R`…`, warn: R`…` }
```

To run it locally: `python3 -m http.server` and then open http://localhost:8000.
