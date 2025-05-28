# Activate Text to Knowledge Graph Backend

## Description

Backend for the Activate Text to Knowledge Graph project. The backend is responsible for performing requests to the various LLMs and other APIs used for verification and storage purposes.

## Setup

Install packages using npm:

```sh
npm install
```

Create a `.env` file for the needed environment variables and fill it with the correct values based on the example file. After that the backend can be started.

### Prerequisites

Node.js and npm are required to run the backend. The backend was developed using Node.js 20.19.0. If you wish to use local Large Language Models (LLMs) you must install [Ollama](https://ollama.com/) and have it running in the background. Whatever models you wish to use must already be downloaded but not necessarily running. All models found using `ollama list` in the temrinal will be available to the frontend.

#### Environment Variables

```
# Port
BACKEND_PORT=<PORT>

# Local LLMS
OLLAMA_URL=<URL>
OLLAMA_PORT=<PORT or FALSE if routing through a proxy>

# LLM API data
GEMINI_API_KEY=<API_KEY>

# Activate Backend
ACTIVATE_URL=<URL>
ACTIVATE_PORT=<PORT or FALSE if routing through a proxy>

# Azure
AZURE_OPENAI_URL="<Azure Resource URL>"
AZURE_OPENAI_KEY="<Azure Resource Key>"
AZURE_DEPLOYMENT="<Azure Deployment Name>"
AZURE_OPENAI_VERSION="<Api Version - Current: 2025-04-01-preview>"

# OpenRouter
OPENROUTER_KEY="<OpenRouter Api Key>"

```

##### Development Mode

```
npm i
npm run dev
```

##### Build and Start

```
npm i
npm run build
npm run start
```

or

```
npm i
npm run build-start
```

## Documentation

The documentation is generated using [Swagger](https://swagger.io/). The documentation can be found at the `/docs` endpoint after starting the backend.
