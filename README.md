# Terminal Space Invaders

A retro Space Invaders game that runs directly in your terminal, built with React Ink.

![Terminal Space Invaders](https://via.placeholder.com/600x400.png?text=Terminal+Space+Invaders)

## Overview

This project is a terminal-based implementation of the classic Space Invaders arcade game. It's built using React Ink, allowing for interactive terminal UIs with React components. The game features colored entities, collision detection, animated win and loss screens, and a complete game loop.

## How to Play

1. **Installation**:

   ```bash
   npm install
   ```

2. **Start the game**:

   ```bash
   npm start
   ```

   or

   ```bash
   tsx SpaceInvaders.jsx
   ```

3. **Controls**:

   - `←` / `→`: Move your spaceship left/right
   - `Space`: Fire bullets
   - `q`: Quit the game

4. **Game Rules**:
   - Destroy all alien invaders before they reach your position
   - Each alien hit earns you 100 points
   - If an alien hits you or reaches the bottom, you lose
   - If you destroy all aliens, you win and see a victory animation!

## Technical Implementation

The game is built using:

- **React Ink**: A library for building CLI applications with React
- **React Hooks**: For state management and side effects
- **Modern JavaScript**: ES modules, array methods, and functional programming
- **Modular Architecture**: Code split into multiple files for better organization
- **Custom Animations**: Win and lose screens with animated visuals

### Code Breakdown

#### 1. Project Structure

```
├── constants.js         # Game constants and configuration
├── SpaceInvaders.jsx    # Main game logic and rendering
├── WinAnimationInline.jsx    # Victory animation component
├── LoseAnimationInline.jsx   # Game over animation component
└── package.json         # Project dependencies and scripts
```

The project uses a modular structure to separate concerns and make the code more maintainable.

#### 2. Constants and Configuration

```javascript
// Constants define the game dimensions, speed, and border characters
const WIDTH = 30;
const HEIGHT = 10;
const TICK_RATE = 200;

const TOP_BORDER = "┌" + "─".repeat(WIDTH) + "┐";
const BOTTOM_BORDER = "└" + "─".repeat(WIDTH) + "┘";
const LEFT_BORDER = "│";
const RIGHT_BORDER = "│";

export {
  WIDTH,
  HEIGHT,
  TICK_RATE,
  TOP_BORDER,
  BOTTOM_BORDER,
  LEFT_BORDER,
  RIGHT_BORDER,
};
```

Separating constants into a dedicated module improves code organization and maintainability, allowing for easy configuration changes.

#### 3. Game Initialization

```jsx
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
```

This function sets up the initial game state by creating a formation of aliens at the top of the play area.

#### 4. State Management with React Hooks

```jsx
const { exit } = useApp();
const [shipX, setShipX] = useState(Math.floor(WIDTH / 2));
const [bullets, setBullets] = useState([]);
const [alienBullets, setAlienBullets] = useState([]);
const [aliens, setAliens] = useState(createAliens());
const [tick, setTick] = useState(0);
const [gameOver, setGameOver] = useState(false);
const [score, setScore] = useState(0);
```

React's useState hook manages the game's state, tracking the position of the player, bullets, aliens, and game status.

#### 5. Helper Functions

```jsx
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
```

Helper functions encapsulate specific behaviors like ending the game and handling user input, improving code readability and maintainability.

#### 6. Input Handling

```jsx
useInput(handleInput);
```

The useInput hook from Ink captures keyboard input, allowing the player to move and fire.

#### 7. Game Loop with useEffect

```jsx
useEffect(() => {
  const timer = setInterval(() => setTick((t) => t + 1), TICK_RATE);
  return () => clearInterval(timer);
}, []);
```

This effect creates a game loop that updates the game state at regular intervals, with proper cleanup when the component unmounts.

#### 8. Game Logic

```jsx
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
```

This effect handles the core game mechanics on each tick, including moving bullets, checking for collisions, updating the score, and removing hit aliens and bullets.

#### 9. Rendering Logic

```jsx
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
```

The rendering function uses a declarative approach to determine what should be displayed at each position in the game grid, with colored text to differentiate game elements.

#### 10. Conditional UI Rendering

```jsx
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
```

The UI conditionally displays either the game grid or a win/lose animation based on the game state, demonstrating React's powerful conditional rendering capabilities.

#### 11. Win Animation

```jsx
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

  // ...Rendering logic
```

The win animation uses state and an interval to cycle through frames, creating a celebratory fireworks effect when the player wins.

## Advanced Techniques Employed

1. **Functional Programming**: Using array methods like map, filter, and some for declarative data transformations
2. **Immutable State Updates**: Following React best practices for state management
3. **Component Composition**: Building complex UIs from simple components
4. **Custom Hooks**: Leveraging React hooks for stateful logic
5. **Modular Design**: Separating concerns into different files
6. **Animation Logic**: Creating dynamic visual effects with state changes
7. **Conditional Rendering**: Showing different UI elements based on game state
8. **Color Differentiation**: Enhancing user experience with colored elements
