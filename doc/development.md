# 🚀 Development Guide - NIGHT.PI ECOSYSTEM

This document provides instructions for setting up and developing the project in both local and containerized environments.

---

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, React Router.
- **Backend:** Node.js, TypeScript, Express, Pi Network SDK Integration.
- **Infrastructure:** Docker, Docker Compose, Nginx (Reverse Proxy).
- **Package Manager:** `yarn` (preferred).

---

## 🏗 Project Architecture

The project is divided into three main services:

1.  **`frontend/`**: The user interface. It is a Single Page Application (SPA) built with Vite.
2.  **`backend/`**: The core logic, handling Pi Network authentication, payments, and user data.
3.  **`reverse-proxy/`**: An Nginx-based layer that routes traffic to the correct service and manages SSL.

---

## 💻 Local Development Setup

### 1. Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn](https://yarnpkg.com/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### 2. Running with Docker (Recommended)

The easiest way to run the entire stack (Frontend, Backend, and Proxy) is using Docker Compose.

1. **Clone the repository:**
```bash
   git clone <your-repo-url>
   cd pi-demo
   
