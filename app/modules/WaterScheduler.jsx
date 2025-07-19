import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { getApps, initializeApp } from "firebase/app";
import { getDatabase, onValue, push, ref, remove } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useLanguage } from '../context/LanguageContext';
import useFCM from '../modules/useFCM';

// Firebase config and init
const firebaseConfig = {
  apiKey: "AIzaSyDqhBhLHYthEYyXIdhkPgBi-jvvq4PRqa8",
  authDomain: "water-c492d.firebaseapp.com",
  databaseURL: "https://water-c492d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "water-c492d",
  storageBucket: "water-c492d.firebasestorage.app",
  messagingSenderId: "920828005428",
  appId: "1:920828005428:web:605086ba4f7dc845714e61"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getDatabase(app);

// Add translations
const translations = {
  en: {
    title: "Water Management",
    schedule: "Water Schedule",
    feasibility: "Crop Feasibility",
    borewells: "Number of Borewells",
    addCrop: "Add Another Crop",
    generateSchedule: "Generate Schedule",
    checkFeasibility: "Check Feasibility",
    cropDetails: "Crop Details",
    schedule_result: "Watering Schedule",
    fields: {
      crop_name: "Crop Name",
      crop_stage: "Growth Stage",
      season: "Season",
      acres: "Area (Acres)",
      last_watered_date: "Last Watered Date"
    },
    tips: {
      title: "Smart Irrigation Tips",
      morning: "🌅 Morning irrigation (6-10 AM) is most effective",
      evening: "🌆 Evening watering (4-6 PM) reduces evaporation",
      soil: "💧 Check soil moisture before irrigation",
      weather: "🌦️ Consider weather forecast"
    }
  },
  hi: {
    title: "जल प्रबंधन",
    schedule: "सिंचाई अनुसूची",
    feasibility: "फसल व्यवहार्यता",
    // ... add Hindi translations
  },
  te: {
    title: "నీటి నిర్వహణ",
    schedule: "నీటి షెడ్యూల్",
    feasibility: "పంట సాధ్యత",
    // ... add Telugu translations
  }
};

const ActionButton = ({ onPress, title, color }) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function WaterScheduler() {
  const { selectedLanguage } = useLanguage();
  const fcmToken = useFCM();
  // States for both features
  const [activeTab, setActiveTab] = useState("schedule");
  
  // Water scheduling states
  const [crops, setCrops] = useState([
    { crop_name: "", crop_stage: "", season: "", acres: "", last_watered_date: "" },
  ]);
  const [borewells, setBorewells] = useState("2");
  const [scheduleResult, setScheduleResult] = useState(null);
  
  // Prediction/feasibility states
  const [predictionCrops, setPredictionCrops] = useState([
    { crop_name: "", crop_stage: "", season: "", acres: "" },
  ]);
  const [predictionBorewells, setPredictionBorewells] = useState("1");
  const [predictionResult, setPredictionResult] = useState(null);

  // For adding new crops
  const [showCropForm, setShowCropForm] = useState(false);
  const [newCrop, setNewCrop] = useState({ crop_name: "", crop_stage: "", season: "", acres: "", last_watered_date: "" });

  // For prediction tab
  const [showPredictionCropForm, setShowPredictionCropForm] = useState(false);
  const [newPredictionCrop, setNewPredictionCrop] = useState({ crop_name: "", crop_stage: "", season: "", acres: "" });

  // Motor Power Time state
  const [motorPowerTime, setMotorPowerTime] = useState(""); // store as "HH:mm"
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Fetch crops and motor power time from Firebase on mount
  useEffect(() => {
    const cropsRef = ref(db, "crops");
    onValue(cropsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cropList = Object.entries(data).map(([id, crop]) => ({ id, ...crop }));
        setCrops(cropList);
      } else {
        setCrops([]);
      }
    });

    const motorRef = ref(db, "motor_power_time");
    onValue(motorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get the last time value from the object
        const times = Object.values(data);
        setMotorPowerTime(times.length > 0 ? times[times.length - 1] : "");
      } else {
        setMotorPowerTime("");
      }
    });
  }, []);

  // Save motor power time to Firebase as "HH:mm"
  const handleSaveMotorPowerTime = (selectedDate) => {
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const motorRef = ref(db, "motor_power_time");
    push(motorRef, timeString);
    setMotorPowerTime(timeString);
    setShowTimePicker(false);
  };

  // Add crop to Firebase (schedule tab)
  const handleAddCropFirebase = () => {
    const cropsRef = ref(db, "crops");
    const cropToSave = {
      ...newCrop,
      date_registered: new Date().toISOString(),
    };
    push(cropsRef, cropToSave);
    setNewCrop({ crop_name: "", crop_stage: "", season: "", acres: "", last_watered_date: "" });
    setShowCropForm(false);
  };

  // Delete crop from Firebase (schedule tab)
  const handleDeleteCropFirebase = (id) => {
    const cropRef = ref(db, `crops/${id}`);
    remove(cropRef);
  };

  // Add crop for prediction tab (local state only)
  const handleAddPredictionCropLocal = () => {
    setPredictionCrops(prev => [...prev, newPredictionCrop]);
    setNewPredictionCrop({ crop_name: "", crop_stage: "", season: "", acres: "" });
    setShowPredictionCropForm(false);
  };

  // Delete crop for prediction tab (local state only)
  const handleDeletePredictionCropLocal = (index) => {
    setPredictionCrops(prev => prev.filter((_, i) => i !== index));
  };

  // Common functions
  const handleInputChange = (index, field, value, isPrediction = false) => {
    const updateFunction = isPrediction ? setPredictionCrops : setCrops;
    const currentCrops = isPrediction ? [...predictionCrops] : [...crops];
    
    currentCrops[index][field] = value;
    updateFunction(currentCrops);
  };

  const addCrop = (isPrediction = false) => {
    const updateFunction = isPrediction ? setPredictionCrops : setCrops;
    const template = isPrediction 
      ? { crop_name: "", crop_stage: "", season: "", acres: "" }
      : { crop_name: "", crop_stage: "", season: "", acres: "", last_watered_date: "" };
    
    updateFunction(prev => [...prev, template]);
  };

  // API calls
  const submitSchedule = async () => {
    try {
      const payload = {
        borewells: parseInt(borewells),
        motor_power_time: motorPowerTime,
        crops: crops.map((c) => ({
          ...c,
          acres: parseFloat(c.acres),
        })),
        fcm_token: fcmToken, // <-- Add this line!
      };

      const response = await fetch("http://10.3.5.210:5000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setScheduleResult(data);

    } catch (err) {
      Alert.alert("❌ Error", "Failed to fetch schedule. Check Flask server or URL.");
    }
  };

  const submitPrediction = async () => {
    try {
      const payload = {
        borewells: parseInt(predictionBorewells),
        crops: predictionCrops.map((c) => ({
          crop_name: c.crop_name,
          crop_stage: c.crop_stage,
          season: c.season,
          acres: parseFloat(c.acres),
        })),
      };

      const response = await fetch("http://10.3.5.210:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      Alert.alert("❌ Error", "Failed to fetch prediction. Check Flask server or URL.");
    }
  };

  const renderInput = (field, placeholder, value, onChange, keyboardType = "default") => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {translations[selectedLanguage].fields[field]}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    </View>
  );

  // Add crop for schedule tab
  const handleAddCrop = () => {
    setCrops(prev => [...prev, newCrop]);
    setNewCrop({ crop_name: "", crop_stage: "", season: "", acres: "", last_watered_date: "" });
    setShowCropForm(false);
  };

  // Add crop for prediction tab
  const handleAddPredictionCrop = () => {
    setPredictionCrops(prev => [...prev, newPredictionCrop]);
    setNewPredictionCrop({ crop_name: "", crop_stage: "", season: "", acres: "" });
    setShowPredictionCropForm(false);
  };

  const handleDeleteCrop = (index) => {
    setCrops(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeletePredictionCrop = (index) => {
    setPredictionCrops(prev => prev.filter((_, i) => i !== index));
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.gradient}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {translations[selectedLanguage].title}
            </Text>
          </View>

          {/* Enhanced Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "schedule" && styles.activeTab]}
              onPress={() => setActiveTab("schedule")}
            >
              <Ionicons 
                name="water-outline" 
                size={24} 
                color={activeTab === "schedule" ? "#1b5e20" : "#666"} 
              />
              <Text style={[
                styles.tabText,
                activeTab === "schedule" && styles.activeTabText
              ]}>
                {translations[selectedLanguage].schedule}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "predict" && styles.activeTab]}
              onPress={() => setActiveTab("predict")}
            >
              <Ionicons 
                name="analytics-outline" 
                size={24} 
                color={activeTab === "predict" ? "#1b5e20" : "#666"} 
              />
              <Text style={[
                styles.tabText,
                activeTab === "predict" && styles.activeTabText
              ]}>
                {translations[selectedLanguage].feasibility}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Smart Tips Section */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>
              {translations[selectedLanguage].tips.title}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.values(translations[selectedLanguage].tips)
                .filter(tip => tip !== "title")
                .map((tip, index) => (
                  <View key={index} style={styles.tipCard}>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))
              }
            </ScrollView>
          </View>

          {/* Main Content */}
          {activeTab === "schedule" ? (
            <>
              <Text style={styles.label}>{translations[selectedLanguage].borewells}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={borewells}
                onChangeText={setBorewells}
              />

              {/* Motor Power Time Section */}
              <View style={styles.card}>
                <Text style={styles.subHeader}>Motor Power Time (Daily)</Text>
                {motorPowerTime ? (
                  <Text style={styles.boldText}>
                    {motorPowerTime} (Every day)
                  </Text>
                ) : (
                  <ActionButton
                    title="Set Motor Power Time"
                    onPress={() => setShowTimePicker(true)}
                    color="#388e3c"
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    mode="time"
                    value={new Date()}
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === "set" && selectedDate) {
                        handleSaveMotorPowerTime(selectedDate);
                      } else {
                        setShowTimePicker(false);
                      }
                    }}
                  />
                )}
              </View>

              {/* List of crops */}
              {crops.map((crop, index) => (
                <View key={crop.id || index} style={styles.card}>
                  <Text style={styles.subHeader}>Crop {index + 1}</Text>
                  <Text>Name: {crop.crop_name}</Text>
                  <Text>Stage: {crop.crop_stage}</Text>
                  <Text>Season: {crop.season}</Text>
                  <Text>Acres: {crop.acres}</Text>
                  <Text>Last Watered: {crop.last_watered_date}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCropFirebase(crop.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={22} color="#d32f2f" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Show Add Crop button or form */}
              {!showCropForm ? (
                <ActionButton 
                  title={`➕ ${translations[selectedLanguage].addCrop}`}
                  onPress={() => setShowCropForm(true)}
                  color="#388e3c"
                />
              ) : (
                <View style={styles.card}>
                  <Text style={styles.subHeader}>Add Crop</Text>
                  {["crop_name", "crop_stage", "season", "acres", "last_watered_date"].map((field) => (
                    <TextInput
                      key={field}
                      style={styles.input}
                      placeholder={field.replace(/_/g, " ")}
                      keyboardType={field === "acres" ? "numeric" : "default"}
                      value={newCrop[field]}
                      onChangeText={(value) => setNewCrop(prev => ({ ...prev, [field]: value }))}
                    />
                  ))}
                  <ActionButton 
                    title="Save Crop"
                    onPress={handleAddCropFirebase}
                    color="#00695c"
                  />
                  <ActionButton 
                    title="Cancel"
                    onPress={() => setShowCropForm(false)}
                    color="#d32f2f"
                  />
                </View>
              )}

              {/* Generate Schedule/Check Feasibility Button */}
              <View style={{ marginTop: 12 }}>
                <ActionButton 
                  title={activeTab === "schedule" 
                    ? `🚀 ${translations[selectedLanguage].generateSchedule}`
                    : `🔍 ${translations[selectedLanguage].checkFeasibility}`
                  }
                  onPress={activeTab === "schedule" ? submitSchedule : submitPrediction}
                  color="#00695c"
                />
              </View>

              {scheduleResult && (
                <View style={styles.output}>
                  <Text style={styles.outputHeader}>📋 {translations[selectedLanguage].schedule_result}:</Text>
                  {scheduleResult.schedule ? (
                    scheduleResult.schedule.map((bore, i) => (
                      <View key={i}>
                        <Text style={styles.boldText}>Borewell {bore.borewell} - ⏱ {bore.total_time} mins</Text>
                        {bore.crops.map((c, j) => (
                          <Text key={j} style={styles.cropLine}>
                            • {c.crop_name} ({c.crop_stage} - {c.season}) - {c.acres} acre(s) → {c.total_time} mins
                          </Text>
                        ))}
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: "red" }}>{scheduleResult.message}</Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.label}>{translations[selectedLanguage].borewells}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={predictionBorewells}
                onChangeText={setPredictionBorewells}
              />

              {/* List of prediction crops */}
              {predictionCrops.map((crop, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.subHeader}>Crop {index + 1}</Text>
                  <Text>Name: {crop.crop_name}</Text>
                  <Text>Stage: {crop.crop_stage}</Text>
                  <Text>Season: {crop.season}</Text>
                  <Text>Acres: {crop.acres}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePredictionCropLocal(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={22} color="#d32f2f" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Show Add Crop button or form */}
              {!showPredictionCropForm ? (
                <ActionButton 
                  title={`➕ ${translations[selectedLanguage].addCrop}`}
                  onPress={() => setShowPredictionCropForm(true)}
                  color="#388e3c"
                />
              ) : (
                <View style={styles.card}>
                  <Text style={styles.subHeader}>Add Crop</Text>
                  {["crop_name", "crop_stage", "season", "acres"].map((field) => (
                    <TextInput
                      key={field}
                      style={styles.input}
                      placeholder={field.replace(/_/g, " ")}
                      keyboardType={field === "acres" ? "numeric" : "default"}
                      value={newPredictionCrop[field]}
                      onChangeText={(value) => setNewPredictionCrop(prev => ({ ...prev, [field]: value }))}
                    />
                  ))}
                  <ActionButton 
                    title="Save Crop"
                    onPress={handleAddPredictionCropLocal}
                    color="#00695c"
                  />
                  <ActionButton 
                    title="Cancel"
                    onPress={() => setShowPredictionCropForm(false)}
                    color="#d32f2f"
                  />
                </View>
              )}

              {/* Generate Schedule/Check Feasibility Button */}
              <View style={{ marginTop: 12 }}>
                <ActionButton 
                  title={activeTab === "schedule" 
                    ? `🚀 ${translations[selectedLanguage].generateSchedule}`
                    : `🔍 ${translations[selectedLanguage].checkFeasibility}`
                  }
                  onPress={activeTab === "schedule" ? submitSchedule : submitPrediction}
                  color="#00695c"
                />
              </View>

              {predictionResult && (
                <View style={styles.output}>
                  <Text style={styles.outputHeader}>📋 {translations[selectedLanguage].feasibility_result}:</Text>
                  {predictionResult.message && (
                    <Text style={predictionResult.status === "Feasible" ? styles.successText : styles.warningText}>
                      {predictionResult.message}
                    </Text>
                  )}
                  
                  {predictionResult.total_time_needed && (
                    <>
                      <Text style={styles.boldText}>Total Watering Time Needed: {predictionResult.total_time_needed} mins</Text>
                      <Text>Available Capacity: {predictionResult.available_capacity} mins</Text>
                    </>
                  )}
                  
                  {predictionResult.extra_minutes_needed && (
                    <Text>Additional Capacity Needed: {predictionResult.extra_minutes_needed} mins</Text>
                  )}
                  
                  {predictionResult.suggested_borewells && (
                    <Text>Suggested Borewells: {predictionResult.suggested_borewells}</Text>
                  )}
                  
                  {predictionResult.crops && (
                    <>
                      <Text style={styles.boldText}>{translations[selectedLanguage].cropDetails}:</Text>
                      {predictionResult.crops.map((crop, i) => (
                        <Text key={i} style={styles.cropLine}>
                          • {crop.crop_name}: {crop.acres} acres, {crop.total_time} mins
                        </Text>
                      ))}
                    </>
                  )}
                  
                  {predictionResult.invalid_crops && predictionResult.invalid_crops.length > 0 && (
                    <>
                      <Text style={styles.boldText}>Invalid Crops:</Text>
                      {predictionResult.invalid_crops.map((crop, i) => (
                        <Text key={i} style={styles.cropLine}>• {crop}</Text>
                      ))}
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#c8e6c9',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    minWidth: 200,
  },
  tipText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
    marginTop: 8,
  },
  output: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  outputHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  boldText: {
    fontWeight: "bold",
    marginTop: 6,
  },
  successText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  warningText: {
    color: "#d32f2f",
    fontWeight: "bold",
  },
  cropLine: {
    marginLeft: 10,
    fontSize: 13,
  },
  actionButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fbe9e7',
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  }
});