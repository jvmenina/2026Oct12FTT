import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
// import puzzleImage from './assets/hero.png'
import './App.css'

const rpBadInfluence = '/rp_badinfluence.jpg'
const rpBalancedDiet = '/rp_balanceddiet.jpg'
const rpExcuseMe = '/rp_excuseme.jpg'
const rpForensics = '/rp_forensics.jpg'
const rpForOnceInMyLife = '/rp_foronceinmylife.jpg'
const rpFreeForAll = '/rp_freeforall.jpg'
const rpMadeInChina = '/rp_madeinchina.jpg'
const rpMicroscope = '/rp_microscope.jpg'
const rpNeonLights = '/rp_neonlights.jpg'
const rpReadBetween = '/rp_readbetween.jpg'
const rpRepeatAfterMe = '/rp_repeatafterme.jpg'
const rpScrambled = '/rp_scrambled.jpg'
const rpSummer = '/rp_summer.jpg'
const rpTrailMix = '/rp_trailmix.jpg'
const rpUpdate = '/rp_update.jpg'

const fp1wApply = '/4p1w_apply.jpg'
const fp1wBank = '/4p1w_bank.jpg'
const fp1wBritain = '/4p1w_britain.jpg'
const fp1wClassical = '/4p1w_classical.jpg'
const fp1wFigure = '/4p1w_figure.jpg'
const fp1wFillet = '/4p1w_fillet.jpg'
const fp1wHarmony = '/4p1w_harmony.jpg'
const fp1wHobby = '/4p1w_hobby.jpg'
const fp1wJagged = '/4p1w_jagged.jpg'
const fp1wMove = '/4p1w_move.jpg'
const fp1wOak = '/4p1w_oak.jpg'
const fp1wOm = '/4p1w_om.jpg'
const fp1wPink = '/4p1w_pink.jpg'
const fp1wPool = '/4p1w_pool.jpg'
const fp1wSafety = '/4p1w_safety.jpg'

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

type MechanicsSlide = {
  title: string
  content: ReactNode
}

// Add or edit JSX slides here to update the mechanics instructions.
const mechanicsSlides: MechanicsSlide[] = [
  {
    title: 'Good afternoon, everyone!',
    content: <>
      <div>
        <div className='mechanics-game-title'>
          <p>Welcome to...</p>
          <h1>Pic<em>Solve</em></h1>
        </div>
      </div>
    </>
  },
  {
    title: 'Game Mechanics I',
    content: <><ol>
        <li>A player is <strong>randomly chosen</strong>. They will answer an <strong>EASY</strong> puzzle.</li>
        <li>After they answer, they choose the next playe. They will answer a <strong>NOT-EASY</strong> puzzle.</li>
        <li>Previous player can help in answering the NOT-EASY puzzle, but only using hints.</li>
        <li>After solving, another player is <strong>randomly chosen</strong> for an <strong>EASY</strong> puzzle.</li>
        <li>Loop until done :&#x29;</li>
      </ol></>,
  },
  {
    title: 'Game Mechanics II',
    content: <><ol>
        <li>Three hints per puzzle: <strong>Category Hint</strong>, <strong>Hint-Hint</strong>, and <strong>Letter Hint</strong>.</li>
        <li><strong>Category</strong> and the <strong>First Letter</strong> will be given after <strong>45 seconds</strong>.</li>
        <li>Answering is limited to <strong>1 minute</strong>.</li>
      </ol></>,
  },
  {
    title: 'Puzzle: 4-Pics-1-Word I',
    content: <>
        <div className='sample'>
          <img src='sample_4p1w_1.jpg' alt='Spectrum Puzzle' />
          <div className='sample-answer'>
            <p>ANSWER</p>
            <strong>Spectrum</strong>
          </div>
        </div>
      </>,
  },
  {
    title: 'Puzzle: 4-Pics-1-Word II',
    content: <>
        <div className='sample'>
          <img src='sample_4p1w_2.jpg' alt='Ear Puzzle' />
          <div className='sample-answer'>
            <p>ANSWER</p>
            <strong>Ear</strong>
          </div>
        </div>
      </>,
  },
  {
    title: 'Puzzle: Rebus Puzzle I',
    content: <>
        <div className='sample'>
          <img src='sample_rp_1.jpg' alt='Crossbow Puzzle' />
          <div className='sample-answer'>
            <p>ANSWER</p>
            <strong>Crossbow</strong>
          </div>
        </div>
      </>,
  },
  {
    title: 'Puzzle: Rebus Puzzle II',
    content: <>
        <div className='sample'>
          <img src='sample_rp_2.jpg' alt='Multiple Choice Puzzle' />
          <div className='sample-answer'>
            <p>ANSWER</p>
            <strong>Multiple Choice/s</strong>
          </div>
        </div>
      </>,
  },
]

// Add puzzle entries here to expand either difficulty's puzzle collection.
const puzzlesByDifficulty: Record<PuzzleDifficulty, Puzzle[]> = {
  easy: [
    {
      category: 'Popular Phrase, Person or People',
      answer: 'BAD INFLUENCE',
      hint: 'A person who encourages someone to make poor choices.',
      image: rpBadInfluence,
    },
    {
      category: 'Food',
      answer: 'SCRAMBLED EGGS',
      hint: 'A breakfast dish made by stirring eggs as they cook.',
      image: rpScrambled,
    },
    {
      category: 'Popular Phrase, Country',
      answer: 'MADE IN CHINA',
      hint: 'A label often found on products imported from overseas.',
      image: rpMadeInChina,
    },
    {
      category: 'Popular Phrase',
      answer: 'READ BETWEEN THE LINES',
      hint: 'Look for a meaning that is implied rather than stated.',
      image: rpReadBetween,
    },
    {
      category: 'Food',
      answer: 'Trail Mix',
      hint: 'A portable snack often made with nuts and dried fruit.',
      image: rpTrailMix,
    },
    {
      category: 'Popular Phrase',
      answer: 'REPEAT AFTER ME',
      hint: 'Say the same words immediately after someone else.',
      image: rpRepeatAfterMe,
    },
    {
      category: 'Popular Phrase, Science, Tool',
      answer: 'MICROSCOPE',
      hint: 'A tool that makes very small things easier to see.',
      image: rpMicroscope,
    },
    {
      category: 'Popular Phrase, Verb',
      answer: 'Update',
      hint: 'Bring something up to date with the latest information.',
      image: rpUpdate,
    },
    {
      category: 'Nature, Tree',
      answer: 'Oak',
      hint: 'A sturdy tree that produces acorns.',
      image: fp1wOak,
    },
    {
      category: 'Noun, Workplaces',
      answer: 'Safety',
      hint: 'The condition of being protected from danger at work.',
      image: fp1wSafety,
    },
    {
      category: 'Countries',
      answer: 'Britain',
      hint: 'An island nation that includes England, Scotland, and Wales.',
      image: fp1wBritain,
    },
    {
      category: 'Music, Social State, Wellness',
      answer: 'Harmony',
      hint: 'A pleasing combination of musical notes or people working well together.',
      image: fp1wHarmony,
    },
    {
      category: 'Music, History, Education',
      answer: 'Classical',
      hint: 'A long-established style of orchestral music.',
      image: fp1wClassical,
    },
    {
      category: 'Color',
      answer: 'Pink',
      hint: 'A light tint commonly associated with roses and flamingos.',
      image: fp1wPink,
    },
    {
      category: 'Place, Activity',
      answer: 'Pool',
      hint: 'A place to swim, or a game played with cues and balls.',
      image: fp1wPool,
    },
  ],
  notEasy: [
    {
      category: 'Religion, Spirituality, Mantra',
      answer: 'Om',
      hint: 'A sacred sound often chanted during meditation.',
      image: fp1wOm,
    },
    {
      category: 'Activity',
      answer: 'Hobby',
      hint: 'A pastime someone enjoys in their free time.',
      image: fp1wHobby,
    },
    {
      category: 'Adjective',
      answer: 'Jagged',
      hint: 'Having rough, sharp, uneven edges.',
      image: fp1wJagged,
    },
    {
      category: 'Place, Activity',
      answer: 'Bank',
      hint: 'A place to deposit money, or the land beside a river.',
      image: fp1wBank,
    },
    {
      category: 'Person or People, Math, Activity',
      answer: 'Figure',
      hint: 'A person, a numerical result, or the act of working something out.',
      image: fp1wFigure,
    },
    {
      category: 'Activity, Workplaces, Medicine',
      answer: 'Apply',
      hint: 'Put something to use, or formally request a job.',
      image: fp1wApply,
    },
    {
      category: 'Food',
      answer: 'Fillet',
      hint: 'A boneless cut of meat or fish.',
      image: fp1wFillet,
    },
    {
      category: 'Activity',
      answer: 'Move',
      hint: 'Change position or location.',
      image: fp1wMove,
    },
    {
      category: 'Noun, Signages',
      answer: 'Neon Lights',
      hint: 'Bright glowing signs often seen outside shops.',
      image: rpNeonLights,
    },
    {
      category: 'Popular Phrase, Food',
      answer: 'Balanced Diet',
      hint: 'A way of eating that includes a healthy range of foods.',
      image: rpBalancedDiet,
    },
    {
      category: 'Popular Phrase, Activity',
      answer: 'Free For All',
      hint: 'A chaotic contest with few rules or restrictions.',
      image: rpFreeForAll,
    },
    {
      category: 'Science, Medicine',
      answer: 'Forensics',
      hint: 'Scientific methods used to investigate crimes.',
      image: rpForensics,
    },
    {
      category: 'Nature',
      answer: 'Summer',
      hint: 'The warmest season of the year in many regions.',
      image: rpSummer,
    },
    {
      category: 'VERY Popular Phrase',
      answer: 'Excuse Me',
      hint: 'A polite phrase used to get attention or apologize.',
      image: rpExcuseMe,
    },
    {
      category: 'Popular Phrase',
      answer: 'For Once in my Life',
      hint: 'A phrase about something happening at least one time.',
      image: rpForOnceInMyLife,
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
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [showMechanicsDialog, setShowMechanicsDialog] = useState(true)
  const [mechanicsSlideIndex, setMechanicsSlideIndex] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [activePuzzleDifficulty, setActivePuzzleDifficulty] = useState<PuzzleDifficulty | null>(null)
  const [puzzleSessions, setPuzzleSessions] = useState<Record<PuzzleDifficulty, PuzzleSession>>({
    easy: { currentPuzzleIndex: 0, progressByPuzzle: {} },
    notEasy: { currentPuzzleIndex: 0, progressByPuzzle: {} },
  })
  const wheelWindowRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Move to an available mechanics slide.
  const moveMechanicsSlide = useCallback((direction: -1 | 1) => {
    setMechanicsSlideIndex((index) => Math.max(0, Math.min(mechanicsSlides.length - 1, index + direction)))
  }, [])

  // Move between puzzles while keeping each puzzle's revealed hints.
  const movePuzzle = useCallback((difficulty: PuzzleDifficulty, direction: -1 | 1) => {
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
  }, [])

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

  // Let arrow keys use the same navigation as the open mechanics or puzzle modal.
  useEffect(() => {
    function handleModalNavigation(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))) return

      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
      if (direction === 0) return

      if (activePuzzleDifficulty) {
        event.preventDefault()
        movePuzzle(activePuzzleDifficulty, direction)
      } else if (showMechanicsDialog) {
        event.preventDefault()
        moveMechanicsSlide(direction)
      }
    }

    window.addEventListener('keydown', handleModalNavigation)
    return () => window.removeEventListener('keydown', handleModalNavigation)
  }, [activePuzzleDifficulty, moveMechanicsSlide, movePuzzle, showMechanicsDialog])

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

  // Close the mechanics guide without resetting its current slide.
  function closeMechanicsDialog() {
    setShowMechanicsDialog(false)
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
      {/* Brand, mechanics guide, and file-loading actions. */}
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Lucky Draw home">
          <span className="wordmark-star" aria-hidden="true">✳</span>
          <span>PIC<span className="wordmark-light">SOLVE</span></span>
        </a>
        <div className="topbar-actions">
          <button className="guide-button" type="button" onClick={() => setShowMechanicsDialog(true)}>Mechanics</button>
          <button className="load-button" type="button" onClick={() => setShowFileDialog(true)}>
            <span aria-hidden="true">＋</span> Load names
          </button>
        </div>
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

      {/* Slide-based mechanics guide opens on startup and can be revisited from the header. */}
      {showMechanicsDialog && (
        <div className="modal-backdrop mechanics-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMechanicsDialog()
        }}>
          <section className="dialog mechanics-dialog" role="dialog" aria-modal="true" aria-labelledby="mechanics-title">
            <button className="dialog-close" type="button" onClick={closeMechanicsDialog} aria-label="Close mechanics">×</button>
            <div className="mechanics-heading">
              <span className="dialog-kicker">HOW TO PLAY</span>
              <span className="mechanics-number">SLIDE {String(mechanicsSlideIndex + 1).padStart(2, '0')} / {String(mechanicsSlides.length).padStart(2, '0')}</span>
              <h2 id="mechanics-title">{mechanicsSlides[mechanicsSlideIndex].title}</h2>
            </div>
            <div className="mechanics-details" aria-live="polite">
              {mechanicsSlides[mechanicsSlideIndex].content}
            </div>
            <div className="mechanics-navigation">
              <button type="button" aria-label="Previous instruction" onClick={() => moveMechanicsSlide(-1)} disabled={mechanicsSlideIndex === 0}>←</button>
              <div className="mechanics-dots" aria-label={`Slide ${mechanicsSlideIndex + 1} of ${mechanicsSlides.length}`}>
                {mechanicsSlides.map((slide, index) => (
                  <span className={index === mechanicsSlideIndex ? 'active' : ''} key={slide.title} />
                ))}
              </div>
              {mechanicsSlideIndex === mechanicsSlides.length - 1 ? (
                <button className="mechanics-start" type="button" onClick={closeMechanicsDialog}>Start game <span aria-hidden="true">→</span></button>
              ) : (
                <button type="button" aria-label="Next instruction" onClick={() => moveMechanicsSlide(1)}>→</button>
              )}
            </div>
          </section>
        </div>
      )}

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
                <h2 id="puzzle-title">What is <em>this?</em></h2>
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
