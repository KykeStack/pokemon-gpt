import { createServer } from "http";
import app from "./app.mjs";

const server = createServer(app);

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 8080
const base = process.env.BASE || '/'

server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
