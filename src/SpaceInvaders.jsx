#!/usr/bin/env node
import React, { useState, useEffect } from "react";
import { render, Text, Box, useInput, useApp } from "ink";
import {
  WIDTH,
  HEIGHT,
  TICK_RATE,
  TOP_BORDER,
  BOTTOM_BORDER,
  LEFT_BORDER,
  RIGHT_BORDER,
} from "./constants";
import { WinAnimationInline } from "./components/WinAnimationInline";
import { LoseAnimationInline } from "./components/LoseAnimationInline";

const ALIEN_FIRE_INTERVAL = 5;

const createAliens = () => {
  const aliens = [];
  for (let y = 0; y < 2; y++) {
    for (let x = 2; x < WIDTH - 2; x += 4) {
      aliens.push({ x, y });
    }
  }
  return aliens;
};

const App = () => {
  const { exit } = useApp();
  const [shipX, setShipX] = useState(Math.floor(WIDTH / 2));
  const [bullets, setBullets] = useState([]);
  const [alienBullets, setAlienBullets] = useState([]);
  const [aliens, setAliens] = useState(createAliens());
  const [tick, setTick] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const endGame = () => {
    setGameOver(true);
    setTimeout(exit, 3000);
  };

  const handleInput = (input, key) => {
    if (input === "q") exit();
    if (key.leftArrow) setShipX((x) => Math.max(0, x - 1));
    if (key.rightArrow) setShipX((x) => Math.min(WIDTH - 1, x + 1));
    if (input === " ") {
      setBullets((b) => [...b, { x: shipX, y: HEIGHT - 2 }]);
    }
  };

  useInput(handleInput);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), TICK_RATE);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const movedBullets = bullets
      .map((b) => ({ ...b, y: b.y - 1 }))
      .filter((b) => b.y >= 0);

    const movedAlienBullets = alienBullets
      .map((b) => ({ ...b, y: b.y + 1 }))
      .filter((b) => b.y < HEIGHT);

    const hits = movedBullets.filter((b) =>
      aliens.some((a) => a.x === b.x && a.y === b.y)
    );

    if (hits.length > 0) {
      setScore((s) => s + hits.length * 100);

      setAliens((currentAliens) =>
        currentAliens.filter(
          (a) => !hits.some((hit) => hit.x === a.x && hit.y === a.y)
        )
      );

      setBullets(() =>
        movedBullets.filter(
          (b) => !hits.some((hit) => hit.x === b.x && hit.y === b.y)
        )
      );
    } else {
      setBullets(movedBullets);
    }

    setAlienBullets(movedAlienBullets);

    if (tick % ALIEN_FIRE_INTERVAL === 0 && aliens.length > 0) {
      const shooter = aliens[Math.floor(Math.random() * aliens.length)];
      setAlienBullets((b) => [...b, { x: shooter.x, y: shooter.y + 1 }]);
    }

    if (movedAlienBullets.some((b) => b.x === shipX && b.y === HEIGHT - 1)) {
      endGame();
    }

    if (aliens.some((a) => a.y >= HEIGHT - 2)) {
      endGame();
    }

    if (aliens.length === 0) {
      endGame();
    }
  }, [tick]);

  const renderCell = (x, y) => {
    if (aliens.some((a) => a.x === x && a.y === y)) {
      return <Text color="green">@</Text>;
    } else if (bullets.some((b) => b.x === x && b.y === y)) {
      return <Text color="yellow">|</Text>;
    } else if (alienBullets.some((b) => b.x === x && b.y === y)) {
      return <Text color="red">!</Text>;
    } else if (y === HEIGHT - 1 && x === shipX) {
      return <Text color="cyan">^</Text>;
    } else {
      return " ";
    }
  };

  const renderRow = (y) =>
    [...Array(WIDTH).keys()].map((x) => (
      <React.Fragment key={x}>{renderCell(x, y)}</React.Fragment>
    ));

  return (
    <Box flexDirection="column">
      <Text>← → to move | space to shoot | q to quit</Text>
      <Text>Score: {score}</Text>

      {gameOver ? (
        aliens.length === 0 ? (
          <WinAnimationInline />
        ) : (
          <LoseAnimationInline />
        )
      ) : (
        <>
          <Text>{TOP_BORDER}</Text>
          {[...Array(HEIGHT).keys()].map((y) => (
            <Box key={y}>
              <Text>{LEFT_BORDER}</Text>
              <Text>{renderRow(y)}</Text>
              <Text>{RIGHT_BORDER}</Text>
            </Box>
          ))}
          <Text>{BOTTOM_BORDER}</Text>
        </>
      )}
    </Box>
  );
};

render(<App />);
