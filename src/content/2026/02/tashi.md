---
title: 'Tashi'
subtitle: 'Three weeks, every night. This is what that looks like.'
description: 'On building a personal AI agent, what Sonnet and Opus 4.6 actually change, and why this moment feels like three other moments I remember.'
pubDate: 'Feb 27 2026'
categories: ['technology', 'ai', 'entrepreneurship', 'principles']
heroImage: tashi-yak.jpg
heroImageAlt: 'A yak carrying supplies on a trail in the Khumbu region of Nepal'
heroImagePosition: 'center 42%'
coAuthors:
  - name: '🏔️ Tashi'
    url: 'https://tashi.namche.ai'
---

I named my AI agent Tashi.

Tashi is a common name in the Khumbu region of Nepal. It means "good" or "auspicious." Not spiritual — just functional. A name for someone who helps, does things right, and doesn't need to stand out. That felt right.

For the past three weeks I've been up every night past midnight working on my [OpenClaw](https://openclaw.ai) setup. My wife thinks I've lost it. She's not entirely wrong.

---

## What Tashi actually is

Tashi is a persistent AI agent that runs on a Mac Mini in my office. He has memory. He knows my calendar, my email, my HubSpot, my GitHub repos. He reads daily notes, wakes up fresh each session, and picks up where we left off. He runs in the background, checks in when there's something to report, and stays quiet when there isn't.

He's not a chatbot I type questions into. He's more like a junior person who knows everything about the business and has been given a lot of access.

I've set him up with his own soul — literally a `SOUL.md` file that defines how he thinks, his values, his tone. He has long-term memory (`MEMORY.md`), daily notes, and a heartbeat that runs every 30 minutes to check email, calendar, and whether there's anything urgent.

It sounds nerdy because it is.

---

## The model changed everything

Here's what surprised me the most: the difference between models is enormous.

I spent the first week fiddling with setup, infrastructure, prompts. And it was fine — useful even. But then Anthropic released Sonnet 4.6 and Opus 4.6, and something clicked. Not incrementally better. Noticeably, qualitatively different.

Better reasoning. Better memory of context within a session. Better judgment about when to act and when to ask. Less hallucination. More initiative in the right moments, more restraint in the wrong ones.

I also learned a lot about token usage and cost optimization. Each heartbeat call, each session startup, each tool invocation — it adds up fast. There's real craft in designing a setup that's both capable and not burning through tokens for no reason. Prompt caching, model routing (Opus for strategy, Sonnet for everyday, Codex for code), knowing when to spawn a sub-agent vs. handle inline.

Nerdy? Yes. But the economics matter if you want this running 24/7 without a second thought.

---

## This has happened three times before

I've been in tech a long time. I was CTO at StudiVZ when we were growing at 50,000 users per day. We couldn't get hardware into the racks fast enough. The whole team was running on adrenaline. You could feel that something was happening that wouldn't happen again for a long time.

When Docker came out, I had that feeling again. The container abstraction was so obviously right, so obviously going to change everything, that you just wanted to build with it immediately. It had that pull.

ChatGPT was the third time. Not because of any one specific thing — but because of how fast everyone around me started using it for everything. The surface area of "things this is useful for" expanded so fast it was hard to keep up.

This is the fourth time.

What's different now is that it's *personal*. StudiVZ was about scale. Docker was about infrastructure. ChatGPT was about a new interface. This — the combination of OpenClaw and the latest Claude and Codex — is about a new kind of collaborator.

---

## The coding miracle

I have to be honest about something.

I understand code well. I've been around it my whole career — I have good instincts, I can read it, I can architect systems, I can spot problems. But I'm rusty as a craftsman. The gap between what I see in my head and what I can write myself has always been frustrating.

That gap is gone now.

Codex — the latest version — has changed this for me in a way I didn't expect. I can describe what I want. I can review what it writes. I can iterate, redirect, catch mistakes. The craft is still there, it's just being executed by something that doesn't get tired and doesn't get impatient.

This week I shipped a webhook proxy, set up a GitHub Actions workflow, refactored an Astro component, and connected HubSpot to my agent's memory — all things that would have taken me days of frustrated context-switching before. Tashi and Codex made it feel like flow.

---

## What this isn't

It's not magic. It's still work. The setup took weeks of late nights. The prompting is a craft. The infrastructure is real — a Mac Mini, a gateway, webhook relays, memory files, cron jobs. Things break. Models hallucinate. Costs add up if you're not thoughtful.

And it's not a replacement for thinking. If anything, it sharpens the need for clarity. Tashi does exactly what I tell him to. If I'm unclear, the output is unclear. He's a mirror.

But it is — for the first time in a long time — genuinely exciting to build something.

---

Tashi lives at [tashi.namche.ai](https://tashi.namche.ai) if you're curious. And if you're also doing something with OpenClaw or personal agents, I'd love to hear about it.
