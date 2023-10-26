import express, { json } from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import verifyToken from "./middleware/auth.mjs";
import { pokemonGame } from "./modules/openai-api.mjs";

dotenv.config()

// Constants
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGIN_URL || [] 

let urls = ALLOWED_ORIGINS.match(/'([^']+)'/g)
console.log("🚀 ~ file: app.mjs:13 ~ urls:", urls)

// Create http server
const app = express()

app.use(
  cors({ 
    origin: urls.map(
      url => url.replace(/'/g, '')
    )
  })
)

app.use(json({ limit: "50mb" }));

app.post('/game', verifyToken, async (req, res) => {
  try {
    const { message, record } = req.body.content;
    await pokemonGame(message, record)
    .then((preview) => {
      if (preview) {
        res.status(200).send({
          content: preview
        });
      } else {
        console.log(preview);
        res.status(400).json({ message: 'Empty responce from API.' })
        ;
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ message: 'Internal server error.', error: error})
    });
  } catch (error) { 
    res.status(400).json({ message: 'Content is required.', error }) 
  }
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

app.get('/heartbeat', (req, res) => {
  res.status(200)
});

export default app;
