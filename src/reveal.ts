import 'reveal.js/reveal.css';
// import "reveal.js/theme/black.css"
// import "reveal.js/theme/white.css"
import 'reveal.js/theme/league.css';
// import "reveal.js/theme/moon.css"
// import "reveal.js/theme/sky.css"
// import "reveal.js/theme/beige.css"
// import "reveal.js/theme/simple.css"
// import "reveal.js/theme/serif.css"
// import "reveal.js/theme/blood.css"
// import "reveal.js/theme/night.css"
// import "reveal.js/theme/solarized.css"
import 'reveal.js/plugin/highlight/monokai.css';

import Reveal from 'reveal.js';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealMarkdown from 'reveal.js/plugin/markdown';
import RevealNotes from 'reveal.js/plugin/notes';
import RevealSearch from 'reveal.js/plugin/search';
import RevealZoom from 'reveal.js/plugin/zoom';

Reveal.initialize({
  controls: true,
  progress: true,
  center: true,
  hash: true,

  plugins: [RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight],
});
