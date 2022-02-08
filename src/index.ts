import http, {IncomingMessage, ServerResponse} from 'http'
import path from 'path'
import fs from 'fs/promises'
import url from 'url'
import fetch from 'node-fetch'

interface Joke {
  id: string
  joke: string
  status: number
}

/**
 * It takes a request and a response object,
 * and it reads the html files from the src/static folder.
 * It replaces the {{joke}} placeholder on the joke page with the joke from the API.
 * @param {IncomingMessage} req - IncomingMessage
 * @param {ServerResponse} res - ServerResponse
 */
async function requestListener(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = url.parse(req.url ?? '')
  let data = ''
  let statusCode = 200
  try {
    let pathName = parsedUrl.pathname
    if (pathName === '/') pathName = '/index'
    const filePath = path.join(__dirname, `static${pathName}.html`)
    data = await fs.readFile(filePath, 'utf-8')
  } catch {
    data = await fs.readFile(path.join(__dirname, 'static/404.html'), 'utf-8')
    statusCode = 404
  }

  if (parsedUrl.pathname === '/dad-joke') {
    const response = await fetch('https://icanhazdadjoke.com', {
      headers: {
        accept: 'application/json',
        'user-agent': 'NodeJS Server',
      },
    })
    const joke: Joke = await response.json()
    data = data.replace(/{{joke}}/gm, joke.joke)
  }

  res.writeHead(statusCode, {
    'Content-type': 'text/html',
    'content-length': data.length,
  })
  res.write(data)
  res.end()
}

/* Create a server that listens on port 3000, and when a request comes in,
use the requestListener function to handle the request. */
http.createServer(requestListener).listen(3000, () => {
  console.log(`
  HTTP server listening on port 3000
  Link: http://localhost:3000
  `)
})
