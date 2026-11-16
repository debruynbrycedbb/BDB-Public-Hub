# BDB Public Hub

My public showcase of the websites and browser games I've designed and built. Scrolling racks a lens's focus from 0.35 m to infinity: each project comes into focus in turn, with an aperture iris between categories and bokeh lights that sharpen into stars at the end.

Plain HTML, CSS and JavaScript, with no build step and no libraries. Hosted on GitHub Pages.

## Files

- `index.html`: the page.
- `js/data.js`: **everything shown**: categories, projects, texts, links, images and the distance labels.
- `js/main.js`: the scene (focus, blur, iris, bokeh, lens scale, captions).
- `css/style.css`: the look. Fonts: Newsreader and Jost (Google Fonts).
- `assets/frames/`: one 800×500 screenshot per project.

## Add a project

1. Add a screenshot to `assets/frames/` (16:10, about 800×500).
2. Add the project to its category in `js/data.js`.
3. Add one more distance to both `distances` and `metres` in `js/data.js` (there is one per stop: the title, each project, then ∞).
4. Raise the `?v=` number on the CSS and JS links in `index.html`.

## Accessibility

- A skip link and an "All work" list give every project as a plain link.
- "Pause motion" stops the grain and the drifting lights.
- With reduced motion switched on, nothing drifts or eases.
