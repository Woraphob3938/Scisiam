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
import { useLabTelemetry, TelemetryPoint } from '../hooks/useLabTelemetry';

interface MainLabScreenProps {
  navigation: any;
  route: any;
}

export const MainLabScreen: React.FC<MainLabScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const tablet = isTablet();
  
  // Params
  const { labTitle = "Newton's law of cooling" } = route.params || {};

  // Import our telemetry Hook (simulating Newton's Law of Cooling)
  const {
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
  } = useLabTelemetry();

  // Local state for input target temperature
  const [inputVal, setInputVal] = useState<string>('30');

  const handleSendCommand = () => {
    const tempNum = parseFloat(inputVal);
    if (isNaN(tempNum) || tempNum < 25 || tempNum > 95) {
      Alert.alert(
        'ข้อมูลไม่ถูกต้อง',
        'กรุณากรอกอุณหภูมิเป้าหมายระหว่าง 25°C ถึง 95°C'
      );
      return;
    }
    sendTargetTemperature(tempNum);
  };

  // Format Elapsed Time into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate SVG path for the chart
  const renderChartPath = (chartWidth: number, chartHeight: number) => {
    if (history.length < 2) return { linePath: '', fillPath: '' };

    const minY = 20; // fixed lower bound
    const maxY = 95; // fixed upper bound
    const count = history.length;

    // Map data to SVG space
    const points = history.map((point, index) => {
      const x = (index / (count - 1)) * chartWidth;
      // Invert Y axis for SVG (0 is top, height is bottom)
      const ratio = (point.temp - minY) / (maxY - minY);
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      const y = chartHeight - clampedRatio * chartHeight;
      return { x, y };
    });

    // Create line path "M x0 y0 L x1 y1..."
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    // Create closed fill path for gradient
    const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${chartHeight} L 0 ${chartHeight} Z`;

    return { linePath, fillPath };
  };

  // Memoized chart path calculation to prevent heavy graph calculations on text input changes
  const memoizedChartAreaWidth = tablet ? (width * 0.54) : (width - 32);
  const memoizedGraphWidth = memoizedChartAreaWidth - 35 - 10;
  const memoizedGraphHeight = 140 - 10 - 20;

  const chartPaths = useMemo(() => {
    return renderChartPath(memoizedGraphWidth, memoizedGraphHeight);
  }, [history, memoizedGraphWidth, memoizedGraphHeight]);

  // Renders the live stream camera rig layout
  const renderLiveViewport = (viewportWidth: number) => {
    const height = 200;
    return (
      <View style={[styles.viewportContainer, { height }]}>
        {/* Blinking Live Label */}
        <View style={styles.recBadge}>
          <View style={[styles.recDot, heatingStatus && styles.recDotActive]} />
          <Text style={styles.recText}>
            {socketStatus === 'connected' ? '🔴 LIVE STREAM' : '⏸️ OFFLINE VIEW'}
          </Text>
        </View>

        {/* Technical Specs Overlay */}
        <Text style={styles.cameraOverlayText}>
          CAM 01 | COOLING_RIG | FPS: 30
        </Text>

        <Text style={styles.timeOverlayText}>
          TIME: {formatTime(elapsedTime)}
        </Text>

        {/* Schematic laboratory rig */}
        <Svg width="100%" height="100%" viewBox="0 0 300 160">
          <Defs>
            {/* Liquid Gradient */}
            <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={heatingStatus ? '#3b82f6' : '#60a5fa'} stopOpacity="0.8" />
              <Stop offset="1" stopColor="#1e3a8a" stopOpacity="0.9" />
            </LinearGradient>
            {/* Heat Gradient */}
            <LinearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ef4444" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#f59e0b" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Table Stirrer Base */}
          <Rect x="80" y="120" width="140" height="15" rx="3" fill="#334155" />
          {/* Knob on Stirrer */}
          <Circle cx="110" cy="127" r="3" fill={heatingStatus ? colors.dangerGlow : '#475569'} />
          <Circle cx="120" cy="127" r="3" fill="#475569" />

          {/* Heating Flame Indicator */}
          {heatingStatus && (
            <Path
              d="M 90 120 Q 95 105 100 120 Q 105 100 110 120 Q 115 105 120 120 Q 125 100 130 120 Q 135 105 140 120 Q 145 100 150 120 Q 155 105 160 120 Q 165 100 170 120 Q 175 105 180 120 Q 185 100 190 120 Q 195 105 200 120 Z"
              fill="url(#fireGrad)"
            />
          )}

          {/* Beaker Outline */}
          <Path d="M 100 50 L 100 118 Q 100 120 102 120 L 198 120 Q 200 120 200 118 L 200 50" stroke="#f1f5f9" strokeWidth="2.5" fill="none" />
          <Path d="M 97 50 L 103 50" stroke="#f1f5f9" strokeWidth="2.5" />
          <Path d="M 197 50 L 203 50" stroke="#f1f5f9" strokeWidth="2.5" />

          {/* Liquid inside Beaker (water level reacts to temp expansion or stays static) */}
          <Rect x="102" y="65" width="96" height="53" fill="url(#waterGrad)" rx="2" />
          
          {/* Beaker markings */}
          <Line x1="102" y1="80" x2="112" y2="80" stroke="#e2e8f0" strokeWidth="1" />
          <SvgText x="115" y="83" fill="#e2e8f0" fontSize="7" fontWeight="bold">100ml</SvgText>
          <Line x1="102" y1="100" x2="112" y2="100" stroke="#e2e8f0" strokeWidth="1" />
          <SvgText x="115" y="103" fill="#e2e8f0" fontSize="7" fontWeight="bold">50ml</SvgText>

          {/* Temperature Sensor Rod */}
          <Rect x="148" y="20" width="4" height="70" fill="#94a3b8" rx="1" />
          {/* Sensor Cap */}
          <Rect x="145" y="15" width="10" height="8" fill="#475569" rx="1" />
          {/* Glowing sensor tip inside water */}
          <Circle cx="150" cy="89" r="3.5" fill={heatingStatus ? colors.dangerGlow : colors.cyanGlow} />

          {/* Steam Effect */}
          {waterTemp > 50 && (
            <Path
              d={`M 115 50 Q 120 30 115 15 M 150 45 Q 155 25 150 10 M 180 50 Q 185 30 180 15`}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              fill="none"
              opacity={Math.min(1, (waterTemp - 50) / 45)}
            />
          )}

          {/* Digital Telemetry HUD in the viewport */}
          <Rect x="10" y="20" width="70" height="35" rx="4" fill="rgba(15, 23, 42, 0.75)" stroke="#334155" strokeWidth="1" />
          <SvgText x="15" y="32" fill="#94a3b8" fontSize="8" fontWeight="bold">WATER TEMP</SvgText>
          <SvgText x="15" y="50" fill={heatingStatus ? colors.dangerGlow : colors.cyanGlow} fontSize="14" fontWeight="800">
            {waterTemp.toFixed(1)}°C
          </SvgText>
        </Svg>
      </View>
    );
  };

  // Render Telemetry values cards (Grid)
  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        {/* Card 1: Water Temp */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🌡️ อุณหภูมิน้ำ (Water)</Text>
          <Text style={[styles.statValue, { color: heatingStatus ? colors.dangerGlow : colors.cyanGlow }]}>
            {waterTemp.toFixed(1)} <Text style={styles.statUnit}>°C</Text>
          </Text>
          <Text style={styles.statDesc}>
            {heatingStatus ? '🔥 ฮีตเตอร์กำลังทำงาน' : '❄️ กำลังระบายความร้อน'}
          </Text>
        </View>

        {/* Card 2: Room Temp */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🏠 อุณหภูมิห้อง (Room)</Text>
          <Text style={[styles.statValue, { color: colors.amberGlow }]}>
            {ambientTemp.toFixed(1)} <Text style={styles.statUnit}>°C</Text>
          </Text>
          <Text style={styles.statDesc}>เซ็นเซอร์วัดค่าแวดล้อมคงที่</Text>
        </View>

        {/* Card 3: Elapsed Time */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>⏱️ เวลาทดลอง (Time)</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatTime(elapsedTime)}
          </Text>
          <Text style={styles.statDesc}>เวลาผ่านไปในการทดลอง</Text>
        </View>
      </View>
    );
  };

  // Render SVG Chart Panel
  const renderChart = (chartAreaWidth: number) => {
    const chartHeight = 140;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 10;
    const paddingBottom = 20;

    const graphHeight = chartHeight - paddingTop - paddingBottom;
    const { linePath, fillPath } = chartPaths;

    return (
      <View style={styles.chartPanel}>
        <View style={styles.chartHeader}>
          <Text style={styles.panelTitle}>กราฟค่าเซ็นเซอร์อุณหภูมิ (Real-time Telemetry)</Text>
          <Text style={styles.chartAxisSub}>อุณหภูมิ (°C) vs เวลา (วินาที)</Text>
        </View>

        {/* Custom SVG Line Chart */}
        <View style={{ height: chartHeight }}>
          <Svg width={chartAreaWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.cyanGlow} stopOpacity="0.4" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Left Y-axis Grid Labels & lines */}
            {[20, 45, 70, 95].map((val) => {
              const yRatio = (val - 20) / (95 - 20);
              const yPos = chartHeight - paddingBottom - yRatio * graphHeight;
              return (
                <React.Fragment key={val}>
                  {/* Grid Line */}
                  <Line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartAreaWidth - paddingRight}
                    y2={yPos}
                    stroke={colors.cardBorder}
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  {/* Axis Label */}
                  <SvgText
                    x={paddingLeft - 6}
                    y={yPos + 3}
                    fill={colors.textMuted}
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {val}°
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Render Path Data inside offset group */}
            {history.length >= 2 && (
              <View style={{ transform: [{ translateX: paddingLeft }, { translateY: paddingTop }] }}>
                {/* Gradient Area Fill */}
                <Path d={fillPath} fill="url(#chartGrad)" />
                {/* Neon Stroke Line */}
                <Path
                  d={linePath}
                  fill="none"
                  stroke={heatingStatus ? colors.dangerGlow : colors.cyanGlow}
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
        <Text style={styles.chartFootnote}>* แสดงความก้าวหน้าของอุณหภูมิในช่วง 30 วินาทีล่าสุด</Text>
      </View>
    );
  };

  // Render Command & Remote Control panel
  const renderControlPanel = () => {
    return (
      <View style={styles.controlPanel}>
        <Text style={styles.panelTitle}>แผงควบคุมการทดลอง (Control Panel)</Text>
        
        {/* Remote Heater setting */}
        <Text style={styles.controlSub}>สั่งการฮีตเตอร์ต้มน้ำระยะไกล (IoT Remote)</Text>
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
            <Text style={styles.inputUnit}>°C</Text>
          </View>

          <TouchableOpacity
            style={styles.commandBtn}
            onPress={handleSendCommand}
            activeOpacity={0.85}
          >
            {heatingStatus ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.commandBtnText}>ยืนยันส่งคำสั่ง</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* System parameters and actions */}
        <View style={styles.buttonActionGrid}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={resetLab}
          >
            <Text style={styles.resetBtnText}>🔄 รีเซ็ตแล็บ (Reset)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.connectionToggle,
              socketStatus === 'connected' ? styles.connOnline : styles.connOffline,
            ]}
            onPress={toggleSocketConnection}
          >
            <Text style={styles.connToggleText}>
              {socketStatus === 'connected' ? '🟢 Socket: Online' : '🔴 Socket: Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>⬅️ กลับ</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          {labTitle}
        </Text>

        <View style={[
          styles.statusBadge,
          socketStatus === 'connected' ? styles.statusOnline : styles.statusOffline
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: socketStatus === 'connected' ? colors.emeraldGlow : colors.dangerGlow }
          ]} />
          <Text style={[
            styles.statusText,
            { color: socketStatus === 'connected' ? colors.emeraldGlow : colors.dangerGlow }
          ]}>
            {socketStatus === 'connected' ? 'IoT Online' : 'Simulation'}
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
              {renderLiveViewport(width * 0.4)}
              <View style={{ height: spacing.md }} />
              {renderControlPanel()}
            </ScrollView>
          </View>

          {/* Right Column (Stats & Chart) */}
          <View style={styles.rightCol}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderStats()}
              <View style={{ height: spacing.md }} />
              {renderChart(width * 0.54)}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* SMARTPHONE LAYOUT: Vertical Scroll Stack */
        <ScrollView contentContainerStyle={styles.scrollWrapper} showsVerticalScrollIndicator={false}>
          {renderLiveViewport(width - 32)}
          {renderStats()}
          {renderChart(width - 32)}
          {renderControlPanel()}
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
  // Section A: Video Viewport
  viewportContainer: {
    backgroundColor: '#05070c',
    borderRadius: roundness.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
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
  // Section B: Stats
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
    includeFontPadding: false,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: fonts.extraBold,
    includeFontPadding: false,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: fonts.regular,
  },
  statDesc: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: fonts.regular,
    includeFontPadding: false,
  },
  // Section C: SVG Chart
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
    includeFontPadding: false,
  },
  controlSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: fonts.regular,
    includeFontPadding: false,
  },
  chartAxisSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: fonts.regular,
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
  // Section D: Control Panel
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
    padding: 0, // clears defaults
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
    includeFontPadding: false,
  },
});
export default MainLabScreen;
