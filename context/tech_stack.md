# Stack

- Strapi on Railway.app:
    - node.js server
    - postgreSQL DB
    - admin panel
    - API for frontend
    - GitHub repo for codebase
- Cloudinary for files hosting
- Astro frontend on Netlify:
    - Static HTMl pages

Codebase: Hosted on GitHub.
Frontend (Netlify): Connects to GitHub. Hosting is Free.
Backend App (Railway): Connects to GitHub. Hosts the Strapi Node.js app and the PostgreSQL Database. Cost: ~$5-10/mo.
Media (Cloudinary): You install the strapi-provider-upload-cloudinary plugin. All images uploaded by the shop owner go here. Cost: Free (their free tier is huge).
