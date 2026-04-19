export interface Chapter {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverColor: string;
  accentColor: string;
  category: string;
  chapters: Chapter[];
}

export const BOOKS: Book[] = [
  {
    id: "light-between-hours",
    title: "The Light Between Hours",
    author: "Eleanor Voss",
    category: "literature",
    description:
      "A meditation on memory, solitude, and the quiet textures of everyday life. Each chapter explores a different hour of the day and the emotional landscape it carries.",
    coverColor: "#4a3728",
    accentColor: "#d4a96a",
    chapters: [
      {
        id: "dawn",
        title: "I. Dawn",
        paragraphs: [
          `In the quiet hours before dawn, the world seems to hold its breath. There is something profoundly melancholy about the ephemeral nature of light, as it shifts from the luminous gold of afternoon to the tranquil blue of dusk. We chase these moments with a kind of wanderlust that no map can satisfy — a longing not for places, but for states of being.`,
          `Resilience, philosophers have long argued, is not the absence of sorrow but the intricate dance between falling and rising. The solitude of a long walk, the serendipity of a chance encounter — these are the textures that give a life its depth. To live fully is to remain open to the profound strangeness of ordinary moments.`,
          `The city at night is a different creature entirely. Neon signs bleed color onto wet pavement, and strangers pass like ships navigating a luminous sea. There is an ephemeral beauty to these encounters — a smile exchanged, a door held open — small acts that dissolve into the tranquil dark as quickly as they appear.`,
          `What we call memory is really a kind of wanderlust through time. We return again and again to certain rooms, certain afternoons, certain faces — not because they were perfect, but because they were ours. Resilience is built in these returns: the intricate work of making meaning from the raw material of experience.`,
        ],
      },
      {
        id: "noon",
        title: "II. Noon",
        paragraphs: [
          `Noon arrives without ceremony. The sun is at its zenith and shadows retreat to their smallest selves, huddled beneath trees and awnings. There is a peculiar solitude to the midday hour — the streets emptied of their morning urgency, the cafés half-drowsing in the heat.`,
          `It is in stillness that we discover the amplitude of our own interior. When the ambient noise of obligation fades, we are left with the unvarnished reality of what we think, what we fear, what we quietly long for. The contemplative life is not a retreat from the world but a different mode of inhabiting it.`,
          `Philosophers have spoken of the examined life as the only one worth living. Perhaps this is most legible at noon — when the harsh, clarifying light strips away the pleasant ambiguities of morning and the forgiving shadows of evening. We see ourselves as we are, not as we wish to be.`,
          `And yet there is tenderness even here. A grandmother moves slowly through a market, selecting tomatoes with the gravity of a judge. A child traces patterns in spilled water on the pavement. Small dignities, unremarked and unremarkable, accumulating into a life.`,
        ],
      },
      {
        id: "dusk",
        title: "III. Dusk",
        paragraphs: [
          `Dusk is the hour of transitions, when the architecture of the day begins its slow dissolution. Colors deepen and blur; the precise edges of things soften. It is the threshold hour, neither fully one thing nor another — and perhaps this is why so many of us find in it an uncanny resonance with our own perpetual in-between states.`,
          `The word liminal comes from the Latin for threshold. We speak of liminal spaces — waiting rooms, stairwells, the moment before sleep — as if space itself can occupy the condition of not-yet and no-longer. Dusk is liminal time: the present tense stretched thin between what was and what will be.`,
          `A restlessness visits me at this hour. Not the anxious restlessness of the unfinished task, but something older, harder to name — a nostalgia that precedes its own object, a longing for something I cannot identify and therefore cannot pursue. The psychologists call it sehnsucht: a yearning for something larger and more complete than any earthly experience can provide.`,
          `But there is also comfort in the fading light. The day has been what it has been, with its small victories and its avoidances. Now it softens into memory, where it will become more shapely and bearable, as all things do with time. Tomorrow the sun will rise again into its impartial light. Tonight, the stars.`,
        ],
      },
    ],
  },
  {
    id: "deep-work-vocabulary",
    title: "The Articulate Mind",
    author: "James Hartwell",
    category: "vocabulary",
    description:
      "An exploration of the relationship between language and thought. Hartwell argues that expanding your vocabulary isn't merely about sounding intelligent — it reshapes the very structure of how you perceive the world.",
    coverColor: "#1e3a5f",
    accentColor: "#7eb8d4",
    chapters: [
      {
        id: "precision",
        title: "I. The Virtue of Precision",
        paragraphs: [
          `Language is not merely a vehicle for thought; it is the very medium in which thought occurs. When we lack the precise word for a concept, we do not simply fail to express it — we fail to think it with any rigor. The impoverished vocabulary produces the impoverished mind, not through any fault of native intelligence, but through a paucity of cognitive tools.`,
          `Consider the word sonder: the realization that each passerby has a life as vivid and complex as your own. Before you encountered this word, you may have felt the sensation — but without the linguistic handle, you could not grasp it, examine it, or share it with fidelity. Words are the handholds of consciousness.`,
          `The philosopher Wittgenstein famously remarked that the limits of my language are the limits of my world. This is not mysticism but neuroscience avant la lettre. Contemporary research confirms that lexical retrieval — our ability to summon the right word — is inseparable from the conceptual representation it encodes. To know the word is, in a meaningful sense, to own the concept.`,
          `The practical implications are significant. Reading voraciously in a range of domains — not merely for information but with attention to diction — rewires the mind's associative architecture. Each new word is a new node in a semantic network, increasing not only the system's vocabulary but its capacity for analogical reasoning, metaphor, and nuanced judgment.`,
        ],
      },
      {
        id: "ambiguity",
        title: "II. In Praise of Ambiguity",
        paragraphs: [
          `If precision is the first virtue of language, ambiguity is its necessary shadow. The richest words are not the most unequivocal but the most resonant — words that hold multiple meanings in productive tension. The poet chooses words precisely because they mean more than one thing at once; the legal drafter chooses words precisely because they should mean only one.`,
          `Consider the English word cleave, which means both to split apart and to cling together. Its self-contradictory nature — what linguists call an auto-antonym — is not a deficiency but a kind of philosophical condensation. That the same root can express both severance and attachment speaks to something deep about the nature of intimacy.`,
          `Ambiguity, handled well, is not vagueness but multiplicity. The great essayists — Montaigne, Woolf, Baldwin — were masters of sentences that meant exactly what they said and also something more, a surplus of significance that the reader carries away and deposits elsewhere in their experience. This is the ecology of literature: meaning distributed across time and minds.`,
          `We should be suspicious, then, of any discourse that promises total transparency. Politics, advertising, and certain strains of self-help literature all traffic in the illusion of unambiguous meaning — words stripped of their resonance and deployed like tools. Against this flattening, the cultivation of a capacious, nuanced vocabulary is itself a form of resistance.`,
        ],
      },
    ],
  },
  {
    id: "geography-of-solitude",
    title: "A Geography of Solitude",
    author: "Maren Albrecht",
    category: "travel",
    description:
      "Albrecht travels to some of the most remote places on earth — a lighthouse off the Norwegian coast, a monastery in the Himalayas, an Antarctic research station — and returns with dispatches on what isolation reveals about human nature.",
    coverColor: "#2d4a3e",
    accentColor: "#8bc4a8",
    chapters: [
      {
        id: "lighthouse",
        title: "I. The Lighthouse at Utsira",
        paragraphs: [
          `The island of Utsira lies twelve nautical miles off the coast of Haugesund, in the North Sea. It is four kilometers long and two kilometers wide. Its permanent population numbers two hundred and eight souls. I arrived on a Tuesday in February, when the wind was strong enough to make standing upright a deliberate act of will.`,
          `The lighthouse keeper — a taciturn man named Knut who had held the position for nineteen years — showed me to a room with a single window facing west. Beyond the glass: ocean, uninterrupted, to the horizon and beyond. I stood there for a long time, feeling the particular vertigo of confronting genuine vastness. We are not built for the infinite; our minds require edges, frames, limits. The open sea offers none.`,
          `Over the following week, I came to understand solitude not as the absence of others but as a distinct presence — a quality of attention that becomes available when the social performance of selfhood is suspended. Without an audience, I ceased to narrate my experience as it happened. I simply had it. This sounds trivial; it is not.`,
          `Knut, when I asked him why he had stayed so long, was quiet for a moment. Then he said: "On the mainland, I am always arriving somewhere or leaving somewhere. Here, I am simply here." I wrote this down and have been unpacking it ever since. There is a philosophy buried in it — something about the difference between movement and presence, between becoming and being.`,
        ],
      },
      {
        id: "monastery",
        title: "II. Forty Days at Spiti",
        paragraphs: [
          `The monastery at Tabo sits at 3,280 meters in the Spiti Valley of Himachal Pradesh, and has been continuously inhabited since 996 CE. The monks wake at four in the morning to pray. By the time the sun clears the surrounding peaks, they have already completed two hours of devotion. I found this schedule, after the first week's disorientation, profoundly organizing.`,
          `Time at altitude is different. Partly this is physiological — the thin air slows everything, imposes a kind of enforced deliberateness on movement and thought. But it is also something subtler: the absence of the temporal markers that ordinarily structure urban life. No commute, no meeting, no appointment except prayer and meals. The day opens like a field.`,
          `I had expected to find the monks austere, or otherworldly, or in some way visibly transformed by their practice. Instead I found people — some serene, some irritable, some funny, all recognizably human. The youngest novice, perhaps fourteen years old, was addicted to chess and beat me seventeen times in succession without apparent effort or mercy.`,
          `What the monastery offered, I came to think, was not escape from the human condition but a different relationship to it. The structured day, the communal silence, the removal of consumer choice — these created conditions in which certain questions became harder to avoid. Who am I when no one is watching? What do I actually want? The answers, when they came, were quieter and stranger than I had anticipated.`,
        ],
      },
    ],
  },
];

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}

export function getChapter(
  bookId: string,
  chapterId: string
): { book: Book; chapter: Chapter; index: number } | undefined {
  const book = getBook(bookId);
  if (!book) return undefined;
  const index = book.chapters.findIndex((c) => c.id === chapterId);
  if (index === -1) return undefined;
  return { book, chapter: book.chapters[index], index };
}
