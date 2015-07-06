# mstsc.js

![Mstsc.js Logo](./img/mstsc.js.png)

Mstsc.js is pure javascript Microsoft RDP (Remote Desktop Client) client using nodejs, [**node-rdp**](https://github.com/citronneur/node-rdp) and socket.io. It allows you to connect to any terminal server compatible application, through web browser (optimized for firefox, compatible with chrome and internet explorer 11).

![](./img/mstsc.js.login.png)

![](./img/mstsc.js.connect.png)

![](./img/mstsc.js.explorer.png)

## Cozy-Cloud

Mstsc.js is compatible with cozy-cloud store.

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[**Cozy**](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you.

## Install

Install last release : 

```
npm install mstsc.js
```

Install last dev commit : 

```
git clone https://github.com/citronneur/mstsc.js
npm install
node server.js
```

## How does it works ?

### Frontend

Frontend application use socket.io and canvas for binding with mstsc.js backend. The front-end is in charge of bitmap decompression trough rle.js file. This file is generated by [**Emscripten**](https://github.com/kripken/emscripten) from [rle.c](https://raw.githubusercontent.com/citronneur/mstsc.js/master/obj/rle.c) which come from rdesktop source.

### Backend

Backend application use nodejs, express and socket.io as web server. Main goal of backend is be a proxy betwwen web browser and terminal server. It use [**node-rdp**](https://github.com/citronneur/node-rdp) for rdp client.


