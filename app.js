"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const request = require('request');

const sagemcom = require('./app/sagemcom');

server.listen(3000);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendfile(__dirname + '/index.html');
});

let router = new sagemcom('admin', 'gvt12345');
router.init(io);

io.on('connection',  (socket) => {
	// socket.emit('news', { hello: 'world' });
	// socket.on('my other event', (data) => {
	// 	console.log(data);
	// });
});
