import React, { useState, useEffect } from "react";
import { Text } from "ink";
import { WIDTH, HEIGHT } from "../constants";

export const WinAnimationInline = () => {
  const frames = [
    "        ✨        ",
    "    🎆     🎆    ",
    "  🎇   ✨   🎇  ",
    "    🎆     🎆    ",
    "        ✨        ",
  ];

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const centerText = (text) => {
    const pad = Math.floor((WIDTH - text.length) / 2);
    return " ".repeat(Math.max(0, pad)) + text;
  };

  return (
    <>
      {[...Array(HEIGHT).keys()].map((y, i) => (
        <Text key={i}>
          {i === Math.floor(HEIGHT / 2) - 1
            ? centerText(frames[frameIndex])
            : i === Math.floor(HEIGHT / 2)
            ? centerText("🏆 YOU WIN! 🏆")
            : i === Math.floor(HEIGHT / 2) + 1
            ? centerText("Thanks for saving the galaxy!")
            : " ".repeat(WIDTH)}
        </Text>
      ))}
    </>
  );
};
