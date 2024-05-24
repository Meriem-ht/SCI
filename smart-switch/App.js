import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { IconButton, Provider as PaperProvider } from 'react-native-paper';
import init from 'react_native_mqtt';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const options = {
  host: 'broker.emqx.io',
  port: 8083,
  path: '/mqtt',
  id: 'id_' + parseInt(Math.random() * 100000),
};

let client; // Declare client variable here

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const App = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [intensity, setIntensity] = useState(75);
  const [schedule, setSchedule] = useState({ from: '5:00 pm', to: '10:00 pm' });
  const [status, setStatus] = useState('Disconnected');
  const [topic, setTopic] = useState('smart-led/status');
  const [subscribedTopic, setSubscribedTopic] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    client = new Paho.MQTT.Client(options.host, options.port, options.path, options.id);

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('onConnectionLost:' + responseObject.errorMessage);
        setStatus('Disconnected');
      }
    };

    client.onMessageArrived = (message) => {
      console.log('Message received:', message.payloadString);
    };

    connect();

    return () => {
      client.disconnect();
    };
  }, []);

  const connect = () => {
    setStatus('Connecting');
    client.connect({
      onSuccess: onConnect,
      useSSL: false,
      timeout: 3,
      onFailure: onFailure,
    });
  };

  const onConnect = () => {
    setStatus('Connected');
    subscribeTopic(topic);
    console.log('Connected');
  };

  const onFailure = (error) => {
    setStatus('Connection failed: ' + error.errorMessage);
    console.log('Connection failed:', error.errorMessage);
  };

  const subscribeTopic = () => {
    setSubscribedTopic(topic);
    client.subscribe(topic, { qos: 0 });
  };

  const sendMessage = (msg) => {
    const messageObj = new Paho.MQTT.Message(msg);
    messageObj.destinationName = subscribedTopic;
    client.send(messageObj);
  };

  const unSubscribeTopic = () => {
    client.unsubscribe(subscribedTopic);
    setSubscribedTopic('');
  };

  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    sendMessage(newState ? '1' : '0'); // Send '1' for ON, '0' for OFF
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Smart LED Control</Text>
        <Text style={styles.status}>Status: {status}</Text>
        <IconButton
          icon={isEnabled ? 'lightbulb' : 'lightbulb-outline'}
          color={isEnabled ? '#FF9800' : '#FFF'}
          size={30}
          onPress={toggleSwitch}
        />
        <Text style={styles.intensityValue}>{intensity}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor="#FF6C44"
          maximumTrackTintColor="#000000"
          value={intensity}
          onValueChange={(value) => setIntensity(value)}
        />
        <View style={styles.scheduleContainer}>
          <TextInput
            style={styles.scheduleInput}
            value={schedule.from + ' - ' + schedule.to}
            onChangeText={(text) =>
              setSchedule({
                ...schedule,
                from: text.split(' - ')[0],
                to: text.split(' - ')[1],
              })
            }
          />
          <IconButton icon="clock" size={20} onPress={() => console.log('Edit schedule')} />
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginBottom: 10,
  },
  intensityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scheduleInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginRight: 10,
    padding: 5,
    width: 180,
  },
});

export default App;
