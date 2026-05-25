# SciSiam Remote Lab Project Guidelines

This document details the project configuration, performance rules, and visual typography standards for agents working on the **SciSiam** platform.

---

## 1. Tech Stack Overview
* **Framework**: React Native (Expo SDK 56.0.0) with TypeScript.
* **Navigation**: `@react-navigation/native` with `@react-navigation/stack`.
* **Graphics & Telemetry Charts**: Responsive custom SVGs using `react-native-svg`.
* **IoT Networking**: `socket.io-client` with a Newton's Law of Cooling simulation fallback hook.

---

## 2. Core Coding & Optimization Standards

### A. Telemetry Simulation Updates
* **Rule**: To avoid repeatedly clearing and recreating interval clocks when state changes, keep physics variables (`waterTemp`, `heatingStatus`, `targetTemp`) in React `useRef` tokens.
* **Pure State Dispatchers**: Do not nest React state updates. Update refs synchronously inside the interval timer, then dispatch flat state updates sequentially.

### B. SVG Graphic Elements
* **Rule**: Inside `<Svg>` elements, never use React Native's `<Text>` component. Use `<SvgText>` (imported as `Text as SvgText` from `react-native-svg`) to prevent positioning attribute type-errors and viewport compile crashes.

### C. Prevent Input Lag
* **Rule**: The screen re-renders during keyboard text entries. Always wrap heavy vector path mapping or coordinates calculations inside `useMemo` blocks (bound to the telemetry `history` array) so keypresses remain fluid at 60fps.

---

## 3. Thai Typography Optimization Skills (เทคนิคอักษรไทยบนแอป)

Because the Thai language features vowels and tone marks above and below main character baselines, standard layout values often cause clipping or overlap bugs. Always implement the following **Thai Typography Skills**:

### 1. Comfortable Line Height (สระ/วรรณยุกต์ไม่ชนกัน)
* **Problem**: Vowels and tones (เช่น ิ, ี, ่, ้) on lines above will collide with tall characters below if standard lines are too compact.
* **Skill**: Set `lineHeight` to a scale factor of **`1.4` to `1.6`** times the `fontSize` for paragraphs and text blocks.
  ```typescript
  lineHeight: fontSize * 1.45
  ```

### 2. Manage Font Padding with Care (การจัดการ Font Padding ป้องกันอักษรแหว่ง)
* **Problem**: Setting `includeFontPadding: false` is great for vertical alignment, but on some Android versions, it can clip topmost tones (เช่น ้, ๊) or lowest vowels (เช่น ุ, ู).
* **Skill**: 
  * If using `includeFontPadding: false` for strict alignment, always set a slightly larger `lineHeight` (1.4+ times `fontSize`) or add a small vertical padding (`paddingVertical: 2`) to compensate for the removed padding.
  * For long paragraphs where alignment isn't critical, it is safer to leave `includeFontPadding: true` (default) to ensure no character is clipped.
  ```typescript
  // ตัวอย่างจัดกึ่งกลางไอคอนคู่ตัวอักษรอย่างปลอดภัย
  style: {
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: fontSize * 1.5,
    paddingVertical: 2
  }
  ```

### 3. Use Simple Text Break Strategy (แก้การเคาะจัดบรรทัดภาษาไทยเพี้ยน)
* **Problem**: ระบบจัดรูปแบบคำของ Android บางรุ่นจะพยายามยัดอักษรไทยให้เต็มบรรทัดด้วยวิธีดั้งเดิม ทำให้เกิดการปัดเศษสระหรือคำแหว่งด้านหลัง
* **Skill**: กำหนดพร็อพเพอร์ตี้ `textBreakStrategy="simple"` บนคอมโพเนนต์ `<Text>` เพื่อช่วยบังคับให้ระบบตัดคำภาษาไทยตามความเหมาะสม ไม่บีบตัวอักษรจนสระหลุดบรรทัด
  ```typescript
  <Text textBreakStrategy="simple" style={styles.myText}>
    ข้อความภาษาไทย...
  </Text>
  ```

### 4. Balanced Letter Spacing (หลีกเลี่ยงช่องไฟชิดกัน)
* **Problem**: Thai script has no spaces between words (only between sentences). Compressing letter spaces makes reading extremely difficult.
* **Skill**: Keep `letterSpacing` at `0` or slightly positive (e.g. `0.2` to `0.4` for titles). **Never use negative `letterSpacing` for Thai text.**

### 5. Modern Sans-Serif Fonts (ฟอนต์ไร้หัวดีไซน์สะอาดตา)
* **Problem**: Standard serif (มีหัว) system fonts can look dated on tech/sci-fi dashboards.
* **Skill**: Load a premium modern Google Font like **`Prompt`** as the global font family. It is sans-serif (ไม่มีหัว), clean, and aligns perfectly with English dashboard metrics.

