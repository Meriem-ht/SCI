import React, { useState, useEffect } from "react";
import ControlBox from "./src/components/ControlBox";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import styles from "./src/styles/style";
import {
  createMQTTClient,
  subscribeTopic,
  sendMessage,
} from "./src/services/mqttService";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Provider as PaperProvider,Button,Dialog,Portal,TextInput,Snackbar,} from "react-native-paper";
import backgroundImage from "./assets/image.png";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const options = {
  host: "192.168.43.32",
  port: 1883,
  id: "id_" + parseInt(Math.random() * 100000),
};

let client;


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
        if (client && client.isConnected()) {
          client.disconnect();
        }
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

const connectToBroker = (address) => {
  client = createMQTTClient(
    address,
    options.id,
    onConnect,
    onFailure,
    (message) => {
      console.log("Message received:", message.payloadString);

      if (message.destinationName === motionTopic) {
        const newState = message.payloadString === "1";
        setIsSwitchEnabled(newState);
      } else if (message.destinationName === statusTopic) {
        const newState = message.payloadString === "1";
        setIsSwitchEnabled(newState);
      }
    },
    (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log(
          "onConnectionLost:" + responseObject.errorMessage
        );
        setStatus("Disconnected");
      }
    }
  );
};

  const onConnect = () => {
    setStatus("Connected");
    subscribeTopic(statusTopic);
    sendMessage(client,"request", statusTopic);
    subscribeTopic(motionTopic);
    console.log("Connected");
  };

  const onFailure = (error) => {
    setStatus("Connection failed: " + error.errorMessage);
    setSnackbarMessage("Connection failed: " + error.errorMessage);
    setSnackbarVisible(true);
    console.log("Connection failed:", error.errorMessage);
  };


  const toggleSwitch = () => {
    const newState = !isSwitchEnabled;
    setIsSwitchEnabled(newState);
    sendMessage(client,newState ? "1" : "0", statusTopic); // Send '1' for ON, '0' for OFF to status topic
  };

  const handleSwitchPress = () => {
    setSelectedBox("switch");
    toggleSwitch();
  };

  const handleVoicePress = () => {
    setSelectedBox("voice");
    setIsVoiceEnabled(!isVoiceEnabled);
    sendMessage(client,isVoiceEnabled ? "0" : "1", "smart-led/voice-control"); // Send voice control state
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const handleBrokerAddressSubmit = () => {
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
            <ControlBox
              title="Switch"
              enabled={isSwitchEnabled}
              selected={selectedBox === "switch"}
              onPress={handleSwitchPress}
              iconType="material"
              iconName="lightbulb-outline"
            />

            <ControlBox
              title="Voice"
              enabled={isVoiceEnabled}
              selected={selectedBox === "voice"}
              onPress={handleVoicePress}
              iconType="material-community"
              iconName="microphone-outline"
            />
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


export default App;
