import 'reveal.js/dist/reveal.css';
// import "reveal.js/dist/theme/black.css"
// import "reveal.js/dist/theme/white.css"
import 'reveal.js/dist/theme/league.css';
// import "reveal.js/dist/theme/moon.css"
// import "reveal.js/dist/theme/sky.css"
// import "reveal.js/dist/theme/beige.css"
// import "reveal.js/dist/theme/simple.css"
// import "reveal.js/dist/theme/serif.css"
// import "reveal.js/dist/theme/blood.css"
// import "reveal.js/dist/theme/night.css"
// import "reveal.js/dist/theme/solarized.css"
import 'reveal.js/plugin/highlight/monokai.css';

import Reveal from 'reveal.js';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight.js';
import RevealMarkdown from 'reveal.js/plugin/markdown/markdown.js';
import RevealNotes from 'reveal.js/plugin/notes/notes.js';
import RevealSearch from 'reveal.js/plugin/search/search.js';
import RevealZoom from 'reveal.js/plugin/zoom/zoom.js';

Reveal.initialize({
  controls: true,
  progress: true,
  center: true,
  hash: true,

  plugins: [RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight],
});
