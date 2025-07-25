import { useState, useEffect } from "react";

const welcomeMessages = [
  "Welcome, mathlete! Ready to conquer some AMC problems today?",
  "Track your AMC journey and unlock your math superpowers!",
  "Did you know: Consistency beats cramming. A little practice every day goes a long way!",
  "Welcome! Pro tip: Try the Konami code on this page. (👀)",
  "Math is the only place people buy 60 watermelons and nobody wonders why. Let's get solving!",
  "You found the secret message! (Or did you?)",
  "Welcome back! Remember: Every wrong answer is a step closer to mastery.",
  "Rumor has it, solving question 25 unlocks a hidden badge...",
  "If you can read this, you're already ahead of the curve!",
  "May the odds be ever in your favor. (Just kidding, it's all skill here!)"
];

export const RandomWelcome = () => {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMsg(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
  }, []);

  return (
    <h1 className="text-base text-primary/80 font-medium mt-3 mb-2 animate-fade-in">
      {msg}
    </h1>
  );
};
