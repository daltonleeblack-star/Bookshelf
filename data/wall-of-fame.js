/* The top five, hung on the wall behind the chair.
 *
 * This file is yours — the Goodreads importer never touches it. Reorder freely.
 * `cover` takes a local file (drop it in assets/wall/) or any image URL. Dates and
 * ratings aren't repeated here; clicking a frame reads them from data/books.js,
 * so they stay right as your shelf changes.
 */
window.WALL_OF_FAME = {
  heading: "Wall of Fame",
  books: [
    {
      title: "Demon Copperhead",
      author: "Barbara Kingsolver",
      // Best guess at the US hardcover; drop the Filia edition into assets/wall/
      // and point here instead. A wrong ISBN just falls back to a title plate.
      cover: "https://covers.openlibrary.org/b/isbn/9780063251922-L.jpg?default=false"
    },
    {
      title: "Pachinko",
      author: "Min Jin Lee",
      cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1766879949l/34051011._SY475_.jpg"
    },
    {
      title: "The Great Believers",
      author: "Rebecca Makkai",
      cover: "https://covers.openlibrary.org/b/isbn/9780735223530-L.jpg?default=false"
    },
    {
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      cover: "https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg?default=false"
    },
    {
      title: "A Little Life",
      author: "Hanya Yanagihara",
      cover: "https://covers.openlibrary.org/b/isbn/9780385539258-L.jpg?default=false"
    }
  ]
};
