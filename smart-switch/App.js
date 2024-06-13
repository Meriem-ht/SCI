// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Text, ImageBackground, TouchableOpacity } from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { Provider as PaperProvider } from 'react-native-paper';
// import backgroundImage from './assets/image.png';
// import Slider from '@react-native-community/slider';
// import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import init from 'react_native_mqtt';

// const options = {
//   id: 'id_' + parseInt(Math.random() * 100000),
// };

// let client;

// init({
//   size: 10000,
//   storageBackend: AsyncStorage,
//   defaultExpires: 1000 * 3600 * 24,
//   enableCache: true,
//   reconnect: true,
//   sync: {},
// });

// const App = () => {
//   const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
//   const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
//   const [horizontalSliderValue, setHorizontalSliderValue] = useState(0);
//   const [selectedBox, setSelectedBox] = useState('');
//   const [status, setStatus] = useState('Disconnected');
//   const [statusTopic, setStatusTopic] = useState('smart-led/status');
//   const [motionTopic, setMotionTopic] = useState('smart-led/motion-status');
//   const [subscribedTopic, setSubscribedTopic] = useState('');

//   useEffect(() => {
//     client = new Paho.MQTT.Client('ws://192.168.43.32:9001/mqtt', options.id);

//     client.onConnectionLost = (responseObject) => {
//       if (responseObject.errorCode !== 0) {
//         console.log('onConnectionLost:' + responseObject.errorMessage);
//         setStatus('Disconnected');
//       }
//     };

//     client.onMessageArrived = (message) => {
//       console.log('Message received:', message.payloadString);
//       if (message.destinationName === motionTopic) {
//         const newState = message.payloadString === '1'; // Assuming '1' means motion detected
//         setIsSwitchEnabled(newState);
//       } else if (message.destinationName === statusTopic) {
//         const newState = message.payloadString === '1'; // Assuming '1' means switch ON, '0' means switch OFF
//         setIsSwitchEnabled(newState);
//       }
//     };

//     connect();

//     return () => {
//       client.disconnect();
//     };
//   }, []);

//   const connect = () => {
//     setStatus('Connecting');
//     client.connect({
//       onSuccess: onConnect,
//       useSSL: false,
//       timeout: 3,
//       onFailure: onFailure,
//     });
//   };

//   const onConnect = () => {
//     setStatus('Connected');
//     subscribeTopic(statusTopic);
//     subscribeTopic(motionTopic);
//     console.log('Connected');
//   };

//   const onFailure = (error) => {
//     setStatus('Connection failed: ' + error.errorMessage);
//     console.log('Connection failed:', error.errorMessage);
//   };

//   const subscribeTopic = (topic) => {
//     setSubscribedTopic(topic);
//     client.subscribe(topic, { qos: 0 });
//   };

//   const sendMessage = (msg, topic) => {
//     const messageObj = new Paho.MQTT.Message(msg);
//     messageObj.destinationName = topic;
//     client.send(messageObj);
//   };

//   const toggleSwitch = () => {
//     const newState = !isSwitchEnabled;
//     setIsSwitchEnabled(newState);
//     sendMessage(newState ? '1' : '0', statusTopic); // Send '1' for ON, '0' for OFF to status topic
//   };

//   const handleSliderValueChange = (value) => {
//     setHorizontalSliderValue(value);
//     sendMessage(String(Math.round(value * 2)), 'smart-led/status'); // Send slider value to intensity topic
//     // Update isSwitchEnabled based on the slider value
//     const isOn = value > 0;
//     setIsSwitchEnabled(isOn);
//   };

//   const handleSwitchPress = () => {
//     setSelectedBox('switch');
//     toggleSwitch();
//   };

//   const handleVoicePress = () => {
//     setSelectedBox('voice');
//     setIsVoiceEnabled(!isVoiceEnabled);
//     sendMessage(isVoiceEnabled ? '0' : '1', 'smart-led/voice-control'); // Send voice control state
//   };

//   return (
//     <PaperProvider>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
//           <View style={styles.container}>
//             <View style={styles.header}>
//               <Text style={styles.title}>Smart switch</Text>
//             </View>
//             <View style={styles.bottomContainer}>
//               <View style={styles.boxWrapper}>
//                 <Text
//                   style={[
//                     styles.boxTitle,
//                     { borderBottomColor: selectedBox === 'switch' ? '#E2FFA3' : 'transparent' },
//                   ]}
//                 >
//                   Switch
//                 </Text>
//                 <TouchableOpacity
//                   style={[
//                     styles.boxContainer,
//                     { backgroundColor: isSwitchEnabled ? '#E2FFA3' : 'rgba(0,0,0,.34)' },
//                   ]}
//                   onPress={handleSwitchPress}
//                 >
//                   <TouchableOpacity
//                     style={[
//                       styles.miniBoxContainer,
//                       { backgroundColor: isSwitchEnabled ? '#242323' : 'rgba(255,255,255,.24)' },
//                     ]}
//                     onPress={handleSwitchPress}
//                   >
//                     <MaterialIcons name="lightbulb-outline" style={styles.iconStyle} />
//                   </TouchableOpacity>
//                 </TouchableOpacity>
//               </View>
//               <View style={styles.boxWrapper}>
//                 <Text
//                   style={[
//                     styles.boxTitle,
//                     { borderBottomColor: selectedBox === 'voice' ? '#E2FFA3' : 'transparent' },
//                   ]}
//                 >
//                   Voice
//                 </Text>
//                 <TouchableOpacity
//                   style={[
//                     styles.boxContainer,
//                     { backgroundColor: isVoiceEnabled ? '#E2FFA3' : 'rgba(0,0,0,.34)' },
//                   ]}
//                   onPress={handleVoicePress}
//                 >
//                   <TouchableOpacity
//                     style={[
//                       styles.miniBoxContainer,
//                       { backgroundColor: isVoiceEnabled ? '#242323' : 'rgba(255,255,255,.24)' },
//                     ]}
//                     onPress={handleVoicePress}
//                   >
//                     <MaterialCommunityIcons name="microphone-outline" style={styles.iconStyle} />
//                   </TouchableOpacity>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </ImageBackground>
//       </GestureHandlerRootView>
//     </PaperProvider>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     resizeMode: 'cover',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 50,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   bottomContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//   },
//   sliderContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'column',
//   },
//   intensityContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     paddingHorizontal: 30,
//     marginBottom: 15,
//   },
//   intensityText: {
//     color: 'white',
//     fontWeight: 'semibold',
//     fontSize: 18,
//   },
//   intensityValue: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 20,
//   },

//   label: {
//     color: '#DB9556',
//     fontWeight: 'bold',
//     fontSize: 12,
//     paddingLeft: 10,
//     paddingRight: 10,
//   },
//   boxContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     borderRadius: 15,
//     width: 100,
//     height: 100,
//   },
//   miniBoxContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     borderRadius: 15,
//     width: 50,
//     height: 50,
//   },
//   boxTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 10,
//     borderBottomWidth: 2,
//   },
//   boxWrapper: {
//     alignItems: 'center',
//   },
//   iconStyle: {
//     color: 'white',
//     fontSize: 30,
//   },
// });

// export default App;

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Provider as PaperProvider,
  Button,
  Dialog,
  Portal,
  TextInput,
  Snackbar,
} from "react-native-paper";
import backgroundImage from "./assets/image.png";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";

const options = {
  host: "192.168.43.32",
  port: 1883,
  id: "id_" + parseInt(Math.random() * 100000),
};

let client;

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
  const [selectedBox, setSelectedBox] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [statusTopic, setStatusTopic] = useState("smart-led/status");
  const [motionTopic, setMotionTopic] = useState("smart-led/motion-status");
  const [visible, setVisible] = useState(false);
  const [brokerIpInput, setBrokerIpInput] = useState("192.168.43.32");
  const [brokerAddress, setBrokerAddress] = useState(
    "ws://192.168.43.32:9001/mqtt"
  );
  const [pressed, setPressed] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (pressed) {
      connectToBroker(brokerAddress);

      return () => {
        client.disconnect();
      };
    }
  }, [pressed]);

  useEffect(() => {
    // Function to retrieve the last connected broker address from AsyncStorage
    const retrieveLastConnectedBroker = async () => {
      try {
        const lastBrokerAddress = await AsyncStorage.getItem(
          "lastBrokerAddress"
        );
        if (lastBrokerAddress !== null) {
          console.log("Connected to the old one");
          console.log(lastBrokerAddress);
          setBrokerAddress(lastBrokerAddress);
          connectToBroker(lastBrokerAddress);
        }
      } catch (error) {
        console.error("Error retrieving last connected broker:", error);
      }
    };

    // Retrieve the last connected broker address when the component mounts
    retrieveLastConnectedBroker();
  }, []);

  const connect = () => {
    setStatus("Connecting");
    client.connect({
      onSuccess: onConnect,
      useSSL: false,
      timeout: 3,
      onFailure: onFailure,
    });
  };

  const connectToBroker = (address) => {
    client = new Paho.MQTT.Client(address, options.id);

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
        setStatus("Disconnected");
      }
    };

    client.onMessageArrived = (message) => {
      console.log("Message received:", message.payloadString);
      if (message.destinationName === statusTopic) {
        const newState = message.payloadString === "1"; // Assuming '1' means motion detected
        setIsSwitchEnabled(newState);
      } else if (message.destinationName === statusTopic) {
        const newState = message.payloadString === "1"; // Assuming '1' means switch ON, '0' means switch OFF
        setIsSwitchEnabled(newState);
      }
    };

    connect();
  };

  const onConnect = () => {
    setStatus("Connected");
    subscribeTopic(statusTopic);
    sendMessage("request", statusTopic);
    subscribeTopic(motionTopic);
    console.log("Connected");
  };

  const onFailure = (error) => {
    setStatus("Connection failed: " + error.errorMessage);
    setSnackbarMessage("Connection failed: " + error.errorMessage);
    setSnackbarVisible(true);
    console.log("Connection failed:", error.errorMessage);
  };

  const subscribeTopic = (topic) => {
    client.subscribe(topic, { qos: 0 });
  };

  const sendMessage = (msg, topic) => {
    const messageObj = new Paho.MQTT.Message(msg);
    messageObj.destinationName = topic;
    client.send(messageObj);
  };

  const toggleSwitch = () => {
    const newState = !isSwitchEnabled;
    setIsSwitchEnabled(newState);
    sendMessage(newState ? "1" : "0", statusTopic); // Send '1' for ON, '0' for OFF to status topic
  };

  const handleSwitchPress = () => {
    setSelectedBox("switch");
    toggleSwitch();
  };

  const handleVoicePress = () => {
    setSelectedBox("voice");
    setIsVoiceEnabled(!isVoiceEnabled);
    sendMessage(isVoiceEnabled ? "0" : "1", "smart-led/voice-control"); // Send voice control state
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const handleBrokerAddressSubmit = () => {
    console.log(brokerIpInput);
    setBrokerAddress(`ws://${brokerIpInput}:9001/mqtt`);
    hideDialog();
    setPressed(true);
    AsyncStorage.setItem(
      "lastBrokerAddress",
      `ws://${brokerIpInput}:9001/mqtt`
    );
    connectToBroker(`ws://${brokerIpInput}:9001/mqtt`);
  };

  const handleSnackbarDismiss = () => setSnackbarVisible(false);

  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Smart switch</Text>
              <Button
                mode="contained"
                onPress={showDialog}
                style={styles.button}
              >
                Set Broker
              </Button>
            </View>
            <Portal>
              <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Set MQTT Broker</Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    label="Broker IP Address"
                    value={brokerIpInput}
                    onChangeText={setBrokerIpInput}
                    autoFocus
                    textAlign="left"
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideDialog}>Cancel</Button>
                  <Button onPress={handleBrokerAddressSubmit}>Submit</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
            <View style={styles.bottomContainer}>
              <View style={styles.boxWrapper}>
                <Text
                  style={[
                    styles.boxTitle,
                    {
                      borderBottomColor:
                        selectedBox === "switch" ? "#E2FFA3" : "transparent",
                    },
                  ]}
                >
                  Switch
                </Text>
                <TouchableOpacity
                  style={[
                    styles.boxContainer,
                    {
                      backgroundColor: isSwitchEnabled
                        ? "#E2FFA3"
                        : "rgba(0,0,0,.34)",
                    },
                  ]}
                  onPress={handleSwitchPress}
                >
                  <TouchableOpacity
                    style={[
                      styles.miniBoxContainer,
                      {
                        backgroundColor: isSwitchEnabled
                          ? "#242323"
                          : "rgba(255,255,255,.24)",
                      },
                    ]}
                    onPress={handleSwitchPress}
                  >
                    <MaterialIcons
                      name="lightbulb-outline"
                      style={styles.iconStyle}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
              <View style={styles.boxWrapper}>
                <Text
                  style={[
                    styles.boxTitle,
                    {
                      borderBottomColor:
                        selectedBox === "voice" ? "#E2FFA3" : "transparent",
                    },
                  ]}
                >
                  Voice
                </Text>
                <TouchableOpacity
                  style={[
                    styles.boxContainer,
                    {
                      backgroundColor: isVoiceEnabled
                        ? "#E2FFA3"
                        : "rgba(0,0,0,.34)",
                    },
                  ]}
                  onPress={handleVoicePress}
                >
                  <TouchableOpacity
                    style={[
                      styles.miniBoxContainer,
                      {
                        backgroundColor: isVoiceEnabled
                          ? "#242323"
                          : "rgba(255,255,255,.24)",
                      },
                    ]}
                    onPress={handleVoicePress}
                  >
                    <MaterialCommunityIcons
                      name="microphone-outline"
                      style={styles.iconStyle}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
            <Snackbar
              visible={snackbarVisible}
              onDismiss={handleSnackbarDismiss}
              duration={Snackbar.DURATION_SHORT}
            >
              {snackbarMessage}
            </Snackbar>
          </View>
        </ImageBackground>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 70,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#DB9556",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 15,
    width: 100,
    height: 100,
  },
  miniBoxContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 15,
    width: 50,
    height: 50,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    borderBottomWidth: 2,
  },
  boxWrapper: {
    alignItems: "center",
  },
  iconStyle: {
    color: "white",
    fontSize: 30,
  },
});

export default App;
