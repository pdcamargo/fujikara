# Docker Setup Guide

This project includes Docker configuration for both development and production environments.

## Prerequisites

- Docker and Docker Compose installed
- Content copied to `./mdx` directory (for production builds)

## Quick Start

### Development Mode

Run the development server with hot-reload:

```bash
docker-compose up dev
```

This will:
1. Install dependencies
2. Run the `copy:content` script (requires external content directory mounted)
3. Start the Vite development server on port 3000

The development container mounts your local code, so changes are reflected immediately.

### Production Build

**Important:** Before building for production, run the copy:content script locally:

```bash
pnpm copy:content
```

Then build and run the production container:

```bash
docker-compose up prod
```

Or manually:

```bash
docker build -t mdx-app .
docker run -p 3000:3000 mdx-app
```

## Docker Services

### `dev` - Development Service
- **Purpose:** Local development with hot-reload
- **Port:** 3000
- **Volumes:** Mounts local code and external content directory
- **Command:** `pnpm install && pnpm run copy:content && pnpm run dev`

### `prod` - Production Service
- **Purpose:** Production-ready application
- **Port:** 3000
- **Image:** Multi-stage optimized build
- **Command:** `pnpm run serve` (Vite preview server)

### `build` - Build-Only Service
- **Purpose:** Build the application without running it
- **Output:** Writes to `./dist` directory

```bash
docker-compose run build
```

## Important Notes

### Content Directory

The `copy:content` script references an external directory (`../../writing/fujikara`).

For **development**:
- The docker-compose mounts this directory at `/writing-source:ro` (read-only)
- The script runs automatically when you start the dev container

For **production**:
- Run `pnpm copy:content` locally before building
- This populates the `./mdx` directory which is included in the Docker image
- The external directory is NOT accessible during Docker build

### External Content Location

If your external content is in a different location, update the volume mount in [docker-compose.yml](docker-compose.yml):

```yaml
volumes:
  - /path/to/your/content:/writing-source:ro
```

### Environment Variables

Development:
- `NODE_ENV=development`
- `VITE_PORT=3000`

Production:
- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

## Troubleshooting

### Build fails with "COPY failed"

Make sure you've run `pnpm copy:content` locally before building for production.

### Content not updating in dev mode

The dev container mounts the external content directory. Make sure:
1. The path in docker-compose.yml is correct
2. The directory is accessible from your host machine

### Port already in use

Change the port mapping in docker-compose.yml:

```yaml
ports:
  - "3001:3000"  # Host port 3001 -> Container port 3000
```

## Docker Commands Cheat Sheet

```bash
# Start development server
docker-compose up dev

# Start production server
docker-compose up prod

# Rebuild and start
docker-compose up --build dev

# Run build only
docker-compose run build

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f dev

# Shell into running container
docker exec -it mdx-dev sh
```
