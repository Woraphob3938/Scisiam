import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TelemetryPoint {
  time: number; // elapsed time in seconds
  temp: number; // water temp in Celsius
  ambientTemp: number; // ambient temp in Celsius
}

export const useLabTelemetry = () => {
  // Refs for tracking mutable values in simulation interval (prevents clearing the interval)
  const waterTempRef = useRef<number>(85.0);
  const heatingStatusRef = useRef<boolean>(false);
  const targetTempRef = useRef<number>(30.0);

  // Telemetry States (synchronized with refs)
  const [waterTemp, _setWaterTemp] = useState<number>(85.0);
  const [ambientTemp] = useState<number>(25.0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [targetTemp, _setTargetTemp] = useState<number>(30.0);
  const [heatingStatus, _setHeatingStatus] = useState<boolean>(false);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [history, setHistory] = useState<TelemetryPoint[]>([
    { time: 0, temp: 85.0, ambientTemp: 25.0 }
  ]);

  // Sync state & ref setters
  const setWaterTempState = (val: number) => {
    waterTempRef.current = val;
    _setWaterTemp(val);
  };

  const setHeatingStatusState = (val: boolean) => {
    heatingStatusRef.current = val;
    _setHeatingStatus(val);
  };

  const setTargetTempState = (val: number) => {
    targetTempRef.current = val;
    _setTargetTemp(val);
  };

  // Simulation parameters
  const coolingConstant = 0.015; // Newton's cooling rate constant 'k'
  const heatingRate = 2.0; // degrees Celsius per second

  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  // 1. WebSocket Handler
  useEffect(() => {
    if (isConnectingRef.current) return;
    
    isConnectingRef.current = true;
    const socket = io('https://scisiam-mock-iot-backend.local', {
      transports: ['websocket'],
      autoConnect: false,
      timeout: 3000,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setSocketStatus('disconnected');
    });

    socket.on('telemetry_update', (data: { waterTemp: number, ambientTemp: number, heating: boolean }) => {
      setWaterTempState(data.waterTemp);
      setHeatingStatusState(data.heating);
      setElapsedTime(prev => {
        const nextTime = prev + 1;
        setHistory(hist => {
          const updated = [...hist, { time: nextTime, temp: data.waterTemp, ambientTemp: data.ambientTemp }];
          return updated.slice(-30); // Keep last 30 data points
        });
        return nextTime;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 2. Physics Simulation Engine (runs when socket is disconnected / mock mode)
  useEffect(() => {
    if (socketStatus === 'connected') return;

    const interval = setInterval(() => {
      // Safely access current telemetry parameter refs (no interval teardowns)
      const currentTemp = waterTempRef.current;
      const currentHeating = heatingStatusRef.current;
      const currentTarget = targetTempRef.current;

      let nextTemp = currentTemp;
      
      if (currentHeating) {
        // Temperature climbs towards target temp
        nextTemp = currentTemp + heatingRate;
        if (nextTemp >= currentTarget) {
          nextTemp = currentTarget;
          setHeatingStatusState(false); // Target reached, turn off heater
        }
      } else {
        // Newton's law of cooling: dT/dt = -k * (T - T_env)
        // Integration: T_next = T_env + (T_prev - T_env) * exp(-k * dt)
        nextTemp = ambientTemp + (currentTemp - ambientTemp) * Math.exp(-coolingConstant * 1);
      }

      // Round to 1 decimal place
      nextTemp = Math.round(nextTemp * 10) / 10;

      // Update state and ref
      setWaterTempState(nextTemp);

      // Save history & elapsed time (pure flat updates)
      setElapsedTime(prevTime => {
        const nextTime = prevTime + 1;
        setHistory(hist => {
          const updated = [...hist, { time: nextTime, temp: nextTemp, ambientTemp }];
          return updated.slice(-30);
        });
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [socketStatus, ambientTemp]);

  // 3. User Actions
  const sendTargetTemperature = (temp: number) => {
    setTargetTempState(temp);
    
    // Simulate heater state logic: if target temperature is higher than current water temperature, heater starts
    if (temp > waterTempRef.current) {
      setHeatingStatusState(true);
    } else {
      setHeatingStatusState(false);
    }

    // Send to server if connected
    if (socketStatus === 'connected' && socketRef.current) {
      socketRef.current.emit('set_target_temp', temp);
    }
  };

  const toggleSocketConnection = () => {
    if (socketStatus === 'disconnected') {
      setSocketStatus('connected');
    } else {
      setSocketStatus('disconnected');
    }
  };

  const resetLab = () => {
    setWaterTempState(85.0);
    setElapsedTime(0);
    setHeatingStatusState(false);
    setHistory([{ time: 0, temp: 85.0, ambientTemp }]);
    
    if (socketStatus === 'connected' && socketRef.current) {
      socketRef.current.emit('reset_experiment');
    }
  };

  return {
    waterTemp,
    ambientTemp,
    elapsedTime,
    targetTemp,
    heatingStatus,
    socketStatus,
    history,
    sendTargetTemperature,
    toggleSocketConnection,
    resetLab,
  };
};
