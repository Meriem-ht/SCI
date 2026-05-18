import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

export const createMQTTClient = (
  address,
  clientId,
  onConnect,
  onFailure,
  onMessageArrived,
  onConnectionLost
) => {
  const client = new Paho.MQTT.Client(address, clientId);

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
    onSuccess: onConnect,
    useSSL: false,
    timeout: 3,
    onFailure,
  });

  return client;
};

export const subscribeTopic = (client, topic) => {
  client.subscribe(topic, { qos: 0 });
};

export const sendMessage = (client, msg, topic) => {
  const messageObj = new Paho.MQTT.Message(msg);
  messageObj.destinationName = topic;
  client.send(messageObj);
};