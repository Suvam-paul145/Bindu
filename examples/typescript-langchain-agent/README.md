# TypeScript LangChain Agent

A research assistant built with [LangChain.js](https://js.langchain.com/) and bindufied using the Bindu TypeScript SDK.

## Prerequisites

- Node.js >= 18
- Python >= 3.12 with Bindu installed (`pip install bindu[grpc]`)
- OpenAI API key

## Setup

```bash
cp .env.example .env
# Edit .env with your OpenAI API key

npm install
```

## Run

```bash
npm start
```

This will:
1. Start the Bindu Python core in the background
2. Register the agent with DID identity and A2A endpoints
3. Start listening for tasks

## Send a message

```bash
curl -X POST http://localhost:3773 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "message/send",
    "params": {
      "message": {
        "role": "user",
        "parts": [{"kind": "text", "text": "What is the A2A protocol?"}],
        "messageId": "msg-1",
        "contextId": "ctx-1",
        "taskId": "task-1"
      }
    },
    "id": "1"
  }'
```
