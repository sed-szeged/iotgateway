import paho.mqtt.client as mqtt
import pymongo
from datetime import datetime

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected to mauthp with result code "+str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    print("Subscribeing to #")
    client.subscribe("#")
    print("Subscribed to #")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print("on_message "+msg.topic+" "+str(msg.payload))
    log_dict = { "datetime" : datetime.now(), "topic": msg.topic, "payload": str(msg.payload) }
    #print("saving to logdb...")
    mongo_client['logdb']['logs'].insert_one(log_dict)
    print("saved to logdb "+msg.topic+" "+str(msg.payload))


print("Connecting to mongodb://logdb:27017/")
mongo_client = pymongo.MongoClient("mongodb://logdb:27017/")
print("Connected to logdb")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.username_pw_set("iotgatewaylogger", password="iotgatewaylogpass")
print("Connecting to mauthp")
client.connect("mauthp", 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()
