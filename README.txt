Western School & College Bengali Student Portal PWA

Built files:
- index.html = login + dashboard
- fee.html = fees page
- result.html = result page
- notice.html = notice board
- message.html = personal message page
- account.html = account settings, file upload, camera capture
- config.js = API URL, Cloudinary logo, app info, route, menu
- css/colors.css = color edit file
- css/fonts.css = font control
- css/root.css = base layout
- css/components.css = cards, shell, forms, sidebar, topbar
- css/apple-menu.css = Apple-style hamburger, drawer, backdrop, open/close animation
- page CSS files = page specific design
- js/app.js = core API, layout, PWA, fast data loading, cache fallback
- page JS files = page behavior
- manifest.json + sw.js = PWA install support
- .nojekyll = GitHub Pages fix

Data load fix:
- GET request tries normal fetch first.
- If fetch fails, JSONP fallback is tried.
- Dashboard never stays loading forever: cache/session fallback will render profile.
- Login continues after successful login even if dashboard pre-cache fails.
- Broom icon clears dashboard cache and service-worker cache.

Local test:
python -m http.server 5500
Open:
http://localhost:5500

GitHub Pages:
Upload all files to repo root.
Settings > Pages > Deploy from branch > main > root.

If GitHub Pages shows old/broken design:
1. Open site.
2. Click broom icon.
3. Hard refresh.
4. If needed: DevTools > Application > Service Workers > Unregister.