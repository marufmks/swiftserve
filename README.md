# SwiftServe

A real-time fleet and order management dashboard for delivery operations. Built with the PERN stack (PostgreSQL, Express, React, Node.js).

![SwiftServe Dashboard](https://via.placeholder.com/800x400?text=SwiftServe+Dashboard)

## Features

### Customer Portal
- Browse menu by category
- Add items to cart
- Place orders with delivery address
- Real-time order status tracking

### Kitchen Display System (KDS)
- Live order queue with auto-updates
- Drag-free status progression
- Real-time Socket.io notifications
- Column-based kanban view (New → Cooking → Ready)

### Driver App
- View assigned orders
- Update delivery status (Picked Up → En Route → Delivered)
- Real-time notifications for new assignments

### Admin Dashboard
- Product management (CRUD)
- Order monitoring and management
- Driver assignment
- Statistics overview

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL 16 |
| Backend | Express.js, Node.js |
| Auth | JWT, bcrypt |
| Real-time | Socket.io |
| Frontend | React 18, Vite |
| State/Fetch | TanStack Query |
| Styling | Tailwind CSS |
| Icons | Lucide React |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (or Docker)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd swiftserve

# Start all services
docker-compose up

# The app will be available at:
# - Frontend: http://localhost:5173
# - API: http://localhost:4000
```

### Option 2: Local Development

**Backend:**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Database:**

Create a PostgreSQL database named `swiftserve_db` with user `user` and password `password`, or update the `.env` file with your credentials.

The schema and seed data auto-initialize on first Docker startup.

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@swiftserve.local | password |
| Driver | driver1@swiftserve.local | password |
| Driver | driver2@swiftserve.local | password |
| Customer | alice@example.com | password |
| Customer | bob@example.com | password |

## Project Structure

```
swiftserve/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── userController.js
│   ├── db/
│   │   └── init.sql      # Schema + seed data
│   ├── middleware/
│   │   └── auth.js       # JWT verification
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── users.js
│   ├── db.js             # PostgreSQL pool
│   └── index.js          # Entry point
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # React context (Auth)
│       ├── hooks/        # Custom hooks (useSocket)
│       ├── pages/        # Page components
│       │   ├── Admin.jsx
│       │   ├── CustomerMenu.jsx
│       │   ├── Driver.jsx
│       │   ├── Kitchen.jsx
│       │   └── Login.jsx
│       ├── api.js        # Axios config
│       └── App.jsx       # Router setup
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products/categories` | List categories |
| POST | `/api/products` | Create (Admin) |
| PUT | `/api/products/:id` | Update (Admin) |
| DELETE | `/api/products/:id` | Delete (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| GET | `/api/orders/drivers` | List drivers |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id/status` | Update status |
| PATCH | `/api/orders/:id/assign-driver` | Assign driver |

### Order Status Flow
```
pending → confirmed → cooking → ready → en-route → delivered
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftserve_db
DB_USER=user
DB_PASSWORD=password
PORT=4000
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
```

## Real-Time Events

Socket.io events for live updates:

| Event | Direction | Description |
|-------|-----------|-------------|
| `order:created` | Server → Client | New order placed |
| `order:status-changed` | Server → Client | Status updated |
| `order:assigned` | Server → Client | Driver assigned |
| `join:kitchen` | Client → Server | Subscribe to kitchen updates |
| `join:driver:{id}` | Client → Server | Subscribe to driver orders |

## Scripts

### Backend
```bash
npm start        # Production
npm run dev      # Development (nodemon)
```

### Frontend
```bash
npm run dev      # Dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

### Docker
```bash
docker-compose up              # Start
docker-compose up --build      # Rebuild & start
docker-compose down            # Stop
docker-compose logs -f api     # View API logs
```

## License

ISC
