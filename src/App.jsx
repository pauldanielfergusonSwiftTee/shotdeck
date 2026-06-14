import { useState } from "react";
import "./App.css";
import logo from "./assets/shotdeck-logo.png";
import { famousShots } from "./data/famousShots";

const clubs = [
  "Driver", "3 Wood", "5 Wood", "4 Iron", "5 Iron", "6 Iron", "7 Iron",
  "8 Iron", "9 Iron", "PW", "50°", "54°", "58°"
];

const shapes = ["Draw", "Fade", "Straight"];
const flights = ["High", "Standard Height", "Low"];
const targets = ["Left Target", "Centre Target", "Right Target"];
const modes = ["Net Practice", "Range Practice", "Course Mode", "Famous Shots"];
const courseSequence = ["TEE SHOT", "APPROACH", "SCORING SHOT"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildShotName(shape, flight) {
  if (shape === "Straight" && flight === "Standard Height") return "Straight Stock Shot";
  if (flight === "Standard Height") return shape;
  if (shape === "Straight") return `${flight} Straight`;
  return `${flight} ${shape}`;
}

function getDistanceForClub(club) {
  const distances = {
    Driver: "240y+",
    "3 Wood": "220y",
    "5 Wood": "200y",
    "4 Iron": "185y",
    "5 Iron": "175y",
    "6 Iron": "165y",
    "7 Iron": "155y",
    "8 Iron": "145y",
    "9 Iron": "135y",
    PW: "120y",
    "50°": "100y",
    "54°": "85y",
    "58°": "70y",
  };

  return distances[club] || "Target Distance";
}

function generateShot(mode, selectedClubs, courseStep) {
  const club = getRandom(selectedClubs);
  const shape = getRandom(shapes);
  const flight = getRandom(flights);
  const shotName = buildShotName(shape, flight);

  if (mode === "Net Practice") {
    return {
      label: "NEXT SHOT",
      context: "",
      main: club,
      details: [shotName],
    };
  }

  if (mode === "Range Practice") {
    return {
      label: "NEXT TARGET",
      context: "",
      main: getDistanceForClub(club),
      details: [club, shotName, getRandom(targets)],
    };
  }

  if (mode === "Course Mode") {
    const label = courseSequence[courseStep];

    return {
      label,
      context: "",
      main: club,
      details: [shotName, getRandom(targets)],
    };
  }

  if (mode === "Famous Shots") {
    return getRandom(famousShots);
  }

  return {
    label: "NEXT SHOT",
    context: "",
    main: club,
    details: [shotName],
  };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedClubs, setSelectedClubs] = useState(clubs);
  const [selectedMode, setSelectedMode] = useState("Net Practice");
  const [shot, setShot] = useState(null);

  const [perfects, setPerfects] = useState(0);
  const [goods, setGoods] = useState(0);
  const [misses, setMisses] = useState(0);
  const [skips, setSkips] = useState(0);

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [courseStep, setCourseStep] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [confirmType, setConfirmType] = useState(null);

  function toggleClub(club) {
    if (selectedClubs.includes(club)) {
      setSelectedClubs(selectedClubs.filter((item) => item !== club));
    } else {
      setSelectedClubs([...selectedClubs, club]);
    }
  }

  function nextCourseStep() {
    if (selectedMode === "Course Mode") {
      const next = (courseStep + 1) % courseSequence.length;
      setCourseStep(next);
      return next;
    }

    return courseStep;
  }

  function newShot() {
    const nextStep = nextCourseStep();
    setShot(generateShot(selectedMode, selectedClubs, nextStep));
    setCardKey((prev) => prev + 1);
  }

  function recordPerfect() {
    const newStreak = streak + 1;
    setPerfects(perfects + 1);
    setStreak(newStreak);

    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
    }

    newShot();
  }

  function recordGood() {
    const newStreak = streak + 1;
    setGoods(goods + 1);
    setStreak(newStreak);

    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
    }

    newShot();
  }

  function recordMiss() {
    setMisses(misses + 1);
    setStreak(0);
    newShot();
  }

  function bypassShot() {
    setSkips(skips + 1);
    newShot();
  }

  function startPractice() {
    setPerfects(0);
    setGoods(0);
    setMisses(0);
    setSkips(0);
    setStreak(0);
    setCourseStep(0);
    setConfirmType(null);
    setShot(generateShot(selectedMode, selectedClubs, 0));
    setCardKey((prev) => prev + 1);
    setScreen("practice");
  }

  function confirmAction() {
    if (confirmType === "end") setScreen("summary");
    if (confirmType === "setup") setScreen("home");
    setConfirmType(null);
  }

  function selectAllClubs() {
    setSelectedClubs(clubs);
  }

  function clearClubs() {
    setSelectedClubs([]);
  }

  const totalScored = perfects + goods + misses;
  const totalShots = perfects + goods + misses + skips;

  const qualityScore =
    totalScored === 0
      ? 0
      : Math.round(((perfects * 2 + goods) / (totalScored * 2)) * 100);

  return (
    <div className="app">
      <div className="background-grid"></div>
      <div className="background-glow"></div>

      <img
  src={logo}
  alt="ShotDeck Logo"
  className="logo"
  onClick={() => {
    setScreen("home");
    setConfirmType(null);
  }}
/>

      {screen === "home" && (
        <div className="panel">
          <h2>Practice Setup</h2>
          <p className="subtext">Choose the type of session you want to run.</p>

          <div className="mode-grid">
            {modes.map((mode) => (
              <button
                key={mode}
                className={selectedMode === mode ? "mode-button selected-mode" : "mode-button"}
                onClick={() => setSelectedMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <button className="main-button" onClick={() => setScreen("clubs")}>
            Choose Clubs
          </button>

          <button className="back-button" onClick={() => setScreen("help")}>
            How It Works
          </button>

          <p className="club-count">
            Current setup: {selectedMode} • {selectedClubs.length} clubs
          </p>
        </div>
      )}

      {screen === "clubs" && (
        <div className="panel">
          <h2>Choose Clubs</h2>
          <p className="subtext">
            Pick which clubs should appear in this practice session.
          </p>

          <div className="club-grid">
            {clubs.map((club) => (
              <button
                key={club}
                className={selectedClubs.includes(club) ? "club-button selected" : "club-button"}
                onClick={() => toggleClub(club)}
              >
                {club}
              </button>
            ))}
          </div>

          <div className="setup-actions">
            <button className="secondary-button" onClick={selectAllClubs}>
              Select All
            </button>

            <button className="secondary-button" onClick={clearClubs}>
              Clear
            </button>
          </div>

          <button
            className="main-button"
            onClick={startPractice}
            disabled={selectedClubs.length === 0}
          >
            Start {selectedMode} Session
          </button>

          <button className="back-button" onClick={() => setScreen("home")}>
            Back to Setup
          </button>

          <p className="club-count">{selectedClubs.length} clubs selected</p>
        </div>
      )}

      {screen === "help" && (
  <div className="panel help-panel">
    <h2>How It Works</h2>

    <div className="help-section">
      <h3>Net Practice</h3>

      <p className="help-main-text">
        For garden net or indoor work where you mainly want reps without
        needing a visible target.
      </p>

      <ul className="help-list">
        <li>Shows: Club + shot shape</li>
        <li>No: Distance or target</li>
        <li>Best for: Technique and strike practice</li>
      </ul>
    </div>

    <div className="help-section">
      <h3>Range Practice</h3>

      <p className="help-main-text">
        For range sessions where you want each ball to have a clear distance,
        club, shot shape and target.
      </p>

      <ul className="help-list">
        <li>Shows: Distance + club + shot shape + target</li>
        <li>Adds: Target direction</li>
        <li>Best for: Realistic target practice</li>
      </ul>
    </div>

    <div className="help-section">
      <h3>Course Mode</h3>

      <p className="help-main-text">
        For practising like you are playing real holes instead of just hitting
        random balls.
      </p>

      <ul className="help-list">
        <li>Shows: Shot type + club + shot shape + target</li>
        <li>Adds: Tee, approach and scoring situations</li>
        <li>Best for: Course-style decisions</li>
      </ul>
    </div>

    <div className="help-section">
      <h3>Famous Shots</h3>

      <p className="help-main-text">
        For cinematic practice challenges inspired by iconic golf moments and
        pressure situations.
      </p>

      <ul className="help-list">
        <li>Shows: Famous scenario + shot challenge</li>
        <li>Adds: Pressure and imagination</li>
        <li>Best for: Fun, variety and creativity</li>
      </ul>
    </div>

    <div className="help-section">
      <h3>Scoring</h3>

      <p className="help-main-text">
        Your score tracks the quality of execution rather than simply hit or
        miss.
      </p>

      <ul className="help-list">
        <li>Perfect = nailed the requested shot</li>
        <li>Good = playable or close enough</li>
        <li>Miss = failed execution</li>
        <li>Bypass = skips the shot without affecting score</li>
      </ul>
    </div>

    <button className="main-button" onClick={() => setScreen("home")}>
      Back to Setup
    </button>
  </div>
)}

      {screen === "practice" && shot && !confirmType && (
        <div className="card animated-card" key={cardKey}>
          {selectedMode !== "Famous Shots" && (
            <p className="small-label">{shot.label}</p>
          )}

          <p className="mode-label">{selectedMode}</p>

          {selectedMode === "Famous Shots" && (
            <p className="famous-title">{shot.label}</p>
          )}

          <h1>{shot.main}</h1>

          {shot.context && <p className="subtext">{shot.context}</p>}

          <div className="details">
            {shot.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>

          <div className="result-actions">
            <button className="perfect-button" onClick={recordPerfect}>
              Perfect
            </button>

            <button className="good-button" onClick={recordGood}>
              Good
            </button>

            <button className="miss-button" onClick={recordMiss}>
              Miss
            </button>
          </div>

          <button className="bypass-button" onClick={bypassShot}>
            Bypass this shot
          </button>

          <div className="streak-bar">
            🔥 Streak: {streak}
            <span>Best: {bestStreak}</span>
          </div>

          <div className="score-row">
            <span>🎯 {perfects}</span>
            <span>👍 {goods}</span>
            <span>❌ {misses}</span>
            <span>{qualityScore}%</span>
          </div>

          <div className="bottom-actions">
            <button className="small-action-button" onClick={() => setConfirmType("end")}>
              End Session
            </button>

            <button className="small-action-button" onClick={() => setConfirmType("setup")}>
              Main Menu
            </button>
          </div>
        </div>
      )}

      {screen === "practice" && confirmType && (
        <div className="card animated-card">
          <p className="small-label">CONFIRM</p>

          <h2>{confirmType === "end" ? "End Session?" : "Main Menu?"}</h2>

          <p className="subtext">
            {confirmType === "end"
              ? "Your session summary will be shown."
              : "This will leave your current practice session."}
          </p>

          <button className="main-button" onClick={confirmAction}>
            {confirmType === "end"
              ? `Yes, end ${selectedMode} session`
              : "Yes, go to main menu"}
          </button>

          <button className="back-button" onClick={() => setConfirmType(null)}>
            No, go back
          </button>
        </div>
      )}

      {screen === "summary" && (
        <div className="card">
          <p className="small-label">SESSION COMPLETE</p>

          <h1>{qualityScore}%</h1>

          <p className="subtext">Strong session. Review your numbers below.</p>

          <div className="summary-grid">
            <div><strong>{perfects}</strong><span>Perfect</span></div>
            <div><strong>{goods}</strong><span>Good</span></div>
            <div><strong>{misses}</strong><span>Misses</span></div>
            <div><strong>{bestStreak}</strong><span>Best Streak</span></div>
            <div><strong>{skips}</strong><span>Bypassed</span></div>
            <div><strong>{totalShots}</strong><span>Total Shots</span></div>
          </div>

          <button className="main-button" onClick={startPractice}>
            Start New {selectedMode} Session
          </button>

          <button className="back-button" onClick={() => setScreen("home")}>
            Main Menu
          </button>
        </div>
      )}
    </div>
  );
}