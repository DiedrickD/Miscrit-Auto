# Miscrits Field Station design

React 19 and Vite dashboard with React Icons. Shared semantic colors in `src/styles.css` use slate surfaces, teal actions and amber availability labels. Dark is the default regardless of OS appearance. The user can choose light mode; only that appearance preference is stored in localStorage.

Use plain task headings, compact navigation, thin borders and modest radii. Avoid decorative gradients, promotional headlines and unnecessary animation. Hunt uses portrait grids, rarity filters, 24 items per page and bounded scrolling. Account map gates and daily schedules come from the route planner. Native details sections contain route priority and advanced settings. Preserve visible focus, disabled states, skip navigation, reduced motion and mobile layouts.

The React component tree is in `src/App.jsx`, `src/Workspace.jsx` and `src/panels/`. The existing automation controller in `src/controller.js` still owns its dedicated form controls and result containers; keep those components stable and do not reconcile controller-owned contents through React state. The theme switch is independently reactive so appearance changes preserve unsaved edits. Game policies and the local Node API remain in `lib/` and `server.mjs`.
