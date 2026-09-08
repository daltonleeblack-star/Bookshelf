/* Reading Room data.
 *
 * Regenerate this file with:  node scripts/import-goodreads.mjs --csv goodreads_library_export.csv
 * (or --rss 108508812). Hand-edits to `progress` / `pagesRead` are preserved on re-import.
 *
 * NOTE: profile.sample = true means these are placeholder books, not real shelf data.
 */
window.BOOKSHELF_DATA = {
  profile: {
    name: "Dalton",
    goodreadsUrl: "https://www.goodreads.com/user/show/108508812",
    lastSynced: null,
    sample: true
  },

  currentlyReading: [
    { id: "s1", title: "The Overstory", author: "Richard Powers", pages: 502, pagesRead: 318, startedAt: "2026-07-14" },
    { id: "s2", title: "Piranesi", author: "Susanna Clarke", pages: 245, pagesRead: 61, startedAt: "2026-08-22" },
    { id: "s3", title: "The Beginning of Infinity", author: "David Deutsch", pages: 487, pagesRead: 120, startedAt: "2026-05-02" }
  ],

  read: [
    { id: "r1",  title: "Project Hail Mary",        author: "Andy Weir",            pages: 476, rating: 5, dateRead: "2026-08-03" },
    { id: "r2",  title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", pages: 401, rating: 4, dateRead: "2026-06-19" },
    { id: "r3",  title: "The Three-Body Problem",   author: "Cixin Liu",            pages: 400, rating: 4, dateRead: "2026-04-27" },
    { id: "r4",  title: "Klara and the Sun",        author: "Kazuo Ishiguro",       pages: 303, rating: 4, dateRead: "2026-03-11" },
    { id: "r5",  title: "Thinking, Fast and Slow",  author: "Daniel Kahneman",      pages: 499, rating: 3, dateRead: "2026-01-30" },
    { id: "r6",  title: "Babel",                    author: "R. F. Kuang",          pages: 546, rating: 5, dateRead: "2025-11-16" },
    { id: "r7",  title: "The Dispossessed",         author: "Ursula K. Le Guin",    pages: 341, rating: 5, dateRead: "2025-09-08" },
    { id: "r8",  title: "Sapiens",                  author: "Yuval Noah Harari",    pages: 443, rating: 4, dateRead: "2025-07-21" },
    { id: "r9",  title: "A Gentleman in Moscow",    author: "Amor Towles",          pages: 462, rating: 5, dateRead: "2025-05-04" },
    { id: "r10", title: "The Left Hand of Darkness",author: "Ursula K. Le Guin",    pages: 304, rating: 4, dateRead: "2025-02-14" },
    { id: "r11", title: "Educated",                 author: "Tara Westover",        pages: 334, rating: 4, dateRead: "2024-12-28" },
    { id: "r12", title: "Circe",                    author: "Madeline Miller",      pages: 393, rating: 5, dateRead: "2024-10-06" },
    { id: "r13", title: "Dune",                     author: "Frank Herbert",        pages: 658, rating: 5, dateRead: "2024-08-17" },
    { id: "r14", title: "The Anthropocene Reviewed",author: "John Green",           pages: 293, rating: 4, dateRead: "2024-06-02" },
    { id: "r15", title: "Station Eleven",           author: "Emily St. John Mandel",pages: 333, rating: 4, dateRead: "2024-03-19" },
    { id: "r16", title: "Never Let Me Go",          author: "Kazuo Ishiguro",       pages: 288, rating: 3, dateRead: "2024-01-07" },
    { id: "r17", title: "Exhalation",               author: "Ted Chiang",           pages: 350, rating: 5, dateRead: "2023-11-24" },
    { id: "r18", title: "The Goldfinch",            author: "Donna Tartt",          pages: 771, rating: 4, dateRead: "2023-10-02" }
  ]
};
