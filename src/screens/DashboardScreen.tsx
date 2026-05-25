import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';
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
      status: 'available',
      description: 'การทดลองจำลองการไทเทรตกรด-เบสเสมือนจริง ควบคุมการหยดของบิวเรตต์อัตโนมัติด้วยคำสั่งดิจิทัลและติดตามค่า pH ในสารละลายแบบ Real-time',
      duration: '25-30 นาที',
      usersActive: 3,
    },
    {
      id: 'photosynthesis-monitor',
      title: 'Photosynthesis Rate Chamber',
      subject: 'Biology',
      status: 'available',
      description: 'จำลองการวิเคราะห์อัตราการสังเคราะห์แสงของพืช โดยสั่งควบคุมความสว่างหลอดไฟ LED ในกล่องทดลองปิด และตรวจดูความเข้มข้น CO2/O2',
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

  const getLab3DImage = (subject: 'Physics' | 'Chemistry' | 'Biology') => {
    switch (subject) {
      case 'Physics':
        return require('../../assets/physics_3d.png');
      case 'Chemistry':
        return require('../../assets/chemistry_3d.png');
      case 'Biology':
        return require('../../assets/biology_3d.png');
    }
  };

  const categories = [
    { key: 'All', label: 'ทั้งหมด', emoji: '🔍' },
    { key: 'Physics', label: 'ฟิสิกส์', emoji: '⚛️' },
    { key: 'Chemistry', label: 'เคมี', emoji: '🧪' },
    { key: 'Biology', label: 'ชีววิทยา', emoji: '🌿' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      {/* Glassmorphic Background Blur Blobs */}
      <View style={[styles.bgBlob, { top: 80, left: -100, backgroundColor: '#0ea5e9', opacity: 0.1 }]} />
      <View style={[styles.bgBlob, { top: 380, right: -120, backgroundColor: '#10b981', opacity: 0.08 }]} />
      <View style={[styles.bgBlob, { bottom: 100, left: -50, backgroundColor: '#6366f1', opacity: 0.08 }]} />

      {/* Top Header Navigation */}
      <View style={styles.topNav}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          <Text textBreakStrategy="simple" style={styles.navTitle}>SciSiam</Text>
        </View>

        <View style={styles.navRight}>
          {/* Diamond points panel */}
          <View style={styles.diamondPill}>
            <Text textBreakStrategy="simple" style={styles.diamondEmoji}>💎</Text>
            <Text textBreakStrategy="simple" style={styles.diamondText}>120</Text>
          </View>

          {/* Orange Notification Bell */}
          <TouchableOpacity style={styles.notificationBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill="#f97316"
              />
            </Svg>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          {/* 3D Student Profile Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={require('../../assets/student_avatar_3d.png')} style={styles.avatarImage} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.banner}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#082f49" />
                <Stop offset="50%" stopColor="#0f172a" />
                <Stop offset="100%" stopColor="#064e3b" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#bannerGrad)" rx={18} />
            <Circle cx="15%" cy="30%" r="50" fill="#06b6d4" opacity={0.12} />
            <Circle cx="85%" cy="75%" r="70" fill="#10b981" opacity={0.12} />
          </Svg>

          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text textBreakStrategy="simple" style={styles.bannerWelcome}>
                สวัสดีคุณ {name} 👋
              </Text>
              <Text textBreakStrategy="simple" style={styles.bannerTitle}>ห้องเรียนรู้เสมือนจริง</Text>
              <Text textBreakStrategy="simple" style={styles.bannerSubtitle}>
                ฝึกฝนทักษะการทดลองทางวิทยาศาสตร์ ผ่าน Sandbox จำลองแบบเรียลไทม์ 100%
              </Text>

              {/* Badges Row */}
              <View style={styles.bannerBadgesRow}>
                <View style={styles.bannerBadgeGreen}>
                  <View style={styles.badgeDotGreen} />
                  <Text textBreakStrategy="simple" style={styles.badgeTextGreen}>Simulation Engine Active</Text>
                </View>
                <View style={styles.bannerBadgeBlue}>
                  <View style={styles.badgeDotBlue} />
                  <Text textBreakStrategy="simple" style={styles.badgeTextBlue}>ระบบจำลอง Sandbox</Text>
                </View>
              </View>
            </View>

            <View style={styles.bannerImageContainer}>
              <Image source={require('../../assets/banner_3d.png')} style={styles.bannerImage} />
            </View>
          </View>
        </View>

        {/* Filter Categories */}
        <View style={styles.filterContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.filterTag,
                activeCategory === cat.key && styles.filterTagActive,
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text textBreakStrategy="simple" style={styles.filterEmoji}>{cat.emoji}</Text>
              <Text
                textBreakStrategy="simple"
                style={[
                  styles.filterTagText,
                  activeCategory === cat.key && styles.filterTagTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Responsive Cards Grid */}
        <View style={[styles.grid, tablet && styles.gridTablet]}>
          {filteredLabs.map((lab) => {
            const subjectColor = getSubjectColor(lab.subject);
            return (
              <View
                key={lab.id}
                style={[
                  styles.card,
                  tablet ? styles.cardTablet : { width: width - 32 },
                ]}
              >
                {/* Subtle colored glow spot inside card background */}
                <View style={[styles.cardGlowSpot, { backgroundColor: subjectColor + '12' }]} />

                {/* Subject Color Indicator Top Line */}
                <View style={[styles.cardColorIndicator, { backgroundColor: subjectColor }]} />

                {/* 3D Image Asset */}
                <View style={styles.cardImageContainer}>
                  <Image source={getLab3DImage(lab.subject)} style={styles.card3dImage} />
                </View>

                {/* Lab Title */}
                <Text textBreakStrategy="simple" style={styles.labTitle}>{lab.title}</Text>

                {/* Status Badge */}
                <View style={styles.cardStatusContainer}>
                  {lab.status === 'available' ? (
                    <View style={styles.statusPillGreen}>
                      <Text textBreakStrategy="simple" style={styles.statusPillTextGreen}>ว่างใช้งานได้</Text>
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

                {/* Category Info */}
                <Text textBreakStrategy="simple" style={styles.categoryText}>
                  หมวดหมู่: {lab.subject === 'Physics' ? 'ฟิสิกส์' : lab.subject === 'Chemistry' ? 'เคมี' : 'ชีววิทยา'}
                </Text>

                {/* Action Buttons Row */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => setSelectedLab(lab)}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.btnIcon}>
                      <Path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        fill={colors.textSecondary}
                      />
                    </Svg>
                    <Text textBreakStrategy="simple" style={styles.detailButtonText}>รายละเอียด</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.enterButton,
                      { backgroundColor: subjectColor },
                      lab.status === 'offline' && styles.enterBtnDisabled,
                      shadows.glowCyan,
                    ]}
                    disabled={lab.status === 'offline'}
                    onPress={() => {
                      navigation.navigate('MainLab', { labId: lab.id, labTitle: lab.title });
                    }}
                  >
                    <Text textBreakStrategy="simple" style={styles.enterButtonText}>เข้าห้องแล็บ</Text>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={styles.btnIconRight}>
                      <Path
                        d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42 5.43 5.43H5v2z"
                        fill={colors.white}
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Adventure Quest Footer */}
        <View style={styles.footerContainer}>
          <Text textBreakStrategy="simple" style={styles.footerEmoji}>🚀</Text>
          <Text textBreakStrategy="simple" style={styles.footerTitle}>
            พร้อมสำหรับการผจญภัยทางวิทยาศาสตร์หรือยัง?
          </Text>
          <Text textBreakStrategy="simple" style={styles.footerSubtitle}>
            เลือกห้องปฏิบัติการที่คุณต้องการ และเริ่มต้นทำการทดลองแบบ Sandbox Sandbox Engine ของเราทำงานอย่างเสถียรแบบออฟไลน์ 100%
          </Text>
        </View>
      </ScrollView>

      {/* Floating 3D Sticky Note Decor */}
      <View style={styles.floatingDecorNoteContainer} pointerEvents="none">
        <Image
          source={require('../../assets/decor_note_3d.png')}
          style={styles.floatingDecorNote}
        />
      </View>

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
                {selectedLab.subject === 'Physics' ? 'PHYSICS' : selectedLab.subject === 'Chemistry' ? 'CHEMISTRY' : 'BIOLOGY'} LABORATORY
              </Text>
              <Text textBreakStrategy="simple" style={styles.modalTitle}>{selectedLab.title}</Text>

              <Text textBreakStrategy="simple" style={styles.modalSectionLabel}>รายละเอียดปฏิบัติการ:</Text>
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
                    { backgroundColor: getSubjectColor(selectedLab.subject) },
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
    backgroundColor: '#f8fafc', // Slate 50 ultra clean bg
  },
  bgBlob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    zIndex: -1,
  },
  topNav: {
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Glassmorphic background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.6)', // Semi-transparent Slate 200 border
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  navTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontFamily: fonts.extraBold,
    includeFontPadding: false,
    lineHeight: 20 * 1.45,
    paddingVertical: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diamondPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)', // Cyan-300 light border
    borderRadius: roundness.round,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  diamondEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  diamondText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.cyanGlow,
    includeFontPadding: false,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
    borderWidth: 1.2,
    borderColor: colors.white,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.8,
    borderColor: '#38bdf8', // Cyan 400
    overflow: 'hidden',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 40,
    alignItems: 'center',
  },
  banner: {
    marginBottom: spacing.lg,
    width: '100%',
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  bannerTextContainer: {
    flex: 1.2,
    justifyContent: 'center',
  },
  bannerWelcome: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: '#38bdf8', // Cyan light
    marginBottom: 4,
    includeFontPadding: false,
    lineHeight: 12 * 1.45,
    paddingVertical: 1,
  },
  bannerTitle: {
    fontSize: 24,
    color: colors.white,
    fontFamily: fonts.extraBold,
    lineHeight: 24 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(241, 245, 249, 0.85)', // Slate 100 opacity
    fontFamily: fonts.regular,
    lineHeight: 13 * 1.5,
    paddingVertical: 2,
    includeFontPadding: false,
    marginBottom: spacing.md,
  },
  bannerBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  bannerBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)', // Emerald tint
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: roundness.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bannerBadgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)', // Cyan tint
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    borderRadius: roundness.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  badgeDotBlue: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
    marginRight: 5,
  },
  badgeTextGreen: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#34d399', // Emerald 400
    includeFontPadding: false,
  },
  badgeTextBlue: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#38bdf8', // Cyan 400
    includeFontPadding: false,
  },
  bannerImageContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    gap: spacing.sm,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: roundness.round,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  filterTagActive: {
    backgroundColor: colors.primary,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  filterEmoji: {
    fontSize: 13,
    marginRight: 6,
    includeFontPadding: false,
  },
  filterTagText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    includeFontPadding: false,
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Glassmorphic background
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)', // Inner highlight border
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTablet: {
    width: 320,
    marginBottom: 0,
  },
  cardGlowSpot: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    zIndex: -1,
  },
  cardColorIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardImageContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  card3dImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  labTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontFamily: fonts.extraBold,
    lineHeight: 20 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  cardStatusContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statusPillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: roundness.round,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  statusPillTextGreen: {
    color: '#059669', // Emerald
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  statusPillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: roundness.round,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  statusPillTextRed: {
    color: '#dc2626', // Danger Red
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  statusPillGrey: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: roundness.round,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  statusPillTextGrey: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
    fontFamily: fonts.bold,
    lineHeight: 13 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderWidth: 1.2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 14,
    height: 42,
  },
  detailButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: fonts.bold,
    includeFontPadding: false,
  },
  enterButton: {
    flex: 1.25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  enterButtonText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bold,
    includeFontPadding: false,
  },
  btnIcon: {
    marginRight: 5,
  },
  btnIconRight: {
    marginLeft: 5,
  },
  enterBtnDisabled: {
    backgroundColor: colors.secondary,
    borderColor: colors.cardBorder,
    opacity: 0.4,
  },
  footerContainer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footerEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  footerTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16 * 1.5,
    paddingVertical: 2,
    includeFontPadding: false,
    marginBottom: spacing.xs,
  },
  footerSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12 * 1.5,
    paddingVertical: 2,
    includeFontPadding: false,
    maxWidth: 320,
  },
  floatingDecorNoteContainer: {
    position: 'absolute',
    bottom: 50,
    left: -20,
    width: 100,
    height: 100,
    zIndex: 5,
  },
  floatingDecorNote: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    transform: [{ rotate: '12deg' }],
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 5,
  },
  modalSubject: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
    marginBottom: 4,
    includeFontPadding: false,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 22 * 1.45,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    marginBottom: 6,
    includeFontPadding: false,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 14 * 1.5,
    marginBottom: spacing.lg,
    fontFamily: fonts.regular,
    includeFontPadding: false,
  },
  modalStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: spacing.sm,
  },
  modalStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontFamily: fonts.regular,
    includeFontPadding: false,
  },
  statValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalCloseBtn: {
    flex: 1,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderWidth: 1.2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 14,
    includeFontPadding: false,
  },
  modalEnterBtn: {
    flex: 1.5,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalEnterText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    includeFontPadding: false,
  },
});
