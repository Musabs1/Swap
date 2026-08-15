# Swap

A full-stack local marketplace application for discovering, buying, and selling items within a community.

Swap is designed around a simple idea: make local marketplace interactions fast, clean, and easy to understand without the clutter commonly found in larger marketplace platforms.

> **Status:** Active development. Core marketplace listings are now persisted in a cloud-hosted PostgreSQL database through Supabase.

## Features

- Create marketplace listings
- Persistent cloud database storage
- Search listings by keyword
- Filter listings by category
- Currency-formatted pricing
- View live listing counts and marketplace activity
- Delete listings during local development
- Responsive dark interface
- Smooth scroll-triggered animations
- REST API built with Express
- Separate frontend and backend architecture

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express
- REST API
- Supabase JavaScript SDK

### Database

- PostgreSQL
- Supabase

### Planned Infrastructure

- Supabase Storage for listing images
- User authentication
- Public cloud deployment

## Architecture

```text
React / Vite Frontend
        |
        | HTTP / JSON
        v
Express REST API
        |
        | Supabase SDK
        v
Supabase PostgreSQL