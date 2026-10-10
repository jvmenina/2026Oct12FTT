import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import puzzleImage from './assets/hero.png'
import './App.css'

type PuzzleDifficulty = 'easy' | 'notEasy'

type Puzzle = {
  category: string
  answer: string
  hint: string
  image: string
  imageDescription?: string
}

type PuzzleProgress = {
  hintShown: boolean
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
      category: 'Popular Phrase, Person or People',
      answer: 'BAD INFLUENCE',
      hint: 'A person who encourages someone to make poor choices.',
      image: puzzleImage,
    },
    {
      category: 'Food',
      answer: 'SCRAMBLED EGGS',
      hint: 'A breakfast dish made by stirring eggs as they cook.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase, Country',
      answer: 'MADE IN CHINA',
      hint: 'A label often found on products imported from overseas.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase',
      answer: 'READ BETWEEN THE LINES',
      hint: 'Look for a meaning that is implied rather than stated.',
      image: puzzleImage,
    },
    {
      category: 'Food',
      answer: 'Trail Mix',
      hint: 'A portable snack often made with nuts and dried fruit.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase',
      answer: 'REPEAT AFTER ME',
      hint: 'Say the same words immediately after someone else.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase, Science, Tool',
      answer: 'MICROSCOPE',
      hint: 'A tool that makes very small things easier to see.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase, Verb',
      answer: 'Update',
      hint: 'Bring something up to date with the latest information.',
      image: puzzleImage,
    },
    {
      category: 'Nature, Tree',
      answer: 'Oak',
      hint: 'A sturdy tree that produces acorns.',
      image: puzzleImage,
    },
    {
      category: 'Noun, Workplaces',
      answer: 'Safety',
      hint: 'The condition of being protected from danger at work.',
      image: puzzleImage,
    },
    {
      category: 'Countries',
      answer: 'Britain',
      hint: 'An island nation that includes England, Scotland, and Wales.',
      image: puzzleImage,
    },
    {
      category: 'Music, Social State, Wellness',
      answer: 'Harmony',
      hint: 'A pleasing combination of musical notes or people working well together.',
      image: puzzleImage,
    },
    {
      category: 'Music, History, Education',
      answer: 'Classical',
      hint: 'A long-established style of orchestral music.',
      image: puzzleImage,
    },
    {
      category: 'Color',
      answer: 'Pink',
      hint: 'A light tint commonly associated with roses and flamingos.',
      image: puzzleImage,
    },
    {
      category: 'Place, Activity',
      answer: 'Pool',
      hint: 'A place to swim, or a game played with cues and balls.',
      image: puzzleImage,
    },
  ],
  notEasy: [
    {
      category: 'Religion, Spirituality, Mantra',
      answer: 'Om',
      hint: 'A sacred sound often chanted during meditation.',
      image: puzzleImage,
    },
    {
      category: 'Activity',
      answer: 'Hobby',
      hint: 'A pastime someone enjoys in their free time.',
      image: puzzleImage,
    },
    {
      category: 'Adjective',
      answer: 'Jagged',
      hint: 'Having rough, sharp, uneven edges.',
      image: puzzleImage,
    },
    {
      category: 'Place, Activity',
      answer: 'Bank',
      hint: 'A place to deposit money, or the land beside a river.',
      image: puzzleImage,
    },
    {
      category: 'Person or People, Math, Activity',
      answer: 'Figure',
      hint: 'A person, a numerical result, or the act of working something out.',
      image: puzzleImage,
    },
    {
      category: 'Activity, Workplaces, Medicine',
      answer: 'Apply',
      hint: 'Put something to use, or formally request a job.',
      image: puzzleImage,
    },
    {
      category: 'Food',
      answer: 'Fillet',
      hint: 'A boneless cut of meat or fish.',
      image: puzzleImage,
    },
    {
      category: 'Activity',
      answer: 'Move',
      hint: 'Change position or location.',
      image: puzzleImage,
    },
    {
      category: 'Noun, Signages',
      answer: 'Neon Lights',
      hint: 'Bright glowing signs often seen outside shops.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase, Food',
      answer: 'Balanced Diet',
      hint: 'A way of eating that includes a healthy range of foods.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase, Activity',
      answer: 'Free For All',
      hint: 'A chaotic contest with few rules or restrictions.',
      image: puzzleImage,
    },
    {
      category: 'Science, Medicine',
      answer: 'Forensics',
      hint: 'Scientific methods used to investigate crimes.',
      image: puzzleImage,
    },
    {
      category: 'Nature',
      answer: 'Summer',
      hint: 'The warmest season of the year in many regions.',
      image: puzzleImage,
    },
    {
      category: 'VERY Popular Phrase',
      answer: 'Excuse Me',
      hint: 'A polite phrase used to get attention or apologize.',
      image: puzzleImage,
    },
    {
      category: 'Popular Phrase',
      answer: 'For Once in my Life',
      hint: 'A phrase about something happening at least one time.',
      image: puzzleImage,
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
        hintShown: false,
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
          <span>PIC<span className="wordmark-light">SOLVE</span></span>
        </a>
        <button className="load-button" type="button" onClick={() => setShowFileDialog(true)}>
          <span aria-hidden="true">＋</span> Load names
        </button>
      </header>

      {/* Main draw area: controls above the expanded, scrollable name grid. */}
      <section className="stage" id="top">
        <div className="stage-header">
          <div className="stage-copy">
            <p className="eyebrow"><span /> OCTOBER 2026 FTT</p>
            <h1>Pic<em>Solve</em></h1>
            {/* <p className="stage-description">Scroll and select a name, or pick randomly.</p> */}
            <div className="entry-summary">
              <span className="entry-icon" aria-hidden="true">☆</span>
              <span><strong>{names.length}</strong> {names.length === 1 ? 'name' : 'names'} in the draw</span>
              {/* {names.length > 0 && <button type="button" onClick={() => setShowFileDialog(true)}>Change list</button>} */}
            </div>
          </div>

          {/* Random draw control stays above the grid with the draw summary. */}
          <div className="stage-action">
            <button className="spin-button" type="button" onClick={pickRandom} disabled={!names.length || isRolling || screenName.length != 0}>
              <span className="spin-icon" aria-hidden="true">↻</span>
              {isRolling ? 'Picking...' : 'Pick Random'}
              <span className="spin-arrow" aria-hidden="true">→</span>
            </button>
            {/* <span className="action-note" aria-live="polite">
              {isRolling ? 'MOVES THROUGH THE GRID, THEN SLOWS TO A STOP' : 'RANDOMLY SELECT A NAME'}
            </span> */}
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
              ? 'PICKING NEXT PLAYER...'
              : names.length
                ? 'READY TO PICK A PLAYER'
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
            <span><span className="selection-label">CURRENT PLAYER</span><strong>{screenName}</strong></span>
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
            {/* <span className="dialog-kicker">SELECTED NAME</span> */}
            {/* <h2 id="result-title">Selected name</h2> */}
            <div className="winner-name">{selectedName}</div>
            <div className="result-actions">
              <button className="proceed-button" type="button" disabled={screenName.length != 0} onClick={proceedWithSelection}>Proceed <span aria-hidden="true">→</span></button>
              <button type="button" onClick={removeSelectedName}>Remove</button>
              <button type="button" onClick={() => { setSelectedName(''); setSelectedIndex(null) }}>Cancel</button>
            </div>
          </section>
        </div>
      )}

      {/* Difficulty-specific puzzle modal keeps hint and answer progress when reopened. */}
      {activePuzzleDifficulty && (() => {
        const difficulty = activePuzzleDifficulty
        const session = puzzleSessions[difficulty]
        const puzzleIndex = session.currentPuzzleIndex
        const puzzle = puzzlesByDifficulty[difficulty][puzzleIndex]
        const progress = session.progressByPuzzle[puzzleIndex] ?? {
          hintShown: false,
          categoryShown: false,
          revealedLetters: [],
        }
        const answerWords = puzzle.answer.toUpperCase().split(' ')
        let answerIndex = 0

        return (
          <div className="modal-backdrop puzzle-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActivePuzzleDifficulty(null)
          }}>
            <section className="dialog puzzle-dialog" role="dialog" aria-modal="true" aria-labelledby="puzzle-title">
              <button className="dialog-close" type="button" onClick={() => setActivePuzzleDifficulty(null)} aria-label="Close puzzle">×</button>
              {/* Puzzle identity stays fixed while the clue and answer area scrolls. */}
              <div className="puzzle-heading">
                <span className="dialog-kicker">{difficulty === 'easy' ? 'EASY PUZZLE' : 'NOT-EASY PUZZLE'}</span>
                <span className="puzzle-number">PUZZLE {String(puzzleIndex + 1).padStart(2, '0')} / {String(puzzlesByDifficulty[difficulty].length).padStart(2, '0')}</span>
                <h2 id="puzzle-title">What is this <em>word?</em></h2>
              </div>
              {/* Image, word-grouped letter tiles, and hints share the scrollable area. */}
              <div className="puzzle-content">
                <div className="puzzle-image-frame">
                  <img src={puzzle.image} alt={puzzle.imageDescription ?? 'Puzzle'} />
                </div>
                <div className="answer-blocks" aria-label="Answer letters">
                  {answerWords.map((word, wordIndex) => {
                    const firstLetterIndex = answerIndex
                    answerIndex += word.length + 1

                    return (
                      <div className="answer-word" key={`${puzzleIndex}-${wordIndex}`}>
                        {Array.from(word).map((letter, letterOffset) => {
                          const index = firstLetterIndex + letterOffset
                          const isRevealed = progress.revealedLetters.includes(index)

                          return (
                            <button
                              className="answer-block"
                              key={`${puzzleIndex}-${index}`}
                              type="button"
                              aria-label={isRevealed ? `Letter ${index + 1}: ${letter}` : `Reveal letter ${index + 1}`}
                              onClick={() => revealPuzzleHint(difficulty, puzzleIndex, (current) => ({
                                ...current,
                                revealedLetters: current.revealedLetters.includes(index)
                                  ? current.revealedLetters
                                  : [...current.revealedLetters, index],
                              }))}
                            >
                              {isRevealed ? letter : ''}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                {/* Custom and category clues appear together in a compact two-column display. */}
                {(progress.hintShown || progress.categoryShown) && (
                  <div className="puzzle-hint-display" aria-live="polite">
                    {progress.hintShown && <p><span>HINT</span>{puzzle.hint}</p>}
                    {progress.categoryShown && <p><span>CATEGORY</span>{puzzle.category}</p>}
                  </div>
                )}
              </div>
              {/* Navigation and hint actions stay visible below the scrollable puzzle content. */}
              <div className="puzzle-navigation">
                <button
                  type="button"
                  aria-label="Previous puzzle"
                  onClick={() => movePuzzle(difficulty, -1)}
                  disabled={puzzleIndex === 0}
                >←</button>
                <div className="puzzle-hints">
                  <button
                    type="button"
                    onClick={() => revealPuzzleHint(difficulty, puzzleIndex, (current) => ({ ...current, hintShown: true }))}
                    disabled={progress.hintShown}
                  >
                    {progress.hintShown ? 'Hint Shown' : 'Show Hint'}
                  </button>
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
