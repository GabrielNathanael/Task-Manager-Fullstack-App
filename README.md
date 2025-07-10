# Task Manager Fullstack App

This Task Manager application is a full-stack project built using **Laravel** (backend API) and **React** (frontend), with authentication handled via **Firebase**. It's designed to manage tasks and projects efficiently.

---

## Key Features

- **User Authentication**: Register and log in using Firebase Authentication.
- **Task Management (CRUD)**: Create, View, Edit, and Delete tasks.
- **Project Management (CRUD)**: Create, View, Edit, and Delete projects.
- **Task & Project Relation**: Tasks can be linked to specific projects, with an option for "Not in any project."
- **Optimistic UI**: CRUD operations (Task & Project) on the frontend feel instant, with dynamic updates to task and project counts.
- **Session Management**: Utilizes Laravel Sanctum for fast API authentication after the initial login.
- **Project Task Caching**: Project tasks in the mini-dashboard are cached for instant loading on repeat visits.
- **Modern Layout**: A responsive user interface featuring a sidebar, header, search bar, icons, and custom modals with backdrop blur effects using **Tailwind CSS v4**.

---

## Prerequisites

Before getting started, ensure you have the following software installed on your system:

- **Laragon**: (Recommended for Windows) A local development environment that includes Apache, MySQL, and PHP.
  - Ensure **PHP version 8.2 or higher** in your Laragon setup.
  - Ensure **MySQL version 8.0 or higher** in your Laragon setup.
- **Composer**: Dependency manager for PHP.
- **Node.js**: (Version 20.19.0 or higher, latest LTS version recommended) JavaScript runtime environment.
  - Ensure the Node.js version used by your terminal matches the requirement (especially if using Laragon, make sure Laragon's Node.js PATH is prioritized).
- **npm**: Package manager for Node.js (usually installed with Node.js).
- **Git**: Version control system.
- **Code Editor**: (VS Code recommended)

---

## Firebase Project Setup

This application uses Firebase Authentication for user management. You'll need to set up your own Firebase project.

### Create a New Firebase Project

1.  Open the [Firebase Console](https://console.firebase.google.com/).
2.  Click "Add project" and follow the steps. Name your project (e.g., `task-manager-app-yourname`).
3.  Disable Google Analytics for simplicity if desired.

### Enable Email/Password Authentication

1.  In your Firebase project's Console, navigate to **Build > Authentication**.
2.  Select the "Sign-in method" tab.
3.  Enable the "Email/Password" method by setting it to **ON**.
4.  **Important**: Click the **Save** button.

### Get Firebase Credentials (Client-side)

1.  In the Firebase Console, go to **Project settings** (gear icon) > **Project settings**.
2.  Scroll down to the "Your apps" section.
3.  Click the Web icon (`</>`) to register a new web app. Give it a name (e.g., `task-manager-frontend`).
4.  You will receive a `firebaseConfig` object. Copy all the values for `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`.

### Get Firebase Credentials (Server-side - Service Account Key)

1.  In the Firebase Console, go to **Project settings > Service accounts**.
2.  Click the "**Generate new private key**" button and confirm. This will download a JSON file (e.g., `[project-id]-firebase-adminsdk-xxxxx.json`). Save this file securely!

---

## Installation and Setup

This project is a monorepo, meaning the Laravel backend and React frontend are within a single Git repository.

### Clone Repository

```bash
git clone [https://github.com/your-username/Task-Manager-Fullstack-App.git](https://github.com/your-username/Task-Manager-Fullstack-App.git)
cd Task-Manager-Fullstack-App
```

Backend Setup (Laravel)
Enter Backend Directory:

Bash

cd task-manager-backend
Install Composer Dependencies:

Bash

composer install
Configure Environment File:

Copy the .env.example file to .env:

Bash

cp .env.example .env
Open the newly created .env file in your code editor.

Set Laravel Application Key: If APP_KEY is empty, run:

Bash

php artisan key:generate
Configure MySQL Database: Adjust the following lines to your Laragon settings:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager_db # You can change this name
DB_USERNAME=root
DB_PASSWORD=
Configure Firebase Credentials (Server-side):

Move the Service Account JSON file you downloaded from the Firebase Console to the folder: task-manager-backend/storage/app/firebase/ (create the firebase folder if it doesn't exist).

Update the lines in .env with the correct path and Project ID:

FIREBASE_CREDENTIALS=firebase/[your_json_file_name].json # Example: firebase/task-manager-app-59f66-firebase-adminsdk-xxxxx.json
FIREBASE_PROJECT_ID=your-firebase-project-id # Example: task-manager-app-59f66
Run Database Migrations:

Ensure MySQL in your Laragon is running.

Create the database in MySQL (e.g., task_manager_db) via phpMyAdmin or the MySQL terminal.

Run migrations to create all tables (this will delete existing data if tables already exist):

Bash

php artisan migrate:fresh --seed
Backend Setup Complete.

Frontend Setup (React)
Return to Monorepo Root Directory:

Bash

cd ..
Enter Frontend Directory:

Bash

cd task-manager-frontend
Install npm Dependencies:

Bash

npm install
Configure Tailwind CSS v4:

To install and configure Tailwind CSS v4 with Vite, follow the official guide: https://tailwindcss.com/docs/installation/using-vite

Configure Environment File:

Copy the .env.example file to .env.local:

Bash

cp .env.example .env.local
Open the newly created .env.local file in your code editor.

Configure Firebase Credentials (Client-side): Fill in the values you obtained from the Firebase Console:

VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTHDOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
VITE_FIREBASE_PROJECTID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGEBUCKET="YOUR_PROJECT_ID.appspot.com"
VITE_FIREBASE_MESSAGINGSENDERID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APPID="YOUR_APP_ID"

VITE_API_URL="http://localhost:8000/api" # Adjust if your Laravel is running on a different port/domain
Frontend Setup Complete.

Running the Application
Run Backend Server (Laravel)
Open a new terminal.

Navigate to the task-manager-backend directory.

Run:

Bash

php artisan serve
Run Frontend Server (React)
Open another new terminal.

Navigate to the task-manager-frontend directory.

Run:

Bash

npm run dev
Access the Application
Open your browser and navigate to http://localhost:5173/.

You will see the Login page. You can register a new account or log in with an existing one.
