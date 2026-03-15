// ============================================================================
// scripture.js — Scripture database for faith-based games
// ============================================================================

/**
 * @typedef {Object} Scripture
 * @property {number}  id        - Unique identifier
 * @property {string}  reference - Book chapter:verse (e.g. "John 3:16")
 * @property {string}  text      - The scripture text (KJV)
 * @property {string}  category  - One of the CATEGORIES values
 */

/**
 * A simple in-memory scripture database.
 *
 * Usage:
 * ```js
 * import { ScriptureDB } from '@faith-games/shared';
 * const verse = ScriptureDB.getRandom();
 * console.log(verse.reference, verse.text);
 * ```
 */
export class ScriptureDB {
  // ---------------------------------------------------------------------------
  // Static scripture data (KJV)
  // ---------------------------------------------------------------------------

  /** @type {Scripture[]} */
  static scriptures = [
    // -- Armor of God (Ephesians 6) ------------------------------------------
    {
      id: 1,
      reference: 'Ephesians 6:10',
      text: 'Finally, my brethren, be strong in the Lord, and in the power of his might.',
      category: 'armor',
    },
    {
      id: 2,
      reference: 'Ephesians 6:11',
      text: 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.',
      category: 'armor',
    },
    {
      id: 3,
      reference: 'Ephesians 6:14',
      text: 'Stand therefore, having your loins girt about with truth, and having on the breastplate of righteousness.',
      category: 'armor',
    },
    {
      id: 4,
      reference: 'Ephesians 6:15',
      text: 'And your feet shod with the preparation of the gospel of peace.',
      category: 'armor',
    },
    {
      id: 5,
      reference: 'Ephesians 6:16',
      text: 'Above all, taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked.',
      category: 'armor',
    },
    {
      id: 6,
      reference: 'Ephesians 6:17',
      text: 'And take the helmet of salvation, and the sword of the Spirit, which is the word of God.',
      category: 'armor',
    },

    // -- Parables -------------------------------------------------------------
    {
      id: 7,
      reference: 'Matthew 13:3-8',
      text: 'Behold, a sower went forth to sow; And when he sowed, some seeds fell by the way side, and the fowls came and devoured them up. But other fell into good ground, and brought forth fruit, some an hundredfold, some sixtyfold, some thirtyfold.',
      category: 'parable',
    },
    {
      id: 8,
      reference: 'Luke 15:11-13',
      text: 'A certain man had two sons: And the younger of them said to his father, Father, give me the portion of goods that falleth to me. And he divided unto them his living. And not many days after the younger son gathered all together, and took his journey into a far country, and there wasted his substance with riotous living.',
      category: 'parable',
    },
    {
      id: 9,
      reference: 'Luke 15:20-24',
      text: 'And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him. For this my son was dead, and is alive again; he was lost, and is found.',
      category: 'parable',
    },
    {
      id: 10,
      reference: 'Matthew 25:21',
      text: 'His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things: enter thou into the joy of thy lord.',
      category: 'parable',
    },
    {
      id: 11,
      reference: 'Matthew 13:45-46',
      text: 'Again, the kingdom of heaven is like unto a merchant man, seeking goodly pearls: Who, when he had found one pearl of great price, went and sold all that he had, and bought it.',
      category: 'parable',
    },
    {
      id: 12,
      reference: 'Luke 10:33-34',
      text: 'But a certain Samaritan, as he journeyed, came where he was: and when he saw him, he had compassion on him, And went to him, and bound up his wounds, pouring in oil and wine, and set him on his own beast, and brought him to an inn, and took care of him.',
      category: 'parable',
    },

    // -- Faith & Courage ------------------------------------------------------
    {
      id: 13,
      reference: 'Philippians 4:13',
      text: 'I can do all things through Christ which strengtheneth me.',
      category: 'faith',
    },
    {
      id: 14,
      reference: 'John 3:16',
      text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      category: 'love',
    },

    // -- Wisdom ---------------------------------------------------------------
    {
      id: 15,
      reference: 'Proverbs 3:5-6',
      text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
      category: 'wisdom',
    },
    {
      id: 16,
      reference: 'Psalm 23:1',
      text: 'The Lord is my shepherd; I shall not want.',
      category: 'courage',
    },
  ];

  // ---------------------------------------------------------------------------
  // Query methods
  // ---------------------------------------------------------------------------

  /**
   * Get all scriptures that match a given category.
   * @param {string} category - Category to filter by (e.g. "armor", "parable")
   * @returns {Scripture[]} Array of matching scriptures (empty if none found)
   */
  static getByCategory(category) {
    return this.scriptures.filter(
      (s) => s.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Look up a single scripture by its numeric ID.
   * @param {number} id - The scripture ID
   * @returns {Scripture|undefined} The matching scripture, or undefined
   */
  static getById(id) {
    return this.scriptures.find((s) => s.id === id);
  }

  /**
   * Return a random scripture from the database.
   * @returns {Scripture}
   */
  static getRandom() {
    const index = Math.floor(Math.random() * this.scriptures.length);
    return this.scriptures[index];
  }

  /**
   * Find a scripture by its reference string.
   * Performs a case-insensitive substring match, so partial references work
   * (e.g. "John 3:16" or just "john 3").
   * @param {string} ref - The reference to search for
   * @returns {Scripture|undefined} First matching scripture, or undefined
   */
  static getByReference(ref) {
    const search = ref.toLowerCase();
    return this.scriptures.find((s) =>
      s.reference.toLowerCase().includes(search)
    );
  }
}
