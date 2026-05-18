# Hardware System

This folder contains the embedded firmware for the smart switch project.

## Features

- PIR motion detection
- MQTT communication
- Smart outlet / lamp control
- Automatic lighting based on movement
- Manual control through mobile application

## Hardware Components

- ESP8266 (e.g., NodeMCU)
- PIR motion sensor
- Smart outlet
- 220V AC to 5V DC adapter

## MQTT Topics

- smart-led/status
- smart-led/motion-status
- smart-led/voice-control

## Arduino Libraries

- ESP8266WiFi
- WiFiManager
- PubSubClient
- EEPROM