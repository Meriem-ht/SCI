
#define PIR_MOTION_SENSOR D1
#define led D2

void setup()
{
    pinMode(PIR_MOTION_SENSOR, INPUT);
    pinMode(led, OUTPUT);
    Serial.begin(9600);
}

void loop()
{
    // If it detects moving people

    if (digitalRead(PIR_MOTION_SENSOR))
    {
        Serial.println("Hi,people is coming");
        digitalWrite(led, LOW);
    }
    else
    {
        Serial.println("Watching");
        digitalWrite(led, HIGH);
    }
    delay(200);
}