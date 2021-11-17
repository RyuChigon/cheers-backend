# cheers-backend
2021 Fall CS473 Project: Watching Sports Service

<br />

## Members
Dain Kim

Chigon Ryu

Subin Kim

Huikyeong An

<br />

## How to run
```
npm install
npm start
```

<br />

## Main Framework
`Node Express v4.17.1`

`Socket.io  v4.3.1`

`mongoose v6.0.12`

`ffmpeg v0.0.4`

<br />

## File Summary
```
.
├── cors          : Include cors and path
├── database      : contents of mongodb, which is a database
├── models        : Schema of datas
├── routes        : response and request
│   └── admin.js  : res and req about admin
│   └── user.js   : res and req about admin
├── socket        : contents of socket
├── streaming     : contents of streaming service
└── server.js     : main backend file. 
                      If `npm start`, this file is implemented and database, 
                      socket and streaming are also connected.
```

## Port
- main server     : 9000
- socket          : 8080
- streaming(http) : 8000
- streaming(rtmp) : 1935

