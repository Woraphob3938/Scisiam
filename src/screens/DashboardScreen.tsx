import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Modal,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, Ellipse } from 'react-native-svg';
import { colors, spacing, roundness, shadows, isTablet, fonts } from '../theme';

interface DashboardScreenProps {
  navigation: any;
  route: any;
}

interface LabRoom {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  status: 'available' | 'busy' | 'offline';
  description: string;
  duration: string;
  usersActive: number;
}

const renderLabIcon = (subject: 'Physics' | 'Chemistry' | 'Biology') => {
  switch (subject) {
    case 'Physics':
      return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          {/* Orbits */}
          <Path d="M12 2C16.97 2 21 6.48 21 12C21 17.52 16.97 22 12 22C7.03 22 3 17.52 3 12C3 6.48 7.03 2 12 2Z" stroke="#2563eb" strokeWidth="1.2" transform="rotate(30 12 12) scale(1 0.35)" />
          <Path d="M12 2C16.97 2 21 6.48 21 12C21 17.52 16.97 22 12 22C7.03 22 3 17.52 3 12C3 6.48 7.03 2 12 2Z" stroke="#10b981" strokeWidth="1.2" transform="rotate(90 12 12) scale(1 0.35)" />
          <Path d="M12 2C16.97 2 21 6.48 21 12C21 17.52 16.97 22 12 22C7.03 22 3 17.52 3 12C3 6.48 7.03 2 12 2Z" stroke="#db2777" strokeWidth="1.2" transform="rotate(150 12 12) scale(1 0.35)" />
          {/* Nucleus */}
          <Circle cx="12" cy="12" r="2.5" fill="#334155" />
          <Circle cx="10.8" cy="11.2" r="1.8" fill="#ef4444" />
          <Circle cx="13.2" cy="12.8" r="1.8" fill="#3b82f6" />
          {/* Electrons */}
          <Circle cx="18.5" cy="8.2" r="1.2" fill="#ef4444" />
          <Circle cx="5.5" cy="15.8" r="1.2" fill="#3b82f6" />
          <Circle cx="12" cy="5.2" r="1.2" fill="#10b981" />
        </Svg>
      );
    case 'Chemistry':
      return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          {/* Beaker (Background) */}
          <Path d="M13 10 L13 18 C13 19.1 13.9 20 15 20 L21 20 C22.1 20 23 19.1 23 18 L23 10 Z" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
          <Line x1="12" y1="10" x2="24" y2="10" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M13.5 13 L22.5 13 L22.5 18.5 C22.5 19.2 21.8 19.8 21 19.8 L15 19.8 C14.2 19.8 13.5 19.2 13.5 18.5 Z" fill="#10b981" opacity="0.6" />
          <Line x1="16" y1="15" x2="19" y2="15" stroke="#475569" strokeWidth="1" />
          <Line x1="16" y1="17" x2="18" y2="17" stroke="#475569" strokeWidth="1" />

          {/* Test Tube (Foreground, tilted) */}
          <g transform="rotate(-20 8 13)">
            <Path d="M7 6 L9 6 L9 16 C9 17.1 8.1 18 7 18 C5.9 18 5 17.1 5 16 L5 6 Z" fill="#ef4444" opacity="0.75" />
            <Path d="M5 4 L5 16 C5 17.1 5.9 18 7 18 C8.1 18 9 17.1 9 16 L9 4" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <Ellipse cx="7" cy="4" rx="2.2" ry="0.8" fill="none" stroke="#334155" strokeWidth="1.5" />
          </g>
        </Svg>
      );
    case 'Biology':
      return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          {/* DNA Helix */}
          {/* Backbone 1 */}
          <Path d="M5 19 C 8 16, 9 12, 12 12 C 15 12, 16 8, 19 5" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          {/* Backbone 2 */}
          <Path d="M5 5 C 8 8, 9 12, 12 12 C 15 12, 16 16, 19 19" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Connecting bars */}
          <Line x1="7.5" y1="8" x2="7.5" y2="16" stroke="#475569" strokeWidth="1.5" />
          <Line x1="10" y1="10" x2="10" y2="14" stroke="#475569" strokeWidth="1.5" />
          <Line x1="14" y1="10" x2="14" y2="14" stroke="#475569" strokeWidth="1.5" />
          <Line x1="16.5" y1="8" x2="16.5" y2="16" stroke="#475569" strokeWidth="1.5" />
          
          {/* Nodes */}
          <Circle cx="7.5" cy="8" r="2.2" fill="#2563eb" />
          <Circle cx="7.5" cy="16" r="2.2" fill="#db2777" />
          <Circle cx="10" cy="10" r="1.8" fill="#2563eb" />
          <Circle cx="10" cy="14" r="1.8" fill="#db2777" />
          <Circle cx="14" cy="10" r="1.8" fill="#db2777" />
          <Circle cx="14" cy="14" r="1.8" fill="#2563eb" />
          <Circle cx="16.5" cy="8" r="2.2" fill="#db2777" />
          <Circle cx="16.5" cy="16" r="2.2" fill="#2563eb" />
        </Svg>
      );
  }
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const tablet = isTablet();

  // Params from login
  const { role = 'student', name = 'ผู้ใช้งาน' } = route.params || {};

  // Active filter category
  const [activeCategory, setActiveCategory] = useState<'All' | 'Physics' | 'Chemistry' | 'Biology'>('All');

  // Detail Modal State
  const [selectedLab, setSelectedLab] = useState<LabRoom | null>(null);

  // Mock list of laboratory rooms
  const labs: LabRoom[] = [
    {
      id: 'newton-cooling',
      title: "Newton's law of cooling",
      subject: 'Physics',
      status: 'available',
      description: 'ทดลองศึกษาความร้อนและการเย็นตัวของของเหลวตามกฎการเย็นตัวของนิวตัน ควบคุมฮีตเตอร์สั่งการอุณหภูมิ และอ่านค่าเซ็นเซอร์อุณหภูมิแบบ Real-time',
      duration: '15-20 นาที',
      usersActive: 0,
    },
    {
      id: 'acid-base-titration',
      title: 'Acid-Base Titration Lab',
      subject: 'Chemistry',
      status: 'available',
      description: 'การทดลองไทเทรตกรด-เบสระยะไกล ควบคุมการหยดของบิวเรตต์อัตโนมัติด้วยคำสั่งดิจิทัลและติดตามค่า pH ในสารละลายแบบ Real-time',
      duration: '25-30 นาที',
      usersActive: 3,
    },
    {
      id: 'photosynthesis-monitor',
      title: 'Photosynthesis Rate Chamber',
      subject: 'Biology',
      status: 'available',
      description: 'วิเคราะห์อัตราการสังเคราะห์แสงของพืชระยะไกล โดยสั่งควบคุมความสว่างหลอดไฟ LED ในกล่องทดลองปิด และตรวจดูความเข้มข้น CO2/O2',
      duration: '45 นาที',
      usersActive: 0,
    },
  ];

  // Filtering logic
  const filteredLabs = labs.filter(lab => activeCategory === 'All' || lab.subject === activeCategory);

  const getSubjectColor = (subject: 'Physics' | 'Chemistry' | 'Biology') => {
    switch (subject) {
      case 'Physics': return colors.cyanGlow;
      case 'Chemistry': return colors.primary;
      case 'Biology': return colors.emeraldGlow;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Navigation */}
      <View style={styles.topNav}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          <Text style={styles.navTitle}>SciSiam</Text>
        </View>

        {/* Right side is blank - no login/register buttons as requested */}
        <View />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.banner}>
          <Text textBreakStrategy="simple" style={styles.bannerTitle}>รายชื่อห้องแล็บ</Text>
          <Text textBreakStrategy="simple" style={styles.bannerSubtitle}>
            เลือกห้องแล็บที่ต้องการใช้งาน
          </Text>

          {/* Centered Badges Row */}
          <View style={styles.bannerBadgesRow}>
            <View style={styles.bannerBadgeGreen}>
              <View style={styles.badgeDotGreen} />
              <Text textBreakStrategy="simple" style={styles.badgeTextGreen}>Socket.IO Connected</Text>
            </View>
            <View style={styles.bannerBadgeBlue}>
              <View style={styles.badgeDotBlue} />
              <Text textBreakStrategy="simple" style={styles.badgeTextBlue}>ผู้ใช้งาน: 1 คน</Text>
            </View>
          </View>
        </View>

        {/* Filter Categories */}
        <View style={styles.filterContainer}>
          {(['All', 'Physics', 'Chemistry', 'Biology'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterTag,
                activeCategory === category && styles.filterTagActive,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                textBreakStrategy="simple"
                style={[
                  styles.filterTagText,
                  activeCategory === category && styles.filterTagTextActive,
                ]}
              >
                {category === 'All' ? 'ทั้งหมด' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Responsive Cards Grid */}
        <View style={[styles.grid, tablet && styles.gridTablet]}>
          {filteredLabs.map((lab) => (
            <View
              key={lab.id}
              style={[
                styles.card,
                tablet ? styles.cardTablet : { width: width - 32 },
              ]}
            >
              {/* Subject Icon at the top (centered) */}
              <View style={styles.cardIconContainer}>
                {renderLabIcon(lab.subject)}
              </View>

              {/* Lab Title (Centered) */}
              <Text textBreakStrategy="simple" style={styles.labTitle}>{lab.title}</Text>

              {/* Status Badge (Centered Pill) */}
              <View style={styles.cardStatusContainer}>
                {lab.status === 'available' ? (
                  <View style={styles.statusPillGreen}>
                    <Text textBreakStrategy="simple" style={styles.statusPillTextGreen}>ว่าง</Text>
                  </View>
                ) : lab.status === 'busy' ? (
                  <View style={styles.statusPillRed}>
                    <Text textBreakStrategy="simple" style={styles.statusPillTextRed}>ไม่ว่าง</Text>
                  </View>
                ) : (
                  <View style={styles.statusPillGrey}>
                    <Text textBreakStrategy="simple" style={styles.statusPillTextGrey}>ปิดบริการ</Text>
                  </View>
                )}
              </View>

              {/* Category Info (Left-aligned or centered) */}
              <Text textBreakStrategy="simple" style={styles.categoryText}>
                หมวดหมู่: {lab.subject}
              </Text>

              {/* Action Buttons Row (Stacked Vertically) */}
              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.detailBtnFull}
                  onPress={() => setSelectedLab(lab)}
                >
                  <Text textBreakStrategy="simple" style={styles.detailBtnTextFull}>ดูรายละเอียด</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.enterBtnFull,
                    lab.status === 'offline' && styles.enterBtnDisabled,
                  ]}
                  disabled={lab.status === 'offline'}
                  onPress={() => {
                    // Navigate to Main Lab Screen
                    navigation.navigate('MainLab', { labId: lab.id, labTitle: lab.title });
                  }}
                >
                  <Text textBreakStrategy="simple" style={styles.enterBtnTextFull}>เข้าห้อง</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={selectedLab !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedLab(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedLab && (
            <View style={styles.modalCard}>
              <Text textBreakStrategy="simple" style={[styles.modalSubject, { color: getSubjectColor(selectedLab.subject) }]}>
                {selectedLab.subject} Laboratory
              </Text>
              <Text textBreakStrategy="simple" style={styles.modalTitle}>{selectedLab.title}</Text>

              <Text textBreakStrategy="simple" style={styles.modalSectionLabel}>รายละเอียดอุปกรณ์:</Text>
              <Text textBreakStrategy="simple" style={styles.modalDescription}>{selectedLab.description}</Text>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalStatCol}>
                  <Text textBreakStrategy="simple" style={styles.statLabel}>ระยะเวลาเฉลี่ย</Text>
                  <Text textBreakStrategy="simple" style={styles.statValue}>{selectedLab.duration}</Text>
                </View>
                <View style={styles.modalStatCol}>
                  <Text textBreakStrategy="simple" style={styles.statLabel}>สถานะห้อง</Text>
                  <Text textBreakStrategy="simple" style={styles.statValue}>
                    {selectedLab.status === 'available' ? 'ว่างใช้งานได้' : selectedLab.status === 'busy' ? 'กำลังทำงาน' : 'ปิดซ่อมบำรุง'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedLab(null)}
                >
                  <Text textBreakStrategy="simple" style={styles.modalCloseText}>ปิดหน้าต่าง</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalEnterBtn,
                    selectedLab.status === 'offline' && styles.enterBtnDisabled,
                  ]}
                  disabled={selectedLab.status === 'offline'}
                  onPress={() => {
                    const lab = selectedLab;
                    setSelectedLab(null);
                    navigation.navigate('MainLab', { labId: lab.id, labTitle: lab.title });
                  }}
                >
                  <Text textBreakStrategy="simple" style={styles.modalEnterText}>เริ่มต้นทดลอง</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    borderRadius: 6,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
    fontFamily: fonts.extraBold,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  banner: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: fonts.extraBold,
    lineHeight: 28 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: fonts.regular,
    lineHeight: 20,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  bannerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  bannerBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1,
    borderRadius: roundness.round,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: spacing.sm,
  },
  bannerBadgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderRadius: roundness.round,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emeraldGlow,
    marginRight: 6,
  },
  badgeDotBlue: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  badgeTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emeraldGlow,
    fontFamily: fonts.bold,
  },
  badgeTextBlue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  filterTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: roundness.round,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: spacing.sm,
  },
  filterTagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.glowCyan,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTagTextActive: {
    color: colors.white,
  },
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: roundness.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cardTablet: {
    width: 300,
    marginHorizontal: spacing.sm,
  },
  cardIconContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: fonts.extraBold,
    lineHeight: 21 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  cardStatusContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statusPillGreen: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderRadius: roundness.round,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  statusPillTextGreen: {
    color: colors.emeraldGlow,
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillRed: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: roundness.round,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  statusPillTextRed: {
    color: colors.dangerGlow,
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillGrey: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: roundness.round,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  statusPillTextGrey: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
    fontFamily: fonts.bold,
    lineHeight: 14 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
    fontWeight: '800',
  },
  actionColumn: {
    flexDirection: 'column',
    width: '100%',
    marginTop: spacing.xs,
  },
  detailBtnFull: {
    backgroundColor: colors.primary,
    borderRadius: roundness.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    width: '100%',
    ...shadows.glowCyan,
  },
  detailBtnTextFull: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.bold,
    lineHeight: 13 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  enterBtnFull: {
    backgroundColor: colors.emeraldGlow,
    borderRadius: roundness.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...shadows.glowEmerald,
  },
  enterBtnDisabled: {
    backgroundColor: colors.secondary,
    borderColor: colors.cardBorder,
    opacity: 0.4,
  },
  enterBtnTextFull: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.bold,
    lineHeight: 13 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: roundness.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  modalSubject: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: roundness.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalActionRow: {
    flexDirection: 'row',
  },
  modalCloseBtn: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: roundness.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modalCloseText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  modalEnterBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: roundness.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glowCyan,
  },
  modalEnterText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
