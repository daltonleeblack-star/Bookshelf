Cover images for the Wall of Fame.

Drop a file in here named after the book and it claims that frame — no code change
needed. `data/wall-of-fame.js` tries these names in order and falls back to a remote
cover, then to a printed title plate:

    demon-copperhead.jpg
    pachinko.jpg
    the-great-believers.jpg
    the-kite-runner.jpg
    a-little-life.jpg

`.png` works too. A local file is worth adding: it's the edition you actually read, it
loads instantly, and it doesn't break when a cover host changes its mind.
