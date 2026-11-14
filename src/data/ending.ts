/**
 * Captain Mallow and the ending (design doc 3.11, content doc → Pirate Captain). The captain
 * writes a letter each time the player wins over a crew (across every run). After the seventh,
 * she joins the court. The fifth prestige plays the ending; the bonus run that follows ends when
 * the court reaches its final rank.
 */

export const CAPTAIN = {
  id: 'char-captain-mallow',
  name: 'Captain Mallow Brambleshanks',
  /** Court points she brings once she joins. */
  courtPoints: 5,
}

export interface CaptainLetter {
  title: string
  lines: string[]
}

/** One letter per crew won over, in order: curious, then doubtful, then hopeful. */
export const CAPTAIN_LETTERS: readonly CaptainLetter[] = [
  {
    title: 'A note pinned with a feather',
    lines: [
      'Ahoy, petal-pusher. Word reaches me that my Drifters have gone soft. Soft! On YOU.',
      'Nobody tames a pirate crew with cake. I should know. I invented cake. (I did not invent cake.)',
      'Who ARE you? — Captain Mallow Brambleshanks',
    ],
  },
  {
    title: 'A note tied to a thorn',
    lines: [
      'Now the Corsairs too. Fine. Thorns are overrated.',
      'They tell me the Forest is waking up. I tell them forests do that, then they fall asleep again.',
      'Everything falls asleep again. — M.B.',
    ],
  },
  {
    title: 'A soggy note in a bottle',
    lines: [
      'The Buccaneers send their love. Ugh. LOVE.',
      'I grew up in a grove, you know. Apple blossom and honeysuckle. It withered when I was small, and it never came back.',
      'So I stopped waiting for things to come back, and I started taking them. — M.',
    ],
  },
  {
    title: 'A sticky note, smelling of honey',
    lines: [
      'You won over the Nabbers. You must have SO much honey cake.',
      'Here is what I know: the land can’t be healed. You can make it pretty for a while. Then it goes grey, and you go grey with it.',
      'Prove me wrong. No, don’t. I don’t want to hope. — M.',
    ],
  },
  {
    title: 'A note that echoes when you unfold it',
    lines: [
      'I went down to the Caves to see for myself. There was light. Real light, in the deep, where there hasn’t been light in a hundred years.',
      'The Smugglers say you brought it. They say you didn’t even ask for anything back.',
      'Why would anyone do that? — M.',
    ],
  },
  {
    title: 'A note written by moonlight',
    lines: [
      'I flew back to my grove tonight. I don’t know why. Habit.',
      'There’s a sprout. One tiny green sprout, right where the old apple tree stood.',
      'I sat with it until morning. Don’t tell the Stormchasers. — Mallow',
    ],
  },
  {
    title: 'Captain Mallow comes in person',
    lines: [
      'She lands at your door in a whirl of feathers, hat first. "So. You won over my Stormchasers."',
      '"I spent years telling everyone the land was finished. Then you came along and kept healing it anyway, one silly flower at a time."',
      '"My grove has three sprouts now. I want to see what grows. Have you got room at this court of yours for one more?"',
      'Captain Mallow Brambleshanks joins your court!',
    ],
  },
]

/** The ending sequence (design doc 3.11 → Ending sequence). */
export const ENDING_SCENES = {
  gather: 'The seven spirits gather at your court.',
  bloom: 'Every region of the land is in full bloom.',
  celebrate: 'Captain Mallow and your helpers dance in the moonlight.',
  thanks: 'The spirits thank you for healing the land.',
  court: 'Your court, finished at last.',
}

/** What each spirit says in thanks. */
export const SPIRIT_THANKS: Readonly<Record<string, string>> = {
  'spirit-sorrel': '"The Meadow breathes easy, little one. Thank you."',
  'spirit-bramblebeard': '"The... roots... sing. Thank... you."',
  'spirit-mirebelle': '"What blooms without being asked? Kindness. Thank you."',
  'spirit-pome': '"Every branch is heavy with blossom. You did that, dear."',
  'spirit-quartz': '"Thank you. ...thank you. ...you."',
  'spirit-selenne': '"Softly, always softly: thank you."',
  'spirit-aeris': '"THANK YOU THANK YOU! Best gardener in the whole wide sky!"',
}
