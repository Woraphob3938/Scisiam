import { useState, useEffect, useRef } from 'react';

export interface TelemetryPoint {
  time: number; // elapsed time in seconds
  temp: number; // water temp in Celsius
  ambientTemp: number; // ambient temp in Celsius
}

// Generate 30 seconds of historical seed data representing water cooling from 95C to ~69.6C
const generateInitialHistory = (envTemp: number): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const startTemp = 95.0;
  const k = 0.015;
  for (let i = 0; i < 30; i++) {
    const temp = envTemp + (startTemp - envTemp) * Math.exp(-k * i);
    points.push({
      time: i,
      temp: Math.round(temp * 10) / 10,
      ambientTemp: envTemp
    });
  }
  return points;
};

export const useLabTelemetry = () => {
  const ambient = 25.0;
  const initialHistory = generateInitialHistory(ambient);
  const currentInitialTemp = initialHistory[initialHistory.length - 1].temp; // ~69.6°C

  // Refs for tracking mutable values in simulation interval
  const waterTempRef = useRef<number>(currentInitialTemp);
  const heatingStatusRef = useRef<boolean>(false);
  const targetTempRef = useRef<number>(30.0);

  // Telemetry States (synchronized with refs)
  const [waterTemp, _setWaterTemp] = useState<number>(currentInitialTemp);
  const [ambientTemp] = useState<number>(ambient);
  const [elapsedTime, setElapsedTime] = useState<number>(30);
  const [targetTemp, _setTargetTemp] = useState<number>(30.0);
  const [heatingStatus, _setHeatingStatus] = useState<boolean>(false);
  const [history, setHistory] = useState<TelemetryPoint[]>(initialHistory);

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

  // Physics Simulation Engine (runs offline)
  useEffect(() => {
    const interval = setInterval(() => {
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
  }, [ambientTemp]);

  // User Actions
  const sendTargetTemperature = (temp: number) => {
    setTargetTempState(temp);
    
    // Simulate heater state logic: if target temperature is higher than current water temperature, heater starts
    if (temp > waterTempRef.current) {
      setHeatingStatusState(true);
    } else {
      setHeatingStatusState(false);
    }
  };

  const resetLab = () => {
    const freshHistory = generateInitialHistory(ambientTemp);
    const freshTemp = freshHistory[freshHistory.length - 1].temp;
    setWaterTempState(freshTemp);
    setElapsedTime(30);
    setHeatingStatusState(false);
    setHistory(freshHistory);
  };

  return {
    waterTemp,
    ambientTemp,
    elapsedTime,
    targetTemp,
    heatingStatus,
    history,
    sendTargetTemperature,
    resetLab,
  };
};
