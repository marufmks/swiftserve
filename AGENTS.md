# Agent Instructions for SwiftServe

## Project Overview

SwiftServe is a **Real-Time Fleet & Order Management Dashboard** built with the PERN stack (PostgreSQL, Express, React, Node).

```
swiftserve/
├── backend/                    # Express.js API (port 4000)
│   ├── index.js               # Entry point with Socket.io
│   ├── db.js                  # PostgreSQL connection pool
│   ├── db/init.sql            # Database schema + seed data
│   ├── routes/                # API route definitions
│   │   ├── auth.js            # POST /login, POST /register
│   │   ├── orders.js          # GET/POST/PATCH /orders
│   │   ├── products.js        # GET/POST/PUT/DELETE /products
│   │   └── users.js           # User management
│   ├── controllers/           # Business logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification, role-based access
│   └── package.json
├── frontend/                  # React + Vite client (port 5173)
│   ├── src/
│   │   ├── App.jsx            # Main app with routing
│   │   ├── api.js             # Axios configuration
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── CustomerMenu.jsx
│   │   │   ├── Kitchen.jsx    # Kitchen Display System
│   │   │   ├── Driver.jsx
│   │   │   └── Admin.jsx
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Auth context
│   │   └── hooks/             # Custom hooks (useSocket)
│   └── package.json
├── docker-compose.yml
└── AGENTS.md
```

## User Roles
- **customer**: Browse menu, place orders, view order history
- **driver**: View assigned orders, update delivery status
- **admin**: Full access - manage kitchen, products, drivers, orders

## Commands

### Backend (from backend/ directory)
```bash
npm install              # Install dependencies
npm start                # Production: node index.js
npm run dev              # Development: nodemon with hot-reload
```

### Frontend (from frontend/ directory)
```bash
npm install              # Install dependencies
npm run dev              # Vite dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build
```

### Docker (from repo root)
```bash
docker-compose up              # Start all services (db, api, client)
docker-compose up --build      # Rebuild and start
docker-compose down            # Stop services
docker-compose logs -f api     # View API logs
```

### Single Test Commands
**No testing framework configured.** To add tests, use:
```bash
# Jest (backend)
npm install --save-dev jest
npx jest                      # Run all tests
npx jest path/to/test.js      # Run single test file
npx jest --watch              # Watch mode

# Vitest (frontend with Vite)
npm install --save-dev vitest
npx vitest run                # Run all tests
npx vitest run src/App.test.jsx # Run single test
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Login, returns JWT | No |
| GET | /api/auth/profile | Get current user | Yes |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/products | List all products | No |
| GET | /api/products/categories | List categories | No |
| GET | /api/products/:id | Get product | No |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/orders | List all orders | No |
| GET | /api/orders/drivers | List available drivers | Admin |
| GET | /api/orders/:id | Get order details | No |
| POST | /api/orders | Create order | No |
| PATCH | /api/orders/:id/status | Update status | Admin/Driver |
| PATCH | /api/orders/:id/assign-driver | Assign driver | Admin |

### Order Status Flow
`pending → confirmed → cooking → ready → en-route → delivered`

## Code Style Guidelines

### General Conventions
- 2-space indentation (not tabs)
- Single quotes for strings in JS/JSX
- Semicolons required at end of statements
- Trailing commas in multiline objects/arrays
- Max line length: 100 characters

### JavaScript (Backend)
```javascript
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Route handler pattern
app.get('/endpoint', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM table');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
```

### React/JSX (Frontend)
```jsx
import React, { useEffect, useState } from 'react';
import api from './api';

function Component() {
  const [state, setState] = useState([]);

  useEffect(() => {
    // effect logic
  }, []);

  return (
    <div className="container">
      <h1>Title</h1>
    </div>
  );
}

export default Component;
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `api-client.js`, `order-item.jsx` |
| Functions | camelCase | `getOrders`, `createOrder` |
| Components | PascalCase | `OrderList`, `UserProfile` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL` |
| CSS Classes | kebab-case | `btn-primary`, `order-list` |
| Database tables | snake_case | `order_items`, `user_profiles` |

### Error Handling
```javascript
// Backend: Always return appropriate status codes
try {
  const result = await pool.query(query, params);
  res.json(result.rows);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Descriptive message' });
}

// Frontend: Handle errors in async functions
try {
  const res = await api.get('/endpoint');
  setData(res.data);
} catch (err) {
  console.error(err);
  // Show user feedback via UI
}
```

### Environment Variables
- Backend: `.env` file, accessed via `process.env.VARIABLE_NAME`
- Frontend: `.env` file, accessed via `import.meta.env.VITE_VARIABLE_NAME`
- Prefix frontend vars with `VITE_` to expose to client
- Never commit `.env` files containing secrets

### Database
- Uses PostgreSQL with `pg` library
- Connection pool via `pg` module
- Parameterized queries only (prevent SQL injection)
- Use `$1`, `$2` for query parameters, not template literals

### Imports Order
1. React/core imports
2. Third-party libraries
3. Local components/utils
4. Relative path imports

## Real-Time Events (Socket.io)

### Server Emits
- `order:created` - New order placed
- `order:status-changed` - Order status updated
- `order:assigned` - Driver assigned to order

### Client Joins
- `join:kitchen` - Kitchen staff receive all updates
- `join:driver:{id}` - Driver receives assigned orders

## Docker Development
- API container: mounts `./backend` to `/app`, excludes `node_modules`
- Client container: mounts `./frontend` to `/app`, excludes `node_modules`
- Database auto-initializes from `backend/db/init.sql`
