# Departmental Stock Management System

A comprehensive, high-performance monorepo application for managing departmental inventory, procurement, and stock fulfillment.

## 🚀 Overview

This system is designed to streamline the lifecycle of inventory management—from issuing Purchase Orders to vendors, to receiving Stock Batches, and tracking real-time stock levels with a full audit trail. It features a premium React frontend and a robust NestJS backend, ensuring type safety and scalability through a shared contract architecture.

### ✨ Core Features

- **Inventory Management**: Track products, categories, and real-time stock levels.
- **Procurement Workflow**: Manage Vendors and full lifecycle of Purchase Orders.
- **Stock Batch Tracking**: Log incoming goods from purchase orders with partial/full receipt support.
- **Audit Logging**: Comprehensive tracking of all mutation actions (Create/Update/Delete).
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for different administrative roles.
- **Asset Management**: Integrated Minio/S3 support for product images and documents.

---

## 🛠 Technology Stack

- **Monorepo**: Turborepo + pnpm
- **Backend**: NestJS, Drizzle ORM, PostgreSQL
- **Frontend**: React (Vite), TailwindCSS, React Query, Radix UI
- **Contracts**: Zod (Shared schemas & types)
- **Infrastructure**: Docker, Minio (Object Storage)

---

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js**: v18 or later
- **pnpm**: v8 or later
- **Docker & Docker Compose**: For database and object storage

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd departmental-stock-management
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Spin up Infrastructure

Start the PostgreSQL and Minio containers:

```bash
docker compose up -d
```

### 4. Configure Object Storage (Minio)

Before proceeding, access the Minio Console at [http://localhost:9001](http://localhost:9001):

1.  **Login**: Default credentials are `minioadmin` / `minioadmin`.
2.  **Create Bucket**: Create a bucket (e.g., `stockify`).
3.  **Create Access Key**: Generate an Access Key and Secret Key for the application to use.

### 5. Setup Environment Variables

Create `.env` files in both `apps/api` and `apps/web`.

#### Backend (`apps/api/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
PORT=4000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600
FRONTEND_URL=http://localhost:5173

# Initial Admin Setup
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_password

# Object Storage (Minio)
# Note: You must create the bucket and access keys in the Minio Console (http://localhost:9001) first.
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_REGION=us-east-1
MINIO_ENDPOINT=http://localhost:9000
MINIO_BUCKET=stockify
RESEND_API_KEY=your_resend_api_key
```

#### Frontend (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:4000
VITE_S3_URL=http://localhost:9000/stockify
```

### 5. Database Setup

Run migrations and seed the database:

```bash
# In apps/api
pnpm run db:push
pnpm run seed # If a seed script is available
```

---

## 🏃‍♂️ Running the Application

Start the development servers for both apps:

```bash
pnpm dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

---

## 🏗 Project Structure

```text
├── apps
│   ├── api          # NestJS Backend
│   └── web          # React Frontend
├── packages
│   ├── contracts    # Shared Zod schemas & types
│   ├── ui           # Shared UI components
│   ├── eslint-config
│   └── typescript-config
├── docker-compose.yaml
└── turbo.json
```

---

## 🛡 Security & Audit

The system implements a centralized audit logging service. Every mutation (Create, Update, Delete) is recorded with:

- Actor (User ID)
- Action Type
- Entity Reference
- Timestamp
- Change Description

Access is controlled via fine-grained permissions using the `@Auth` decorator on API endpoints.
