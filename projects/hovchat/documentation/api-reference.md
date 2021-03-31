FORMAT: 1A
HOST: http:/localhost:8000

# HOV Chat

Welcome to the **HOV Chat** API. This API provides access to the **HOV Chat** service.

# Persons [/persons]

Resources in here are related to **HOV Chat** persons.

## Create a Person [POST]

- Attributes

  - id (string) - Id of the person

- Request (application/json)

  - Headers

        Integration-Key: integration key

- Response 201

  - Body

          true

## Delete a Person [DELETE /persons/{id}]

- Parameters

  - id (string) ... Id of the person

- Request (application/json)

  - Headers

        Integration-Key: integration key

- Response 200
  true

# Channels [/channels]

Resources in here related to **HOV Chat** channels.

- Model

       {
          "id": "channel_1",
          "integration": "integration key",
          "persons": [
              "f0d8368d-85e2-54fb-73c4-2d60374295e3",
              "b1e2641h-10m6-77ed-96a2-2d60376297b2",
          ]
        }

## Retrieve Channels [GET]

- Request (application/json)

  - Headers

        Integration-Key: integration key

- Response 200

  [Channels][]

## Create a Channel [POST]

- Attributes

  - id (string) - Id of the channel
  - persons (array) - Ids of persons

- Request (application/json)

  - Headers

        Integration-Key: integration key

- Response 201

  - Body

          true

## Delete a Channel [DELETE /channels/{channelId}]

- Parameters

  - channelId (string) ... Id of the channel

- Request (application/json)

  - Headers

        Integration-Key: integration key

- Response 200
  true

## GET Unread Count [GET /channels/{channelId}/unread-count]

- Parameters

  - channelId (string) ... Id of the channel

- Request (application/json)

  - Headers

        Authorization: Bearer token

- Response 200
  {
  "id": "ad3f2eec-13db-4c9c-a787-6b39b27c9048",
  "channel": "channel1",
  "person": "person1"
  "count": 3,
  }

## Mark as Read [PUT /channels/{channelId}/mark-read]

- Parameters

  - channelId (string) ... Id of the channel

- Request (application/json)

  - Headers

        Authorization: Bearer token

- Response 200
  true

## Add React [PUT /channels/{channelId}/message/{messageId}/react]

- Parameters

  - channelId (string) ... Id of the channel
  - messageId (string) ... Id of the message

- Attributes

  - reaction (string) - name of the reaction

- Request (application/json)

  - Headers

        Authorization: Bearer token

- Response 200
  true

## Remove React [DELETE /channels/{channelId}/message/{messageId}/react]

- Parameters

  - channelId (string) ... Id of the channel
  - messageId (string) ... Id of the message

- Attributes

  - reaction (string) - name of the reaction

- Request (application/json)

  - Headers

        Authorization: Bearer token

- Response 200
  true

# Channel Messages [/channels/{channelId}/message]

Resources in here related to **HOV Chat** channel messages.

- Model

       {
          "body": "Hello!",
          "channel": "channel1",
          "id": "9a263ae9-69e7-4b30-ba5d-c9750bfd2e38",
          "integration": "integration key",
          "sender": "1234"
        }

## Retrieve Channel Messages [GET]

- Parameters

  - channelId (string) ... Id of the channel

- Request (application/json)

  - Headers

        Authorization: Bearer token

- Response 200

  [Channel Messages][]

## Post Channel Message [POST]

- Parameters

  - channelId (string) ... Id of the channel

- Attributes

  - body (string) - message

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 201

  - Body

          true

## Delete Channel Message [DELETE /channels/{channelId}/message/{messageId}]

- Parameters

  - channelId (string) ... Id of the channel
  - messageId (string) ... Id of the message

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200
  true

# Direct Messages [/direct-message/{recipient}]

Resources in here related to **HOV Chat** direct messages.

- Model

       {
          "body": "Hello!",
          "channel": "person1:person2",
          "id": "9a263ae9-69e7-4b30-ba5d-c9750bfd2e38",
          "integration": "integration key",
          "sender": "person1"
        }

## Retrieve Direct Messages [GET]

- Parameters

  - recipient (string) ... Id of the receiver person

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200

  [Direct Messages][]

## Post Direct Message [POST]

- Parameters

  - recipient (string) ... Id of the receiver person

- Attributes

  - body (string) - message

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 201

  - Body

          true

## Delete Direct Message [DELETE /direct-message/{recipient}/{message}]

- Parameters

  - recipient (string) ... Id of the receiver person
  - message (string) ... Id of the message

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200
  true

# Contacts [/contacts/]

Resources in here related to **HOV Chat** contacts.

- Model

       {
          "contacts": [
              "person2"
          ],
          "cursorDateTimeCreated": "klpxis3v",
          "dateTimeCreated": "2021-03-01T01:54:28.939Z",
          "dateTimeUpdated": "2021-03-01T01:54:28.939Z",
          "deleted": false,
          "id": "b0e9c616-e94c-4a86-b616-e2cc8037f175",
          "integration": "integration key",
          "person": "person1"
        }

## Retrieve Contacts [GET]

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200

  [Contacts][]

## Add Contact [POST /contacts/{personId}]

- Parameters

  - personId (string) ... Id of the person

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 201

  - Body

          true

## Delete Contact [DELETE /contacts/{personId}]

- Parameters

  - personId (string) ... Id of the person

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200
  true

# Authentication [/authenticate]

Resource in here related to **HOV Chat** authentication.

## Authenticate [POST]

- Attributes

  - person (string) - id of the person

- Request (application/json)

  - Headers

        Integration-Key: integration key

- Response 201

  - Body

          { "token": "authorization token"}

# Attachments [/attachments/{channel}]

Resource in here related to **HOV Chat** attachments.

- Model

       {
          "id": "77a77bfe-d0a3-4c0f-8b31-7ed86d9386e4",
          "channel": "channel1",
          "integration": "f232a6e0-c656-44db-a8d1-dc547395e135",
          "person": "person1"
          "path": "attachments\\file.txt",
          "filename": "file.txt",
          "cursorDateTimeCreated": "km46tozm",
          "dateTimeCreated": "2021-03-11T01:23:41.122Z",
          "dateTimeUpdated": "2021-03-11T01:23:41.122Z","
        }

## Upload Attachments [POST]

- Parameters

  - channel (string) ... Id of the channel

- Request (multipart/form-data, boundary=AaB03x)

  - Headers

        Authorization: Bearer token

  - Body
    --AaB03x
    content-disposition: form-data; name="field1"

    $field1
    --AaB03x--

- Response 201

  - Body

          ["attachment id"]

## Get Attachments [GET]

- Parameters

  - channel (string) ... Id of the channel

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200

  [Attachments][]

## Get File [GET /attachments/file/{id}]

- Parameters

  - id (string) ... Id of the attachments

- Request (application/json)

  - Headers

        Authrozation: Bearer token

- Response 200

# Socket IO Connection [/]

```

import { io } from 'socket.io-client';

const socketUrl = `ws://localhost:${process.env.SOCKET_PORT || 8001}`;

const socket = io(socketUrl, {
  auth: {
    token: 'authorization token',
  },
});


socket.on('connect', listenerFunction);

```

# Socket IO Subscribe to Channel [/]

```

socket.emit('subscribe', <channel_id>, callback);

```

# Socket IO Message Events [/]

Retrieves created/updated/deleted message from a subscribed channel

```
socket.on('messageCreated', listenerFunction);

socket.on('messageUpdated', listenerFunction);

socket.on('messageDeleted', listenerFunction);

```

# Socket IO Channel Events [/]

Retrieves updated or deleted channel data

```
socket.on('channelUpdated', listenerFunction);

socket.on('channelDeleted', listenerFunction);


```

# Socket IO Person Events [/]

Retrieves updated channel data

```
socket.on('personUpdated', listenerFunction);


```
