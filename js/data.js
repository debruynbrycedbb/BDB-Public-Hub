/* =========================================================================
   Everything in the scene lives in this file.

   The page racks focus from close up to infinity. Each project sits at its
   own distance, in the order below. Categories close and reopen the
   aperture between them.

   category  { name, fstop }: shown in the readout while you're in it
   projects  id, name, type, text, note (optional), url, image
   distances one label per stop: the title, each project, then the end (∞)
   ========================================================================= */

window.FOCUS = {
  distances: ['0.35 m', '0.5 m', '0.7 m', '1 m', '1.2 m', '1.5 m', '2 m', '3 m', '5 m', '10 m', '∞'],
  metres: [0.35, 0.5, 0.7, 1, 1.2, 1.5, 2, 3, 5, 10, Infinity],

  categories: [
    {
      name: 'Portfolios',
      fstop: 'f/1.4',
      projects: [
        {
          id: 'interactive-cv',
          name: 'Interactive CV',
          type: 'Curriculum vitae',
          text: 'My CV as a single page. An animated world map follows my journey from South Africa to Spain, with my portfolio, past projects, experience, education and skills.',
          url: 'https://debruynbrycedbb.github.io/Interactive-CV-Website/',
          image: 'assets/frames/interactive-cv.jpg',
        },
        {
          id: 'photography-globe',
          name: 'Photography Globe',
          type: 'Photography portfolio',
          text: 'My photography on an interactive 3D Earth. Rotate the globe, pick a location and fly down through the clouds into its gallery.',
          url: 'https://bdbphotography.site/',
          image: 'assets/frames/photography-globe.jpg',
        },
        {
          id: 'georgina-marrison',
          name: 'Georgina Marrison',
          type: 'Painting portfolio',
          text: 'An example portfolio for a painter. Scroll to walk a watercolour path toward the mountain, until the scene dissolves into white paper and becomes the gallery.',
          note: 'Example site, still in progress.',
          url: 'https://debruynbrycedbb.github.io/Georgina-Example-Portfolio/',
          image: 'assets/frames/georgina-marrison.jpg',
        },
      ],
    },
    {
      name: 'Games',
      fstop: 'f/2',
      projects: [
        {
          id: 'moon-racer',
          name: 'Moon Racer',
          type: 'Driving game',
          text: 'A 3D driving game on a floating circuit above the Moon. Race your best lap against your own ghost, with a keyboard or a PS5 controller.',
          url: 'https://debruynbrycedbb.github.io/Moon-Racer/',
          image: 'assets/frames/moon-racer.jpg',
        },
        {
          id: 'starlink-launch-tycoon',
          name: 'Starlink Launch Tycoon',
          type: 'Tycoon game',
          text: 'A tycoon game about launching satellites. Load the rocket, launch, deploy, land the booster and grow your orbital income. Fly it yourself or leave it to the autopilot.',
          url: 'https://debruynbrycedbb.github.io/SpaceX-Tycoon/',
          image: 'assets/frames/starlink-launch-tycoon.jpg',
        },
      ],
    },
    {
      name: '3D showcases',
      fstop: 'f/2.8',
      projects: [
        {
          id: 'jackob',
          name: 'Jackob',
          type: '3D product showcase',
          text: 'A gallery room with a rack of three denim jackets and a sequin patchwork bag. Click a jacket to bring it forward and turn it, or pick up the bag.',
          url: 'https://debruynbrycedbb.github.io/Jackob-Blender-Site/',
          image: 'assets/frames/jackob.jpg',
        },
        {
          id: 'u9-xtreme',
          name: 'U9 Xtreme',
          type: '3D car demo',
          text: 'A scroll-driven 3D demo of the BYD Yangwang U9 Xtreme. The camera circles the car on a dark, wet stage and stops at each spec.',
          note: 'Independent design demo. Not affiliated with BYD or Yangwang.',
          url: 'https://debruynbrycedbb.github.io/BYD-U9-Demo-Site/',
          image: 'assets/frames/u9-xtreme.jpg',
        },
      ],
    },
    {
      name: 'Apps & trackers',
      fstop: 'f/4',
      projects: [
        {
          id: 'weeknight',
          name: 'Weeknight',
          type: 'Recipes and meal planner',
          text: 'Recipes and weekly meal planning. A looping recipe carousel, a week and month plan, and a shopping list grouped by aisle.',
          url: 'https://debruynbrycedbb.github.io/Recipe-Site/',
          image: 'assets/frames/weeknight.jpg',
        },
        {
          id: 'cinevault',
          name: 'CineVault',
          type: 'Film and series tracker',
          text: 'A film and series tracker for friends and family. Rate what you watch, log the dates and compare your taste with other members.',
          note: 'Members only. Visitors see the sign-in page.',
          url: 'https://debruynbrycedbb.github.io/Movies-and-Series-Site/',
          image: 'assets/frames/cinevault.jpg',
        },
      ],
    },
  ],
};
