#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <EEPROM.h>

// Define the pins for the PIR motion sensor and the smart outlet
#define PIR_MOTION_SENSOR D1
#define SMART_OUTLET D2
#define CONNECTION_LED D3

WiFiClient espClient;
PubSubClient client(espClient);

// Variables to store MQTT server address
char mqtt_server[40] = "";

// Variables to track the current state
bool mqttControlled = false;
bool motionDetected = false;

// EEPROM addresses
#define EEPROM_MQTT_SERVER_START 0
#define EEPROM_MQTT_SERVER_SIZE 40

void saveConfig() {
  for (int i = 0; i < EEPROM_MQTT_SERVER_SIZE; i++) {
    EEPROM.write(EEPROM_MQTT_SERVER_START + i, mqtt_server[i]);
  }
  EEPROM.commit();
}

void loadConfig() {
  for (int i = 0; i < EEPROM_MQTT_SERVER_SIZE; i++) {
    mqtt_server[i] = EEPROM.read(EEPROM_MQTT_SERVER_START + i);
  }
  // Check if the first character is not a valid ASCII character (not printable)
  if (mqtt_server[0] < 32 || mqtt_server[0] > 126) {
    strcpy(mqtt_server, ""); // Set to empty string if not valid
  }
}

void setup_wifi() {
  // Local initialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;

  // Uncomment to reset saved WiFi credentials
  wifiManager.resetSettings();

  // Set a custom hostname (optional)
  wifiManager.setHostname("NodeMCU");

  // Create a custom parameter for the MQTT server
  WiFiManagerParameter custom_mqtt_server("server", "MQTT Server", mqtt_server, EEPROM_MQTT_SERVER_SIZE);

  // Add custom parameters to WiFiManager
  wifiManager.addParameter(&custom_mqtt_server);

  // Automatically connect using saved credentials or begin configuration portal if none are saved
  if (!wifiManager.autoConnect("AutoConnectAP")) {
    Serial.println("Failed to connect and hit timeout");
    delay(3000);
    // Reset and try again, or maybe put it to deep sleep
    ESP.reset();
    delay(5000);
  }

  // If you get here you have connected to the WiFi
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Save the custom MQTT server parameter
  strcpy(mqtt_server, custom_mqtt_server.getValue());
  saveConfig();
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("NodeMCUClient")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("OUTTopic", "hello world");
      // ... and resubscribe
      client.subscribe("smart-outlet/status");
      // Indication with LED on
      digitalWrite(CONNECTION_LED, HIGH);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      // Indication with LED off
      digitalWrite(CONNECTION_LED, LOW);
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

// Callback function for when a PUBLISH message is received
void onMessage(char* topic, uint8_t* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);

  // Control the smart outlet based on the message received
  if (message == "1") {
    mqttControlled = true;
    digitalWrite(SMART_OUTLET, HIGH); // Turn the smart outlet on
  } else if (message == "0") {
    mqttControlled = false;
    digitalWrite(SMART_OUTLET, LOW); // Turn the smart outlet off
  } else if (message == "request") {
    // Publish the current smart outlet state
    if (digitalRead(SMART_OUTLET) == HIGH) {
      client.publish("smart-outlet/status", "1");
    } else {
      client.publish("smart-outlet/status", "0");
    }
  }
}

void setup() {
  Serial.begin(115200);

  // Initialize EEPROM
  EEPROM.begin(512);

  // Load the MQTT server address from EEPROM
  loadConfig();

  setup_wifi();
  client.setServer(mqtt_server, 1883);

  // Set the callback function for receiving messages
  client.setCallback(onMessage);

  // Initialize the smart outlet and motion sensor pins as an output and input respectively
  pinMode(SMART_OUTLET, OUTPUT);
  pinMode(CONNECTION_LED, OUTPUT);
  pinMode(PIR_MOTION_SENSOR, INPUT);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Check the state of the motion sensor
  bool currentMotion = digitalRead(PIR_MOTION_SENSOR);

  // Only update the smart outlet state based on motion if it's not controlled by MQTT
  if (!mqttControlled) {
    if (currentMotion != motionDetected) {
      motionDetected = currentMotion;
      if (motionDetected) {
        digitalWrite(SMART_OUTLET, HIGH); // Turn the smart outlet on
        client.publish("smart-outlet/status", "1");
      } else {
        digitalWrite(SMART_OUTLET, LOW); // Turn the smart outlet off
        client.publish("smart-outlet/status", "0");
      }
    }
  }

  delay(200);
}