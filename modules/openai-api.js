import OpenAI from 'openai'
import { config } from 'dotenv'
import random from 'random';

// eslint-disable-next-line no-unused-vars
const CONFIG_ENV = config()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // defaults to process.env["OPENAI_API_KEY"]
})

const POKEMON_LIST = [
  'venusaur', 'charizard', 'blastoise', 'butterfree', 'beedrill', 'pidgeot', 'raticate', 'arbok', 'raichu',
  'sandslash', 'nidoqueen', 'nidoking', 'clefable', 'ninetales', 'wigglytuff', 'golbat', 'vileplume', 'parasect',
  'venomoth', 'dugtrio', 'persian', 'golduck', 'primeape', 'arcanine', 'poliwrath', 'alakazam', 'machamp', 'victreebel',
  'tentacruel', 'golem', 'rapidash', 'slowbro', 'magneton', 'farfetchd', 'dodrio', 'dewgong', 'muk', 'cloyster', 'gengar',
  'onix', 'hypno', 'kingler', 'electrode', 'exeggutor', 'marowak', 'hitmonlee', 'hitmonchan', 'lickitung', 'weezing',
  'rhydon', 'chansey', 'tangela', 'kangaskhan', 'seadra', 'seaking', 'starmie', 'mr-mime', 'scyther', 'jynx', 'electabuzz',
  'magmar', 'pinsir', 'tauros', 'gyarados', 'lapras', 'ditto', 'vaporeon', 'jolteon', 'flareon', 'porygon', 'omastar',
  'kabutops', 'aerodactyl', 'snorlax', 'articuno', 'zapdos', 'moltres', 'dragonite', 'mewtwo', 'mew'
];

function pickRandomPokemons(pokemonList, num) {
  const totalPokemonCount = pokemonList.length;

  if (num > totalPokemonCount) {
    throw new Error('The number of random elements requested is greater than the total number of elements.');
  }

  const randomIndices = [];
  const selectedPokemonList = [];

  // Generate distinct random indices
  while (randomIndices.length < num) {
    const randomIndex = random.int(0, totalPokemonCount - 1);
    if (!randomIndices.includes(randomIndex)) {
      randomIndices.push(randomIndex);
    }
  }

  // Get the selected Pokémon
  randomIndices.forEach(index => {
    selectedPokemonList.push(pokemonList[index]);
  });

  return selectedPokemonList;
}

const POKEMON_PROMPT = `
IMAGE: ![pollinations](https://img.pokemondb.net/sprites/black-white/anim/normal/{POKEMON}.gif) (HP: {HP}%)

1. THE FOLLOWING is a list of {POKEMON}, ALWAYS put the list in a DIFFERENT ORDER and REPLACE the {POKEMON} part of {IMAGE} with the first {POKEMON} on the list even for subsequent instance of {POKEMON} in this prompt:

${pickRandomPokemons(POKEMON_LIST, 6)}

2. Put the list in a new DIFFERENT ORDER every time a {POKEMON} is pulled from it.

3. You will then ALWAYS start:

"Welcome to the battle factory. You have been challenged by an opposing trainer to a 3v3 battle with random lvl 100 pokemon."

"The trainer has" {IMAGE}

"You have" {IMAGE}

4. You are to act as a text based game, aka interactive fiction.

5. D0 NOT EXPLAIN THE GAME OR ANY OF THE PARAMETERS.

6. Description: In this game, the player and trainer will BOTH have EXACTLY 3 {POKEMON}. The players will battle. The game ends when all the {POKEMON} from one side lose all their hp and FAINT. {POKEMON} cannot be field after they FAINT. ONLY 1 POKEMON should be fielded for each side at a time. The game starts with both players having 1 of their 3 pokemon fielded with the options of:

- Switch to another pokemon

- Attack

7. Switch to another pokemon EXPLAINED:

The player has a 2nd slot {POKEMON} and a 3rd slot {POKEMON}, THIS MEANS ONLY 2 {POKEMON} can EVER switch in, NEVER any number greater than 2. After switching, the previously fielded {POKEMON} now occupies this slot and the new {POKEMON} is fielded. If a pokemon FAINTS, it does not occupy a slot and the total number of {POKEMON} on the team are reduced by 1.

8. Attack EXPLAINED:

The fielded {POKEMON} will have ALWAYS have 4 moves that are from the games, These ARE NOT named move but actual attacks from the games, NEVER attack without letting the player pick a move first.

Actions costs a TURN with the opposing trainer also ALWAYS taking a TURN at the same time and DAMAGING the user player. 

You will then ALWAYS ANSWER "The trainer has now HP" and "Your pokemon name have now HP".

9. Battle mechanics:

{POKEMON} are the same TYPE they are in the pokemon games.

Moves ALWAYS obey the TYPE EFFECTIVENESS chart. UNDER NO CIRCUMSTANCES should a move be supereffective unless it would actually be supereffective

Any other move constraints such as accuracy and power are preservered.

{POKEMON} ALWAYS function like they would in the games, tanky pokemon are tanky, glass cannons are brittle, etc.
`

function parsePollinationString (inputString) {
  // Extract the percentage
  const percentageRegex = /\(HP: (\d+)%\)/
  const percentageMatch = inputString.match(percentageRegex)
  const hpPercentage = percentageMatch ? parseInt(percentageMatch[1]) : null

  // Extract the URL link
  const urlRegex = /\(([^)]+)\)/
  const urlMatch = inputString.match(urlRegex)
  const imageUrl = urlMatch ? urlMatch[1] : null

  const urlParts = imageUrl ? imageUrl.split('/') : null
  const lastPart = urlParts ? urlParts[urlParts.length - 1] : null

  // Remove the file extension (".gif" in this case)
  const pokemonName = lastPart ? lastPart.replace(/\.\w+$/, '') : null

  const statusRegex = /HP: (\d+)%,\sSTATUS:\s([^)]+)/
  const statusMatch = inputString.match(statusRegex)
  const status = statusMatch ? statusMatch[2] : null
  return {
    pokemon: pokemonName ?? '',
    image: imageUrl ?? '',
    lifePercentage: hpPercentage,
    status
  }
}

function generatePokemonImage (pokemon) {
  return `https://img.pokemondb.net/sprites/black-white/anim/normal/${pokemon}.gif`
}

async function chatWithAi (chat) {
  const chatCompletion = await openai.chat.completions.create({
    messages: chat,
    model: 'gpt-3.5-turbo',
    temperature: 0
  }).catch(err => console.error(err))

  if (chatCompletion) {
    return chatCompletion.choices[0].message.content
  } else {
    console.error('Translation not found in the response')
    return null
  }
}

export async function pokemonGame (userInput, conversation) {
  const chatRecord = []

  if (conversation.length <= 0) { 
    conversation = [
      { 
        role: 'system', 
        content: POKEMON_PROMPT 
      }
    ]
  }

  conversation.push({ role: 'user', content: userInput })

  if (conversation.length >= 20) {
    conversation = []
    return {
      record: conversation,
      messages: [{
        type: 'operator',
        message: 'assistant',
        content: 'Game ended'
      }]
    }
  }

  const chat = await chatWithAi(conversation)

  if (!chat) return [ERROR_MESSAGE]
  
  const mssgs = chat.split('\n')

  const pokemonPattern = new RegExp(`\\b(${POKEMON_LIST.join('|')})\\b`, 'i');
  const hpPattern = /(\d+)%/;
  const indexPattern = /^\d+\./;

  mssgs.forEach(message => {
    if (message.length <= 0) return

    if (/!\[[^\]]+\]/.test(message)) {
      const data = parsePollinationString(message)
      chatRecord.push({
        type: 'operator',
        message: 'pokemon-message',
        content: '',
        objectContent: data
      })
      return
    }
    
    const match = message.match(pokemonPattern);
    const hpMatch = message.match(hpPattern);
    const indexMatch = message.match(indexPattern);

    if ((match && hpMatch) || (match && indexMatch)) {
        const pokemonName = match[0].toLowerCase();
        const hp = hpMatch ? parseInt(hpMatch[1], 10) : null;
        chatRecord.push({
          type: 'operator',
          message: 'pokemon-message',
          content: '',
          objectContent: {
            pokemon: pokemonName ?? '',
            image: generatePokemonImage(pokemonName),
            lifePercentage: hp,
            status: null
          }
        })
        return
    }
    

    chatRecord.push({
      type: 'operator',
      message: 'assistant',
      content: message
    })
  })

  conversation.push({ role: 'assistant', content: chat })

  return {
    record: conversation,
    messages: chatRecord
  }
}