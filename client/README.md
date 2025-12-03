# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e0148acd-b012-4d8f-82fa-e8ad50800ed3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e0148acd-b012-4d8f-82fa-e8ad50800ed3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Stack

- **Frontend:** Vite + React + TypeScript, Tailwind, shadcn/ui, React Query
- **Backend:** Express, MongoDB (Mongoose), JWT auth, Nodemon for dev
- **Auth & Roles:** JWT sessions with bcrypt hashing and role-based guards (customer/admin)
- **Installments:** Server-generated schedules with payment tracking & verification workflows

## Local Development

1. **Install dependencies**
   ```sh
   npm install
   npm --prefix server install
   ```

2. **Environment variables**
   - Copy `env.example` → `.env`
   - Copy `server/env.example` → `server/.env` and update:
     ```env
     PORT=8080
     MONGODB_URI=your-mongo-uri
     JWT_SECRET=strong-secret
     CORS_ORIGIN=http://localhost:5173
     ```

3. **Seed sample data (optional)**
   ```sh
   npm run server:seed
   ```

4. **Run the apps (in separate terminals)**
   ```sh
   npm run dev          # frontend on http://localhost:5173
   npm run server:dev   # backend on http://localhost:8080
   ```

## Deployment

Deploy the frontend as usual (Netlify/Vercel/etc.) and deploy the Express API to any Node-friendly host (Render, Railway, etc.). Update `VITE_API_URL` to point at the hosted API.

## Feature Highlights
- Customer auth with installment checkout (3/6/12/18 mo) and payment proof capture
- Dashboard widgets for orders, pending installments, next due date, and history
- Order history shows payment method, references, and schedule
- Admin portal for stats, product CRUD, payment verification, and installment management
