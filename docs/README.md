    # CareerPath — Full Project (Frontend + Backend + MySQL)

    ## What this project contains
    - Frontend (public/) — HTML, CSS, JS (student form, merit view, admin pages)
    - Backend (server.js) — Node.js + Express + MySQL2 API
    - DB script (db.sql) — create database `careerpath` and table `students`
    - package.json — Node dependencies and start script

    ## Pre-requisites (on your machine)
    - Node.js (LTS)
    - MySQL server running
    - Optionally VS Code + Live Server for frontend testing

    ## Default MySQL credentials used in project (you can change in .env or server.js)
    - Host: localhost
    - User: root
    - Password: pass@123
    - Database: careerpath

    ## Admin credentials (demo)
    - Username: admin
    - Password: admin123

    ## How to run
    1. Import DB: open MySQL client and run `db.sql` or run:

   ```sql
   SOURCE path/to/db.sql;
   ```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node server.js
```

Server listens on port 5000 by default. Open the frontend pages in `public/` (e.g., open `public/index.html` in browser).

## Notes
- This demo uses a simple in-memory admin session token for the admin panel (sufficient for a college project demo). For production, use proper authentication (JWT or sessions) and secure password storage.
- If your MySQL credentials differ, edit `server.js` and update the `dbConfig` section.
