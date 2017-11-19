const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

// fake DB
var chains = []

// socket.io server
io.on('connection', socket => {
  socket.on('makeChain', (data) => {
    chains.push(data)
    socket.broadcast.emit('makeChain', data)
  })

  socket.on('updateChain', (data) => {
    for (let x = chains.length -1; x >-1 ; x-- ){
      if (chains[x].id == data.id){
        chains[x] = data;
      }
    }
    socket.broadcast.emit('updateChain', data);
  })
})

nextApp.prepare().then(() => {
  app.get('/chains', (req, res) => {
    const queryParams = { id: req.query.id}
    if (req.query.id){
      nextApp.render(req, res, '/chains' , queryParams)
    } else {
      res.json(chains)
    }
  })

  app.get('/chains:id', (req, res) => {
    const queryParams = { id: req.query.id}
    nextApp.render(req, res, '/chains' ,  queryParams)
  })

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
