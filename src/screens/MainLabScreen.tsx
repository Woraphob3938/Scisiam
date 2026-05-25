import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, spacing, roundness, shadows, isTablet, fonts } from '../theme';
import { useLabTelemetry } from '../hooks/useLabTelemetry';
import { useTitrationTelemetry } from '../hooks/useTitrationTelemetry';
import { usePhotosynthesisTelemetry } from '../hooks/usePhotosynthesisTelemetry';

interface MainLabScreenProps {
  navigation: any;
  route: any;
}

export const MainLabScreen: React.FC<MainLabScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const tablet = isTablet();
  
  // Params
  const { labId = 'newton-cooling', labTitle = "Newton's law of cooling" } = route.params || {};

  // Instantiate all three hooks unconditionally (React Hook rules)
  const cooling = useLabTelemetry();
  const titration = useTitrationTelemetry();
  const biology = usePhotosynthesisTelemetry();

  // Local state for target temperature input (Physics only)
  const [inputVal, setInputVal] = useState<string>('30');

  // Format Elapsed Time into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // DYNAMIC CHART PATH CALCULATORS (MEMOIZED INDIVIDUALLY)
  // -------------------------------------------------------------
  const chartAreaWidth = tablet ? (width * 0.54) : (width - 32);
  const graphWidth = chartAreaWidth - 35 - 10;
  const graphHeight = 140 - 10 - 20; // 110

  // 1. Physics chart path
  const coolingPaths = useMemo(() => {
    const history = cooling.history;
    if (history.length < 2) return { linePath: '', fillPath: '' };
    const minY = 20, maxY = 95;
    const count = history.length;
    const points = history.map((point, index) => {
      const x = (index / (count - 1)) * graphWidth;
      const ratio = (point.temp - minY) / (maxY - minY);
      const clamped = Math.max(0, Math.min(1, ratio));
      const y = graphHeight - clamped * graphHeight;
      return { x, y };
    });
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${graphHeight} L 0 ${graphHeight} Z`;
    return { linePath, fillPath };
  }, [cooling.history, graphWidth]);

  // 2. Chemistry Titration chart path (X axis is mL volume 0-100, Y is pH 0-14)
  const titrationPaths = useMemo(() => {
    const history = titration.history;
    if (history.length < 2) return { linePath: '', fillPath: '' };
    const minX = 0, maxX = 100;
    const minY = 0, maxY = 14;
    const points = history.map((point) => {
      const x = ((point.vol - minX) / (maxX - minX)) * graphWidth;
      const ratio = (point.ph - minY) / (maxY - minY);
      const clamped = Math.max(0, Math.min(1, ratio));
      const y = graphHeight - clamped * graphHeight;
      return { x, y };
    });
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${graphHeight} L 0 ${graphHeight} Z`;
    return { linePath, fillPath };
  }, [titration.history, graphWidth]);

  // 3. Biology Photosynthesis chart path (Y axis is CO2 level 100-1200 ppm)
  const biologyPaths = useMemo(() => {
    const history = biology.history;
    if (history.length < 2) return { linePath: '', fillPath: '' };
    const minY = 100, maxY = 1200;
    const count = history.length;
    const points = history.map((point, index) => {
      const x = (index / (count - 1)) * graphWidth;
      const ratio = (point.co2 - minY) / (maxY - minY);
      const clamped = Math.max(0, Math.min(1, ratio));
      const y = graphHeight - clamped * graphHeight;
      return { x, y };
    });
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${graphHeight} L 0 ${graphHeight} Z`;
    return { linePath, fillPath };
  }, [biology.history, graphWidth]);

  // -------------------------------------------------------------
  // RENDERING MODULES FOR PHYSICS (Newton Cooling)
  // -------------------------------------------------------------
  const handleSendCommandPhysics = () => {
    const tempNum = parseFloat(inputVal);
    if (isNaN(tempNum) || tempNum < 25 || tempNum > 95) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกอุณหภูมิเป้าหมายระหว่าง 25°C ถึง 95°C');
      return;
    }
    cooling.sendTargetTemperature(tempNum);
  };

  const renderPhysicsViewport = () => {
    return (
      <View style={styles.viewportContainer}>
        <View style={styles.recBadge}>
          <View style={[styles.recDot, cooling.heatingStatus && styles.recDotActive]} />
          <Text style={styles.recText}>
            {cooling.socketStatus === 'connected' ? '🔴 LIVE STREAM' : '⏸️ OFFLINE VIEW'}
          </Text>
        </View>
        <Text style={styles.cameraOverlayText}>CAM 01 | COOLING_RIG | FPS: 30</Text>
        <Text style={styles.timeOverlayText}>TIME: {formatTime(cooling.elapsedTime)}</Text>

        <Svg width="100%" height={200} viewBox="0 0 300 160">
          <Defs>
            <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={cooling.heatingStatus ? '#3b82f6' : '#60a5fa'} stopOpacity="0.8" />
              <Stop offset="1" stopColor="#1e3a8a" stopOpacity="0.9" />
            </LinearGradient>
            <LinearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ef4444" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#f59e0b" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Table Stirrer Base */}
          <Rect x="80" y="120" width="140" height="15" rx="3" fill="#334155" />
          <Circle cx="110" cy="127" r="3" fill={cooling.heatingStatus ? colors.dangerGlow : '#475569'} />
          <Circle cx="120" cy="127" r="3" fill="#475569" />

          {/* Heating Flame Indicator */}
          {cooling.heatingStatus && (
            <Path
              d="M 90 120 Q 95 105 100 120 Q 105 100 110 120 Q 115 105 120 120 Q 125 100 130 120 Q 135 105 140 120 Q 145 100 150 120 Q 155 105 160 120 Q 165 100 170 120 Q 175 105 180 120 Q 185 100 190 120 Q 195 105 200 120 Z"
              fill="url(#fireGrad)"
            />
          )}

          {/* Beaker Outline */}
          <Path d="M 100 50 L 100 118 Q 100 120 102 120 L 198 120 Q 200 120 200 118 L 200 50" stroke="#f1f5f9" strokeWidth="2.5" fill="none" />
          <Path d="M 97 50 L 103 50" stroke="#f1f5f9" strokeWidth="2.5" />
          <Path d="M 197 50 L 203 50" stroke="#f1f5f9" strokeWidth="2.5" />

          {/* Liquid inside Beaker */}
          <Rect x="102" y="65" width="96" height="53" fill="url(#waterGrad)" rx="2" />
          
          {/* Beaker markings */}
          <Line x1="102" y1="80" x2="112" y2="80" stroke="#e2e8f0" strokeWidth="1" />
          <SvgText x="115" y="83" fill="#e2e8f0" fontSize="7" fontWeight="bold">100ml</SvgText>
          <Line x1="102" y1="100" x2="112" y2="100" stroke="#e2e8f0" strokeWidth="1" />
          <SvgText x="115" y="103" fill="#e2e8f0" fontSize="7" fontWeight="bold">50ml</SvgText>

          {/* Temperature Sensor Rod */}
          <Rect x="148" y="20" width="4" height="70" fill="#94a3b8" rx="1" />
          <Rect x="145" y="15" width="10" height="8" fill="#475569" rx="1" />
          <Circle cx="150" cy="89" r="3.5" fill={cooling.heatingStatus ? colors.dangerGlow : colors.cyanGlow} />

          {/* Steam Effect */}
          {cooling.waterTemp > 50 && (
            <Path
              d={`M 115 50 Q 120 30 115 15 M 150 45 Q 155 25 150 10 M 180 50 Q 185 30 180 15`}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              fill="none"
              opacity={Math.min(1, (cooling.waterTemp - 50) / 45)}
            />
          )}

          {/* Digital Telemetry HUD in the viewport */}
          <Rect x="10" y="20" width="70" height="35" rx="4" fill="rgba(15, 23, 42, 0.75)" stroke="#334155" strokeWidth="1" />
          <SvgText x="15" y="32" fill="#94a3b8" fontSize="8" fontWeight="bold">WATER TEMP</SvgText>
          <SvgText x="15" y="50" fill={cooling.heatingStatus ? colors.dangerGlow : colors.cyanGlow} fontSize="14" fontWeight="800">
            {cooling.waterTemp.toFixed(1)}°C
          </SvgText>
        </Svg>
      </View>
    );
  };

  const renderPhysicsStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>🌡️ อุณหภูมิน้ำ (Water)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: cooling.heatingStatus ? colors.dangerGlow : colors.cyanGlow }]}>
            {cooling.waterTemp.toFixed(1)} <Text textBreakStrategy="simple" style={styles.statUnit}>°C</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>{cooling.heatingStatus ? '🔥 ฮีตเตอร์ทำงาน' : '❄️ กำลังระบายความร้อน'}</Text>
        </View>

        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>🏠 อุณหภูมิห้อง (Room)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: colors.amberGlow }]}>
            {cooling.ambientTemp.toFixed(1)} <Text textBreakStrategy="simple" style={styles.statUnit}>°C</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>เซ็นเซอร์แวดล้อมคงที่</Text>
        </View>

        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>⏱️ เวลาทดลอง (Time)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatTime(cooling.elapsedTime)}
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>เวลาในการระบายความร้อน</Text>
        </View>
      </View>
    );
  };

  const renderPhysicsControls = () => {
    return (
      <View style={styles.controlPanel}>
        <Text textBreakStrategy="simple" style={styles.panelTitle}>แผงควบคุมการทดลอง (Control Panel)</Text>
        <Text textBreakStrategy="simple" style={styles.controlSub}>สั่งการฮีตเตอร์ต้มน้ำระยะไกล (IoT Remote)</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={colors.textMuted}
            />
            <Text textBreakStrategy="simple" style={styles.inputUnit}>°C</Text>
          </View>

          <TouchableOpacity style={styles.commandBtn} onPress={handleSendCommandPhysics} activeOpacity={0.85}>
            {cooling.heatingStatus ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text textBreakStrategy="simple" style={styles.commandBtnText}>ยืนยันส่งคำสั่ง</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.buttonActionGrid}>
          <TouchableOpacity style={styles.resetBtn} onPress={cooling.resetLab}>
            <Text textBreakStrategy="simple" style={styles.resetBtnText}>🔄 รีเซ็ตแล็บ (Reset)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.connectionToggle, cooling.socketStatus === 'connected' ? styles.connOnline : styles.connOffline]}
            onPress={cooling.toggleSocketConnection}
          >
            <Text textBreakStrategy="simple" style={styles.connToggleText}>
              {cooling.socketStatus === 'connected' ? '🟢 Socket: Online' : '🔴 Socket: Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // RENDERING MODULES FOR CHEMISTRY (Titration Lab)
  // -------------------------------------------------------------
  const renderChemistryViewport = () => {
    const isPink = titration.ph > 8.2;
    return (
      <View style={styles.viewportContainer}>
        <View style={styles.recBadge}>
          <View style={[styles.recDot, titration.isAutoDripping && styles.recDotActive]} />
          <Text style={styles.recText}>
            {titration.socketStatus === 'connected' ? '🔴 LIVE STREAM' : '⏸️ OFFLINE VIEW'}
          </Text>
        </View>
        <Text style={styles.cameraOverlayText}>CAM 02 | TITRATION_RIG | FPS: 30</Text>
        <Text style={styles.timeOverlayText}>VOLUME: {titration.acidVol.toFixed(1)} mL</Text>

        <Svg width="100%" height={200} viewBox="0 0 300 160">
          <Defs>
            <LinearGradient id="flaskGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={isPink ? '#f472b6' : '#f8fafc'} stopOpacity={isPink ? 0.75 : 0.4} />
              <Stop offset="1" stopColor={isPink ? '#db2777' : '#cbd5e1'} stopOpacity={isPink ? 0.9 : 0.6} />
            </LinearGradient>
          </Defs>

          {/* Table / Base */}
          <Rect x="80" y="135" width="140" height="10" rx="2" fill="#475569" />

          {/* Titration Stand Rod */}
          <Rect x="190" y="20" width="4" height="115" fill="#64748b" />
          <Rect x="155" y="45" width="38" height="6" fill="#475569" />

          {/* Glass Burette Container */}
          <Rect x="145" y="10" width="10" height="75" rx="1" fill="#f1f5f9" opacity="0.3" stroke="#cbd5e1" strokeWidth="1" />
          {/* Acid Level inside burette */}
          {titration.acidVol < 100 && (
            <Rect
              x="146.5"
              y={11 + (titration.acidVol / 100.0) * 60}
              width="7"
              height={73 - (titration.acidVol / 100.0) * 60}
              fill="#93c5fd"
              opacity="0.75"
            />
          )}
          {/* Valve/Tap */}
          <Circle cx="150" cy="85" r="3" fill="#ef4444" />

          {/* Falling drop animation based on auto drip state */}
          {titration.isAutoDripping && (
            <Circle cx="150" cy={92 + ((titration.acidVol * 25) % 20)} r="2" fill="#93c5fd" />
          )}

          {/* Erlenmeyer Flask Outline */}
          <Path d="M 140 100 L 160 100 L 160 108 L 180 132 Q 182 135 178 135 L 122 135 Q 118 135 120 132 L 140 108 Z" stroke="#f1f5f9" strokeWidth="2" fill="none" />
          
          {/* Liquid inside flask (Color reacts dynamically to pH) */}
          <Path
            d="M 132 120 L 168 120 L 176 131 Q 178 133 175 133 L 125 133 Q 122 133 124 131 Z"
            fill="url(#flaskGrad)"
          />

          {/* Digital HUD box inside chemistry viewport */}
          <Rect x="10" y="20" width="70" height="35" rx="4" fill="rgba(15, 23, 42, 0.75)" stroke="#334155" strokeWidth="1" />
          <SvgText x="15" y="32" fill="#94a3b8" fontSize="8" fontWeight="bold">MIX pH VALUE</SvgText>
          <SvgText x="15" y="50" fill={isPink ? '#f472b6' : '#2563eb'} fontSize="13" fontWeight="800">
            pH {titration.ph.toFixed(2)}
          </SvgText>
        </Svg>
      </View>
    );
  };

  const renderChemistryStats = () => {
    const isPink = titration.ph > 8.2;
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>🧪 ปริมาตรกรด (Acid Added)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: colors.primary }]}>
            {titration.acidVol.toFixed(1)} <Text textBreakStrategy="simple" style={styles.statUnit}>mL</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>กรด HCl 0.1M ที่เพิ่มเข้าไป</Text>
        </View>

        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>📐 ค่าความเป็นกรด-เบส (pH)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: isPink ? '#db2777' : colors.primary }]}>
            {titration.ph.toFixed(2)}
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>{isPink ? '💗 ด่าง (เบส) + Phenolphthalein' : '🤍 สารละลายสะเทินเป็นกลาง/กรด'}</Text>
        </View>

        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>🧪 ปริมาตรตั้งต้น (Base Vol)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: colors.textPrimary }]}>
            50.0 <Text textBreakStrategy="simple" style={styles.statUnit}>mL</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>เบส NaOH 0.1M ในขวด</Text>
        </View>
      </View>
    );
  };

  const renderChemistryControls = () => {
    return (
      <View style={styles.controlPanel}>
        <Text textBreakStrategy="simple" style={styles.panelTitle}>แผงควบคุมการหยดกรด (Titration Controller)</Text>
        <Text textBreakStrategy="simple" style={styles.controlSub}>สั่งสั่งการบิวเรตต์อิเล็กทรอนิกส์ระยะไกล (Burette IoT)</Text>
        
        <View style={styles.inputRow}>
          <TouchableOpacity style={[styles.commandBtn, { flex: 1, marginRight: spacing.md }]} onPress={() => titration.addAcidDrop(0.5)}>
            <Text textBreakStrategy="simple" style={styles.commandBtnText}>💧 หยดกรด (+0.5 mL)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.commandBtn, { flex: 1, backgroundColor: titration.isAutoDripping ? colors.dangerGlow : colors.primary }]}
            onPress={titration.toggleAutoDrip}
          >
            <Text textBreakStrategy="simple" style={styles.commandBtnText}>
              {titration.isAutoDripping ? '⏸️ หยุดหยดออโต้' : '⏳ หยดอัตโนมัติ'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonActionGrid}>
          <TouchableOpacity style={styles.resetBtn} onPress={titration.resetTitration}>
            <Text textBreakStrategy="simple" style={styles.resetBtnText}>🔄 รีเซ็ตการทดลอง (Reset)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.connectionToggle, titration.socketStatus === 'connected' ? styles.connOnline : styles.connOffline]}
            onPress={titration.toggleSocketConnection}
          >
            <Text textBreakStrategy="simple" style={styles.connToggleText}>
              {titration.socketStatus === 'connected' ? '🟢 Socket: Online' : '🔴 Socket: Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // RENDERING MODULES FOR BIOLOGY (Photosynthesis Chamber)
  // -------------------------------------------------------------
  const renderBiologyViewport = () => {
    // We animate bubbles using elapsed time modulo values
    const bubbleSpeed = 16;
    const timeTick = biology.elapsedTime;
    return (
      <View style={styles.viewportContainer}>
        <View style={styles.recBadge}>
          <View style={[styles.recDot, biology.light > 0 && styles.recDotActive]} />
          <Text style={styles.recText}>
            {biology.socketStatus === 'connected' ? '🔴 LIVE STREAM' : '⏸️ OFFLINE VIEW'}
          </Text>
        </View>
        <Text style={styles.cameraOverlayText}>CAM 03 | CHAMBER_BIO | FPS: 30</Text>
        <Text style={styles.timeOverlayText}>CO2 LEVEL: {biology.co2.toFixed(1)} ppm</Text>

        <Svg width="100%" height={200} viewBox="0 0 300 160">
          <Defs>
            {/* Bulb Glow Gradient */}
            <LinearGradient id="bulbGlow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#fef08a" stopOpacity={biology.light / 100.0 * 0.6} />
              <Stop offset="1" stopColor="#eab308" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Chamber Outline Box */}
          <Rect x="50" y="25" width="200" height="115" rx="4" stroke="#f1f5f9" strokeWidth="2.5" fill="none" opacity="0.3" />
          <Rect x="48" y="22" width="204" height="121" rx="6" stroke="#475569" strokeWidth="1" fill="none" />

          {/* Glowing Lamp from ceiling */}
          <Rect x="135" y="25" width="30" height="10" fill="#64748b" />
          <Circle cx="150" cy="38" r="8" fill={biology.light > 0 ? '#fef08a' : '#94a3b8'} />
          
          {/* Bulb Glow rays */}
          {biology.light > 0 && (
            <Path d="M 120 40 L 180 40 L 210 110 L 90 110 Z" fill="url(#bulbGlow)" />
          )}

          {/* Plant Pot */}
          <Rect x="135" y="115" width="30" height="20" fill="#b45309" rx="1.5" />
          <Line x1="133" y1="115" x2="167" y2="115" stroke="#78350f" strokeWidth="3.5" />

          {/* Plant Leaves and stem */}
          <Path d="M 150 115 Q 150 90 148 70" stroke="#047857" strokeWidth="3" fill="none" />
          {/* Left Leaves */}
          <Path d="M 148 100 Q 130 90 142 85 Q 148 95 148 100" fill="#10b981" />
          <Path d="M 148 80 Q 125 70 138 65 Q 148 75 148 80" fill="#10b981" />
          {/* Right Leaves */}
          <Path d="M 149 105 Q 168 95 156 90 Q 149 98 149 105" fill="#10b981" />
          <Path d="M 148 88 Q 170 78 158 73 Q 148 83 148 88" fill="#10b981" />
          {/* Top Bud */}
          <Circle cx="148" cy="68" r="3.5" fill="#34d399" />

          {/* Oxygen Bubbles rising upwards when light is on */}
          {biology.light > 0 && (
            <React.Fragment>
              <Circle cx="135" cy={100 - ((timeTick * bubbleSpeed) % 65)} r="1.5" fill="#34d399" opacity="0.8" />
              <Circle cx="160" cy={95 - ((timeTick * bubbleSpeed + 25) % 65)} r="2" fill="#34d399" opacity="0.7" />
              <Circle cx="140" cy={80 - ((timeTick * bubbleSpeed + 45) % 65)} r="1.2" fill="#34d399" opacity="0.9" />
              <Circle cx="155" cy={75 - ((timeTick * bubbleSpeed + 10) % 65)} r="1.8" fill="#34d399" opacity="0.85" />
            </React.Fragment>
          )}

          {/* Small fan inside chamber */}
          <Circle cx="70" cy="45" r="8" fill="#475569" />
          {/* Fan blades */}
          <Path
            d="M 70 45 L 70 37 M 70 45 L 70 53 M 70 45 L 62 45 M 70 45 L 78 45"
            stroke="#1e293b"
            strokeWidth="1.5"
            rotation={biology.fanStatus ? timeTick * 45 : 0}
            origin="70, 45"
          />
          {biology.fanStatus && (
            <Path d="M 83 41 Q 88 45 83 49 M 87 41 Q 92 45 87 49" stroke="#94a3b8" strokeWidth="1" fill="none" />
          )}

          {/* Digital HUD box inside biology viewport */}
          <Rect x="10" y="20" width="70" height="35" rx="4" fill="rgba(15, 23, 42, 0.75)" stroke="#334155" strokeWidth="1" />
          <SvgText x="15" y="32" fill="#94a3b8" fontSize="8" fontWeight="bold">PHOTOSYNTHESIS</SvgText>
          <SvgText x="15" y="50" fill={biology.light > 0 ? colors.emeraldGlow : colors.textSecondary} fontSize="11" fontWeight="800">
            {biology.o2Rate.toFixed(1)} ppm/m
          </SvgText>
        </Svg>
      </View>
    );
  };

  const renderBiologyStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>💡 ความเข้มแสง (Light)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: colors.amberGlow }]}>
            {biology.light.toFixed(0)} <Text textBreakStrategy="simple" style={styles.statUnit}>%</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>ควบคุมความสว่างหลอดไฟ LED</Text>
        </View>

        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>🌱 ความเข้มข้น CO2 (Chamber)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: biology.co2 > 450 ? colors.dangerGlow : colors.emeraldGlow }]}>
            {biology.co2.toFixed(1)} <Text textBreakStrategy="simple" style={styles.statUnit}>ppm</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>{biology.co2 < 400 ? '🍃 พืชกำลังดูดซึมคาร์บอน' : '🍂 คาร์บอนสะสมจากการหายใจ'}</Text>
        </View>

        <View style={styles.statCard}>
          <Text textBreakStrategy="simple" style={styles.statLabel}>💨 อัตราผลิต O2 (Oxygen)</Text>
          <Text textBreakStrategy="simple" style={[styles.statValue, { color: colors.emeraldGlow }]}>
            {biology.o2Rate.toFixed(1)} <Text textBreakStrategy="simple" style={styles.statUnit}>ppm/m</Text>
          </Text>
          <Text textBreakStrategy="simple" style={styles.statDesc}>อัตราการผลิตก๊าซออกซิเจน</Text>
        </View>
      </View>
    );
  };

  const renderBiologyControls = () => {
    const currentLightStr = biology.light.toFixed(0);
    return (
      <View style={styles.controlPanel}>
        <Text textBreakStrategy="simple" style={styles.panelTitle}>แผงควบคุมระบบชีวนิเวศ (Bio-Chamber Controls)</Text>
        <Text textBreakStrategy="simple" style={styles.controlSub}>สั่งปรับความเข้มแสงไฟสังเคราะห์แสง (IoT Light Controller)</Text>

        <View style={styles.inputRow}>
          {/* Quick buttons to set light level */}
          <View style={[styles.buttonActionGrid, { flex: 1, marginTop: 0, marginRight: spacing.md }]}>
            <TouchableOpacity style={[styles.resetBtn, { marginRight: 8, height: 48 }]} onPress={() => biology.changeLight(0)}>
              <Text textBreakStrategy="simple" style={styles.resetBtnText}>💡 ปิดไฟ (0%)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resetBtn, { marginRight: 8, height: 48 }]} onPress={() => biology.changeLight(50)}>
              <Text textBreakStrategy="simple" style={styles.resetBtnText}>💡 กลาง (50%)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resetBtn, { height: 48, marginRight: 0 }]} onPress={() => biology.changeLight(100)}>
              <Text textBreakStrategy="simple" style={styles.resetBtnText}>💡 สูง (100%)</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWrapper, { width: 75, flex: 0, marginRight: 0 }]}>
            <Text textBreakStrategy="simple" style={styles.input}>{currentLightStr}</Text>
            <Text textBreakStrategy="simple" style={styles.inputUnit}>%</Text>
          </View>
        </View>

        <View style={styles.buttonActionGrid}>
          <TouchableOpacity
            style={[styles.resetBtn, biology.fanStatus && { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: colors.primary }]}
            onPress={biology.toggleFan}
          >
            <Text textBreakStrategy="simple" style={[styles.resetBtnText, biology.fanStatus && { color: colors.primary }]}>
              {biology.fanStatus ? '💨 พัดลม: เปิดอยู่' : '💨 พัดลม: ปิดอยู่'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={biology.resetChamber}>
            <Text textBreakStrategy="simple" style={styles.resetBtnText}>🔄 รีเซ็ตตู้ควบคุม (Reset)</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.buttonActionGrid, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            style={[styles.connectionToggle, { flex: 1 }, biology.socketStatus === 'connected' ? styles.connOnline : styles.connOffline]}
            onPress={biology.toggleSocketConnection}
          >
            <Text textBreakStrategy="simple" style={styles.connToggleText}>
              {biology.socketStatus === 'connected' ? '🟢 Socket: Online' : '🔴 Socket: Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // DYNAMIC CHART RENDERING DISPATCHER
  // -------------------------------------------------------------
  const renderSelectedChart = () => {
    const chartHeight = 140;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 10;
    const paddingBottom = 20;

    let linePath = '', fillPath = '', title = '', subtitle = '', footnote = '';
    let gridValues: number[] = [];
    let minY = 0, maxY = 100;
    let labelSuffix = '';

    if (labId === 'newton-cooling') {
      linePath = coolingPaths.linePath;
      fillPath = coolingPaths.fillPath;
      title = 'กราฟค่าเซ็นเซอร์อุณหภูมิ (Real-time Telemetry)';
      subtitle = 'อุณหภูมิน้ำ (°C) vs เวลา (วินาที)';
      footnote = '* แสดงการระบายอุณหภูมิในช่วง 30 วินาทีล่าสุด';
      gridValues = [20, 45, 70, 95];
      minY = 20;
      maxY = 95;
      labelSuffix = '°';
    } else if (labId === 'acid-base-titration') {
      linePath = titrationPaths.linePath;
      fillPath = titrationPaths.fillPath;
      title = 'กราฟการไทเทรตกรด-เบส (pH Curve)';
      subtitle = 'ค่า pH vs ปริมาตรกรด HCl ที่หยด (mL)';
      footnote = '* ปลายทางทางคณิตศาสตร์แสดงความสะเทินของปฏิกิริยาที่ปริมาณ 50 mL';
      gridValues = [0, 3.5, 7, 10.5, 14];
      minY = 0;
      maxY = 14;
      labelSuffix = '';
    } else if (labId === 'photosynthesis-monitor') {
      linePath = biologyPaths.linePath;
      fillPath = biologyPaths.fillPath;
      title = 'กราฟความเข้มข้น CO2 (Carbon Dioxide Chamber Graph)';
      subtitle = 'ความเข้มข้น CO2 (ppm) vs เวลา (วินาที)';
      footnote = '* สังเกตการตกของปริมาณคาร์บอนไดออกไซด์เมื่อพืชสังเคราะห์แสง';
      gridValues = [100, 375, 650, 925, 1200];
      minY = 100;
      maxY = 1200;
      labelSuffix = 'p';
    }

    return (
      <View style={styles.chartPanel}>
        <View style={styles.chartHeader}>
          <Text textBreakStrategy="simple" style={styles.panelTitle}>{title}</Text>
          <Text textBreakStrategy="simple" style={styles.chartAxisSub}>{subtitle}</Text>
        </View>

        <View style={{ height: chartHeight }}>
          <Svg width={chartAreaWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={labId === 'acid-base-titration' ? '#db2777' : colors.cyanGlow} stopOpacity="0.4" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Left Y-axis Grid Labels & lines */}
            {gridValues.map((val) => {
               const yRatio = (val - minY) / (maxY - minY);
               const yPos = chartHeight - paddingBottom - yRatio * graphHeight;
               return (
                 <React.Fragment key={val}>
                   <Line
                     x1={paddingLeft}
                     y1={yPos}
                     x2={chartAreaWidth - paddingRight}
                     y2={yPos}
                     stroke={colors.cardBorder}
                     strokeWidth="1"
                     strokeDasharray="4,4"
                   />
                   <SvgText
                     x={paddingLeft - 6}
                     y={yPos + 3}
                     fill={colors.textMuted}
                     fontSize="8"
                     fontWeight="bold"
                     textAnchor="end"
                     fontFamily={fonts.bold}
                   >
                     {val.toFixed(0)}{labelSuffix}
                   </SvgText>
                 </React.Fragment>
               );
            })}

            {/* Render Path Data inside offset group */}
            {linePath !== '' && (
              <View style={{ transform: [{ translateX: paddingLeft }, { translateY: paddingTop }] }}>
                <Path d={fillPath} fill="url(#chartGrad)" />
                <Path
                  d={linePath}
                  fill="none"
                  stroke={labId === 'acid-base-titration' ? '#db2777' : (labId === 'photosynthesis-monitor' ? colors.emeraldGlow : colors.cyanGlow)}
                  strokeWidth="2.5"
                />
              </View>
            )}

            {/* Axis boundary borders */}
            <Line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={chartHeight - paddingBottom}
              stroke={colors.cardBorder}
              strokeWidth="1.5"
            />
            <Line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartAreaWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke={colors.cardBorder}
              strokeWidth="1.5"
            />
          </Svg>
        </View>
        <Text textBreakStrategy="simple" style={styles.chartFootnote}>{footnote}</Text>
      </View>
    );
  };

  // -------------------------------------------------------------
  // DYNAMIC GENERAL LAYOUT STRUCTURE DISPATCHER
  // -------------------------------------------------------------
  const renderViewportByLab = () => {
    if (labId === 'newton-cooling') return renderPhysicsViewport();
    if (labId === 'acid-base-titration') return renderChemistryViewport();
    if (labId === 'photosynthesis-monitor') return renderBiologyViewport();
    return null;
  };

  const renderStatsByLab = () => {
    if (labId === 'newton-cooling') return renderPhysicsStats();
    if (labId === 'acid-base-titration') return renderChemistryStats();
    if (labId === 'photosynthesis-monitor') return renderBiologyStats();
    return null;
  };

  const renderControlsByLab = () => {
    if (labId === 'newton-cooling') return renderPhysicsControls();
    if (labId === 'acid-base-titration') return renderChemistryControls();
    if (labId === 'photosynthesis-monitor') return renderBiologyControls();
    return null;
  };

  const selectedSocketStatus = () => {
    if (labId === 'newton-cooling') return cooling.socketStatus;
    if (labId === 'acid-base-titration') return titration.socketStatus;
    if (labId === 'photosynthesis-monitor') return biology.socketStatus;
    return 'disconnected';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text textBreakStrategy="simple" style={styles.backBtnText}>⬅️ กลับ</Text>
        </TouchableOpacity>

        <Text textBreakStrategy="simple" style={styles.navTitle} numberOfLines={1}>
          {labTitle}
        </Text>

        <View style={[
          styles.statusBadge,
          selectedSocketStatus() === 'connected' ? styles.statusOnline : styles.statusOffline
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: selectedSocketStatus() === 'connected' ? colors.emeraldGlow : colors.dangerGlow }
          ]} />
          <Text textBreakStrategy="simple" style={[
            styles.statusText,
            { color: selectedSocketStatus() === 'connected' ? colors.emeraldGlow : colors.dangerGlow }
          ]}>
            {selectedSocketStatus() === 'connected' ? 'IoT Online' : 'Simulation'}
          </Text>
        </View>
      </View>

      {/* Main Body */}
      {tablet ? (
        /* TABLET LAYOUT: Horizontal Split View */
        <View style={styles.splitWrapper}>
          {/* Left Column (Video Stream & Control) */}
          <View style={styles.leftCol}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderViewportByLab()}
              <View style={{ height: spacing.md }} />
              {renderControlsByLab()}
            </ScrollView>
          </View>

          {/* Right Column (Stats & Chart) */}
          <View style={styles.rightCol}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderStatsByLab()}
              <View style={{ height: spacing.md }} />
              {renderSelectedChart()}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* SMARTPHONE LAYOUT: Vertical Scroll Stack */
        <ScrollView contentContainerStyle={styles.scrollWrapper} showsVerticalScrollIndicator={false}>
          {renderViewportByLab()}
          {renderStatsByLab()}
          {renderSelectedChart()}
          {renderControlsByLab()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNav: {
    height: 60,
    backgroundColor: colors.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: roundness.sm,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    fontFamily: fonts.bold,
    lineHeight: 12 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
    fontFamily: fonts.extraBold,
    lineHeight: 16 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: roundness.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusOnline: {
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderColor: colors.emeraldGlow,
  },
  statusOffline: {
    backgroundColor: 'rgba(255, 75, 92, 0.12)',
    borderColor: colors.dangerGlow,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.bold,
    lineHeight: 10 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  // Responsive Splitting for Tablet
  splitWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  leftCol: {
    width: '42%',
    marginRight: '2%',
  },
  rightCol: {
    width: '56%',
  },
  // Smartphone layout styles
  scrollWrapper: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Video Viewport Container
  viewportContainer: {
    backgroundColor: '#05070c',
    borderRadius: roundness.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    height: 200,
  },
  recBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: roundness.sm,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    marginRight: 6,
  },
  recDotActive: {
    backgroundColor: colors.dangerGlow,
  },
  recText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  cameraOverlayText: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: 'bold',
  },
  timeOverlayText: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: roundness.md,
    padding: spacing.sm,
    marginHorizontal: 4,
    ...shadows.card,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: fonts.bold,
    lineHeight: 10 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: fonts.extraBold,
    lineHeight: 18 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: fonts.regular,
    lineHeight: 12 * 1.45,
  },
  statDesc: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: fonts.regular,
    lineHeight: 8 * 1.5,
    paddingVertical: 1,
    includeFontPadding: false,
  },
  // SVG Chart Panel
  chartPanel: {
    backgroundColor: colors.cardBg,
    borderRadius: roundness.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  chartHeader: {
    marginBottom: spacing.sm,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    lineHeight: 14 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  controlSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: fonts.regular,
    lineHeight: 12 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  chartAxisSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: fonts.regular,
    lineHeight: 10 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  axisLabel: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  chartFootnote: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  // Control Panel
  controlPanel: {
    backgroundColor: colors.cardBg,
    borderRadius: roundness.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    ...shadows.card,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: roundness.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 48,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
  },
  inputUnit: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  commandBtn: {
    width: 130,
    backgroundColor: colors.primary,
    borderRadius: roundness.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glowCyan,
  },
  commandBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fonts.bold,
    lineHeight: 14 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  buttonActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: roundness.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fonts.bold,
    lineHeight: 12 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  connectionToggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: roundness.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connOnline: {
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderColor: colors.emeraldGlow,
  },
  connOffline: {
    backgroundColor: 'rgba(255, 75, 92, 0.12)',
    borderColor: colors.dangerGlow,
  },
  connToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    lineHeight: 12 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
});
export default MainLabScreen;
