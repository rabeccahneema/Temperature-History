'use client';
import { useEffect } from 'react';
import mqtt from 'mqtt';

const MqttSubscriber = () => {
  useEffect(() => {
    const broker = 'wss://207b716636fd44df8ca523f26d592fd9.s1.eu.hivemq.cloud:8884/mqtt';
    const options = {
      username: 'KukuKonnect',
      password: 'Kuku@2025',
    };

    const client = mqtt.connect(broker, options);
    client.on('connect', () => {
      console.log('Connected to HiveMQ over WebSocket');
      client.subscribe('esp32/sensor_data', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log('Subscribed to topic esp32/sensor_data');
        }
      });
    });
    client.on('message', (topic, message) => {
      try {
        const mqttData = JSON.parse(message.toString());
        const postData = {
            timestamp:mqttData.timestamp,
            temperature:mqttData.avg_temp,
            humidity:mqttData.avg_humidity,
            device_id:mqttData.device_id,
        };
        fetch('https://kukukonnect-6aa0bdb81a64.herokuapp.com/api/sensor-data/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        })
          .then(res => res.json())
          .then(response => {
            console.log('Backend API response:', response);
          })
          .catch(error => {
            console.error('Error posting to backend:', error);
          });
      } catch (err) {
        console.error('Failed to parse MQTT message JSON', err);
      }
    });
    client.on('error', (err) => {
      console.error('MQTT Client Error:', err);
      client.end();
    });
    client.on('reconnect', () => {
      console.log('MQTT reconnecting...');
    });
    return () => {
      client.end();
    };
  }, []);
  return null;
};
export default MqttSubscriber;