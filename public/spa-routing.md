# SPA Routing for GitHub Pages

This project uses a special setup to handle SPA (Single Page Application) routing on GitHub Pages.

## Why is this needed?

GitHub Pages serves static files. When a user navigates directly to a route like `/lms` or refreshes a page on that route, GitHub looks for a physical file at that path, which doesn't exist in a React app with client-side routing.

## How it works

1. When a user visits a non-existent path, GitHub Pages serves the `404.html` file
2. The `404.html` file contains a script that converts the current path to a special query parameter and redirects to the root
3. The `index.html` file detects this query parameter and uses `window.history.replaceState` to restore the original URL
4. React Router then handles the route normally

## Key files

- `/404.html` - Contains the redirect script
- `/index.html` - Contains the script to restore the URL
- `/.nojekyll` - Prevents GitHub Pages from processing the site with Jekyll

## Troubleshooting

If you encounter a blank page or 404 errors:
1. Clear your browser cache
2. Make sure both scripts in 404.html and index.html are correct
3. Verify that the BrowserRouter has the correct basename (`/audit-readiness-hub`) 