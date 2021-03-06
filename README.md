# coesite2
vector tile server (mbtiles with Azure AD authentication)  

## install
```console
git clone https://github.com/ubukawa/coesite2
cd coesite2
npm install
(edit config, store data, etc..)
npm start
```
## Run
### Config setting
Edit .env and config/default.hjson to provide necessary confit setting.

```
OAUTH_CLIENT_ID=Your APP/Client ID
OAUTH_CLIENT_SECRET=Your secret
OAUTH_REDIRECT_URI=https://yourdomain/unvt/auth/callback
OAUTH_SCOPES='user.read'
OAUTH_AUTHORITY=https://login.microsoftonline.com/(your place)/
```

```
{
 morganFormat: tiny
 htdocsPath: public
 privkeyPath: key-location/privkey.pem
 fullchainPath: key-location/cert.pem
 logDirPath: log
 port: 443
 tz:{
  unosm: 6
 }
 sTileName:{
  unosm: small-scale
 }
 defaultZ: 6
 mbtilesDir: mbtiles
 esriDir: esri
 esri-tilemap-min:{
  ne-test: 0
  }
 esri-tilemap-max:{
  ne-test: 5
  }

}
```
### Start server
node app.js  
 or  
./pmserve.sh

To stop, run ./pmstop.sh  
(Please make sure that you have the permission to execute sh scripts.)

sh containts sudo because I needed it in my own environment.

## Structure
top page will be https://(your domain)/unvt  
Tile will be served from https://(your domain)/unvt/VT/zxy/{t}/{z}/{x}/{y}.pbf  

## Tips
If your node is not allow to use port 443, try  

```console
which node
sudo setcap cap_net_bind_service=+ep (your location)/bin/node
```


