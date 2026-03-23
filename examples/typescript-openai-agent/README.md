# TypeScript OpenAI Agent

An assistant built with the [OpenAI SDK](https://github.com/openai/openai-node) and bindufied using the Bindu TypeScript SDK.

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
        "parts": [{"kind": "text", "text": "Explain async/await in TypeScript"}],
        "messageId": "msg-1",
        "contextId": "ctx-1",
        "taskId": "task-1"
      }
    },
    "id": "1"
  }'
```
