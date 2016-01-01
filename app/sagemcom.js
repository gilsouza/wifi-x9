"use strict";

const md5 = require('md5');
const request = require('request');

var sessionReg = new RegExp("parameters\":{\"id\":([^,]+)", "g");
var nonceReg = new RegExp("parameters\":{\"id\":[^,]+,\"nonce\":\"([^\"]+)", "g");

class Sagemcom {
	constructor(user, pwd) {
		this.connected = false;
		this.requestID = 0;
		this.sessionID = 0;
		this.nonce = null;
		this.user = user;
		this.pwd = md5(pwd);
		this.io = null;
	}

	isConnected() {
		return this.connected;
	}

	_extractParams(body) {
		let s = sessionReg.exec(body);
		let o = nonceReg.exec(body);

		if (s && o) {
			this.sessionID = s[1];
			this.nonce = o[1];
		}
	}

	init(io) {
		let _this = this;

		_this.io = io;
		_this.authenticate();
	}

	authenticate() {
		if (this.connected) return;

		let _this = this;

		this.requestID = 0;

		let hashCredentials = md5(this.user+"::"+this.pwd);
		let nonce = Sagemcom.random();
		let authKey = md5(hashCredentials+":0:"+nonce+":JSON:/cgi/json-req");
		let form = {"request":{"id":this.requestID++,"session-id":"0","priority":true,"actions":[{"id":0,"method":"logIn","parameters":{"user":"admin","persistent":"true","session-options":{"nss":[{"name":"gtw","uri":"http://sagem.com/gateway-data"}],"language":"ident","context-flags":{"get-content-name":true,"local-time":true},"capability-depth":2,"capability-flags":{"name":true,"default-value":false,"restriction":true,"description":false},"time-format":"ISO_8601"},"timeout":1800}}],"cnonce":nonce,"auth-key":authKey}};

		request.post({url: 'http://192.168.25.1/cgi/json-req', form: {req: JSON.stringify(form)}}, (err, response, body) => {
			if (err)
				console.log("houve um erro!!!");

			_this._extractParams(body);
			setTimeout(_this.listWifiConnected, 1000);
		});
	}

	listWifiConnected() {
		// if (!this.connected) this.authenticate();
		let _this = this;

		let conce = Sagemcom.random();
		let authKey = md5(md5("admin:"+this.nonce+":"+this.pwd)+":"+this.requestID+":"+conce+":JSON:/cgi/json-req");		
		let form = {"request":{"id":this.requestID++,"session-id":this.sessionID,"priority":false,"actions":[{"id":0,"method":"getValue","xpath":"Device/Hosts/Hosts[Active=true]"}],"cnonce":conce,"auth-key":authKey}};

		request.post({url: 'http://192.168.25.1/cgi/json-req', form: {req: JSON.stringify(form)}}, (err, response, body) => {
			if (err)
				console.log("houve um erro!!!");

			console.log(body);
		});
	}

	static random() {
		return Math.floor(4294967295 * (Math.random() % 1));
	}

	static md5(text) {
		return md5(text);
	}
}

module.exports = Sagemcom;