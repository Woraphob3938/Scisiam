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
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
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
      status: 'busy',
      description: 'การทดลองไทเทรตกรด-เบสระยะไกล ควบคุมการหยดของบิวเรตต์อัตโนมัติด้วยคำสั่งดิจิทัลและติดตามค่า pH ในสารละลายแบบ Real-time',
      duration: '25-30 นาที',
      usersActive: 3,
    },
    {
      id: 'photosynthesis-monitor',
      title: 'Photosynthesis Rate Chamber',
      subject: 'Biology',
      status: 'offline',
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
          <Text style={styles.bannerTitle}>รายชื่อห้องแล็บ</Text>
          <Text style={styles.bannerSubtitle}>
            เลือกห้องแล็บที่ต้องการใช้งาน
          </Text>

          {/* Centered Badges Row */}
          <View style={styles.bannerBadgesRow}>
            <View style={styles.bannerBadgeGreen}>
              <View style={styles.badgeDotGreen} />
              <Text style={styles.badgeTextGreen}>Socket.IO Connected</Text>
            </View>
            <View style={styles.bannerBadgeBlue}>
              <View style={styles.badgeDotBlue} />
              <Text style={styles.badgeTextBlue}>ผู้ใช้งาน: 1 คน</Text>
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
              {/* Microscope/Subject Icon at the top (centered) */}
              <View style={styles.cardIconContainer}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                  {/* Microscope shape SVG */}
                  <Path d="M6 18h12M7 18v-2h10v2M12 16v-4M8 12h8" stroke={colors.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
                  <Path d="M14 4l-4 6M15 3.5l-3 4.5" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
                  <Rect x="7.5" y="10" width="3" height="2" fill={colors.primary} />
                  <Path d="M5 21h14" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </View>

              {/* Lab Title (Centered) */}
              <Text style={styles.labTitle}>{lab.title}</Text>

              {/* Status Badge (Centered Pill) */}
              <View style={styles.cardStatusContainer}>
                {lab.status === 'available' ? (
                  <View style={styles.statusPillGreen}>
                    <Text style={styles.statusPillTextGreen}>ว่าง</Text>
                  </View>
                ) : lab.status === 'busy' ? (
                  <View style={styles.statusPillRed}>
                    <Text style={styles.statusPillTextRed}>ไม่ว่าง</Text>
                  </View>
                ) : (
                  <View style={styles.statusPillGrey}>
                    <Text style={styles.statusPillTextGrey}>ปิดบริการ</Text>
                  </View>
                )}
              </View>

              {/* Category Info (Left-aligned or centered) */}
              <Text style={styles.categoryText}>
                หมวดหมู่: {lab.subject}
              </Text>

              {/* Action Buttons Row (Stacked Vertically) */}
              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.detailBtnFull}
                  onPress={() => setSelectedLab(lab)}
                >
                  <Text style={styles.detailBtnTextFull}>ดูรายละเอียด</Text>
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
                  <Text style={styles.enterBtnTextFull}>เข้าห้อง</Text>
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
              <Text style={[styles.modalSubject, { color: getSubjectColor(selectedLab.subject) }]}>
                {selectedLab.subject} Laboratory
              </Text>
              <Text style={styles.modalTitle}>{selectedLab.title}</Text>
              
              <Text style={styles.modalSectionLabel}>รายละเอียดอุปกรณ์:</Text>
              <Text style={styles.modalDescription}>{selectedLab.description}</Text>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalStatCol}>
                  <Text style={styles.statLabel}>ระยะเวลาเฉลี่ย</Text>
                  <Text style={styles.statValue}>{selectedLab.duration}</Text>
                </View>
                <View style={styles.modalStatCol}>
                  <Text style={styles.statLabel}>สถานะห้อง</Text>
                  <Text style={styles.statValue}>
                    {selectedLab.status === 'available' ? 'ว่างใช้งานได้' : selectedLab.status === 'busy' ? 'กำลังทำงาน' : 'ปิดซ่อมบำรุง'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedLab(null)}
                >
                  <Text style={styles.modalCloseText}>ปิดหน้าต่าง</Text>
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
                  <Text style={styles.modalEnterText}>เริ่มต้นทดลอง</Text>
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
    includeFontPadding: false,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: fonts.regular,
    lineHeight: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: fonts.bold,
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
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
    fontFamily: fonts.regular,
    includeFontPadding: false,
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
