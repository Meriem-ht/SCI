import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import backgroundImage from './assets/image.png';
import Slider from '@react-native-community/slider';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';


const SLIDER_COLOR = '#FFE690';
const GRAY_COLOR = 'rgba(0, 0, 0, 0.34)';
const SLIDER_WIDTH = 300;
const SLIDER_HEIGHT = 65;
const BORDER_RADIUS = 10;
class CustomSlider extends React.Component {
  state = {
    slideValue: 0,
  };

  handleValueChange = (value) => {
    this.setState({ slideValue: value });
    this.props.onValueChange(value);
  };

  render() {
    const sliderStyle = {
      sliderDummy: {
        backgroundColor: GRAY_COLOR,
        width: SLIDER_WIDTH,
        height: SLIDER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS,
        position: 'absolute',
      },
      sliderReal: {
        backgroundColor: SLIDER_COLOR,
        width: (this.state.slideValue / 50) * SLIDER_WIDTH,
        height: SLIDER_HEIGHT,
        borderRadius: BORDER_RADIUS,
      },
      thumbLine: {
        position: 'absolute',
        left: (this.state.slideValue / 50) * SLIDER_WIDTH - 1, // Center the line
        width: 2,
        height: SLIDER_HEIGHT,
        backgroundColor: '#FFFFFF',
      },
    };

    return (
      <View style={{ borderRadius: BORDER_RADIUS, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', position: 'absolute' }}>
          <View style={sliderStyle.sliderDummy}></View>
          <View style={sliderStyle.sliderReal}></View>
        </View>
        <Slider
          style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT, borderRadius: BORDER_RADIUS }}
          minimumValue={0}
          maximumValue={50}
          value={this.state.slideValue}
          onValueChange={this.handleValueChange}
          maximumTrackTintColor="transparent"
          minimumTrackTintColor="transparent"
          thumbTintColor="transparent"
        />
        <View style={sliderStyle.thumbLine}></View>
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>Off</Text>
          <Text style={styles.label}>100%</Text>
        </View>
      </View>
    );
  }
}


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
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [horizontalSliderValue, setHorizontalSliderValue] = useState(0);
  const [selectedBox, setSelectedBox] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [statusTopic, setStatusTopic] = useState('smart-led/status');
  const [motionTopic, setMotionTopic] = useState('smart-led/motion-status');
  const [subscribedTopic, setSubscribedTopic] = useState('');

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
            if (message.destinationName === motionTopic) {
              const newState = message.payloadString === '1'; // Assuming '1' means motion detected
              setIsEnabled(newState);
            }
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
          subscribeTopic(statusTopic);
          subscribeTopic(motionTopic);
          console.log('Connected');
        };
      
        const onFailure = (error) => {
          setStatus('Connection failed: ' + error.errorMessage);
          console.log('Connection failed:', error.errorMessage);
        };
      
        const subscribeTopic = (topic) => {
          setSubscribedTopic(topic);
          client.subscribe(topic, { qos: 0 });
        };
      
        const sendMessage = (msg, topic) => {
          const messageObj = new Paho.MQTT.Message(msg);
          messageObj.destinationName = topic;
          client.send(messageObj);
        };
      
        const unSubscribeTopic = () => {
          client.unsubscribe(subscribedTopic);
          setSubscribedTopic('');
        };
  const toggleSwitch = () => {
    const newState = !isSwitchEnabled;
    setIsSwitchEnabled(newState);
    sendMessage(newState ? '1' : '0', statusTopic); // Send '1' for ON, '0' for OFF to status topic
  };

  const handleSliderValueChange = (value) => {
    setHorizontalSliderValue(value);
    sendMessage(String(value), 'smart-led/intensity'); // Send slider value to intensity topic
  };

  const handleSwitchPress = () => {
    setSelectedBox('switch');
    toggleSwitch();
  };

  const handleVoicePress = () => {
    setSelectedBox('voice');
    setIsVoiceEnabled(!isVoiceEnabled);
    sendMessage(isVoiceEnabled ? '0' : '1', 'smart-led/voice-control'); // Send voice control state
  };

  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Smart switch</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.intensityContainer}>
                <Text style={styles.intensityText}>Intensity</Text>
                <Text style={styles.intensityValue}>{Math.round(horizontalSliderValue * 2)}%</Text>
              </View>
              <CustomSlider onValueChange={handleSliderValueChange} />
            </View>
            <View style={styles.bottomContainer}>
              <View style={styles.boxWrapper}>
                <Text
                  style={[
                    styles.boxTitle,
                    { borderBottomColor: selectedBox === 'switch' ? '#E2FFA3' : 'transparent' },
                  ]}
                >
                  Switch
                </Text>
                <TouchableOpacity
                  style={[
                    styles.boxContainer,
                    { backgroundColor: isSwitchEnabled ? '#E2FFA3' : 'rgba(0,0,0,.34)' },
                  ]}
                  onPress={handleSwitchPress}
                >
                  <TouchableOpacity
                    style={[
                      styles.miniBoxContainer,
                      { backgroundColor: isSwitchEnabled ? '#242323' : 'rgba(255,255,255,.24)' },
                    ]}
                    onPress={handleSwitchPress}
                  >
                    <MaterialIcons name="lightbulb-outline" style={styles.iconStyle} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
              <View style={styles.boxWrapper}>
                <Text
                  style={[
                    styles.boxTitle,
                    { borderBottomColor: selectedBox === 'voice' ? '#E2FFA3' : 'transparent' },
                  ]}
                >
                  Voice
                </Text>
                <TouchableOpacity
                  style={[
                    styles.boxContainer,
                    { backgroundColor: isVoiceEnabled ? '#E2FFA3' : 'rgba(0,0,0,.34)' },
                  ]}
                  onPress={handleVoicePress}
                >
                  <TouchableOpacity
                    style={[
                      styles.miniBoxContainer,
                      { backgroundColor: isVoiceEnabled ? '#242323' : 'rgba(255,255,255,.24)' },
                    ]}
                    onPress={handleVoicePress}
                  >
                    <MaterialCommunityIcons name="microphone-outline" style={styles.iconStyle} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  intensityText: {
    color: 'white',
    fontWeight: 'semibold',
    fontSize: 18,
  },
  intensityValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_WIDTH,
    position: 'absolute',
    top: (SLIDER_HEIGHT - 20) / 2, // Center the labels vertically
  },
  label: {
    color: '#DB9556',
    fontWeight: 'bold',
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 10,
  },
  boxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 15,
    width: 100,
    height: 100,
  },
  miniBoxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 15,
    width: 50,
    height: 50,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    borderBottomWidth: 2,
  },
  boxWrapper: {
    alignItems: 'center',
  },
  iconStyle: {
    color: 'white',
    fontSize: 30,
  },
});

export default App;

