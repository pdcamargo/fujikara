#!/usr/bin/env node
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import serverEntry from './dist/server/server.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

async function serveStaticFile(pathname, res) {
  try {
    // Try serving from dist/client first (built assets)
    let filePath = join(__dirname, 'dist/client', pathname)
    let content

    try {
      content = await readFile(filePath)
    } catch {
      // If not found in dist/client, try public directory
      filePath = join(__dirname, 'public', pathname)
      content = await readFile(filePath)
    }

    const ext = extname(pathname).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    res.end(content)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const pathname = url.pathname

    // Debug endpoint to check content availability
    if (pathname === '/__debug/content') {
      const { readdirSync, existsSync } = await import('fs')
      const debugInfo = {
        contentCollectionsExists: existsSync('.content-collections'),
        contentCollectionsDirs: existsSync('.content-collections') ? readdirSync('.content-collections', { withFileTypes: true }).map(d => d.name) : [],
        mdxDirExists: existsSync('mdx'),
        mdxFiles: existsSync('mdx') ? readdirSync('mdx', { recursive: true }) : [],
        distExists: existsSync('dist'),
        publicExists: existsSync('public'),
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(debugInfo, null, 2))
      return
    }

    // Try serving static files first
    if (pathname.startsWith('/assets/') || pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)) {
      const served = await serveStaticFile(pathname, res)
      if (served) return
    }

    // Otherwise, pass to TanStack Start SSR handler
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    })

    const response = await serverEntry.fetch(request)

    res.writeHead(response.status, Object.fromEntries(response.headers))

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }

    res.end()
  } catch (error) {
    console.error('Server error:', error)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`)
})
