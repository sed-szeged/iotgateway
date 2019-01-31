# IoTGateway

The IoTGateway application is based on a [Mosquitto](https://mosquitto.org/) [MQTT](http://mqtt.org/) broker with an [authentication plugin](https://github.com/jpmens/mosquitto-auth-plug) and ACL checks. It also contains a [node.js](https://nodejs.org/en/) application to provide a web interface for device management. All componenets are Dockerized, and defined as services with [Docker-compose](https://docs.docker.com/compose/).

### Services:
 - mauthp
Mosquitto MQTT broker with auth plugin using authdb
 - mqttadmin
node.js web application for device management
 - authdb
Mongo database to store device data

## Usage
Start the services:
```sh
docker-compose up
```
The service addresses are:
 - webadmin 
localhost <or Docker Machine IP on Windows> :3000
 - mqtt
localhost  <or Docker Machine IP on Windows>  :1883
 - db
localhost  <or Docker Machine IP on Windows>  :27017

Stop the services:
```sh
docker-compose down
```

More useful commands at the [Update](#update) section

## Test
<Ubuntu>
Using MQTT clients:
 - [mosquitto_sub](https://mosquitto.org/man/mosquitto_sub-1.html)
 - [mosquitto_pub](https://mosquitto.org/man/mosquitto_pub-1.html)

Install client packages:
```sh
sudo apt install mosquitto_clients
```
Add a device on the webadmin page [localhost:3000](localhost:3000)

<img src="https://github.com/sed-szeged/iotgateway/raw/master/screenshots/create_device.png" width="720">

Subscribe to a topic (grant read permission `r` to the topic)
```sh
mosquitto_sub -u <USERNAME> -P <PASS> -t <TOPIC>
```
Example:
```sh
mosquitto_sub -u mydevice -P mypass -t /device/mytype/mydevice
```
Open another terminal and publish to the same topic (grant write permission `w` to the topic)
```sh
mosquitto_pub -u <USERNAME> -P <PASS> -t <TOPIC> -m <MSG>
```
Example:
```sh
mosquitto_pub -u mydevice -P mypass -t /device/mytype/mydevice -m "hello"
```
The mosquitto_sub terminal should show a `hello` message.

You could also test:
 - subscribe/publish without or wrong username and password
 - subscribe to a topic without granted read permission
 - publish to a topic without granted write permission

## Update a service
If you want to update only one service:
List the containers
```sh
docker-compose ps
```
Stop the service
```sh
docker-compose stop <service>
```
Delete it
```sh
docker-compose rm <service>
```
Build it
```sh
docker-compose build <service>
```
Start it again
```sh
docker-compose up -d --no-deps <service>
```
## Architecture / modifications

## TODO
 * update to Docker-compose v3
 * generate logger password from ENV, block new device creation with the logger name
 * compare with the official mosquitto Dockerfile https://github.com/eclipse/mosquitto/blob/master/docker/generic/Dockerfile
 * multistage build to minimalize the image size
 * move application to a standard location (/usr/bin/)
 * add security to authdb
 * logging with plugin instead of a client subscribe to all topics
 * show connected clients
 * show resent messages
 * REST API for device (batch) CRUD
 * secure REST API with users and permissions
 * add graph web application: real time and history data, multiple devices

