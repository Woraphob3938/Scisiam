import { useState, useEffect, useRef } from 'react';

export interface TitrationPoint {
  vol: number; // Volume of acid added in mL
  ph: number;  // pH value
}

export const useTitrationTelemetry = () => {
  // Refs for tracking mutable values in simulation interval
  const acidVolRef = useRef<number>(0.0);
  const isAutoDrippingRef = useRef<boolean>(false);

  // States
  const [acidVol, _setAcidVol] = useState<number>(0.0);
  const [ph, setPh] = useState<number>(13.0);
  const [isAutoDripping, _setIsAutoDripping] = useState<boolean>(false);
  const [history, setHistory] = useState<TitrationPoint[]>([
    { vol: 0.0, ph: 13.0 }
  ]);

  // Setters sync refs
  const setAcidVolState = (vol: number) => {
    acidVolRef.current = vol;
    _setAcidVol(vol);
  };

  const setIsAutoDrippingState = (val: boolean) => {
    isAutoDrippingRef.current = val;
    _setIsAutoDripping(val);
  };

  // Titration pH calculator (HCl 0.1M + NaOH 0.1M 50mL)
  const calculatePh = (vol: number): number => {
    const Va = vol;
    const Vb = 50.0;
    const Ca = 0.1;
    const Cb = 0.1;

    // Equivalence point (clamped for mathematical stability)
    if (Math.abs(Va - 50.0) < 0.08) {
      return 7.0;
    }

    if (Va < 50.0) {
      // Before equivalence point: excess OH-
      const ohConc = (Cb * Vb - Ca * Va) / (Vb + Va);
      if (ohConc <= 0) return 7.0;
      const pOH = -Math.log10(ohConc);
      const computedPh = 14.0 - pOH;
      return Math.round(computedPh * 100) / 100;
    } else {
      // After equivalence point: excess H+
      const hConc = (Ca * Va - Cb * Vb) / (Vb + Va);
      if (hConc <= 0) return 7.0;
      const computedPh = -Math.log10(hConc);
      return Math.round(computedPh * 100) / 100;
    }
  };

  // 1. Auto Dripping Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAutoDrippingRef.current) return;

      const currentVol = acidVolRef.current;
      if (currentVol >= 100.0) {
        setIsAutoDrippingState(false); // Stop when burette limit is reached
        return;
      }

      // Add a drop (0.5 mL)
      const nextVol = Math.min(100.0, currentVol + 0.5);
      const nextPh = calculatePh(nextVol);

      setAcidVolState(nextVol);
      setPh(nextPh);

      setHistory(hist => {
        // Only append if it's a new volume increment
        const exists = hist.some(p => Math.abs(p.vol - nextVol) < 0.1);
        if (exists) return hist;
        const updated = [...hist, { vol: nextVol, ph: nextPh }];
        return updated.sort((a, b) => a.vol - b.vol);
      });
    }, 400); // 400ms per drop in auto mode

    return () => clearInterval(interval);
  }, []);

  // 2. Manual Action: Trigger Drop
  const addAcidDrop = (amount: number = 0.5) => {
    const currentVol = acidVolRef.current;
    if (currentVol >= 100.0) return;

    const nextVol = Math.min(100.0, currentVol + amount);
    const nextPh = calculatePh(nextVol);

    setAcidVolState(nextVol);
    setPh(nextPh);

    setHistory(hist => {
      const exists = hist.some(p => Math.abs(p.vol - nextVol) < 0.1);
      if (exists) return hist;
      const updated = [...hist, { vol: nextVol, ph: nextPh }];
      return updated.sort((a, b) => a.vol - b.vol);
    });
  };

  // 3. Toggle Auto mode
  const toggleAutoDrip = () => {
    setIsAutoDrippingState(!isAutoDrippingRef.current);
  };

  // 4. Reset Experiment
  const resetTitration = () => {
    setAcidVolState(0.0);
    setPh(13.0);
    setIsAutoDrippingState(false);
    setHistory([{ vol: 0.0, ph: 13.0 }]);
  };

  return {
    acidVol,
    ph,
    isAutoDripping,
    history,
    addAcidDrop,
    toggleAutoDrip,
    resetTitration,
  };
};
