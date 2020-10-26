/* 
        🔥 Fireth API
        🕶 (C) 2020 EthSagan. All rights reserved.
*/

const d3 = require("d3");
const whois = require("whois-api");
var compression = require('compression');
const exec  = require('child_process').exec;
const express = require("express");
const app = express();
app.use(compression());
var config = require("./config")();
const MongoClient = require('mongodb').MongoClient;
const uriDB = config.uriDB;
const PORT = config.PORT;
const ROWLIMIT = config.ROWLIMIT; //last week
const client = new MongoClient(uriDB, { useNewUrlParser: true, useUnifiedTopology: true });

var collection;
var collectionETH;
//require('newrelic');

console.log('🔥 Welcome to Fireth API');

client.connect(erro => {
    app.get('/gas', (req, res, next) => {
        let provider = req.query.pid;
        if (provider == null) {
            res.json("wrong params");
        } else {
            if (provider == "GN") collection = client.db("fireth").collection("barGN");
            if (provider == "EC") collection = client.db("fireth").collection("barEC");
            if (provider == "EG") collection = client.db("fireth").collection("barEG");
        }
        console.log("...conectado a bbdd");
        try {
            console.log("peticion recibida...");
            collection.find({}).limit(ROWLIMIT).toArray(function (err, result) {
                console.log("adentro de collection...");
                if (err) {
                    console.log("error en coleccion: " + err.stack);
                    throw err
                }
                console.log(new Date() + " Peticion entregada...");
                let data = result.map(_o => new Array(_o.d, _o.ftO, _o.ftH, _o.ftL, _o.ftC, _o.fsO, _o.fsH, _o.fsL, _o.fsC, _o.stO, _o.stH, _o.stL, _o.stC, _o.saO, _o.saH, _o.saL, _o.saC))
                res.set('Access-Control-Allow-Origin', "*")
                res.set('Access-Control-Allow-Methods', 'GET, POST')
                res.json(data);
                console.log("--" + new Date() + " Fin de todo.");
            });
        }
        catch (e) {
            console.log(e.message)
        }
    });

    app.get('/eth', (req, res, next) => {
        collectionETH = client.db("fireth").collection("barETH");
        console.log("...conectado a bbdd");
        try {
            console.log("peticion ETH recibida...");
            collectionETH.find({}).limit(ROWLIMIT).toArray(function (err, result) {
                console.log("adentro de collection...");
                if (err) {
                    console.log("error en coleccion: " + err.stack);
                    throw err
                }
                console.log(new Date() + " Peticion entregada...");
                let rr = result.map(_o => new Array(_o.d, _o.O, _o.H, _o.L, _o.C))
                res.set('Access-Control-Allow-Origin', "*")
                res.set('Access-Control-Allow-Methods', 'GET, POST')
                res.json(rr);
                console.log("--" + new Date() + " Fin de todo.");
            });
        }
        catch (e) {
            console.log(e.message)
        }
    });

});

app.get('/w', (req, res, next) => {
    let _url = req.query.url;


    const subprocess = exec('whois ' + _url);
    let stdout = "";
    subprocess.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    subprocess.stdout.on('end', () => {
      console.log(`stdout: ${stdout}`); // stdout is now complete
      res.set('Access-Control-Allow-Origin', "*")
      res.set('Access-Control-Allow-Methods', 'GET, POST')
      res.json(stdout.toString());
    });
});

app.listen(PORT, () => {
    console.log(`Fireth server running on port ${PORT}`);
});

module.exports = {
    app
}






