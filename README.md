# Pokemon-GPT API Documentation

Welcome to the Pokemon-GPT API, an exciting text-based Pokemon adventure powered by GPT-3! 

## Getting Started

## Install

```
$ npm install
```

### Start Local
```
$ npm start 
```
## Environment Variables:


🔐 JWT_SECRET_KEY (openssl rand -hex 32)
This environment variable is meant to store a secret key for JSON Web Token (JWT) authentication or encryption.

For authentication and encryption purposes: IDS (Array: ["ids"]), DOMAINS (Array: ["domais"])

ALLOWED_ORIGIN_URL (Array: ["urls"] : The URL's allowed to access the API endpoints


See also the example.env 🔍

To interact with the Pokemon-GPT API, follow these steps:

### Prerequisites

- You should have a JWT (JSON Web Token) ready to authenticate your requests.

### Usage

1. **Base URL:** `http://localhost:8080/game`

2. **Authentication:** Make sure to include your JWT as a Bearer token in the request headers.

3. **Request Body:** Send an empty JSON object `{ content: { message: string, record: messages[] }` as the request body. The API leverages GPT-3 to process your input and respond accordingly.

4. **Endpoints:**

    - `POST /game`: Start or continue your Pokemon adventure. Send an empty JSON object to this endpoint, and receive a text-based response guiding your journey.

5. **Example cURL Request:**

The record is empty at the start, needs to be passed return records to keep memory.

```bash
curl -X POST http://localhost:8080/game \
-H "Authorization: Bearer YOUR_JWT_HERE" \
-d '`{ content: { message: 'Hello World', record: [] }'
