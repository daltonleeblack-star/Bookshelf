/* The top five, hung on the wall behind the chair.
 *
 * This file is yours — the Goodreads importer never touches it. Reorder freely.
 * `covers` is a list tried in order: a local file in assets/wall/ wins, a remote cover
 * backs it up, and a title plate shows if none load. Dropping a correctly named image
 * into assets/wall/ is all it takes to claim a frame. Dates and
 * ratings aren't repeated here; clicking a frame reads them from data/books.js,
 * so they stay right as your shelf changes.
 */
window.WALL_OF_FAME = {
  heading: "Wall of Fame",
  books: [
    {
      title: "Demon Copperhead",
      author: "Barbara Kingsolver",
      covers: [
        "assets/wall/demon%20copperhead.jpg",
        "https://covers.openlibrary.org/b/isbn/9780063251922-L.jpg?default=false"
      ]
    },
    {
      title: "Pachinko",
      author: "Min Jin Lee",
      covers: [
        "assets/wall/pachinko.jpg",
        "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1766879949l/34051011._SY475_.jpg"
      ]
    },
    {
      title: "The Great Believers",
      author: "Rebecca Makkai",
      covers: [
        "assets/wall/greatbelievers.jpg",
        "https://covers.openlibrary.org/b/isbn/9780735223530-L.jpg?default=false"
      ]
    },
    {
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      covers: [
        "assets/wall/kiterunner.jpg",
        "https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg?default=false"
      ]
    },
    {
      title: "A Little Life",
      author: "Hanya Yanagihara",
      covers: [
        "assets/wall/alittlelife.jpg",
        "https://covers.openlibrary.org/b/isbn/9780385539258-L.jpg?default=false"
      ]
    }
  ]
};
