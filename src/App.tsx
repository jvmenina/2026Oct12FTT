import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import puzzleImage from './assets/hero.png'
import './App.css'

type PuzzleDifficulty = 'easy' | 'notEasy'

type Puzzle = {
  category: string
  answer: string
  image: string
  imageDescription: string
}

type PuzzleProgress = {
  categoryShown: boolean
  revealedLetters: number[]
}

type PuzzleSession = {
  currentPuzzleIndex: number
  progressByPuzzle: Record<number, PuzzleProgress>
}

// Add puzzle entries here to expand either difficulty's puzzle collection.
const puzzlesByDifficulty: Record<PuzzleDifficulty, Puzzle[]> = {
  easy: [
    {
      category: 'Design',
      answer: 'LAYER',
      image: puzzleImage,
      imageDescription: 'Two offset layers stacked on top of one another',
    },
    {
      category: 'Design',
      answer: 'LAYERING',
      image: puzzleImage,
      imageDescription: 'Two offset layers stacked on top of one another',
    },
  ],
  notEasy: [
    {
      category: 'Design concept',
      answer: 'STACK',
      image: puzzleImage,
      imageDescription: 'Two offset layers stacked on top of one another',
    },
    {
      category: 'Design concept',
      answer: 'STACKER',
      image: puzzleImage,
      imageDescription: 'Two offset layers stacked on top of one another',
    },
  ],
}

// Render the draw controls, name grid, selection dialogs, and puzzle modals.
function App() {
  const [names, setNames] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedName, setSelectedName] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [screenName, setScreenName] = useState('')
  const [showFileDialog, setShowFileDialog] = useState(true)
  const [isRolling, setIsRolling] = useState(false)
  const [activePuzzleDifficulty, setActivePuzzleDifficulty] = useState<PuzzleDifficulty | null>(null)
  const [puzzleSessions, setPuzzleSessions] = useState<Record<PuzzleDifficulty, PuzzleSession>>({
    easy: { currentPuzzleIndex: 0, progressByPuzzle: {} },
    notEasy: { currentPuzzleIndex: 0, progressByPuzzle: {} },
  })
  const wheelWindowRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stop a pending roll timer when the picker unmounts.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Keep the active grid cell visible while browsing or rolling.
  useEffect(() => {
    const activeName = wheelWindowRef.current?.querySelector<HTMLButtonElement>(
      `[data-index="${activeIndex}"]`,
    )
    activeName?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeIndex])

  // Read newline-separated names and reset the draw to the first cell.
  function loadNames(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const loadedNames = String(reader.result ?? '')
        .split(/\r?\n/)
        .map((name) => name.trim())
        .filter(Boolean)

      setNames(loadedNames)
      setActiveIndex(0)
      setSelectedName('')
      setSelectedIndex(null)
      setScreenName('')
      setShowFileDialog(false)
    }
    reader.readAsText(file)
  }

  // Select a specific name when its grid cell is clicked.
  function pickName(index: number) {
    if (isRolling || names.length === 0) return
    setActiveIndex(index)
    setSelectedName(names[index])
    setSelectedIndex(index)
  }

  // Remove a name from the draw and keep the active cell in range.
  function removeNameAt(index: number) {
    if (index < 0 || index >= names.length) return

    setNames((currentNames) => [
      ...currentNames.slice(0, index),
      ...currentNames.slice(index + 1),
    ])
    setActiveIndex((currentIndex) => {
      if (names.length <= 1) return 0
      if (index < currentIndex) return currentIndex - 1
      if (index === currentIndex) return Math.min(currentIndex, names.length - 2)
      return currentIndex
    })
  }

  // Close the result dialog and remove its selected name from the draw.
  function removeSelectedName() {
    if (selectedIndex !== null) removeNameAt(selectedIndex)
    setSelectedName('')
    setSelectedIndex(null)
  }

  // Keep the selected name on screen after removing it from the draw.
  function proceedWithSelection() {
    setScreenName(selectedName)
    if (selectedIndex !== null) removeNameAt(selectedIndex)
    setSelectedName('')
    setSelectedIndex(null)
  }

  // Open a difficulty's puzzle modal without resetting its saved session.
  function openPuzzle(difficulty: PuzzleDifficulty) {
    setActivePuzzleDifficulty(difficulty)
  }

  // Move between puzzles while keeping each puzzle's revealed hints.
  function movePuzzle(difficulty: PuzzleDifficulty, direction: -1 | 1) {
    const puzzleCount = puzzlesByDifficulty[difficulty].length
    setPuzzleSessions((sessions) => ({
      ...sessions,
      [difficulty]: {
        ...sessions[difficulty],
        currentPuzzleIndex: Math.max(
          0,
          Math.min(puzzleCount - 1, sessions[difficulty].currentPuzzleIndex + direction),
        ),
      },
    }))
  }

  // Reveal the category or a chosen answer letter for the active puzzle.
  function revealPuzzleHint(
    difficulty: PuzzleDifficulty,
    puzzleIndex: number,
    update: (progress: PuzzleProgress) => PuzzleProgress,
  ) {
    setPuzzleSessions((sessions) => {
      const session = sessions[difficulty]
      const currentProgress = session.progressByPuzzle[puzzleIndex] ?? {
        categoryShown: false,
        revealedLetters: [],
      }

      return {
        ...sessions,
        [difficulty]: {
          ...session,
          progressByPuzzle: {
            ...session.progressByPuzzle,
            [puzzleIndex]: update(currentProgress),
          },
        },
      }
    })
  }

  // Advance through cells in row-major order, slowing down before the winner.
  function pickRandom() {
    if (isRolling || names.length === 0) return

    setSelectedName('')
    setSelectedIndex(null)
    setIsRolling(true)
    const winnerIndex = Math.floor(Math.random() * names.length)
    const distanceToWinner = (winnerIndex - activeIndex + names.length) % names.length
    const totalSteps = names.length * 2 + distanceToWinner
    const delayCount = Math.max(0, totalSteps - 1)
    let totalWeight = 0
    for (let step = 1; step <= delayCount; step += 1) {
      const progress = step / totalSteps
      totalWeight += 0.5 + 1.5 * progress * progress
    }
    let stepsTaken = 0
    let currentIndex = activeIndex

    // Advance in grid order, distributing all remaining delays across two seconds.
    function advance() {
      currentIndex = (currentIndex + 1) % names.length
      stepsTaken += 1
      setActiveIndex(currentIndex)

      if (stepsTaken === totalSteps) {
        setSelectedName(names[winnerIndex])
        setSelectedIndex(winnerIndex)
        setIsRolling(false)
        timeoutRef.current = null
        return
      }

      const progress = stepsTaken / totalSteps
      const delay = 2000 * (0.5 + 1.5 * progress * progress) / totalWeight
      timeoutRef.current = setTimeout(advance, delay)
    }

    advance()
  }

  return (
    <main className="app-shell">
      {/* Brand and file-loading action. */}
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Lucky Draw home">
          <span className="wordmark-star" aria-hidden="true">✳</span>
          <span>LUCKY<span className="wordmark-light">DRAW</span></span>
        </a>
        <button className="load-button" type="button" onClick={() => setShowFileDialog(true)}>
          <span aria-hidden="true">＋</span> Load names
        </button>
      </header>

      {/* Main draw area: controls above the expanded, scrollable name grid. */}
      <section className="stage" id="top">
        <div className="stage-header">
          <div className="stage-copy">
            <p className="eyebrow"><span /> SELECT A NAME</p>
            <h1>Choose a<br /><em>name.</em></h1>
            <p className="stage-description">Scroll and select a name, or pick randomly.</p>
            <div className="entry-summary">
              <span className="entry-icon" aria-hidden="true">♧</span>
              <span><strong>{names.length}</strong> {names.length === 1 ? 'name' : 'names'} in the draw</span>
              {names.length > 0 && <button type="button" onClick={() => setShowFileDialog(true)}>Change list</button>}
            </div>
          </div>

          {/* Random draw control stays above the grid with the draw summary. */}
          <div className="stage-action">
            <button className="spin-button" type="button" onClick={pickRandom} disabled={!names.length || isRolling}>
              <span className="spin-icon" aria-hidden="true">↻</span>
              {isRolling ? 'Picking...' : 'Pick Random'}
              <span className="spin-arrow" aria-hidden="true">→</span>
            </button>
            <span className="action-note" aria-live="polite">
              {isRolling ? 'MOVES THROUGH THE GRID, THEN SLOWS TO A STOP' : 'RANDOMLY SELECT A NAME'}
            </span>
          </div>
        </div>

        <div className={`wheel-scene${isRolling ? ' is-rolling' : ''}`}>
          <div className="wheel-frame">
            <div className="wheel-side left" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span></div>
            <div className="wheel-window" ref={wheelWindowRef} role="region" aria-label="Name selection grid">
              {names.length > 0 ? (
                <div className="wheel-list">
                  {names.map((name, index) => {
                    const isActive = index === activeIndex
                    return (
                      <button
                        className={`wheel-name${isActive ? ' active' : ''}`}
                        key={`${index}-${name}`}
                        data-index={index}
                        type="button"
                        disabled={isRolling}
                        onClick={() => pickName(index)}
                        aria-label={`Pick ${names[index]}`}
                      >
                        <span className="name-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="name-value">{name}</span>
                        {isActive && <span className="name-star" aria-hidden="true">✦</span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <button className="empty-wheel" type="button" onClick={() => setShowFileDialog(true)}>
                  <span className="empty-plus" aria-hidden="true">＋</span>
                  <strong>Your names go here</strong>
                  <span>Load a list to start the draw</span>
                </button>
              )}
            </div>
            <div className="wheel-side right" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span></div>
          </div>
          <div className="wheel-base"><span /><span /><span /><span /><span /></div>
          <div className="wheel-hint">
            {isRolling
              ? 'MOVING LEFT TO RIGHT, TOP TO BOTTOM · SLOWING TO A STOP'
              : names.length
                ? 'BROWSE THE GRID · CLICK A NAME TO SELECT'
                : 'LOAD A LIST TO BEGIN'}
          </div>
        </div>

        {/* Puzzle choices sit directly below the name grid. */}
        <div className="puzzle-actions" aria-label="Puzzle options">
          <button type="button" onClick={() => openPuzzle('easy')}>Show Easy Puzzle</button>
          <button type="button" onClick={() => openPuzzle('notEasy')}>Show Not-Easy Puzzle</button>
        </div>

        {/* Proceeded selections remain visible until removed from the screen. */}
        {screenName && (
          <div className="screen-selection" aria-live="polite">
            <span><span className="selection-label">SELECTED</span><strong>{screenName}</strong></span>
            <button type="button" onClick={() => setScreenName('')}>Remove</button>
          </div>
        )}

        <div className="stage-decoration decor-left" aria-hidden="true">✳</div>
        <div className="stage-decoration decor-right" aria-hidden="true">✴</div>
      </section>

      {/* File selection dialog for importing a plain-text name list. */}
      {showFileDialog && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowFileDialog(false)
        }}>
          <section className="dialog file-dialog" role="dialog" aria-modal="true" aria-labelledby="file-dialog-title">
            <button className="dialog-close" type="button" onClick={() => setShowFileDialog(false)} aria-label="Close">×</button>
            <span className="dialog-kicker">LOAD NAMES</span>
            <h2 id="file-dialog-title">Load your<br /><em>name list.</em></h2>
            <p>Choose a plain text file with one name on each line.</p>
            <label className="file-dropzone">
              <span className="upload-icon" aria-hidden="true">↑</span>
              <strong>Choose a .txt file</strong>
              <span>One name per line · Blank lines are skipped</span>
              <input type="file" accept=".txt,text/plain" onChange={loadNames} />
            </label>
            {names.length > 0 && <div className="loaded-note">Currently loaded: {names.length} {names.length === 1 ? 'name' : 'names'}</div>}
          </section>
        </div>
      )}

      {/* Result dialog: proceed retains the name, remove deletes it, cancel only closes. */}
      {selectedName && (
        <div className="modal-backdrop result-backdrop">
          <section className="dialog result-dialog" role="dialog" aria-modal="true" aria-labelledby="result-title">
            <span className="result-spark" aria-hidden="true">✳</span>
            <span className="dialog-kicker">SELECTED NAME</span>
            <h2 id="result-title">Selected name</h2>
            <div className="winner-name">{selectedName}</div>
            <div className="result-actions">
              <button className="proceed-button" type="button" onClick={proceedWithSelection}>Proceed <span aria-hidden="true">→</span></button>
              <button type="button" onClick={removeSelectedName}>Remove</button>
              <button type="button" onClick={() => { setSelectedName(''); setSelectedIndex(null) }}>Cancel</button>
            </div>
          </section>
        </div>
      )}

      {/* Puzzle modal shows difficulty-specific progress and image clues. */}
      {activePuzzleDifficulty && (() => {
        const difficulty = activePuzzleDifficulty
        const session = puzzleSessions[difficulty]
        const puzzleIndex = session.currentPuzzleIndex
        const puzzle = puzzlesByDifficulty[difficulty][puzzleIndex]
        const progress = session.progressByPuzzle[puzzleIndex] ?? {
          categoryShown: false,
          revealedLetters: [],
        }

        return (
          <div className="modal-backdrop puzzle-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePuzzleDifficulty(null)
          }}>
            <section className="dialog puzzle-dialog" role="dialog" aria-modal="true" aria-labelledby="puzzle-title">
              <button className="dialog-close" type="button" onClick={() => setActivePuzzleDifficulty(null)} aria-label="Close puzzle">×</button>
              <div className="puzzle-heading">
                <span className="dialog-kicker">{difficulty === 'easy' ? 'EASY PUZZLE' : 'NOT-EASY PUZZLE'}</span>
                <span className="puzzle-number">PUZZLE {String(puzzleIndex + 1).padStart(2, '0')} / {String(puzzlesByDifficulty[difficulty].length).padStart(2, '0')}</span>
              </div>
              <h2 id="puzzle-title">What is this <em>word?</em></h2>
              <div className="puzzle-image-frame">
                <img src={puzzle.image} alt={puzzle.imageDescription} />
              </div>
              <div className="puzzle-hints">
                <button
                  type="button"
                  onClick={() => revealPuzzleHint(difficulty, puzzleIndex, (current) => ({ ...current, categoryShown: true }))}
                  disabled={progress.categoryShown}
                >
                  {progress.categoryShown ? 'Category Shown' : 'Show Category'}
                </button>
                <button
                  type="button"
                  onClick={() => revealPuzzleHint(difficulty, puzzleIndex, (current) => ({
                    ...current,
                    revealedLetters: Array.from({ length: puzzle.answer.length }, (_, index) => index),
                  }))}
                  disabled={progress.revealedLetters.length === puzzle.answer.length}
                >
                  {progress.revealedLetters.length === puzzle.answer.length ? 'Answer Revealed' : 'Reveal Answer'}
                </button>
              </div>
              {progress.categoryShown && <p className="puzzle-category">Category: <strong>{puzzle.category}</strong></p>}
              <div className="answer-blocks" aria-label="Answer letters">
                {Array.from(puzzle.answer).map((letter, index) => (
                  <button
                    className="answer-block"
                    key={`${puzzleIndex}-${index}`}
                    type="button"
                    aria-label={progress.revealedLetters.includes(index) ? `Letter ${index + 1}: ${letter}` : `Reveal letter ${index + 1}`}
                    onClick={() => revealPuzzleHint(difficulty, puzzleIndex, (current) => ({
                      ...current,
                      revealedLetters: current.revealedLetters.includes(index)
                        ? current.revealedLetters
                        : [...current.revealedLetters, index],
                    }))}
                  >
                    {progress.revealedLetters.includes(index) ? letter : ''}
                  </button>
                ))}
              </div>
              <div className="puzzle-navigation">
                <button
                  type="button"
                  aria-label="Previous puzzle"
                  onClick={() => movePuzzle(difficulty, -1)}
                  disabled={puzzleIndex === 0}
                >←</button>
                <button
                  type="button"
                  aria-label="Next puzzle"
                  onClick={() => movePuzzle(difficulty, 1)}
                  disabled={puzzleIndex === puzzlesByDifficulty[difficulty].length - 1}
                >→</button>
              </div>
            </section>
          </div>
        )
      })()}
    </main>
  )
}

export default App
