import { useState, useEffect, useRef } from 'react';

export interface PhotosynthesisPoint {
  time: number;
  co2: number;
  o2Rate: number; // Oxygen production rate in ppm/min
}

export const usePhotosynthesisTelemetry = () => {
  // Refs for tracking mutable values in simulation interval
  const lightRef = useRef<number>(50.0); // light intensity 0-100%
  const co2Ref = useRef<number>(400.0);  // CO2 concentration in ppm
  const fanStatusRef = useRef<boolean>(false);

  // States
  const [light, _setLight] = useState<number>(50.0);
  const [co2, _setCo2] = useState<number>(400.0);
  const [o2Rate, setO2Rate] = useState<number>(20.0); // O2 production rate in ppm/min
  const [fanStatus, _setFanStatus] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [history, setHistory] = useState<PhotosynthesisPoint[]>([
    { time: 0, co2: 400.0, o2Rate: 20.0 }
  ]);

  // Setters sync refs
  const setLightState = (val: number) => {
    lightRef.current = val;
    _setLight(val);
  };

  const setCo2State = (val: number) => {
    co2Ref.current = val;
    _setCo2(val);
  };

  const setFanStatusState = (val: boolean) => {
    fanStatusRef.current = val;
    _setFanStatus(val);
  };

  // Constants
  const pMax = 45.0; // Max photosynthesis rate in ppm/min
  const km = 25.0;   // Half-saturation light level in %
  const respirationRate = 6.0; // Plant CO2 release rate in ppm/min

  // 1. Simulation Loop (ticks every 1s)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentLight = lightRef.current;
      const currentCo2 = co2Ref.current;
      const currentFan = fanStatusRef.current;

      // Photosynthesis Rate: P = Pmax * I / (I + Km)
      const pRate = currentLight > 0 ? (pMax * currentLight) / (currentLight + km) : 0;
      
      // Calculate net CO2 rate per minute: Net = Respiration - Photosynthesis
      const netCo2RatePerMin = respirationRate - pRate;
      const netCo2RatePerSec = netCo2RatePerMin / 60.0;

      let nextCo2 = currentCo2;

      if (currentFan) {
        // Ventilation pulls CO2 back to ambient 400.0 ppm rapidly
        nextCo2 = currentCo2 + (400.0 - currentCo2) * 0.25;
      } else {
        // Accumulate/decrease CO2 based on plant metabolism
        nextCo2 = Math.max(100.0, Math.min(1200.0, currentCo2 + netCo2RatePerSec));
      }

      // Round to 1 decimal
      nextCo2 = Math.round(nextCo2 * 10) / 10;
      const currentO2Rate = Math.round(pRate * 10) / 10;

      setCo2State(nextCo2);
      setO2Rate(currentO2Rate);

      setElapsedTime(prevTime => {
        const nextTime = prevTime + 1;
        setHistory(hist => {
          const updated = [...hist, { time: nextTime, co2: nextCo2, o2Rate: currentO2Rate }];
          return updated.slice(-30); // Cap history at 30 points
        });
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2. User Controls
  const changeLight = (intensity: number) => {
    setLightState(intensity);
    
    // Recalculate O2 rate immediately for instant UI feedback
    const pRate = intensity > 0 ? (pMax * intensity) / (intensity + km) : 0;
    setO2Rate(Math.round(pRate * 10) / 10);
  };

  const toggleFan = () => {
    setFanStatusState(!fanStatusRef.current);
  };

  const toggleSocketConnection = () => {
    setSocketStatus(prev => prev === 'connected' ? 'disconnected' : 'connected');
  };

  const resetChamber = () => {
    setLightState(50.0);
    setCo2State(400.0);
    setO2Rate(30.0);
    setFanStatusState(false);
    setElapsedTime(0);
    setHistory([{ time: 0, co2: 400.0, o2Rate: 30.0 }]);
  };

  return {
    light,
    co2,
    o2Rate,
    fanStatus,
    elapsedTime,
    socketStatus,
    history,
    changeLight,
    toggleFan,
    toggleSocketConnection,
    resetChamber,
  };
};
