# Swap

A full-stack local marketplace application for discovering, buying, and selling items within a community.

Swap is designed around a simple idea: make local marketplace interactions fast, clean, and easy to understand without the clutter commonly found in larger marketplace platforms.

> **Status:** Active development. The current development backend uses temporary in-memory listing storage while persistent cloud storage is being integrated.

## Features

* Create marketplace listings
* Search listings by keyword
* Filter listings by category
* View live listing counts and marketplace activity
* Responsive dark interface
* Smooth scroll-triggered UI animations
* REST API built with Express
* Separate frontend and backend architecture

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* CSS

**Backend**

* Node.js
* Express
* REST API

**Planned Infrastructure**

* Supabase PostgreSQL for persistent listing storage
* Supabase Storage for listing images
* Cloud deployment for a public live demo

## Architecture

```text
React / Vite Frontend
        |
        | HTTP / JSON
        v
Express REST API
        |
        v
Persistent Database
```

The frontend is responsible for the user interface, search, filtering, forms, and marketplace state.

The Express backend exposes API endpoints used to create and retrieve listings. Persistent cloud database and image-storage integration are the next development steps.

## Listing Flow

When a user creates a listing:

```text
User completes listing form
        |
        v
React validates and submits the form
        |
        | POST /api/listings
        v
Express API receives the listing
        |
        v
Server creates the listing
        |
        v
JSON response returned to React
        |
        v
Marketplace UI updates
```

## Current API

```text
GET  /api/listings
POST /api/listings
GET  /
```

## Local Development

Clone the repository:

```bash
git clone https://github.com/Musabs1/Swap.git
cd Swap
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
cd ..
```

Start both the Vite frontend and Express backend:

```bash
npm run dev
```

The frontend runs locally through Vite and communicates with the Express API on port `5000`.

## Roadmap

* Persistent database storage
* Listing image uploads
* User authentication
* Seller profiles
* Edit and delete listing functionality
* Favorites
* Improved marketplace search
* Public cloud deployment

## Project Goal

Swap was built as a hands-on full-stack project to better understand how frontend applications, REST APIs, authentication, databases, and cloud services work together as one system.

The project is actively being developed and expanded as new infrastructure and marketplace features are added.
