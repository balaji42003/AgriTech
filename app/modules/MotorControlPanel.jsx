import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
// Remove useLanguage import if not used
// import { useLanguage } from '../context/LanguageContext';

// Hardcoded Firebase setup
import { getApps, initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBRioAP3LV19aSk3CoWYgLsgJ1QJMwEkqs",
  authDomain: "motorcontrol-a2f73.firebaseapp.com",
  databaseURL: "https://motorcontrol-a2f73-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "motorcontrol-a2f73",
  storageBucket: "motorcontrol-a2f73.appspot.com",
  messagingSenderId: "679494988516",
  appId: "1:679494988516:web:25d3d502a432d9e9d2f2f1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

// Add translations for other languages similarly
const translations = {
  en: {
    title: "Smart Motor Control",
    powerStatus: "Power Status",
    waterLevel: "Water Level",
    voltage: "Voltage Monitor",
    schedule: "Scheduling",
    automation: "Smart Automation",
    history: "Usage History",
    tips: "Power Saving Tips",
    on: "ON",
    off: "OFF",
    motorHealth: "Motor Health",
    scheduledTimes: "Scheduled Times",
    waterSaved: "Water Saved",
    powerConsumed: "Power Consumed",
    efficiency: "System Efficiency",
    dailyUsage: "Daily Usage",
    monthlyStats: "Monthly Statistics",
    pumpHealth: "Pump Health",
    systemStatus: "System Status",
    nextMaintenance: "Next Maintenance",
    alerts: "Recent Alerts",
    optimal: "Optimal",
    warning: "Warning",
    critical: "Critical"
  },
  hi: {
    title: "स्मार्ट मोटर नियंत्रण",
    // Add Hindi translations
  },
  te: {
    title: "స్మార్ట్ మోటార్ కంట్రోల్",
    // Add Telugu translations
  }
};

export default function MotorControlPanel() {
  // Hardcode language to English
  const selectedLanguage = "en";
  const [isMotorOn, setIsMotorOn] = useState(false);
  const [waterLevel, setWaterLevel] = useState(75);
  const [voltage, setVoltage] = useState(220);
  const [efficiency, setEfficiency] = useState(92);
  const [pumpHealth, setPumpHealth] = useState(85);
  const pulseAnim = new Animated.Value(1);
  const [schedules, setSchedules] = useState([
    { time: "06:00 AM", duration: "2 hrs", active: true, id: '1' },
    { time: "05:00 PM", duration: "1.5 hrs", active: true, id: '2' },
    { time: "09:00 PM", duration: "1 hr", active: false, id: '3' }
  ]);

  // Add pulse animation for power button
  useEffect(() => {
    if (isMotorOn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMotorOn]);

  // Read motor status from Firebase when app loads
  useEffect(() => {
    const motorRef = ref(db, 'motorStatus');
    const unsubscribe = onValue(motorRef, snapshot => {
      const val = snapshot.val();
      setIsMotorOn(val === "ON");
    });
    return () => unsubscribe();
  }, []);

  // Update Firebase when toggling motor
  const toggleMotor = () => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to turn the motor ${isMotorOn ? "OFF" : "ON"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            const newStatus = isMotorOn ? "OFF" : "ON";
            setIsMotorOn(!isMotorOn);
            set(ref(db, 'motorStatus'), newStatus);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#f0fff4', '#e8f5e9', '#c8e6c9']}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {translations[selectedLanguage].title}
          </Text>
        </View>

        {/* Main Control Panel */}
        <View style={styles.mainCard}>
          <Animated.View style={[
            styles.powerSection,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <TouchableOpacity 
              style={[styles.powerButton, isMotorOn ? styles.powerButtonOn : styles.powerButtonOff]}
              onPress={toggleMotor}
            >
              <LinearGradient
                colors={isMotorOn ? ['#4caf50', '#388e3c'] : ['#f5f5f5', '#e0e0e0']}
                style={styles.powerGradient}
              >
                <Ionicons 
                  name="power" 
                  size={40} 
                  color={isMotorOn ? "#fff" : "#666"} 
                />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.powerStatus}>
              {isMotorOn ? translations[selectedLanguage].on : translations[selectedLanguage].off}
            </Text>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f0fff4', '#e8f5e9']}
                style={styles.statGradient}
              >
                <MaterialCommunityIcons name="water-percent" size={28} color="#388e3c" />
                <Text style={styles.statValue}>{waterLevel}%</Text>
                <Text style={styles.statLabel}>{translations[selectedLanguage].waterLevel}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${waterLevel}%`, backgroundColor: '#4caf50' }]} />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#e8f5e9', '#c8e6c9']}
                style={styles.statGradient}
              >
                <Ionicons name="flash" size={28} color="#ffa000" />
                <Text style={styles.statValue}>{voltage}V</Text>
                <Text style={styles.statLabel}>Voltage</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(voltage / 240) * 100}%` }]} />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f3e5f5', '#e1bee7']}
                style={styles.statGradient}
              >
                <MaterialCommunityIcons name="chart-line" size={28} color="#8e24aa" />
                <Text style={styles.statValue}>{efficiency}%</Text>
                <Text style={styles.statLabel}>Efficiency</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${efficiency}%` }]} />
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* System Health Card */}
        <View style={styles.healthCard}>
          <Text style={styles.sectionTitle}>{translations[selectedLanguage].motorHealth}</Text>
          <View style={styles.healthMetrics}>
            <View style={styles.circularProgress}>
              {/* Add circular progress indicator for pump health */}
            </View>
            <View style={styles.healthStats}>
              <Text style={styles.healthValue}>{pumpHealth}%</Text>
              <Text style={styles.healthLabel}>System Health</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Schedule Section */}
        <View style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>Scheduled Times</Text>
          {schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTime}>{schedule.time}</Text>
                <Text style={styles.scheduleDuration}>{schedule.duration}</Text>
              </View>
              <Switch 
                value={schedule.active}
                onValueChange={() => {
                  const newSchedules = [...schedules];
                  newSchedules[index].active = !newSchedules[index].active;
                  setSchedules(newSchedules);
                }}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={schedule.active ? "#1976d2" : "#f4f3f4"}
              />
            </View>
          ))}
        </View>

        {/* Smart Tips with Icons */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Smart Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>⚡ Best time to run: 6 AM - 10 AM</Text>
            <Text style={styles.tipItem}>💧 Check water level before starting</Text>
            <Text style={styles.tipItem}>🔌 Monitor voltage fluctuations</Text>
            <Text style={styles.tipItem}>⏰ Use scheduling for better efficiency</Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fff4',
  },
  gradient: {
    padding: 16,
    minHeight: '100%',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#dcedc8',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  powerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  powerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  powerButtonOn: {
    backgroundColor: '#4caf50',
  },
  powerButtonOff: {
    backgroundColor: '#f5f5f5',
  },
  powerStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    elevation: 2,
  },
  statGradient: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#388e3c',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#2e7d32',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    marginBottom: 16,
  },
  healthMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circularProgress: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 8,
    borderColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  healthStats: {
    flex: 1,
  },
  healthValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#388e3c',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e9',
  },
  scheduleTime: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  scheduleDuration: {
    fontSize: 14,
    color: '#388e3c',
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#388e3c',
    lineHeight: 20,
  }
});