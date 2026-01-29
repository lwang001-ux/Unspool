import React, { useState, useEffect, useMemo, useRef } from 'react';

/* ---------- palette ---------- */
const CMYK = { c: "#00C2FF", m: "#FF007F", y: "#FFEB00", k: "#111111" };
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/* ---------- layout constants ---------- */
const GRID_COLS = "1fr minmax(0, 340px) minmax(0, 340px)";
const GRID_GAP = 24;

/* ---------- tags ---------- */
const TAGS = [
  { id: "process", label: "process", top: CMYK.c },
  { id: "systems", label: "systems", top: CMYK.m },
  { id: "materials", label: "materials", top: CMYK.y },
  { id: "documentation", label: "documentation", top: CMYK.k },
  { id: "assessment", label: "assessment", top: CMYK.k },
  { id: "makerspace", label: "makerspace", top: CMYK.y },
  { id: "design", label: "design", top: CMYK.c },
  { id: "sustainability", label: "sustainability", top: CMYK.c },
];

/* ---------- RNG functions ---------- */
function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWithRng(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${pad2(d.getDate())}, ${d.getFullYear()}`;
}

/* ---------- content ---------- */
const INSPIRATION = [
  // Famous Designer Quotes - Dieter Rams
  { kind: "quote", topic: "design", text: "Good design is as little design as possible.", author: "Dieter Rams" },
  { kind: "quote", topic: "design", text: "Less, but better.", author: "Dieter Rams" },
  { kind: "quote", topic: "design", text: "Good design is honest.", author: "Dieter Rams" },
  { kind: "quote", topic: "design", text: "Good design is long-lasting.", author: "Dieter Rams" },
  { kind: "quote", topic: "design", text: "Good design is thorough down to the last detail.", author: "Dieter Rams" },
  { kind: "quote", topic: "sustainability", text: "Good design is environmentally friendly.", author: "Dieter Rams" },
  { kind: "quote", topic: "design", text: "Indifference towards people and the reality in which they live is actually the one and only cardinal sin in design.", author: "Dieter Rams" },

  // Charles & Ray Eames
  { kind: "quote", topic: "design", text: "The details are not the details. They make the design.", author: "Charles Eames" },
  { kind: "quote", topic: "creativity", text: "Never delegate understanding.", author: "Charles Eames" },
  { kind: "quote", topic: "design", text: "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose.", author: "Charles Eames" },
  { kind: "quote", topic: "systems", text: "Eventually everything connects—people, ideas, objects.", author: "Charles Eames" },
  { kind: "quote", topic: "making", text: "Take your pleasure seriously.", author: "Charles Eames" },
  { kind: "quote", topic: "creativity", text: "What works good is better than what looks good, because what works good lasts.", author: "Ray Eames" },
  { kind: "quote", topic: "curiosity", text: "The most important thing is to keep the most important thing the most important thing.", author: "Ray Eames" },

  // Buckminster Fuller
  { kind: "quote", topic: "systems", text: "You never change things by fighting the existing reality. To change something, build a new model that makes the existing model obsolete.", author: "Buckminster Fuller" },
  { kind: "quote", topic: "systems", text: "There is nothing in a caterpillar that tells you it's going to be a butterfly.", author: "Buckminster Fuller" },
  { kind: "quote", topic: "sustainability", text: "Pollution is nothing but resources we're not harvesting.", author: "Buckminster Fuller" },
  { kind: "quote", topic: "systems", text: "When I'm working on a problem, I never think about beauty. I think only how to solve the problem.", author: "Buckminster Fuller" },
  { kind: "quote", topic: "design", text: "If you want to teach people a new way of thinking, don't bother trying to teach them. Give them a tool.", author: "Buckminster Fuller" },

  // Victor Papanek
  { kind: "quote", topic: "sustainability", text: "Design has become the most powerful tool with which man shapes his tools and environments.", author: "Victor Papanek" },
  { kind: "quote", topic: "design", text: "The only important thing about design is how it relates to people.", author: "Victor Papanek" },
  { kind: "quote", topic: "sustainability", text: "There are professions more harmful than industrial design, but only a very few of them.", author: "Victor Papanek" },

  // Bruno Munari
  { kind: "quote", topic: "creativity", text: "Creativity is not a gift, it's a way of operating.", author: "Bruno Munari" },
  { kind: "quote", topic: "design", text: "Complicating is easy, simplifying is hard.", author: "Bruno Munari" },
  { kind: "quote", topic: "education", text: "A child who is playing or doing something is learning, but a child who is doing nothing is learning nothing.", author: "Bruno Munari" },
  { kind: "quote", topic: "creativity", text: "To understand a flower you need to find out about all kinds of other things.", author: "Bruno Munari" },

  // Massimo Vignelli
  { kind: "quote", topic: "design", text: "The life of a designer is a life of fight against the ugliness.", author: "Massimo Vignelli" },
  { kind: "quote", topic: "design", text: "If you can design one thing, you can design everything.", author: "Massimo Vignelli" },
  { kind: "quote", topic: "design", text: "Styles come and go. Good design is a language, not a style.", author: "Massimo Vignelli" },
  { kind: "quote", topic: "design", text: "There is no design without discipline. There is no discipline without intelligence.", author: "Massimo Vignelli" },

  // Paula Scher
  { kind: "quote", topic: "creativity", text: "It took me a few seconds to draw it, but it took me 34 years to learn how to draw it in a few seconds.", author: "Paula Scher" },
  { kind: "quote", topic: "design", text: "Design is the art of planning, and it is the art of making things possible.", author: "Paula Scher" },

  // Milton Glaser
  { kind: "quote", topic: "creativity", text: "There are three responses to a piece of design—yes, no, and WOW! Wow is the one to aim for.", author: "Milton Glaser" },
  { kind: "quote", topic: "education", text: "To design is to communicate clearly by whatever means you can control or master.", author: "Milton Glaser" },
  { kind: "quote", topic: "creativity", text: "Less isn't more; just enough is more.", author: "Milton Glaser" },

  // Paul Rand
  { kind: "quote", topic: "design", text: "Design is the silent ambassador of your brand.", author: "Paul Rand" },
  { kind: "quote", topic: "design", text: "Don't try to be original, just try to be good.", author: "Paul Rand" },
  { kind: "quote", topic: "design", text: "Simplicity is not the goal. It is the by-product of a good idea and modest expectations.", author: "Paul Rand" },
  { kind: "quote", topic: "creativity", text: "The role of the imagination is to create new meanings and to discover connections that, even if obvious, seem to escape detection.", author: "Paul Rand" },

  // Don Norman
  { kind: "quote", topic: "design", text: "Design is really an act of communication, which means having a deep understanding of the person with whom the designer is communicating.", author: "Don Norman" },
  { kind: "quote", topic: "design", text: "Good design is actually a lot harder to notice than poor design.", author: "Don Norman" },
  { kind: "quote", topic: "systems", text: "We are our own worst enemies. We don't learn. We don't change.", author: "Don Norman" },

  // Steve Jobs / Jony Ive
  { kind: "quote", topic: "design", text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
  { kind: "quote", topic: "design", text: "Simplicity is the ultimate sophistication.", author: "Steve Jobs" },
  { kind: "quote", topic: "creativity", text: "Creativity is just connecting things.", author: "Steve Jobs" },
  { kind: "quote", topic: "design", text: "True simplicity is derived from so much more than just the absence of clutter.", author: "Jony Ive" },

  // Other Designers & Thinkers
  { kind: "quote", topic: "design", text: "A designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupery" },
  { kind: "quote", topic: "design", text: "Have nothing in your houses that you do not know to be useful or believe to be beautiful.", author: "William Morris" },
  { kind: "quote", topic: "systems", text: "In an interconnected world, we need to learn how to think in systems.", author: "Donella Meadows" },
  { kind: "quote", topic: "systems", text: "A system must be managed. It will not manage itself.", author: "W. Edwards Deming" },
  { kind: "quote", topic: "architecture", text: "Less is more.", author: "Ludwig Mies van der Rohe" },
  { kind: "quote", topic: "architecture", text: "God is in the details.", author: "Ludwig Mies van der Rohe" },
  { kind: "quote", topic: "architecture", text: "Form follows function.", author: "Louis Sullivan" },
  { kind: "quote", topic: "nature", text: "In every walk with nature, one receives far more than he seeks.", author: "John Muir" },
  { kind: "quote", topic: "education", text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { kind: "quote", topic: "making", text: "The best way to have a good idea is to have a lot of ideas.", author: "Linus Pauling" },
  { kind: "quote", topic: "curiosity", text: "I have no special talents. I am only passionately curious.", author: "Albert Einstein" },
  { kind: "quote", topic: "sustainability", text: "We do not inherit the Earth from our ancestors; we borrow it from our children.", author: "Native American Proverb" },
  { kind: "quote", topic: "making", text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese Proverb" },
  { kind: "quote", topic: "education", text: "Learning is experience. Everything else is just information.", author: "Albert Einstein" },

  // Seymour Papert & Constructionism
  { kind: "quote", topic: "education", text: "You can't teach people everything they need to know. The best you can do is position them where they can find what they need to know when they need to know it.", author: "Seymour Papert" },
  { kind: "quote", topic: "education", text: "The role of the teacher is to create the conditions for invention rather than provide ready-made knowledge.", author: "Seymour Papert" },
  { kind: "quote", topic: "making", text: "The computer is a medium in which what we make lends itself to be shared.", author: "Seymour Papert" },

  // Maker Movement & Learning
  { kind: "quote", topic: "making", text: "Making is fundamental to what it means to be human.", author: "Dale Dougherty" },
  { kind: "quote", topic: "education", text: "The hand is the cutting edge of the mind.", author: "Jacob Bronowski" },
  { kind: "quote", topic: "making", text: "If you want to understand something, make it.", author: "Mitchel Resnick" },

  // Design Maxims (uncredited)
  { kind: "quote", topic: "design", text: "Design is the edit." },
  { kind: "quote", topic: "design", text: "Clarity beats decoration—every time." },
  { kind: "quote", topic: "design", text: "The best interface is no interface." },
  { kind: "quote", topic: "design", text: "Form follows function—but emotion follows form." },
  { kind: "quote", topic: "design", text: "Constraints are gifts disguised as limitations." },
  { kind: "quote", topic: "design", text: "Remove until it breaks. Then add back one thing." },
  { kind: "quote", topic: "design", text: "White space is not empty space. It's breathing room." },
  { kind: "quote", topic: "design", text: "Design for the verb, not the noun." },
  { kind: "quote", topic: "design", text: "The grid is a guide, not a prison." },

  // Creativity
  { kind: "quote", topic: "creativity", text: "Make the thing that makes the thing." },
  { kind: "quote", topic: "creativity", text: "Steal like an artist. Credit like a scholar." },
  { kind: "quote", topic: "creativity", text: "Every expert was once a beginner who kept showing up." },
  { kind: "quote", topic: "creativity", text: "The muse visits during the work, not before." },
  { kind: "quote", topic: "creativity", text: "Quantity leads to quality. Make a lot to make something good." },
  { kind: "quote", topic: "creativity", text: "Boredom is the signal to go deeper, not wider." },
  { kind: "quote", topic: "creativity", text: "Constraints spark creativity. Infinite options cause paralysis." },
  { kind: "quote", topic: "creativity", text: "Your taste is ahead of your skill. Keep making." },
  { kind: "quote", topic: "creativity", text: "Share before you're ready. Iterate in public." },

  // Curiosity
  { kind: "quote", topic: "curiosity", text: "Curiosity is a muscle. Use it or lose it." },
  { kind: "quote", topic: "curiosity", text: "The best question is the one you're afraid to ask." },
  { kind: "quote", topic: "curiosity", text: "Stay foolish. Ask the obvious question." },
  { kind: "quote", topic: "curiosity", text: "Follow the interesting thread, even if it leads nowhere." },
  { kind: "quote", topic: "curiosity", text: "'I don't know' is the beginning, not the end." },
  { kind: "quote", topic: "curiosity", text: "Read outside your field. That's where breakthroughs hide." },
  { kind: "quote", topic: "curiosity", text: "Ask 'why' five times. The real answer is always deeper." },
  { kind: "quote", topic: "curiosity", text: "Notice what you notice. Your attention knows something." },
  { kind: "quote", topic: "curiosity", text: "The adjacent possible is where innovation lives." },
  { kind: "quote", topic: "curiosity", text: "Curiosity requires humility. Expertise can kill wonder." },

  // Systems Thinking
  { kind: "quote", topic: "systems", text: "Zoom out until the causes connect." },
  { kind: "quote", topic: "systems", text: "Fix the system, not the symptom." },
  { kind: "quote", topic: "systems", text: "Every system is perfectly designed to get the results it gets." },
  { kind: "quote", topic: "systems", text: "Look for the feedback loops. That's where leverage hides." },
  { kind: "quote", topic: "systems", text: "The map is not the territory—but a good map changes how you see it." },
  { kind: "quote", topic: "systems", text: "Optimization of parts rarely optimizes the whole." },
  { kind: "quote", topic: "systems", text: "Emergence: the whole is smarter than the sum of its parts." },
  { kind: "quote", topic: "systems", text: "Complex systems fail in complex ways." },
  { kind: "quote", topic: "systems", text: "If you can't draw it, you don't understand it." },

  // Sustainability
  { kind: "quote", topic: "sustainability", text: "Design for repair first. Recycling is Plan B." },
  { kind: "quote", topic: "sustainability", text: "The most sustainable product is the one that already exists." },
  { kind: "quote", topic: "sustainability", text: "Waste is just a design flaw." },
  { kind: "quote", topic: "sustainability", text: "Circular design: the end is just another beginning." },
  { kind: "quote", topic: "sustainability", text: "Buy once, buy well. Or better yet, borrow." },
  { kind: "quote", topic: "sustainability", text: "The greenest energy is the energy not used." },
  { kind: "quote", topic: "sustainability", text: "Design for disassembly. Everything deserves a second life." },
  { kind: "quote", topic: "sustainability", text: "Local materials, global mindset." },
  { kind: "quote", topic: "sustainability", text: "Biomimicry: nature already solved it. Look closer." },
  { kind: "quote", topic: "sustainability", text: "Longevity is the ultimate sustainability metric." },
  { kind: "quote", topic: "sustainability", text: "A landfill is just a library of design failures." },
  { kind: "quote", topic: "sustainability", text: "Reduce, reuse, repair, rot, recycle—in that order." },

  // Engineering
  { kind: "quote", topic: "engineering", text: "Make the simplest version that survives real use." },
  { kind: "quote", topic: "engineering", text: "Build to learn, not to last. Then rebuild." },
  { kind: "quote", topic: "engineering", text: "Debugging is like being a detective in a crime movie where you're also the murderer." },
  { kind: "quote", topic: "engineering", text: "The best code is no code. The second best is simple code." },
  { kind: "quote", topic: "engineering", text: "Premature optimization is the root of all evil." },
  { kind: "quote", topic: "engineering", text: "Make it work. Make it right. Make it fast. In that order." },
  { kind: "quote", topic: "engineering", text: "Ship early, learn fast, iterate often." },
  { kind: "quote", topic: "engineering", text: "The prototype is the specification." },
  { kind: "quote", topic: "engineering", text: "Measure twice, cut once. Then measure again." },
  { kind: "quote", topic: "engineering", text: "Fail fast, fail cheap, fail forward." },
  { kind: "quote", topic: "engineering", text: "Technical debt is a mortgage on your future self." },

  // AI
  { kind: "quote", topic: "ai", text: "AI is a tool, not a replacement. Use it like a power drill, not a crutch." },
  { kind: "quote", topic: "ai", text: "The best AI prompts are conversations, not commands." },
  { kind: "quote", topic: "ai", text: "AI amplifies capability, not judgment. Judgment is still yours." },
  { kind: "quote", topic: "ai", text: "Train your taste before you train your model." },
  { kind: "quote", topic: "ai", text: "AI can mimic, but only humans can mean." },
  { kind: "quote", topic: "ai", text: "The future is human+AI, not human vs AI." },
  { kind: "quote", topic: "ai", text: "AI is a collaborator, not an oracle." },

  // Natural World
  { kind: "quote", topic: "nature", text: "Nature doesn't hurry, yet everything is accomplished." },
  { kind: "quote", topic: "nature", text: "A forest is a network. A city could be too." },
  { kind: "quote", topic: "nature", text: "Every organism is a 4-billion-year R&D project." },
  { kind: "quote", topic: "nature", text: "Ecosystems don't have waste. Only resources in the wrong place." },
  { kind: "quote", topic: "nature", text: "Observe a tree for an hour. You'll learn more than a week of meetings." },
  { kind: "quote", topic: "nature", text: "The best designs have already been tested by evolution." },
  { kind: "quote", topic: "nature", text: "Growth is not always vertical. Roots matter." },
  { kind: "quote", topic: "nature", text: "Seasons teach us: rest is part of the cycle, not a failure." },
  { kind: "quote", topic: "nature", text: "Diversity is resilience. Monocultures collapse." },
  { kind: "quote", topic: "nature", text: "Pay attention to edges. That's where ecosystems thrive." },

  // Digital Fabrication
  { kind: "quote", topic: "fabrication", text: "3D printing isn't making—it's materializing ideas." },
  { kind: "quote", topic: "fabrication", text: "Laser cutters think in 2.5D. Design accordingly." },
  { kind: "quote", topic: "fabrication", text: "The kerf is not a bug, it's a design constraint." },
  { kind: "quote", topic: "fabrication", text: "Parametric design: change one number, update everything." },
  { kind: "quote", topic: "fabrication", text: "Tolerance is the difference between a prototype and a product." },
  { kind: "quote", topic: "fabrication", text: "Test your joints in cardboard before you cut plywood." },
  { kind: "quote", topic: "fabrication", text: "The file is the blueprint. Version control is memory." },
  { kind: "quote", topic: "fabrication", text: "Every failed print is a lesson in physics." },
  { kind: "quote", topic: "fabrication", text: "Digital tools, analog thinking. The hand still matters." },

  // Making & Education
  { kind: "quote", topic: "education", text: "The best learning leaves evidence you can hold." },
  { kind: "quote", topic: "education", text: "Learning happens at the edge of comfort." },
  { kind: "quote", topic: "education", text: "Make thinking visible." },
  { kind: "quote", topic: "education", text: "Documentation is a form of learning, not just a record of it." },
  { kind: "quote", topic: "making", text: "Make something every day, even if it's just a sketch." },
  { kind: "quote", topic: "making", text: "The hands know things the mind forgets." },
  { kind: "quote", topic: "making", text: "Document your process, not just your products." },
  { kind: "quote", topic: "making", text: "Every maker was once a beginner who didn't quit." },
  { kind: "quote", topic: "making", text: "Low floor, wide walls, high ceiling. That's good project design." },
  { kind: "quote", topic: "making", text: "Prototypes are questions made physical." },
  { kind: "quote", topic: "making", text: "Hard fun beats easy boredom every time." },
  { kind: "quote", topic: "making", text: "A makerspace is not a room. It's a mindset." },

  // Architecture
  { kind: "quote", topic: "architecture", text: "Spaces teach—whether we mean them to or not." },
  { kind: "quote", topic: "architecture", text: "Light is the first material. Use it wisely." },

  // Materials & Documentation
  { kind: "quote", topic: "materials", text: "Choose fewer materials. Learn them deeply." },
  { kind: "quote", topic: "materials", text: "Every material has a grain. Respect it." },
  { kind: "quote", topic: "documentation", text: "If it isn't documented, it's a rumor." },
  { kind: "quote", topic: "documentation", text: "Future you will thank present you for good notes." },
];

const PROMPTS = [
  // Design Creativity
  { kind: "prompt", topic: "design", text: "Design a tool that removes one step from a daily routine—prototype it in paper." },
  { kind: "prompt", topic: "design", text: "Take one object. Remove 30% of its parts. What still works?" },
  { kind: "prompt", topic: "design", text: "Write a one-sentence design principle you'll follow this week." },
  { kind: "prompt", topic: "design", text: "Redesign a doorknob for someone who can't grip. What changes?" },
  { kind: "prompt", topic: "design", text: "Pick an everyday object. Sketch 10 variations in 10 minutes." },
  { kind: "prompt", topic: "design", text: "What would this product look like if it were designed by nature?" },
  { kind: "prompt", topic: "design", text: "Design something that gets better with age, not worse." },
  { kind: "prompt", topic: "design", text: "Take a digital experience. Make it physical. What's gained? What's lost?" },
  { kind: "prompt", topic: "design", text: "Design a single-use product that becomes something else after use." },
  { kind: "prompt", topic: "design", text: "What would Dieter Rams remove from your latest project?" },

  // Creativity & Making
  { kind: "prompt", topic: "creativity", text: "Combine two unrelated tools in your workspace. What new function emerges?" },
  { kind: "prompt", topic: "creativity", text: "Make something with only materials within arm's reach. 15 minutes. Go." },
  { kind: "prompt", topic: "creativity", text: "What's the worst version of your idea? Now find the hidden insight in it." },
  { kind: "prompt", topic: "creativity", text: "Describe your current project to a 5-year-old. What did you have to simplify?" },
  { kind: "prompt", topic: "creativity", text: "What if your project had to work in 100 years? What would you change?" },
  { kind: "prompt", topic: "creativity", text: "Take your idea and flip one core assumption. What happens?" },
  { kind: "prompt", topic: "creativity", text: "Design a toy that teaches one concept without words." },
  { kind: "prompt", topic: "creativity", text: "What would your project look like if it cost $1 to make? $1,000,000?" },
  { kind: "prompt", topic: "making", text: "Build a working prototype in one hour using only recycled materials." },
  { kind: "prompt", topic: "making", text: "Document one project with only photos—no words allowed." },
  { kind: "prompt", topic: "making", text: "Make the same thing three different ways. Which surprised you?" },
  { kind: "prompt", topic: "making", text: "What tool do you wish existed? Sketch it." },

  // Curiosity
  { kind: "prompt", topic: "curiosity", text: "Ask 'why' five times about something you use every day. Where do you end up?" },
  { kind: "prompt", topic: "curiosity", text: "Find something you don't understand. Spend 20 minutes learning just enough to explain it." },
  { kind: "prompt", topic: "curiosity", text: "Interview someone who does work completely unlike yours. What do you have in common?" },
  { kind: "prompt", topic: "curiosity", text: "Pick a random Wikipedia article. Connect it to your current project." },
  { kind: "prompt", topic: "curiosity", text: "What question have you been avoiding? Write it down." },
  { kind: "prompt", topic: "curiosity", text: "Look at something you made years ago. What do you notice now that you didn't then?" },
  { kind: "prompt", topic: "curiosity", text: "What's a skill you admire in others but haven't tried to learn?" },
  { kind: "prompt", topic: "curiosity", text: "Find a material you've never worked with. What are its properties?" },
  { kind: "prompt", topic: "curiosity", text: "What's something 'everyone knows' in your field that might be wrong?" },
  { kind: "prompt", topic: "curiosity", text: "Read the first page of three books you've never opened. What threads connect them?" },

  // Sustainability
  { kind: "prompt", topic: "sustainability", text: "Pick a product you love. Redesign it to be repairable in under 5 minutes." },
  { kind: "prompt", topic: "sustainability", text: "Trace one material in your project back to its source. What did you learn?" },
  { kind: "prompt", topic: "sustainability", text: "Design a product that creates zero waste at end of life. How?" },
  { kind: "prompt", topic: "sustainability", text: "What if your project had to be made from only local materials?" },
  { kind: "prompt", topic: "sustainability", text: "Redesign packaging so it becomes part of the product." },
  { kind: "prompt", topic: "sustainability", text: "Design something meant to be shared, not owned." },
  { kind: "prompt", topic: "sustainability", text: "How would nature solve this problem? Look for biomimicry inspiration." },
  { kind: "prompt", topic: "sustainability", text: "Calculate the carbon footprint of one thing you made. What's the biggest contributor?" },
  { kind: "prompt", topic: "sustainability", text: "Design a repair kit for something that's usually thrown away." },
  { kind: "prompt", topic: "sustainability", text: "What's the longest-lasting thing you've ever made? Why did it last?" },

  // Systems Thinking
  { kind: "prompt", topic: "systems", text: "Draw a loop: what increases demand, and what increases capacity?" },
  { kind: "prompt", topic: "systems", text: "Map all the stakeholders affected by your project. Who's missing?" },
  { kind: "prompt", topic: "systems", text: "What's the second-order effect of your design decision?" },
  { kind: "prompt", topic: "systems", text: "Draw your project as a system. Where are the feedback loops?" },
  { kind: "prompt", topic: "systems", text: "What would break if this succeeded beyond your expectations?" },
  { kind: "prompt", topic: "systems", text: "Find the constraint in your system. What happens if you remove it?" },
  { kind: "prompt", topic: "systems", text: "Map the flow of information in a space you use daily. Where does it get stuck?" },
  { kind: "prompt", topic: "systems", text: "What's the 'tragedy of the commons' in your field? How could design address it?" },
  { kind: "prompt", topic: "systems", text: "Identify a delay in a system you know well. What does it hide?" },
  { kind: "prompt", topic: "systems", text: "What would change if your project had to serve 1000x more people?" },

  // Education & Learning
  { kind: "prompt", topic: "education", text: "How would you show learning with 3 photos and 30 words?" },
  { kind: "prompt", topic: "education", text: "Design a lesson that uses no screens and no paper." },
  { kind: "prompt", topic: "education", text: "What's one thing you learned this week? Teach it to someone else." },
  { kind: "prompt", topic: "education", text: "Document your learning process, not just the result." },
  { kind: "prompt", topic: "education", text: "Design a way to make thinking visible in a group." },
  { kind: "prompt", topic: "education", text: "What mistake taught you the most? How would you share that lesson?" },
  { kind: "prompt", topic: "education", text: "Create a 'learning artifact' that shows your process, not just your product." },

  // Architecture & Space
  { kind: "prompt", topic: "architecture", text: "Sketch a quiet corner in a school. What materials make it calmer?" },
  { kind: "prompt", topic: "architecture", text: "Redesign a space you know well for someone with different abilities." },
  { kind: "prompt", topic: "architecture", text: "What does the layout of your workspace teach people about collaboration?" },
  { kind: "prompt", topic: "architecture", text: "Design a threshold—a moment of transition between two spaces." },

  // Nature & Observation
  { kind: "prompt", topic: "nature", text: "Go outside. Find three patterns. Sketch them in 5 minutes." },
  { kind: "prompt", topic: "nature", text: "Observe one natural process for 10 minutes. What design principles emerge?" },
  { kind: "prompt", topic: "nature", text: "Find a structure in nature that solves a problem you're working on." },
  { kind: "prompt", topic: "nature", text: "How does your local ecosystem handle waste? What can you learn from it?" },

  // Fabrication & Making
  { kind: "prompt", topic: "fabrication", text: "Design a joint that uses no glue, no screws—only geometry." },
  { kind: "prompt", topic: "fabrication", text: "What's one failed prototype that taught you something unexpected?" },
  { kind: "prompt", topic: "fabrication", text: "Design something that can be made with one tool and one material." },
  { kind: "prompt", topic: "fabrication", text: "Create a template someone else could use to make your design." },

  // AI & Technology
  { kind: "prompt", topic: "ai", text: "Ask AI to critique your latest project. Where do you disagree?" },
  { kind: "prompt", topic: "ai", text: "What's one thing AI can't do that your project requires?" },
  { kind: "prompt", topic: "ai", text: "Design a human-AI collaboration for a task you usually do alone." },
  { kind: "prompt", topic: "ai", text: "What part of your creative process would you never outsource to AI? Why?" },

  // Science & Experimentation
  { kind: "prompt", topic: "science", text: "What's one variable you could control to make your project more reliable?" },
  { kind: "prompt", topic: "science", text: "Design an experiment to test one assumption in your project." },
  { kind: "prompt", topic: "science", text: "What data would change your mind about your current approach?" },
];

/* ---------- Real Twitter Archive Data ---------- */
const REAL_ARCHIVE = [
  { id: "1711116983561834571", created_at: "Sun Oct 08 20:30:54 +0000 2023", full_text: "After a weekend of learning, sharing and presenting at #flc2023 so nice to go for a ride across the Hudson!", hashtags: ["flc2023"], media: [{ type: "photo", url: "https://pbs.twimg.com/ext_tw_video_thumb/1711114276927139840/pu/img/PpNj2jKIeuN-jb2T.jpg" }] },
  { id: "1680195314928570373", created_at: "Sat Jul 15 12:39:14 +0000 2023", full_text: "Had so much fun learning with project mates Andrew, Tazz, Amanda and Kurt! #cmk23 #realdealpbl #learningbydoing #hardfun", hashtags: ["cmk23", "realdealpbl", "learningbydoing", "hardfun"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/F1FAu76XgAA4Z7j.jpg" }] },
  { id: "1680191218519625729", created_at: "Sat Jul 15 12:22:57 +0000 2023", full_text: "So much gratitude to amazing teachers for an incredible experience at #cmk23 #realdealpbl #learningbydoing #inventtolearn", hashtags: ["cmk23", "realdealpbl", "learningbydoing", "inventtolearn"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/F1E8g5TXoAEjDtx.jpg" }] },
  { id: "1679686893066223616", created_at: "Fri Jul 14 02:58:57 +0000 2023", full_text: "Charle Rosen of the 8 Bit Big Band! #cmk23", hashtags: ["cmk23"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/F09yUs_WYAEZlzO.jpg" }] },
  { id: "1679684382305517569", created_at: "Fri Jul 14 02:48:58 +0000 2023", full_text: "CEO demonstrating new machine learning capabilities of the #bbcmicrobit #cmk23", hashtags: ["bbcmicrobit", "cmk23"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/F09wCtXXoAEPBhK.jpg" }] },
  { id: "1679218946782687232", created_at: "Wed Jul 12 19:59:29 +0000 2023", full_text: "So much fun at #CMK23 #realdealpbl", hashtags: ["CMK23", "realdealpbl"], media: [{ type: "photo", url: "https://pbs.twimg.com/ext_tw_video_thumb/1679218895721316353/pu/img/dxjgZhq4Xh6OWi4V.jpg" }] },
  { id: "1667601684514721795", created_at: "Sat Jun 10 18:36:38 +0000 2023", full_text: "9th grade lighting designs made with love in the spark lab. #mypdesign", hashtags: ["mypdesign"], media: [{ type: "photo", url: "https://pbs.twimg.com/ext_tw_video_thumb/1667601551974703104/pu/img/RK-NneuI1vUFwb-R.jpg" }] },
  { id: "1633645913074806784", created_at: "Thu Mar 09 01:48:32 +0000 2023", full_text: "Looking forward to welcoming amazing teachers to our schools. Registration is now open for these workshops! #makered", hashtags: ["makered"], media: [] },
  { id: "1130834557551480832", created_at: "Tue May 21 13:55:43 +0000 2019", full_text: "We made this Central Park bird list for our first graders! Can't wait to bring them to the park this afternoon! #girlswhobird #mmtsteam #changeperspective", hashtags: ["girlswhobird", "mmtsteam", "changeperspective"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D7GICMUX4AAtipu.jpg" }] },
  { id: "1129715076594843648", created_at: "Sat May 18 11:47:18 +0000 2019", full_text: "So much fun planning a birding trip to Central Park with our 1st graders. One way to bring the outside-in. We were watching a yellow throated vireo build its nest. #girlswhobird #mmtsteam #changeperspective", hashtags: ["girlswhobird", "mmtsteam", "changeperspective"], media: [] },
  { id: "1129568273174077440", created_at: "Sat May 18 02:03:57 +0000 2019", full_text: "First graders drawing the bird species they are becoming experts on. We loved hearing Noor mention that everyone in her family is learning about her bird, the northern flicker. #mmtsteam #girlswhobird #changeperspective", hashtags: ["mmtsteam", "girlswhobird", "changeperspective"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D60IUZ6WsAEDeiy.jpg" }] },
  { id: "1117570365209890816", created_at: "Sun Apr 14 23:28:33 +0000 2019", full_text: "The Lower Middle School #ROarBOTS at #RoboExpo #mmtmakers", hashtags: ["ROarBOTS", "RoboExpo", "mmtmakers"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D4JoUogW4AE33Qr.jpg" }] },
  { id: "1116077448255422464", created_at: "Wed Apr 10 20:36:14 +0000 2019", full_text: "Cassidy's latest iteration made with felt", hashtags: [], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D30ahZNWsAAaQ3M.jpg" }] },
  { id: "1116074158285307906", created_at: "Wed Apr 10 20:23:09 +0000 2019", full_text: "Introducing the #mmtROarBOTS #mmtmakers", hashtags: ["mmtROarBOTS", "mmtmakers"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D30Xh4bX4AEJGW2.jpg" }] },
  { id: "1116064706253471745", created_at: "Wed Apr 10 19:45:36 +0000 2019", full_text: "Lower Middle School ROarBOTS making custom t-shirts for #roboexpo", hashtags: ["roboexpo"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D30O7wEW0AA9wbz.jpg" }] },
  { id: "1115993897598111745", created_at: "Wed Apr 10 15:04:14 +0000 2019", full_text: "Ava and Mia, Class IV, designed Mr. Microbit", hashtags: [], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D3zOhlqXsAECeYB.jpg" }] },
  { id: "1115993623466782720", created_at: "Wed Apr 10 15:03:08 +0000 2019", full_text: "Cassidy and Hunter, Class IV, designed a fitness tracker! #microbit #mmtsteam", hashtags: ["microbit", "mmtsteam"], media: [{ type: "photo", url: "https://pbs.twimg.com/ext_tw_video_thumb/1115993566315253760/pu/img/stZy6Fb3F3x-U0ek.jpg" }] },
  { id: "1106739358944714752", created_at: "Sat Mar 16 02:10:00 +0000 2019", full_text: "Parker's first time with the micro:bit #mmtsteam #girlswholovetocode", hashtags: ["mmtsteam", "girlswholovetocode"], media: [{ type: "photo", url: "https://pbs.twimg.com/ext_tw_video_thumb/1106738803358814208/pu/img/k2YB8Ga_i3rpY2EV.jpg" }] },
  { id: "1106596105876328448", created_at: "Fri Mar 15 16:40:45 +0000 2019", full_text: "Class IV coding with the micro:bit #mmtsteam #girlwholovetocode", hashtags: ["mmtsteam", "girlwholovetocode"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D1trSgUWkAAXLq8.jpg" }] },
  { id: "1106537500758151170", created_at: "Fri Mar 15 12:47:53 +0000 2019", full_text: "Amazed by the Class IV vending machines #mmtsteam #howcomputersthink", hashtags: ["mmtsteam", "howcomputersthink"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D1s1_V7W0AIK8CI.jpg" }] },
  { id: "1106536657371709445", created_at: "Fri Mar 15 12:44:32 +0000 2019", full_text: "A happy customer at our Class IV vending machine showcase! #mmtsteam #howcomputersthink", hashtags: ["mmtsteam", "howcomputersthink"], media: [{ type: "photo", url: "https://pbs.twimg.com/media/D1s0rblWoAAs8Kv.jpg" }] },
];

function makeDailyTweet(seedStr, index = 0) {
  const seed = hash32(`${seedStr}::${index}`);
  const rng = mulberry32(seed);
  const pool = shuffleWithRng([...INSPIRATION, ...PROMPTS], rng);
  const item = pool[0] || pickWithRng(INSPIRATION, rng);
  const t1 = pickWithRng(TAGS, rng);
  let t2 = pickWithRng(TAGS, rng);
  for (let i = 0; i < 12 && t2.id === t1.id; i++) t2 = pickWithRng(TAGS, rng);
  return {
    id: `d_${seedStr}_${index}`,
    date: new Date(),
    text: item.text,
    kind: item.kind,
    topic: item.topic,
    author: item.author || null,
    tags: [t1, t2],
  };
}

/* ---------- sound hook ---------- */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function useKeyboardClickSound(enabled) {
  const ctxRef = useRef(null);
  
  function play() {
    if (!enabled) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      o.type = "square";
      o.frequency.value = randInt(1800, 2600);
      f.type = "bandpass";
      f.frequency.value = 2200;
      f.Q.value = 10;
      g.gain.value = 0.0001;
      o.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      const dur = 0.03;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.06, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now);
      o.stop(now + dur);
    } catch {}
  }
  
  useEffect(() => {
    const resume = async () => {
      try {
        if (ctxRef.current && ctxRef.current.state === "suspended") await ctxRef.current.resume();
      } catch {}
    };
    window.addEventListener("pointerdown", resume, { passive: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, []);
  
  return play;
}

/* ---------- UI Components ---------- */
function PageNavButton({ label, sliverColor, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        border: "1px solid rgba(0,0,0,0.16)",
        background: "rgba(255,255,255,0.92)",
        color: "#111111",
        padding: "10px 16px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 850,
        cursor: "pointer",
        outline: "none",
        userSelect: "none",
        minWidth: 86,
        borderTopWidth: 2,
        borderTopStyle: "solid",
        borderTopColor: sliverColor,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {label}
      {active && (
        <span style={{
          position: "absolute",
          left: 12,
          right: 12,
          top: "calc(100% + 7px)",
          height: 3,
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.95) 1.2px, transparent 1.8px)",
          backgroundSize: "10px 3px",
          backgroundRepeat: "repeat-x",
          pointerEvents: "none",
        }} />
      )}
    </button>
  );
}

function TagPill({ label, topColor }) {
  return (
    <span style={{
      fontSize: 10,
      padding: "4px 7px",
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.10)",
      background: "rgba(255,255,255,0.98)",
      borderBottomWidth: 2,
      borderBottomStyle: "solid",
      borderBottomColor: topColor,
      boxSizing: "border-box",
    }}>
      {label}
    </span>
  );
}

function ControlScreen({ title, desc, children }) {
  return (
    <div style={{
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.16)",
      background: "rgba(245,246,248,0.92)",
      padding: "6px 7px",
      minWidth: 128,
      maxWidth: 128,
      height: 66,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      flex: "0 0 auto",
      boxSizing: "border-box",
    }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 10.4, fontWeight: 950, letterSpacing: 0.12, opacity: 0.9 }}>{title}</div>
        <div style={{ fontFamily: MONO, fontSize: 9.2, letterSpacing: 0.12, opacity: 0.62, marginTop: 2, lineHeight: 1.12 }}>{desc}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", paddingBottom: 4 }}>{children}</div>
    </div>
  );
}

function Knob({ color, on, onToggle, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={ariaLabel}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        textAlign: "left",
        userSelect: "none",
      }}
    >
      <div style={{ display: "inline-flex" }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          border: `3px solid ${color}`,
          background: "rgba(255,255,255,0.98)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 140ms ease",
          position: "relative",
          boxSizing: "border-box",
          transform: `rotate(${on ? 135 : 45}deg)`,
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)" }} />
          <div style={{ position: "absolute", top: 3, left: "50%", width: 2, height: 8, borderRadius: 99, background: "rgba(0,0,0,0.82)", transform: "translateX(-50%)" }} />
        </div>
      </div>
    </button>
  );
}

function ActionKnob({ color, onClick, ariaLabel }) {
  const [pressed, setPressed] = useState(false);

  function handleClick() {
    onClick?.();
    setPressed(true);
    setTimeout(() => setPressed(false), 600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        textAlign: "left",
        userSelect: "none",
      }}
    >
      <div style={{ display: "inline-flex" }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          border: `3px solid ${color}`,
          background: "rgba(255,255,255,0.98)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxSizing: "border-box",
          transform: `rotate(${pressed ? 90 : 0}deg)`,
          transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)" }} />
          <div style={{ position: "absolute", top: 3, left: "50%", width: 2, height: 8, borderRadius: 99, background: "rgba(0,0,0,0.82)", transform: "translateX(-50%)" }} />
        </div>
      </div>
    </button>
  );
}

// Knob that rotates to 12:15 when selected, returns to noon when not
function SelectableKnob({ color, selected, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        textAlign: "left",
        userSelect: "none",
      }}
    >
      <div style={{ display: "inline-flex" }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          border: `3px solid ${color}`,
          background: "rgba(255,255,255,0.98)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxSizing: "border-box",
          transform: `rotate(${selected ? 90 : 0}deg)`,
          transition: "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)" }} />
          <div style={{ position: "absolute", top: 3, left: "50%", width: 2, height: 8, borderRadius: 99, background: "rgba(0,0,0,0.82)", transform: "translateX(-50%)" }} />
        </div>
      </div>
    </button>
  );
}

function CopyKnob({ text, clickSound }) {
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);

  async function handleCopy() {
    clickSound?.();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setRotation(prev => prev + 90);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 400,
        letterSpacing: 0.12,
        opacity: copied ? 1 : 0.5,
        color: copied ? CMYK.c : "rgba(0,0,0,0.65)",
        transition: "all 200ms ease",
      }}>
        {copied ? "copied!" : "copy"}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy tweet"
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          border: `2.5px solid ${copied ? CMYK.c : "rgba(0,0,0,0.18)"}`,
          background: copied ? "rgba(0,194,255,0.08)" : "rgba(255,255,255,0.98)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxSizing: "border-box",
          transform: `rotate(${rotation}deg)`,
          transition: "all 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.06)",
          }} />
          <div style={{
            position: "absolute",
            top: 2,
            left: "50%",
            width: 1.5,
            height: 6,
            borderRadius: 99,
            background: copied ? CMYK.c : "rgba(0,0,0,0.65)",
            transform: "translateX(-50%)",
            transition: "background 200ms ease",
          }} />
        </div>
      </button>
    </div>
  );
}

/* ---------- Main App ---------- */
export default function App() {
  const [activeTopTab, setActiveTopTab] = useState("home");
  const [soundOn, setSoundOn] = useState(true);
  const [autoOn, setAutoOn] = useState(true);
  const [searchOn, setSearchOn] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [query, setQuery] = useState("");
  const [archiveStatus, setArchiveStatus] = useState("");
  
  const clickSound = useKeyboardClickSound(soundOn);
  
  const today = dayKey(new Date());
  const [tweets, setTweets] = useState(() => [0, 1, 2, 3, 4, 5].map((i) => makeDailyTweet(today, i)));
  const [archivedTweets, setArchivedTweets] = useState([]); // Empty until Demo loads real Twitter archive
  const [mediaItems, setMediaItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState(new Set());
  const [playingVideos, setPlayingVideos] = useState(new Set());
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Upload state
  const [uploadedTweets, setUploadedTweets] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(new Map());
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("twitter"); // twitter, instagram, facebook, flickr
  const [exportComplete, setExportComplete] = useState(false);

  // Handle tweets.js upload
  async function handleTweetsUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    clickSound();
    setUploadStatus("Reading tweets.js...");
    try {
      const text = await file.text();
      const jsonStr = text.replace(/^window\.YTD\.tweets\.part0\s*=\s*/, '');
      const data = JSON.parse(jsonStr);
      setUploadedTweets(data);
      setUploadStatus(`Found ${data.length} tweets. Now select your media folder.`);
    } catch (err) {
      setUploadStatus("Error reading tweets.js. Make sure it's from your Twitter archive.");
      console.error(err);
    }
  }

  // Handle media folder upload
  function handleMediaUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    clickSound();
    setUploadStatus(`Processing ${files.length} media files...`);

    const mediaMap = new Map();
    for (const file of files) {
      const url = URL.createObjectURL(file);
      mediaMap.set(file.name, url);
    }
    setUploadedMedia(mediaMap);
    setUploadStatus(`Loaded ${mediaMap.size} media files. Ready to generate!`);
  }

  // Handle Instagram archive upload (JSON + media)
  async function handleInstagramUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    clickSound();
    setUploadStatus("Reading Instagram data...");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Instagram format: posts array or media array
      let posts = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if (data.posts) {
        posts = data.posts;
      } else if (data.media) {
        posts = data.media;
      }

      // Convert to common format
      const converted = posts.map((post, i) => ({
        tweet: {
          id_str: `ig_${i}_${Date.now()}`,
          created_at: post.taken_at || post.creation_timestamp ? new Date((post.taken_at || post.creation_timestamp) * 1000).toISOString() : new Date().toISOString(),
          full_text: post.caption || post.title || '',
          extended_entities: {
            media: [{
              media_url: post.uri || post.path || '',
              type: (post.uri || post.path || '').includes('.mp4') ? 'video' : 'photo'
            }]
          }
        }
      }));

      setUploadedTweets(converted);
      setUploadStatus(`Found ${converted.length} Instagram posts. Now select your media folder.`);
    } catch (err) {
      setUploadStatus("Error reading Instagram data. Try posts_1.json or media.json from your archive.");
      console.error(err);
    }
  }

  // Handle Facebook archive upload
  async function handleFacebookUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    clickSound();
    setUploadStatus("Reading Facebook data...");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Facebook format varies - look for posts array
      let posts = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if (data.posts) {
        posts = data.posts;
      }

      // Convert to common format
      const converted = posts.filter(post => post.attachments?.some(a => a.data?.some(d => d.media))).map((post, i) => {
        const mediaData = post.attachments?.find(a => a.data?.some(d => d.media))?.data?.find(d => d.media)?.media;
        return {
          tweet: {
            id_str: `fb_${i}_${Date.now()}`,
            created_at: post.timestamp ? new Date(post.timestamp * 1000).toISOString() : new Date().toISOString(),
            full_text: post.data?.find(d => d.post)?.post || post.title || '',
            extended_entities: {
              media: [{
                media_url: mediaData?.uri || '',
                type: mediaData?.uri?.includes('.mp4') ? 'video' : 'photo'
              }]
            }
          }
        };
      });

      setUploadedTweets(converted);
      setUploadStatus(`Found ${converted.length} Facebook posts with media. Now select your media folder.`);
    } catch (err) {
      setUploadStatus("Error reading Facebook data. Try your_posts_1.json from your archive.");
      console.error(err);
    }
  }

  // Handle Flickr archive upload
  async function handleFlickrUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    clickSound();
    setUploadStatus("Reading Flickr data...");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Flickr format: array of photos
      let photos = [];
      if (Array.isArray(data)) {
        photos = data;
      } else if (data.photos) {
        photos = data.photos;
      }

      // Convert to common format
      const converted = photos.map((photo, i) => ({
        tweet: {
          id_str: `fl_${photo.id || i}_${Date.now()}`,
          created_at: photo.date_taken || photo.date_uploaded || new Date().toISOString(),
          full_text: photo.title || photo.description || '',
          extended_entities: {
            media: [{
              media_url: photo.original || photo.url_o || photo.url_l || photo.url_m || '',
              type: (photo.media || 'photo') === 'video' ? 'video' : 'photo'
            }]
          }
        }
      }));

      setUploadedTweets(converted);
      setUploadStatus(`Found ${converted.length} Flickr photos. Now select your media folder.`);
    } catch (err) {
      setUploadStatus("Error reading Flickr data. Try the JSON file from your Flickr export.");
      console.error(err);
    }
  }

  // Get the right upload handler based on platform
  function getDataUploadHandler() {
    switch (selectedPlatform) {
      case 'instagram': return handleInstagramUpload;
      case 'facebook': return handleFacebookUpload;
      case 'flickr': return handleFlickrUpload;
      default: return handleTweetsUpload;
    }
  }

  // Get platform-specific file info
  function getPlatformFileInfo() {
    switch (selectedPlatform) {
      case 'instagram': return { label: 'Posts Data', file: 'posts_1.json', folder: 'media/' };
      case 'facebook': return { label: 'Posts Data', file: 'your_posts_1.json', folder: 'photos_and_videos/' };
      case 'flickr': return { label: 'Photo Data', file: 'photo_*.json', folder: 'data/' };
      default: return { label: 'Tweets', file: 'tweets.js', folder: 'tweets_media/' };
    }
  }

  // Get platform-specific color
  function getPlatformColor() {
    switch (selectedPlatform) {
      case 'instagram': return CMYK.m;
      case 'facebook': return CMYK.y;
      case 'flickr': return CMYK.k;
      default: return CMYK.c;
    }
  }

  // Generate portfolio from uploaded files
  function generatePortfolio() {
    if (!uploadedTweets || uploadedMedia.size === 0) return;
    clickSound();
    setUploadStatus("Generating portfolio...");

    const tagById = new Map(TAGS.map((t) => [t.id, t]));
    const fallbackTag = TAGS[0];

    // Helper to get video URL
    const getVideoUrl = (media, tweetId) => {
      if (media.video_info?.variants) {
        const mp4Variants = media.video_info.variants
          .filter(v => v.content_type === 'video/mp4')
          .sort((a, b) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));
        if (mp4Variants.length > 0) {
          const videoUrl = mp4Variants[0].url;
          const match = videoUrl.match(/\/([^/]+)\.mp4/);
          if (match) {
            const videoId = match[1];
            return `${tweetId}-${videoId}.mp4`;
          }
        }
      }
      return null;
    };

    // Filter tweets with media
    const tweetsWithMedia = uploadedTweets.filter(item => {
      const media = item.tweet?.extended_entities?.media;
      return media?.length > 0;
    });

    // Shuffle
    const shuffled = [...tweetsWithMedia];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const getDateKey = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };

    // Select unique dates
    const usedDates = new Set();
    const forDisplay = [];
    for (const item of shuffled) {
      const dateKey = getDateKey(item.tweet.created_at);
      if (!usedDates.has(dateKey) && forDisplay.length < 24) {
        forDisplay.push(item);
        usedDates.add(dateKey);
      }
    }

    const parsedTweets = [];
    const parsedMedia = [];

    forDisplay.forEach((item) => {
      const tweet = item.tweet;
      const media = tweet.extended_entities?.media?.[0];
      if (!media) return;

      const urlParts = media.media_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const thumbnailFilename = `${tweet.id_str}-${filename}`;
      const isVideo = media.type === 'video' || media.type === 'animated_gif';
      const videoFilename = isVideo ? getVideoUrl(media, tweet.id_str) : null;

      // Check if media exists in uploaded files
      const thumbnailUrl = uploadedMedia.get(thumbnailFilename);
      const videoUrl = videoFilename ? uploadedMedia.get(videoFilename) : null;

      if (!thumbnailUrl && !videoUrl) return; // Skip if no media found

      let cleanText = tweet.full_text
        .replace(/pro-bot/gi, 'bot')
        .replace(/https?:\/\/t\.co\/\S+/g, '')
        .trim();

      // Simple tag assignment
      let tags = [tagById.get('process') || fallbackTag, tagById.get('documentation') || fallbackTag];

      parsedTweets.push({
        id: tweet.id_str,
        date: new Date(tweet.created_at),
        text: cleanText,
        kind: "tweet",
        topic: "archive",
        tags,
        imageUrl: thumbnailUrl || videoUrl,
        videoUrl: videoUrl,
        isVideo,
      });

      parsedMedia.push({
        id: `media_${tweet.id_str}`,
        kind: isVideo ? 'video' : 'image',
        date: new Date(tweet.created_at),
        dateKey: getDateKey(tweet.created_at),
        url: thumbnailUrl || videoUrl,
        videoUrl: videoUrl,
      });
    });

    setArchivedTweets(parsedTweets);
    setMediaItems(parsedMedia);
    setUploadStatus(`Portfolio ready! ${parsedTweets.length} tweets with media loaded. See your portfolio in the windows to the right!`);
    // Stay on current page so user can see their data populate in Sample Unspool and Archived media windows
  }

  // auto drip
  useEffect(() => {
    if (!autoOn) return;
    const seed = hash32(today);
    const rng = mulberry32(seed);
    const order = shuffleWithRng([...INSPIRATION, ...PROMPTS], rng);
    let idx = 0;
    
    const t = setInterval(() => {
      setTweets((prev) => {
        idx += 1;
        const item = order[idx % order.length] || { kind: "quote", topic: "design", text: "Design is the edit." };
        const t1 = pickWithRng(TAGS, rng);
        let t2 = pickWithRng(TAGS, rng);
        for (let i = 0; i < 12 && t2.id === t1.id; i++) t2 = pickWithRng(TAGS, rng);
        const tw = {
          id: `a_${today}_${idx}`,
          date: new Date(),
          text: item.text,
          kind: item.kind,
          topic: item.topic,
          tags: [t1, t2],
        };
        return [tw, ...prev].slice(0, 24);
      });
    }, 15000);
    
    return () => clearInterval(t);
  }, [autoOn, today]);
  
  const filteredTweets = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...tweets];
    if (searchOn && q) {
      list = list.filter((tw) => {
        const tagText = tw.tags.map((x) => x.label).join(" ").toLowerCase();
        const meta = `${tw.kind} ${tw.topic}`.toLowerCase();
        return tw.text.toLowerCase().includes(q) || tagText.includes(q) || meta.includes(q);
      });
    }
    list.sort((a, b) => (sortNewest ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime()));
    return list;
  }, [tweets, query, searchOn, sortNewest]);
  
  function doClick(fn) {
    clickSound();
    fn?.();
  }

  function togglePin(id) {
    clickSound();
    setPinnedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function downloadMedia(url, filename) {
    clickSound();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'unspool-media';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (e) {
      console.error('Download failed:', e);
    }
  }
  
  async function loadDemoData() {
    console.log('Loading your Twitter archive...');
    setArchiveStatus('Loading archive...');

    try {
      // Fetch the tweets.js file
      const response = await fetch('/tweets.js');
      const text = await response.text();

      // Parse the Twitter archive format (starts with "window.YTD.tweets.part0 = ")
      const jsonStr = text.replace(/^window\.YTD\.tweets\.part0\s*=\s*/, '');
      const tweetsData = JSON.parse(jsonStr);

      const tagById = new Map(TAGS.map((t) => [t.id, t]));
      const fallbackTag = TAGS[0];

      // Filter to tweets with media
      const tweetsWithMedia = tweetsData.filter(item => {
        const tweet = item.tweet;
        const media = tweet.extended_entities?.media;
        return media?.length > 0;
      });

      // Fisher-Yates shuffle
      const shuffled = [...tweetsWithMedia];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Helper to get date key (YYYY-MM-DD)
      const getDateKey = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      };

      // Select tweets ensuring one per date
      const usedDates = new Set();
      const forTweets = [];
      const forGallery = [];

      for (const item of shuffled) {
        const dateKey = getDateKey(item.tweet.created_at);
        if (!usedDates.has(dateKey) && forTweets.length < 12) {
          forTweets.push(item);
          usedDates.add(dateKey);
        }
      }

      // For gallery, get different dates than tweets
      const galleryDates = new Set();
      for (const item of shuffled) {
        const dateKey = getDateKey(item.tweet.created_at);
        if (!usedDates.has(dateKey) && !galleryDates.has(dateKey) && forGallery.length < 20) {
          forGallery.push(item);
          galleryDates.add(dateKey);
        }
      }

      const parsedTweets = [];
      const parsedMedia = [];

      // Helper to get video URL from Twitter archive
      const getVideoUrl = (media, tweetId) => {
        if (media.video_info?.variants) {
          // Find the mp4 variant with highest bitrate
          const mp4Variants = media.video_info.variants
            .filter(v => v.content_type === 'video/mp4')
            .sort((a, b) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));

          if (mp4Variants.length > 0) {
            // Extract video ID from URL like: .../C2qdympiZ3pZ5nQH.mp4?tag=12
            const videoUrl = mp4Variants[0].url;
            const match = videoUrl.match(/\/([^/]+)\.mp4/);
            if (match) {
              const videoId = match[1];
              return `/tweets_media/${tweetId}-${videoId}.mp4`;
            }
          }
        }
        return null;
      };

      // Process tweets - each tweet gets its own image attached
      forTweets.forEach((item) => {
        const tweet = item.tweet;
        const hashtags = tweet.entities?.hashtags?.map(h => h.text) || [];
        const media = tweet.extended_entities?.media?.[0]; // Get first media
        if (!media) return; // Skip if no media

        // Build local URL for the image/thumbnail
        const urlParts = media.media_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const thumbnailUrl = `/tweets_media/${tweet.id_str}-${filename}`;
        const isVideo = media.type === 'video' || media.type === 'animated_gif';
        const videoUrl = isVideo ? getVideoUrl(media, tweet.id_str) : null;
        const localUrl = isVideo ? (videoUrl || thumbnailUrl) : thumbnailUrl;

        // Map hashtags to our tag system
        let tags = [];
        for (const hashtag of hashtags) {
          const h = hashtag.toLowerCase();
          if (h.includes('make') || h.includes('build') || h.includes('create') || h.includes('pbl') || h.includes('bot')) {
            tags.push(tagById.get('makerspace') || fallbackTag);
          } else if (h.includes('design') || h.includes('my')) {
            tags.push(tagById.get('design') || fallbackTag);
          } else if (h.includes('learning') || h.includes('education') || h.includes('mmt') || h.includes('hard')) {
            tags.push(tagById.get('process') || fallbackTag);
          } else if (h.includes('system')) {
            tags.push(tagById.get('systems') || fallbackTag);
          } else if (h.includes('material')) {
            tags.push(tagById.get('materials') || fallbackTag);
          } else if (h.includes('cmk') || h.includes('flc') || h.includes('robo') || h.includes('expo')) {
            tags.push(tagById.get('process') || fallbackTag);
          } else if (h.includes('bird') || h.includes('change') || h.includes('perspective')) {
            tags.push(tagById.get('sustainability') || fallbackTag);
          } else if (h.includes('micro') || h.includes('code') || h.includes('computer')) {
            tags.push(tagById.get('systems') || fallbackTag);
          }
        }

        tags = [...new Map(tags.map(t => [t.id, t])).values()];
        if (tags.length === 0) tags.push(tagById.get('process') || fallbackTag);
        if (tags.length === 1) tags.push(tagById.get('documentation') || fallbackTag);
        tags = tags.slice(0, 2);

        // Clean up tweet text
        let cleanText = tweet.full_text
          .replace(/pro-bot/gi, 'bot')
          .replace(/https?:\/\/t\.co\/\S+/g, '') // Remove t.co links
          .trim();

        parsedTweets.push({
          id: tweet.id_str,
          date: new Date(tweet.created_at),
          text: cleanText,
          kind: "tweet",
          topic: "archive",
          tags,
          imageUrl: thumbnailUrl,
          videoUrl: videoUrl,
          isVideo,
        });
      });

      // Process gallery items - different images, no text needed, one per date
      forGallery.forEach((item) => {
        const tweet = item.tweet;
        const media = tweet.extended_entities?.media?.[0]; // Only first media per tweet
        if (!media) return;

        const urlParts = media.media_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const thumbnailUrl = `/tweets_media/${tweet.id_str}-${filename}`;
        const isVideo = media.type === 'video' || media.type === 'animated_gif';
        const videoUrl = isVideo ? getVideoUrl(media, tweet.id_str) : null;
        const dateKey = getDateKey(tweet.created_at);

        parsedMedia.push({
          id: tweet.id_str,
          kind: isVideo ? 'video' : 'image',
          date: new Date(tweet.created_at),
          dateKey,
          url: isVideo ? thumbnailUrl : thumbnailUrl, // thumbnail for display
          videoUrl: videoUrl, // actual video file for playback
        });
      });

      console.log('Loaded tweets:', parsedTweets.length);
      console.log('Loaded gallery media:', parsedMedia.length);

      setArchivedTweets(parsedTweets);
      setMediaItems(parsedMedia);
      setArchiveStatus(`Loaded ${parsedTweets.length} tweets, ${parsedMedia.length} gallery items ✓`);
    } catch (error) {
      console.error('Failed to load archive:', error);
      setArchiveStatus('Failed to load archive');
    }
  }
  
  async function downloadPortfolio() {
    try {
      setArchiveStatus("Preparing download…");
      const payload = {
        exportedAt: new Date().toISOString(),
        version: "unspool-json-v1",
        tweets: (tweets || []).map((t) => ({
          id: t.id,
          date: t.date instanceof Date ? t.date.toISOString() : String(t.date),
          text: t.text,
          kind: t.kind,
          topic: t.topic,
          tags: (t.tags || []).map((x) => x.label),
        })),
      };
      const stamp = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unspool-portfolio-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 800);
      setArchiveStatus("Downloaded ✓ (JSON)");
    } catch (e) {
      console.error("[unspool] downloadPortfolio failed", e);
      setArchiveStatus("Download failed");
    }
  }

  // Convert image URL to base64
  async function imageToBase64(url) {
    if (!url) return null;
    try {
      // For blob URLs (uploaded files), fetch directly
      if (url.startsWith('blob:')) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }

      // For local file paths, load via img element
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    } catch {
      return null;
    }
  }

  // 1. Self-Contained HTML Export
  async function exportAsHTML() {
    setArchiveStatus("Generating HTML portfolio...");
    const items = archivedTweets.filter(tw => tw.imageUrl || tw.videoUrl).slice(0, 12);

    // Convert images to base64
    const imagesBase64 = await Promise.all(
      items.map(async (tw) => {
        const base64 = await imageToBase64(tw.imageUrl);
        return { id: tw.id, base64 };
      })
    );
    const imageMap = Object.fromEntries(imagesBase64.map(i => [i.id, i.base64]));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Unspool Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #fff;
      color: #111;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { font-size: 48px; font-weight: 900; letter-spacing: -1px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; opacity: 0.7; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .card {
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 16px;
      padding: 16px;
      background: #fafafa;
    }
    .card img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .date { font-size: 12px; opacity: 0.6; margin-bottom: 8px; }
    .text { font-size: 14px; line-height: 1.5; font-family: ui-monospace, monospace; }
    .tags { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .tag {
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 12px; opacity: 0.5; }
    .cmyk { display: flex; gap: 6px; margin-top: 8px; }
    .cmyk span { width: 8px; height: 8px; border-radius: 50%; }
  </style>
</head>
<body>
  <h1>unspool</h1>
  <p class="subtitle">A portfolio archive — exported ${new Date().toLocaleDateString()}</p>
  <div class="grid">
    ${items.map(tw => `
    <div class="card">
      ${imageMap[tw.id] ? `<img src="${imageMap[tw.id]}" alt="">` : ''}
      <div class="date">${formatDate(tw.date)}</div>
      <div class="text">${tw.text}</div>
      <div class="tags">
        ${tw.tags.map(t => `<span class="tag">${t.label}</span>`).join('')}
      </div>
    </div>
    `).join('')}
  </div>
  <div class="footer">
    <div>Generated with Unspool</div>
    <div class="cmyk">
      <span style="background: #00C2FF"></span>
      <span style="background: #FF007F"></span>
      <span style="background: #FFEB00"></span>
      <span style="background: #111"></span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unspool-portfolio-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setArchiveStatus("HTML exported ✓ (open in browser)");
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 2000);
  }

  // 2. PDF Export (via print dialog)
  function exportAsPDF() {
    setArchiveStatus("Opening print dialog for PDF...");
    const items = archivedTweets.filter(tw => tw.imageUrl || tw.videoUrl).slice(0, 12);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Unspool Portfolio</title>
  <style>
    @page { margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; color: #111; }
    h1 { font-size: 36px; font-weight: 900; margin-bottom: 4px; }
    .subtitle { font-size: 12px; opacity: 0.6; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .card { break-inside: avoid; padding: 12px; border: 1px solid #eee; border-radius: 8px; }
    .card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 4px; margin-bottom: 8px; }
    .date { font-size: 10px; opacity: 0.5; }
    .text { font-size: 11px; line-height: 1.4; margin-top: 4px; font-family: monospace; }
    .footer { margin-top: 32px; font-size: 10px; opacity: 0.4; text-align: center; }
  </style>
</head>
<body>
  <h1>unspool</h1>
  <p class="subtitle">Portfolio exported ${new Date().toLocaleDateString()}</p>
  <div class="grid">
    ${items.map(tw => `
    <div class="card">
      <img src="${tw.imageUrl}" alt="">
      <div class="date">${formatDate(tw.date)}</div>
      <div class="text">${tw.text}</div>
    </div>
    `).join('')}
  </div>
  <div class="footer">Generated with Unspool • unspool.work</div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    setArchiveStatus("PDF ready ✓ (use Save as PDF)");
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 2000);
  }

  // 3. Image Grid Export
  async function exportAsImageGrid() {
    setArchiveStatus("Generating image grid...");
    const items = mediaItems.slice(0, 12);

    const canvas = document.createElement('canvas');

    // Polyfill for roundRect
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }
    const cols = 4;
    const rows = Math.ceil(items.length / cols);
    const cellSize = 400;
    const gap = 20;
    const padding = 60;

    canvas.width = cols * cellSize + (cols - 1) * gap + padding * 2;
    canvas.height = rows * cellSize + (rows - 1) * gap + padding * 2 + 100;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 48px system-ui';
    ctx.fillText('unspool', padding, padding + 10);

    // CMYK dots
    const colors = ['#00C2FF', '#FF007F', '#FFEB00', '#111111'];
    colors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(padding + 180 + i * 20, padding + 5, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Load and draw images
    const startY = padding + 80;
    for (let i = 0; i < items.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (cellSize + gap);
      const y = startY + row * (cellSize + gap);

      // Draw rounded rect background first
      ctx.fillStyle = '#f5f5f3';
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 16);
      ctx.fill();

      try {
        const imgUrl = items[i].url;
        if (!imgUrl) continue;

        const img = new Image();
        // Only set crossOrigin for non-blob URLs
        if (!imgUrl.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 5000); // 5 second timeout
          img.src = imgUrl;
        });

        // Draw image
        const imgPad = 16;
        const imgSize = cellSize - imgPad * 2;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x + imgPad, y + imgPad, imgSize, imgSize, 8);
        ctx.clip();

        // Calculate dimensions to cover the area
        const scale = Math.max(imgSize / img.naturalWidth, imgSize / img.naturalHeight);
        const scaledW = img.naturalWidth * scale;
        const scaledH = img.naturalHeight * scale;
        const offsetX = (imgSize - scaledW) / 2;
        const offsetY = (imgSize - scaledH) / 2;

        ctx.drawImage(img, x + imgPad + offsetX, y + imgPad + offsetY, scaledW, scaledH);
        ctx.restore();
      } catch (e) {
        // Placeholder already drawn above
        console.log('Failed to load image:', items[i].url);
      }
    }

    // Footer
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = '14px system-ui';
    ctx.fillText(`Generated with Unspool • ${new Date().toLocaleDateString()}`, padding, canvas.height - 30);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unspool-grid-${new Date().toISOString().slice(0,10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');

    setArchiveStatus("Image grid exported ✓");
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 2000);
  }

  // 4. Slideshow Export
  async function exportAsSlideshow() {
    setArchiveStatus("Generating slideshow...");
    const items = archivedTweets.filter(tw => tw.imageUrl).slice(0, 12);

    const imagesBase64 = await Promise.all(
      items.map(async (tw) => {
        const base64 = await imageToBase64(tw.imageUrl);
        return { ...tw, base64 };
      })
    );

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unspool Slideshow</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      background: #111;
      color: #fff;
      height: 100vh;
      overflow: hidden;
    }
    .slide {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.8s ease;
      padding: 60px;
    }
    .slide.active { opacity: 1; }
    .slide-content {
      display: flex;
      gap: 48px;
      max-width: 1200px;
      align-items: center;
    }
    .slide img {
      max-width: 600px;
      max-height: 70vh;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .slide-text { max-width: 400px; }
    .slide-date { font-size: 14px; opacity: 0.5; margin-bottom: 16px; }
    .slide-quote { font-size: 24px; line-height: 1.5; font-family: ui-monospace, monospace; }
    .controls {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 16px;
      z-index: 100;
    }
    .controls button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .controls button:hover { background: rgba(255,255,255,0.2); }
    .progress {
      position: fixed;
      bottom: 0;
      left: 0;
      height: 3px;
      background: #00C2FF;
      transition: width 0.3s;
    }
    .counter {
      position: fixed;
      top: 40px;
      right: 40px;
      font-size: 14px;
      opacity: 0.5;
      font-family: ui-monospace, monospace;
    }
    .logo {
      position: fixed;
      top: 40px;
      left: 40px;
      font-size: 24px;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div class="logo">unspool</div>
  <div class="counter"><span id="current">1</span> / ${items.length}</div>

  ${imagesBase64.map((tw, i) => `
  <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
    <div class="slide-content">
      <img src="${tw.base64 || tw.imageUrl}" alt="">
      <div class="slide-text">
        <div class="slide-date">${formatDate(tw.date)}</div>
        <div class="slide-quote">${tw.text}</div>
      </div>
    </div>
  </div>
  `).join('')}

  <div class="controls">
    <button onclick="prev()">←</button>
    <button onclick="toggleAuto()" id="autoBtn">▶</button>
    <button onclick="next()">→</button>
  </div>
  <div class="progress" id="progress"></div>

  <script>
    let current = 0;
    let auto = false;
    let interval;
    const slides = document.querySelectorAll('.slide');
    const total = slides.length;

    function show(n) {
      slides.forEach(s => s.classList.remove('active'));
      current = (n + total) % total;
      slides[current].classList.add('active');
      document.getElementById('current').textContent = current + 1;
      document.getElementById('progress').style.width = ((current + 1) / total * 100) + '%';
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function toggleAuto() {
      auto = !auto;
      document.getElementById('autoBtn').textContent = auto ? '⏸' : '▶';
      if (auto) {
        interval = setInterval(next, 4000);
      } else {
        clearInterval(interval);
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === ' ') toggleAuto();
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unspool-slideshow-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setArchiveStatus("Slideshow exported ✓ (open in browser)");
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 2000);
  }

  // 5. Print-Ready Zine/Poster Export
  function exportAsPrintReady(format = 'poster') {
    setArchiveStatus(`Generating ${format} layout...`);
    const items = archivedTweets.filter(tw => tw.imageUrl).slice(0, format === 'zine' ? 8 : 16);

    const layouts = {
      poster: { cols: 4, title: 'Poster (24×36")', width: '24in', height: '36in' },
      zine: { cols: 2, title: '8-Page Zine', width: '11in', height: '8.5in' },
      contact: { cols: 6, title: 'Contact Sheet', width: '11in', height: '17in' }
    };
    const layout = layouts[format];

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Unspool ${layout.title}</title>
  <style>
    @page { size: ${layout.width} ${layout.height}; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; }
    .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; }
    h1 { font-size: ${format === 'zine' ? '24px' : '36px'}; font-weight: 900; }
    .date { font-size: 12px; opacity: 0.5; }
    .grid {
      display: grid;
      grid-template-columns: repeat(${layout.cols}, 1fr);
      gap: ${format === 'contact' ? '8px' : '16px'};
    }
    .cell { break-inside: avoid; }
    .cell img {
      width: 100%;
      aspect-ratio: ${format === 'contact' ? '1' : '4/3'};
      object-fit: cover;
      border-radius: ${format === 'contact' ? '2px' : '8px'};
    }
    .cell .caption {
      font-size: ${format === 'contact' ? '8px' : '10px'};
      margin-top: 4px;
      font-family: monospace;
      opacity: 0.7;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #eee;
      font-size: 10px;
      opacity: 0.4;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>unspool</h1>
    <span class="date">${new Date().toLocaleDateString()}</span>
  </div>
  <div class="grid">
    ${items.map(tw => `
    <div class="cell">
      <img src="${tw.imageUrl}" alt="">
      ${format !== 'contact' ? `<div class="caption">${tw.text.slice(0, 60)}${tw.text.length > 60 ? '...' : ''}</div>` : ''}
    </div>
    `).join('')}
  </div>
  <div class="footer">
    <span>Generated with Unspool</span>
    <span>unspool.work</span>
  </div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    setArchiveStatus(`${layout.title} ready ✓`);
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 2000);
  }

  // 6. Static Site Export (downloadable folder as zip-like structure)
  async function exportAsStaticSite() {
    setArchiveStatus("Generating static site...");
    const items = archivedTweets.filter(tw => tw.imageUrl).slice(0, 24);

    // Generate index.html with relative image paths
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Unspool Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>unspool</h1>
    <p class="subtitle">A portfolio archive</p>
    <div class="cmyk">
      <span style="background: #00C2FF"></span>
      <span style="background: #FF007F"></span>
      <span style="background: #FFEB00"></span>
      <span style="background: #111"></span>
    </div>
  </header>
  <main class="grid">
    ${items.map((tw, i) => `
    <article class="card">
      <img src="images/image-${i + 1}.jpg" alt="" loading="lazy">
      <time>${formatDate(tw.date)}</time>
      <p>${tw.text}</p>
      <div class="tags">
        ${tw.tags.map(t => `<span class="tag" style="border-color: ${t.top}">${t.label}</span>`).join('')}
      </div>
    </article>
    `).join('')}
  </main>
  <footer>
    <p>Generated with <a href="https://unspool.work">Unspool</a></p>
  </footer>
</body>
</html>`;

    const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #fff;
  color: #111;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}
header { margin-bottom: 40px; }
h1 { font-size: 48px; font-weight: 900; letter-spacing: -1px; }
.subtitle { font-size: 16px; opacity: 0.6; margin: 8px 0 16px; }
.cmyk { display: flex; gap: 8px; }
.cmyk span { width: 12px; height: 12px; border-radius: 50%; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
.card {
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 16px;
  overflow: hidden;
  background: #fafafa;
}
.card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.card time {
  display: block;
  padding: 16px 16px 8px;
  font-size: 12px;
  opacity: 0.5;
}
.card p {
  padding: 0 16px 12px;
  font-size: 14px;
  line-height: 1.5;
  font-family: ui-monospace, monospace;
}
.tags { padding: 0 16px 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.tag {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid;
  border-bottom-width: 2px;
}
footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(0,0,0,0.1);
  font-size: 14px;
  opacity: 0.5;
}
footer a { color: inherit; }
@media (max-width: 600px) {
  body { padding: 20px; }
  h1 { font-size: 32px; }
  .grid { grid-template-columns: 1fr; }
}`;

    const readme = `# My Unspool Portfolio

This is a static website generated from your Twitter archive using Unspool.

## How to use

1. **View locally**: Just open \`index.html\` in your browser

2. **Deploy to the web**:
   - **Netlify**: Drag this folder to netlify.com/drop
   - **Vercel**: Run \`npx vercel\` in this folder
   - **GitHub Pages**: Push to a repo and enable Pages in settings

## Files

- \`index.html\` - Main page
- \`style.css\` - Styles
- \`images/\` - Your portfolio images (download separately)

## Image Setup

Replace the placeholder image paths with your actual images:
1. Create an \`images\` folder
2. Copy your images from tweets_media
3. Rename them to match: image-1.jpg, image-2.jpg, etc.

Generated with Unspool • unspool.work
`;

    // Create a combined file with instructions
    const combined = `<!--
UNSPOOL STATIC SITE EXPORT
==========================

This file contains your complete portfolio site.
To deploy:

1. Save this as index.html
2. The CSS is embedded below
3. Images need to be in an 'images' folder

For a quick deploy:
- Drag this file to netlify.com/drop
- Or upload to GitHub and enable Pages

-->

${html.replace('link rel="stylesheet" href="style.css"', `style>${css}</style`)}

<!--
README
======
${readme}
-->`;

    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unspool-site-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setArchiveStatus("Static site exported ✓ (deploy to Netlify/Vercel)");
    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 2000);
  }
  
  const GRID = { small: 24, big: 120, line: "rgba(91,140,255,0.18)", bigLine: "rgba(91,140,255,0.26)" };
  
  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      position: "relative",
      overflowX: "hidden",
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      color: "#111111",
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
          linear-gradient(to right, ${GRID.line} 1px, transparent 1px),
          linear-gradient(to bottom, ${GRID.line} 1px, transparent 1px),
          linear-gradient(to right, ${GRID.bigLine} 1px, transparent 1px),
          linear-gradient(to bottom, ${GRID.bigLine} 1px, transparent 1px)
        `,
        backgroundSize: `
          ${GRID.small}px ${GRID.small}px,
          ${GRID.small}px ${GRID.small}px,
          ${GRID.big}px ${GRID.big}px,
          ${GRID.big}px ${GRID.big}px
        `,
      }} />
      
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "min(1560px, calc(100% - 80px))",
        margin: "0 auto",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <header style={{ padding: "22px 0 12px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: GRID_COLS,
            gap: GRID_GAP,
            alignItems: "start",
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1.1, lineHeight: 0.92 }}>unspool</div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 2 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: CMYK.c }} />
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: CMYK.m }} />
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: CMYK.y }} />
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: CMYK.k }} />
                </div>
              </div>
              <div style={{ marginTop: 6, fontSize: 14.5, opacity: 0.75 }}>Turn your Twitter archive into a viewable portfolio.</div>
            </div>
            
            <div />
            
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              boxSizing: "border-box",
            }}>
              <nav style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxSizing: "border-box",
              }}>
                <PageNavButton label="Home" sliverColor={CMYK.c} active={activeTopTab === "home"} onClick={() => doClick(() => setActiveTopTab("home"))} />
                <PageNavButton label="About" sliverColor={CMYK.m} active={activeTopTab === "about"} onClick={() => doClick(() => setActiveTopTab("about"))} />
                <PageNavButton label="How to" sliverColor={CMYK.y} active={activeTopTab === "howto"} onClick={() => doClick(() => setActiveTopTab("howto"))} />
              </nav>
            </div>
          </div>
        </header>
        
        {/* Main */}
        <main style={{
          width: "100%",
          padding: "18px 0 28px",
          display: "grid",
          gridTemplateColumns: GRID_COLS,
          gap: GRID_GAP,
          alignItems: "start",
        }}>
          {/* Left column */}
          <section style={{ width: "100%" }}>
            {activeTopTab === "home" && (
              <>
                <h1 style={{ fontSize: 52, lineHeight: 0.98, letterSpacing: -1.6, margin: "18px 0 14px", fontWeight: 950 }}>
                  Unspool your work.<br />Keep the receipts.<br />Lose the feed.
                </h1>
                <p style={{ fontSize: 15.5, lineHeight: 1.55, margin: "0 0 18px", maxWidth: 760, opacity: 0.9 }}>
                  A portfolio archive for maker educators, artists, designers, architects, and builders—made to outlive a platform.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginTop: 12 }}>
                  <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.88)", borderRadius: 18, padding: 14, borderBottom: `3px solid ${CMYK.c}`, boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 900, fontSize: 18.5, marginBottom: 8, letterSpacing: -0.25 }}>Time Capsule</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.92 }}>Everything, chronological. Searchable. Link-only or private.</div>
                  </div>
                  <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.88)", borderRadius: 18, padding: 14, borderBottom: `3px solid ${CMYK.m}`, boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 900, fontSize: 18.5, marginBottom: 8, letterSpacing: -0.25 }}>Portfolio</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.92 }}>Curate highlights: threads, projects, media sets, notes.</div>
                  </div>
                  <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.88)", borderRadius: 18, padding: 14, borderBottom: `3px solid ${CMYK.y}`, boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 900, fontSize: 18.5, marginBottom: 8, letterSpacing: -0.25 }}>Educator-friendly</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.92 }}>Privacy-aware. Self-hostable. Built for sharing without risk.</div>
                  </div>
                </div>
              </>
            )}
            
            {activeTopTab === "about" && (
              <>
                <h1 style={{ fontSize: 52, lineHeight: 0.98, letterSpacing: -1.6, margin: "18px 0 14px", fontWeight: 950 }}>
                  About Unspool
                </h1>
                <p style={{ fontSize: 15.5, lineHeight: 1.55, margin: "0 0 18px", maxWidth: 760, opacity: 0.9 }}>
                  Making thinking and learning visible. For people who used Twitter like a studio wall.
                </p>
              </>
            )}

            {/* About Window - same position as Tweet Generator */}
            {activeTopTab === "about" && (
            <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.90)", borderRadius: 22, padding: 16, boxSizing: "border-box", marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 2px 12px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 14, gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 15.5, letterSpacing: -0.2 }}>Making Thinking Visible</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: 0.2, opacity: 0.65 }}>why we built this</div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.88 }}>
                Learning isn't just about what you know at the end—it's about the journey of getting there. The sketches, the failed attempts, the "aha" moments, the questions that led somewhere unexpected.
              </p>

              <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.88 }}>
                For years, maker educators, artists, designers, architects, and builders have used social media as a kind of <strong>thinking-out-loud space</strong>—documenting their work one post at a time. These posts aren't polished presentations. They are process. They are learning and thinking made visible.
              </p>

              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Why documentation matters:</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.82 }}>
                  <div style={{ marginBottom: 6 }}>• <strong>Reflection</strong> — Looking back helps you see patterns in your own thinking</div>
                  <div style={{ marginBottom: 6 }}>• <strong>Evidence</strong> — Work that isn't documented becomes invisible to others</div>
                  <div style={{ marginBottom: 6 }}>• <strong>Connection</strong> — Sharing process invites collaboration and feedback</div>
                  <div>• <strong>Teaching</strong> — Your solutions inspire new work</div>
                </div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 14px", opacity: 0.88 }}>
                Platforms come and go. But your work—the thinking, the making, the learning—shouldn't disappear with them.
              </p>

              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>What Unspool does:</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.82 }}>
                  <div style={{ marginBottom: 6 }}>• Transforms your social media archives into a portfolio you own</div>
                  <div style={{ marginBottom: 6 }}>• Preserves your images, videos, and the context around them</div>
                  <div style={{ marginBottom: 6 }}>• Works entirely in your browser—nothing is uploaded to any server</div>
                  <div style={{ marginBottom: 6 }}>• Exports to multiple formats: HTML, PDF, image grids, and more</div>
                  <div>• No account needed, no tracking, no ads. Just your work.</div>
                </div>
              </div>

              </div>
            )}

            {activeTopTab === "howto" && (
              <>
                <h1 style={{ fontSize: 52, lineHeight: 0.98, letterSpacing: -1.6, margin: "18px 0 14px", fontWeight: 950 }}>
                  How to Unspool
                </h1>
                <p style={{ fontSize: 15.5, lineHeight: 1.55, margin: "0 0 18px", maxWidth: 760, opacity: 0.9 }}>
                  Three steps. Five minutes. Years of work preserved.
                </p>
              </>
            )}

            {/* How To Instructions - same window style as Tweet Generator */}
            {activeTopTab === "howto" && (
            <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.90)", borderRadius: 22, padding: 16, boxSizing: "border-box", marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 2px 12px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 14, gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 15.5, letterSpacing: -0.2 }}>Getting Started</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: 0.2, opacity: 0.65 }}>select platform + follow steps</div>
              </div>

              {/* Platform Selection */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Choose your platform</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <ControlScreen title="Twitter" desc="tweets.js">
                    <ActionKnob
                      color={selectedPlatform === 'twitter' ? CMYK.c : "rgba(0,0,0,0.25)"}
                      ariaLabel="Select Twitter"
                      onClick={() => doClick(() => setSelectedPlatform('twitter'))}
                    />
                  </ControlScreen>

                  <ControlScreen title="Instagram" desc="posts_1.json">
                    <ActionKnob
                      color={selectedPlatform === 'instagram' ? CMYK.m : "rgba(0,0,0,0.25)"}
                      ariaLabel="Select Instagram"
                      onClick={() => doClick(() => setSelectedPlatform('instagram'))}
                    />
                  </ControlScreen>

                  <ControlScreen title="Facebook" desc="your_posts_1.json">
                    <ActionKnob
                      color={selectedPlatform === 'facebook' ? CMYK.y : "rgba(0,0,0,0.25)"}
                      ariaLabel="Select Facebook"
                      onClick={() => doClick(() => setSelectedPlatform('facebook'))}
                    />
                  </ControlScreen>

                  <ControlScreen title="Flickr" desc="photo_*.json">
                    <ActionKnob
                      color={selectedPlatform === 'flickr' ? CMYK.k : "rgba(0,0,0,0.25)"}
                      ariaLabel="Select Flickr"
                      onClick={() => doClick(() => setSelectedPlatform('flickr'))}
                    />
                  </ControlScreen>
                </div>
              </div>

              {/* Step 1 - Platform specific */}
              <div style={{ marginBottom: 12, padding: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2.5px solid rgba(0,0,0,0.15)",
                    color: CMYK.c,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 18,
                  }}>1</div>
                  <div style={{ fontWeight: 900, fontSize: 17 }}>
                    Request your {selectedPlatform === 'twitter' ? 'Twitter' : selectedPlatform === 'instagram' ? 'Instagram' : selectedPlatform === 'facebook' ? 'Facebook' : 'Flickr'} archive
                  </div>
                </div>
                <div style={{ marginLeft: 48 }}>
                  {selectedPlatform === 'twitter' && (
                    <>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On desktop:</strong> Go to <a href="https://twitter.com/settings/download_your_data" target="_blank" rel="noopener" style={{ color: CMYK.c }}>twitter.com/settings/download_your_data</a>
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On mobile:</strong> Settings → Your Account → Download an archive of your data
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.7 }}>Takes 24-48 hours. Twitter emails when ready.</div>
                    </>
                  )}
                  {selectedPlatform === 'instagram' && (
                    <>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On desktop:</strong> Go to <a href="https://www.instagram.com/download/request/" target="_blank" rel="noopener" style={{ color: CMYK.m }}>instagram.com/download/request</a>
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On mobile:</strong> Settings → Accounts Center → Your information and permissions → Download your information
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        Select <strong>JSON</strong> format (not HTML) and request <strong>All time</strong> data.
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.7 }}>Takes up to 48 hours. Instagram emails when ready.</div>
                    </>
                  )}
                  {selectedPlatform === 'facebook' && (
                    <>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On desktop:</strong> Go to <a href="https://www.facebook.com/dyi/" target="_blank" rel="noopener" style={{ color: "#B8A600" }}>facebook.com/dyi</a> (Download Your Information)
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On mobile:</strong> Settings → Your Facebook Information → Download Your Information
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        Select <strong>JSON</strong> format, choose <strong>Posts</strong> and <strong>Photos and Videos</strong>.
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.7 }}>Takes a few hours to a few days depending on data size.</div>
                    </>
                  )}
                  {selectedPlatform === 'flickr' && (
                    <>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        <strong>On desktop:</strong> Go to <a href="https://www.flickr.com/account" target="_blank" rel="noopener" style={{ color: "#111" }}>flickr.com/account</a> → Your Flickr Data
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                        Click <strong>"Request my Flickr data"</strong> to download your complete archive.
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.7 }}>Flickr sends a download link via email when ready.</div>
                    </>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ marginBottom: 12, padding: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2.5px solid rgba(0,0,0,0.15)",
                    color: CMYK.m,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 18,
                  }}>2</div>
                  <div style={{ fontWeight: 900, fontSize: 17 }}>Download & unzip your archive</div>
                </div>
                <div style={{ marginLeft: 48 }}>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                    <strong>1.</strong> Click the download link in your email
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                    <strong>2.</strong> Save the <code style={{ background: "rgba(0,0,0,0.08)", padding: "2px 8px", borderRadius: 4, fontFamily: MONO, fontSize: 13 }}>.zip</code> file to your computer
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                    <strong>3.</strong> Double-click to unzip (creates a folder)
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>
                    {selectedPlatform === 'twitter' && <>Find: <code style={{ fontFamily: MONO }}>data/tweets.js</code> and <code style={{ fontFamily: MONO }}>data/tweets_media/</code></>}
                    {selectedPlatform === 'instagram' && <>Find: <code style={{ fontFamily: MONO }}>your_instagram_activity/content/posts_1.json</code> and <code style={{ fontFamily: MONO }}>media/</code></>}
                    {selectedPlatform === 'facebook' && <>Find: <code style={{ fontFamily: MONO }}>posts/your_posts_1.json</code> and <code style={{ fontFamily: MONO }}>photos_and_videos/</code></>}
                    {selectedPlatform === 'flickr' && <>Find: <code style={{ fontFamily: MONO }}>*.json</code> files and your photos in the archive</>}
                  </div>
                </div>
              </div>

              {/* Step 3 - Upload Controls */}
              <div style={{ padding: 16, background: "#fff", border: "1px solid rgba(0,0,0,0.10)", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2.5px solid rgba(0,0,0,0.15)",
                    color: CMYK.y,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 18,
                  }}>3</div>
                  <div style={{ fontWeight: 900, fontSize: 17 }}>Upload & generate your portfolio</div>
                </div>

                <div style={{ marginLeft: 48, marginBottom: 14 }}>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                    <strong>A.</strong> Click <strong>{getPlatformFileInfo().label}</strong> below → select <code style={{ background: "rgba(0,0,0,0.08)", padding: "2px 8px", borderRadius: 4, fontFamily: MONO, fontSize: 13 }}>{getPlatformFileInfo().file}</code>
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
                    <strong>B.</strong> Click <strong>Media</strong> below → select the <code style={{ background: "rgba(0,0,0,0.08)", padding: "2px 8px", borderRadius: 4, fontFamily: MONO, fontSize: 13 }}>{getPlatformFileInfo().folder}</code> folder
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7 }}>
                    <strong>C.</strong> Click <strong>Generate</strong> → watch your portfolio appear in the windows to the right!
                  </div>
                </div>

                {/* Hidden file inputs */}
                <input
                  id="data-file-input"
                  type="file"
                  accept={selectedPlatform === 'twitter' ? '.js' : '.json'}
                  style={{ display: "none" }}
                  onChange={getDataUploadHandler()}
                />
                <input
                  id="media-folder-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  style={{ display: "none" }}
                  onChange={handleMediaUpload}
                  {...{ webkitdirectory: "true", directory: "true" }}
                />

                {/* Upload controls - matching Demo/Export style */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginLeft: 48, flexWrap: "wrap" }}>
                  {/* Data file upload */}
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => document.getElementById('data-file-input')?.click()}
                  >
                    <ControlScreen title={getPlatformFileInfo().label} desc={uploadedTweets ? "✓ Loaded" : `Select ${getPlatformFileInfo().file}`}>
                      <ActionKnob color={getPlatformColor()} ariaLabel={`Select ${getPlatformFileInfo().file}`} />
                    </ControlScreen>
                  </div>

                  {/* Media upload */}
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => document.getElementById('media-folder-input')?.click()}
                  >
                    <ControlScreen title="Media" desc={uploadedMedia.size > 0 ? `✓ ${uploadedMedia.size} files` : "Select folder"}>
                      <ActionKnob color={getPlatformColor()} ariaLabel="Select media folder" />
                    </ControlScreen>
                  </div>

                  {/* Generate */}
                  <div
                    style={{ cursor: uploadedTweets && uploadedMedia.size > 0 ? "pointer" : "default" }}
                    onClick={() => {
                      if (uploadedTweets && uploadedMedia.size > 0) {
                        doClick(generatePortfolio);
                      }
                    }}
                  >
                    <ControlScreen title="Generate" desc={uploadedTweets && uploadedMedia.size > 0 ? "Ready!" : "Upload first"}>
                      <ActionKnob
                        color={uploadedTweets && uploadedMedia.size > 0 ? getPlatformColor() : "rgba(0,0,0,0.3)"}
                        ariaLabel="Generate portfolio"
                      />
                    </ControlScreen>
                  </div>

                  {/* Counter - ControlScreen style */}
                  <ControlScreen title="Counter" desc="portfolios created">
                    <div style={{ display: "flex", gap: 2 }}>
                      {String(1247).split('').map((digit, i) => (
                        <div key={i} style={{
                          background: "#fff",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: 3,
                          padding: "2px 4px",
                          fontFamily: MONO,
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#111",
                          position: "relative",
                          minWidth: 12,
                          textAlign: "center",
                        }}>
                          {digit}
                          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "rgba(0,0,0,0.06)" }} />
                        </div>
                      ))}
                    </div>
                  </ControlScreen>
                </div>

                {/* Status */}
                {uploadStatus && (
                  <div style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7, marginLeft: 48, marginTop: 12, color: CMYK.c }}>{uploadStatus}</div>
                )}
              </div>

              {/* Note */}
              <div style={{ fontFamily: MONO, fontSize: 11, opacity: 0.5, marginTop: 14, marginLeft: 48 }}>
                Your data stays in your browser. Nothing is uploaded to any server.
              </div>
            </div>
            )}

            {/* Tweet Generator - Home page only */}
            {activeTopTab === "home" && (
            <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.90)", borderRadius: 22, padding: 16, boxSizing: "border-box", marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 2px 12px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 14, gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 15.5, letterSpacing: -0.2 }}>Tweet Generator</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: 0.2, opacity: 0.65 }}>daily inspiration + prompts</div>
              </div>
              
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start", overflowX: "auto", paddingBottom: 2 }}>
                <ControlScreen title="Generate" desc="Add one now">
                  <ActionKnob color={CMYK.c} ariaLabel="Generate tweet" onClick={() => doClick(() => {
                    const seed = hash32(`${today}::manual::${Date.now()}`);
                    const rng = mulberry32(seed);
                    const item = pickWithRng([...INSPIRATION, ...PROMPTS], rng);
                    const t1 = pickWithRng(TAGS, rng);
                    let t2 = pickWithRng(TAGS, rng);
                    for (let i = 0; i < 12 && t2.id === t1.id; i++) t2 = pickWithRng(TAGS, rng);
                    const tw = {
                      id: `m_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                      date: new Date(),
                      text: item.text,
                      kind: item.kind,
                      topic: item.topic,
                      author: item.author || null,
                      tags: [t1, t2],
                    };
                    setTweets((prev) => [tw, ...prev].slice(0, 24));
                  })} />
                </ControlScreen>
                
                <ControlScreen title="Auto" desc={autoOn ? "Drip on" : "Stopped"}>
                  <Knob color={CMYK.m} on={autoOn} onToggle={() => doClick(() => setAutoOn((v) => !v))} ariaLabel="Toggle auto-drip" />
                </ControlScreen>
                
                <ControlScreen title="Search" desc={searchOn ? "Active" : "Off"}>
                  <Knob color={CMYK.y} on={searchOn} onToggle={() => doClick(() => setSearchOn((s) => !s))} ariaLabel="Toggle search" />
                </ControlScreen>
                
                <ControlScreen title="Order" desc={sortNewest ? "Newest first" : "Oldest first"}>
                  <Knob color={CMYK.k} on={sortNewest} onToggle={() => doClick(() => setSortNewest((v) => !v))} ariaLabel="Toggle order" />
                </ControlScreen>
                
                <ControlScreen title="Sound" desc={soundOn ? "Clicks on" : "Silent"}>
                  <Knob color={CMYK.c} on={soundOn} onToggle={() => doClick(() => setSoundOn((s) => !s))} ariaLabel="Toggle sound" />
                </ControlScreen>
              </div>
              
              {searchOn && (
                <div style={{ marginTop: 14 }}>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tags, topic, quote, prompt…"
                    style={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 14,
                      padding: "10px 12px",
                      fontFamily: MONO,
                      fontSize: 10.4,
                      fontWeight: 400,
                      letterSpacing: 0.12,
                      color: "rgba(0,0,0,0.45)",
                      outline: "none",
                      background: "rgba(255,255,255,0.96)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
              
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 13, opacity: 0.8, padding: "0 2px 8px" }}>Today's mix</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {filteredTweets.slice(0, 6).map((tw) => (
                    <div key={`gen_${tw.id}`} style={{ border: "1px solid rgba(0,0,0,0.10)", background: "rgba(255,255,255,0.94)", borderRadius: 16, padding: 12, boxSizing: "border-box" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, opacity: 0.65, marginBottom: 6 }}>
                        <span>{formatDate(tw.date)}</span>
                        <span style={{ fontFamily: MONO, letterSpacing: 0.35 }}>{tw.kind} · {tw.topic}</span>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 10.5, lineHeight: 1.5, marginBottom: tw.author ? 6 : 10, color: "rgba(0,0,0,0.72)" }}>{tw.text}</div>
                      {tw.author && (
                        <div style={{ fontSize: 10, opacity: 0.55, marginBottom: 10, fontWeight: 600 }}>— {tw.author}</div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {tw.tags.map((t) => <TagPill key={`gen_${tw.id}_${t.id}`} label={t.label} topColor={t.top} />)}
                        </div>
                        {/* Copy knob - Dieter Rams inspired */}
                        <CopyKnob text={tw.author ? `"${tw.text}" — ${tw.author}` : tw.text} clickSound={clickSound} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </section>

          {/* Middle column */}
          <aside style={{ width: "100%", maxWidth: 340, marginTop: 0, paddingTop: 0, alignSelf: "flex-start" }}>
            <div style={{ width: "100%", border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.90)", borderRadius: 22, padding: 16, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 4px 10px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: -0.2 }}>{uploadedTweets ? "Your Unspool" : "Sample Unspool"}</div>
              </div>

              <div style={{ border: "1px solid rgba(0,0,0,0.10)", background: "rgba(255,255,255,0.94)", borderRadius: 18, padding: 12, marginBottom: 14, boxSizing: "border-box" }}>
                <div style={{ fontWeight: 900, fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
                  {uploadedTweets ? "Your tweets" : "Archived tweets"} {archivedTweets.length > 0 && `(${archivedTweets.length})`}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {archivedTweets.length > 0 ? archivedTweets.filter(tw => tw.imageUrl || tw.videoUrl).slice(0, 6).map((tw) => (
                    <div key={tw.id} style={{ border: "1px solid rgba(0,0,0,0.10)", background: "rgba(255,255,255,0.96)", borderRadius: 14, padding: 12, boxSizing: "border-box", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ fontSize: 11, opacity: 0.6 }}>{formatDate(tw.date)}</div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => togglePin(tw.id)}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: pinnedItems.has(tw.id) ? CMYK.c : "rgba(245,246,248,0.9)",
                              border: `1.5px solid ${pinnedItems.has(tw.id) ? CMYK.c : "rgba(0,0,0,0.12)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
                            aria-label="Pin tweet"
                          >
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: pinnedItems.has(tw.id) ? "#fff" : "rgba(0,0,0,0.4)" }} />
                          </button>
                        </div>
                      </div>

                      {/* Media - image or video */}
                      {(tw.imageUrl || tw.videoUrl) && (
                        <div
                          style={{
                            borderRadius: 10,
                            backgroundColor: '#f5f5f3',
                            aspectRatio: "4/3",
                            marginBottom: 10,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            cursor: tw.isVideo ? "default" : "zoom-in",
                          }}
                          onClick={!tw.isVideo ? () => setLightboxImage(tw.imageUrl) : undefined}
                        >
                          {tw.isVideo ? (
                            <>
                              <video
                                src={tw.videoUrl || tw.imageUrl}
                                muted={!playingVideos.has(tw.id)}
                                controls={playingVideos.has(tw.id)}
                                playsInline
                                preload="metadata"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  position: "absolute",
                                  inset: 0,
                                }}
                                ref={(el) => {
                                  if (el) {
                                    if (playingVideos.has(tw.id)) {
                                      el.muted = false;
                                      el.play();
                                    } else {
                                      el.pause();
                                      el.currentTime = 0.1;
                                    }
                                  }
                                }}
                                onEnded={() => setPlayingVideos(prev => { const n = new Set(prev); n.delete(tw.id); return n; })}
                              />
                              {!playingVideos.has(tw.id) && (
                                <button
                                  onClick={() => { clickSound(); setPlayingVideos(prev => new Set(prev).add(tw.id)); }}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.95)",
                                    border: "2px solid rgba(0,0,0,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    padding: 0,
                                    position: "relative",
                                    zIndex: 2,
                                  }}
                                  aria-label="Play video"
                                >
                                  <div style={{
                                    width: 0,
                                    height: 0,
                                    borderTop: "6px solid transparent",
                                    borderBottom: "6px solid transparent",
                                    borderLeft: "9px solid #333",
                                    marginLeft: 2,
                                  }} />
                                </button>
                              )}
                            </>
                          ) : (
                            <img
                              src={tw.imageUrl}
                              alt="Tweet media"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                e.target.parentElement.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      )}

                      <div style={{ fontFamily: MONO, fontSize: 10.5, lineHeight: 1.5, marginBottom: 10, color: "rgba(0,0,0,0.72)" }}>{tw.text}</div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {tw.tags.map((t) => <TagPill key={`${tw.id}_${t.id}`} label={t.label} topColor={t.top} />)}
                      </div>
                    </div>
                  )) : (
                    <div style={{ fontSize: 13, opacity: 0.5, fontStyle: "normal", padding: "12px 0" }}>
                      {activeTopTab === "howto"
                        ? "Upload your Twitter archive above to see your tweets here"
                        : "Click \"Demo\" to load sample tweets, or go to \"How to\" to upload your archive"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
          
          {/* Right column */}
          <aside style={{ width: "100%", maxWidth: 340, marginTop: 0, paddingTop: 0, alignSelf: "flex-start" }}>
            <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.90)", borderRadius: 22, padding: 16, boxSizing: "border-box", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "2px 2px 12px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 14, gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 15.5, letterSpacing: -0.2 }}>Archive Manager</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: 0.2, opacity: 0.65 }}>demo + export</div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "space-evenly", alignItems: "flex-start" }}>
                <ControlScreen title="Demo" desc="Load sample data">
                  <ActionKnob color={CMYK.c} ariaLabel="Load demo data" onClick={() => doClick(() => loadDemoData())} />
                </ControlScreen>

                <ControlScreen title="Export" desc="Download portfolio">
                  <ActionKnob color={CMYK.m} ariaLabel="Download portfolio" onClick={() => doClick(() => setShowExportMenu(true))} />
                </ControlScreen>
              </div>

              {archiveStatus && (
                <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 11.5, opacity: 0.75 }}>{archiveStatus}</div>
              )}
            </div>
            
            <div style={{ border: "1px solid rgba(0,0,0,0.12)", background: "rgba(255,255,255,0.90)", borderRadius: 22, padding: 16, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 4px 10px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 15.5, letterSpacing: -0.2 }}>{uploadedTweets ? "Your images + media" : "Archived images + media"}</div>
                
                {/* Shuffle knob - same style as Tweet Generator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10.4, fontWeight: 400, letterSpacing: 0.12, opacity: 0.9 }}>Shuffle</div>
                  <ActionKnob
                    color={CMYK.y}
                    ariaLabel="Shuffle media"
                    onClick={() => doClick(() => {
                      // Fisher-Yates shuffle for proper randomization
                      const shuffled = [...mediaItems];
                      for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                      }
                      // Ensure only one item per date
                      const seenDates = new Set();
                      const unique = shuffled.filter(item => {
                        const dateKey = item.dateKey || item.date?.toISOString().slice(0,10);
                        if (seenDates.has(dateKey)) return false;
                        seenDates.add(dateKey);
                        return true;
                      });
                      setMediaItems(unique);
                    })}
                  />
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                {mediaItems.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", fontSize: 13, opacity: 0.5, fontStyle: "normal", padding: "12px 0", textAlign: "center" }}>
                    {activeTopTab === "howto"
                      ? "Your media will appear here after upload"
                      : "Click \"Demo\" to see sample media"}
                  </div>
                )}
                {(mediaItems.length ? mediaItems.slice(0, 8) : []).map((it, i) => {
                  const isVideo = it.kind === 'video' || it.url?.endsWith('.mp4');

                  return (
                    <div key={it.id || `tile_${i}`} style={{
                      background: "#f5f5f3",
                      borderRadius: 12,
                      padding: "8px 8px 10px 8px",
                      boxSizing: "border-box",
                    }}>
                      {/* Screen - clickable for images */}
                      <div
                        onClick={!isVideo ? () => setLightboxImage(it.url) : undefined}
                        style={{
                          borderRadius: 4,
                          backgroundColor: isVideo && playingVideos.has(it.id) ? '#000' : '#fafafa',
                          aspectRatio: "4/3",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          cursor: isVideo ? "default" : "zoom-in",
                        }}
                      >
                        {isVideo ? (
                          <>
                            {/* Video element - shows preview frame, plays on click */}
                            <video
                              src={it.videoUrl || it.url}
                              muted={!playingVideos.has(it.id)}
                              controls={playingVideos.has(it.id)}
                              playsInline
                              preload="metadata"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "absolute",
                                inset: 0,
                              }}
                              ref={(el) => {
                                if (el) {
                                  if (playingVideos.has(it.id)) {
                                    el.muted = false;
                                    el.play();
                                  } else {
                                    el.pause();
                                    el.currentTime = 0.1; // Show first frame
                                  }
                                }
                              }}
                              onEnded={() => setPlayingVideos(prev => { const n = new Set(prev); n.delete(it.id); return n; })}
                            />
                            {/* Play button overlay - only show when not playing */}
                            {!playingVideos.has(it.id) && (
                              <button
                                onClick={() => { clickSound(); setPlayingVideos(prev => new Set(prev).add(it.id)); }}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: "rgba(255,255,255,0.95)",
                                  border: "2px solid rgba(0,0,0,0.15)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  padding: 0,
                                  position: "relative",
                                  zIndex: 2,
                                }}
                                aria-label="Play video"
                              >
                                <div style={{
                                  width: 0,
                                  height: 0,
                                  borderTop: "7px solid transparent",
                                  borderBottom: "7px solid transparent",
                                  borderLeft: "11px solid #333",
                                  marginLeft: 3,
                                }} />
                              </button>
                            )}
                          </>
                        ) : (
                          it.url && (
                            <img
                              src={it.url}
                              alt="Portfolio media"
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => { e.target.parentElement.parentElement.style.display = 'none'; }}
                            />
                          )
                        )}
                      </div>
                      {/* Controls - Braun style */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 6,
                        padding: "0 2px",
                      }}>
                        {/* Speaker grille */}
                        <div style={{ display: "flex", gap: 2 }}>
                          {[0,1,2,3,4,5].map(j => (
                            <div key={j} style={{
                              width: 1.5,
                              height: 6,
                              borderRadius: 1,
                              background: "rgba(0,0,0,0.2)",
                            }} />
                          ))}
                        </div>
                        {/* Control buttons */}
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          {isVideo ? (
                            <>
                              <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#e8e8e6",
                                border: "1px solid rgba(0,0,0,0.1)",
                              }} />
                              <div style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#e53935",
                                boxShadow: playingVideos.has(it.id) ? "0 0 6px #e53935" : "none",
                              }} />
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => togglePin(it.id)}
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background: pinnedItems.has(it.id) ? CMYK.y : "#e8e8e6",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                                aria-label="Pin"
                              >
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: pinnedItems.has(it.id) ? "#111" : "rgba(0,0,0,0.3)" }} />
                              </button>
                              <button
                                onClick={() => downloadMedia(it.url, it.url?.split('/').pop())}
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background: "#e8e8e6",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                                aria-label="Download"
                              >
                                <div style={{ width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: "4px solid rgba(0,0,0,0.5)" }} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </main>
        
        <footer style={{ width: "100%", padding: "18px 0 24px", fontSize: 12, opacity: 0.75 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.10)", paddingTop: 12 }}>
            <div>unspool.work © 2026</div>
            <div style={{ fontFamily: MONO, letterSpacing: 0.4 }} />
          </div>
        </footer>
      </div>

      {/* Export Menu Modal */}
      {showExportMenu && (
        <div
          onClick={() => setShowExportMenu(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 24,
              maxWidth: 480,
              width: "90%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.3 }}>Export Portfolio</div>
              <button
                onClick={() => setShowExportMenu(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* HTML Export */}
              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>HTML Page</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, marginTop: 2 }}>Self-contained file</div>
                  </div>
                  <ActionKnob color={CMYK.c} ariaLabel="Export as HTML" onClick={() => { exportAsHTML(); setShowExportMenu(false); }} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Opens offline in any browser. Images embedded.</div>
              </div>

              {/* PDF Export */}
              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>PDF Document</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, marginTop: 2 }}>Print-ready grid</div>
                  </div>
                  <ActionKnob color={CMYK.m} ariaLabel="Export as PDF" onClick={() => { exportAsPDF(); setShowExportMenu(false); }} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Opens print dialog. Save as PDF.</div>
              </div>

              {/* Image Grid Export */}
              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Image Grid</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, marginTop: 2 }}>PNG collage</div>
                  </div>
                  <ActionKnob color={CMYK.y} ariaLabel="Export as image grid" onClick={() => { exportAsImageGrid(); setShowExportMenu(false); }} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Share on Instagram or social media.</div>
              </div>

              {/* Slideshow Export */}
              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Slideshow</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, marginTop: 2 }}>Auto-play presentation</div>
                  </div>
                  <ActionKnob color={CMYK.c} ariaLabel="Export as slideshow" onClick={() => { exportAsSlideshow(); setShowExportMenu(false); }} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Arrow keys or auto-play. Full screen.</div>
              </div>

              {/* Poster Export */}
              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Poster</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, marginTop: 2 }}>24x36 inch print</div>
                  </div>
                  <ActionKnob color={CMYK.m} ariaLabel="Export as poster" onClick={() => { exportAsPrintReady('poster'); setShowExportMenu(false); }} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Large format for printing.</div>
              </div>

              {/* Static Site Export */}
              <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Static Site</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6, marginTop: 2 }}>Deploy to web</div>
                  </div>
                  <ActionKnob color={CMYK.k} ariaLabel="Export as static site" onClick={() => { exportAsStaticSite(); setShowExportMenu(false); }} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>Drag to Netlify for instant URL.</div>
              </div>
            </div>

            {archivedTweets.length === 0 && (
              <div style={{ marginTop: 16, padding: 12, background: "rgba(255,0,127,0.08)", borderRadius: 10, fontSize: 12, textAlign: "center" }}>
                Load demo data or upload your archive first
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal - Dieter Rams inspired */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div style={{
            background: "#f5f5f3",
            borderRadius: 16,
            padding: "12px 12px 16px 12px",
            maxWidth: "90vw",
            maxHeight: "90vh",
            boxSizing: "border-box",
          }}>
            <div style={{
              borderRadius: 6,
              backgroundColor: "#fafafa",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <img
                src={lightboxImage}
                alt="Full size"
                style={{
                  maxWidth: "85vw",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  display: "block",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {/* TV Controls */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
              padding: "0 4px",
            }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[0,1,2,3,4,5,6,7].map(j => (
                  <div key={j} style={{ width: 2, height: 8, borderRadius: 1, background: "rgba(0,0,0,0.2)" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e8e8e6", border: "1px solid rgba(0,0,0,0.1)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e53935" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
