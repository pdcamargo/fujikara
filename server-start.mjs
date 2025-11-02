#!/usr/bin/env node
import { createServer } from 'http'
import serverEntry from './dist/server/server.js'

const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)

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
