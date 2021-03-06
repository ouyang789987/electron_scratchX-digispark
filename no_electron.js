'use strict'

// check versions
// console.dir(process.versions)

const fs = require('fs');

const url = require('url');
const qs = require('querystring');

const ds = require('./digispark.js');
let ds_flag;

const PORT = 40410;
let sendCount = 0;
let timer = Date.now();

const server = require('http').createServer();

server.listen(PORT, createWindow);

server.on('request', (req, res) => {
  let urlObj = url.parse(req.url, true);
  if(urlObj.pathname == "/myscratch.js"){
    fs.readFile(`${__dirname}/myscratch.js`, (err, file) => {
      res.writeHead(200, {"Content-Type": "text/javascript"});
      res.end(file);
    });
  }
  else if(urlObj.pathname == "/blink" && req.method == "POST"){
    let now = Date.now();
    if(now - timer < 1000){
      sendCount++;
    }else{
      timer = now;
      sendCount = 0;
    }

    let body = "";
    req.on('data', data => {
      body += data;
    })
    req.on('end', () => {
      let q = qs.parse(body);
      let r, g, b;
      r = Math.round(q['red']);
      g = Math.round(q['green']);
      b = Math.round(q['blue']);
      // check whether digits or others
      if (sendCount < 10
          && typeof r == "number"
          && typeof g == "number"
          && typeof b == "number")
      {
        r = r < 0 ? 0 : r;
        g = g < 0 ? 0 : g;
        b = b < 0 ? 0 : b;

        r = r > 255 ? 255 : r;
        g = g > 255 ? 255 : g;
        b = b > 255 ? 255 : b;

        if(ds_flag) ds.sendRGB([r, g, b]);
        // win.webContents.insertCSS(
        //   "body {background: #" +
        //     ("0" + r.toString(16)).slice(-2) +
        //     ("0" + g.toString(16)).slice(-2) +
        //     ("0" + b.toString(16)).slice(-2) + "}"
        // );
      } else {
        console.error("bad query");
      }
    });
    res.end();
  }
  else {
    res.statusCode = 404;
    res.end("Not Found. check URL.");
  }
});

function createWindow() {
  if (ds.getDevice()){
    ds_flag = true;
    ds.open();
    console.log("ACCESS to following URL");
    console.log(`http://scratchx.org/?url=http://localhost:${PORT}/myscratch.js`);
  } else {
    ds_flag = false;
    console.log("NOT FOUND Digispark!");
  }
}
