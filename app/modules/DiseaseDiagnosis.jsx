import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { id: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { id: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

const translations = {
  en: {
    headerTitle: "🌿 Plant Disease Detection",
    headerSubtitle: "Quick diagnosis & treatment advice",
    uploadText: "Select Plant Image",
    uploadSubtext: "Tap to choose from gallery",
    newImageButton: "New Image",
    diagnoseButton: "Diagnose",
    loadingText: "Analyzing leaf image...",
    resultTitle: "Diagnosis Results",
    detectedDisease: "Detected Disease",
    accuracy: "Accuracy",
    treatmentPlan: "Treatment Plan",
    recentScansTitle: "Recent Scans",
    diseaseGuideTitle: "Quick Disease Guide",
    emergencyTitle: "Need Urgent Help?",
    emergencySubtext: "Connect with Agriculture Experts 24/7"
  },
  hi: {
    headerTitle: "🌿 पौधों की बीमारी की पहचान",
    headerSubtitle: "त्वरित निदान और उपचार सलाह",
    uploadText: "पौधे की छवि चुनें",
    uploadSubtext: "गैलरी से चुनने के लिए टैप करें",
    newImageButton: "नई छवि",
    diagnoseButton: "निदान करें",
    loadingText: "पत्ती की छवि का विश्लेषण किया जा रहा है...",
    resultTitle: "निदान परिणाम",
    detectedDisease: "पहचानी गई बीमारी",
    accuracy: "सटीकता",
    treatmentPlan: "उपचार योजना",
    recentScansTitle: "हाल की जांच",
    diseaseGuideTitle: "त्वरित रोग मार्गदर्शिका",
    emergencyTitle: "तत्काल सहायता चाहिए?",
    emergencySubtext: "कृषि विशेषज्ञों से 24/7 जुड़ें"
  },
  te: {
    headerTitle: "🌿 మొక్క వ్యాధి గుర్తింపు",
    headerSubtitle: "త్వరిత రోగనిర్ధారణ & చికిత్స సలహా",
    uploadText: "మొక్క చిత్రాన్ని ఎంచుకోండి",
    uploadSubtext: "గ్యాలరీ నుండి ఎంచుకోవడానికి నొక్కండి",
    newImageButton: "కొత్త చిత్రం",
    diagnoseButton: "రోగనిర్ధారణ",
    loadingText: "ఆకు చిత్రం విశ్లేషించబడుతోంది...",
    resultTitle: "రోగనిర్ధారణ ఫలితాలు",
    detectedDisease: "గుర్తించిన వ్యాధి",
    accuracy: "ఖచ్చితత్వం",
    treatmentPlan: "చికిత్స ప్రణాళిక",
    recentScansTitle: "ఇటీవలి స్కాన్‌లు",
    diseaseGuideTitle: "త్వరిత వ్యాధి గైడ్",
    emergencyTitle: "అత్యవసర సహాయం కావాలా?",
    emergencySubtext: "వ్యవసాయ నిపుణులతో 24/7 అనుసంధానం"
  },
  ta: {
    headerTitle: "🌿 தாவர நோய் கண்டறிதல்",
    headerSubtitle: "விரைவான நோய் கண்டறிதல் & சிகிச்சை ஆலோசனை",
    uploadText: "தாவர படத்தை தேர்ந்தெடுக்கவும்",
    uploadSubtext: "கேலரியிலிருந்து தேர்வு செய்ய தட்டவும்",
    newImageButton: "புதிய படம்",
    diagnoseButton: "நோய் கண்டறிக",
    loadingText: "இலை படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    resultTitle: "நோய் கண்டறிதல் முடிவுகள்",
    detectedDisease: "கண்டறியப்பட்ட நோய்",
    accuracy: "துல்லியம்",
    treatmentPlan: "சிகிச்சை திட்டம்",
    recentScansTitle: "சமீபத்திய ஸ்கேன்கள்",
    diseaseGuideTitle: "விரைவு நோய் வழிகாட்டி",
    emergencyTitle: "அவசர உதவி தேவையா?",
    emergencySubtext: "விவசாய நிபுணர்களுடன் 24/7 இணைக்கவும்"
  }
};

export default function DiseaseDiagnosis() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentScans] = useState([
    { id: '1', date: '2023-07-10', disease: 'Leaf Blight', crop: 'Rice' },
    { id: '2', date: '2023-07-08', disease: 'Rust', crop: 'Wheat' },
  ]);

  const commonDiseases = [
    { id: '1', name: 'Bacterial Blight', symptoms: 'Yellow-brown lesions', icon: '🍃' },
    { id: '2', name: 'Leaf Rust', symptoms: 'Orange-brown spots', icon: '🌾' },
    { id: '3', name: 'Powdery Mildew', symptoms: 'White powdery coating', icon: '🌿' },
  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setResult(null);
      setConfidence(null);
      setMedication(null);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    setLoading(true);
    let formData = new FormData();
    formData.append("image", {
      uri: image,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    try {
      const response = await fetch("http://10.3.5.210:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await response.json();
      setResult(data.predicted_class || "No result");
      setConfidence(data.confidence ? `${data.confidence}%` : null);
      setMedication(data.medication || null);
    } catch (e) {
      Alert.alert("Upload failed", e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#f0fff4', '#e8f5e9']} style={styles.gradientBg}>
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>{translations[selectedLanguage].headerTitle}</Text>
            <Text style={styles.subtitle}>{translations[selectedLanguage].headerSubtitle}</Text>
          </View>

          {/* Language Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.languageScroll}
          >
            {languages.map(lang => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.languageBtn,
                  selectedLanguage === lang.id && styles.selectedLanguage
                ]}
                onPress={() => setSelectedLanguage(lang.id)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={styles.languageName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.uploadSection}>
            {!image ? (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <View style={styles.uploadContent}>
                  <Ionicons name="leaf-outline" size={40} color="#388e3c" />
                  <Text style={styles.uploadText}>{translations[selectedLanguage].uploadText}</Text>
                  <Text style={styles.uploadSubtext}>{translations[selectedLanguage].uploadSubtext}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.newImageBtn]} 
                    onPress={pickImage}
                  >
                    <Ionicons name="images-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>{translations[selectedLanguage].newImageButton}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.diagnoseBtn]} 
                    onPress={uploadImage}
                    disabled={loading}
                  >
                    <Ionicons name="search-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>{translations[selectedLanguage].diagnoseButton}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#388e3c" />
              <Text style={styles.loadingText}>{translations[selectedLanguage].loadingText}</Text>
            </View>
          )}

          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Ionicons name="medical" size={24} color="#388e3c" />
                <Text style={styles.resultTitle}>{translations[selectedLanguage].resultTitle}</Text>
              </View>
              
              <View style={styles.resultCard}>
                <Text style={styles.diseaseText}>
                  <Text style={styles.labelText}>{translations[selectedLanguage].detectedDisease}: </Text>
                  {result}
                </Text>
                {confidence && (
                  <Text style={styles.confidenceText}>
                    <Text style={styles.labelText}>{translations[selectedLanguage].accuracy}: </Text>
                    {confidence}
                  </Text>
                )}
              </View>

              {medication && (
                <View style={styles.medicationContainer}>
                  <View style={styles.medicationHeader}>
                    <Ionicons name="medkit-outline" size={20} color="#2e7d32" />
                    <Text style={styles.medicationTitle}>{translations[selectedLanguage].treatmentPlan}</Text>
                  </View>
                  <Text style={styles.medicationText}>{medication}</Text>
                </View>
              )}
            </View>
          )}

          {/* Add after the results section */}
          <View style={styles.additionalContent}>
            {/* Recent Scans Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color="#388e3c" />
                <Text style={styles.sectionTitle}>{translations[selectedLanguage].recentScansTitle}</Text>
              </View>
              <FlatList
                horizontal
                data={recentScans}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.recentScanCard}>
                    <Text style={styles.recentDate}>{item.date}</Text>
                    <Text style={styles.recentCrop}>{item.crop}</Text>
                    <Text style={styles.recentDisease}>{item.disease}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
              />
            </View>

            {/* Common Diseases Guide */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={20} color="#388e3c" />
                <Text style={styles.sectionTitle}>{translations[selectedLanguage].diseaseGuideTitle}</Text>
              </View>
              {commonDiseases.map(disease => (
                <View key={disease.id} style={styles.diseaseGuideItem}>
                  <Text style={styles.diseaseIcon}>{disease.icon}</Text>
                  <View style={styles.diseaseInfo}>
                    <Text style={styles.diseaseName}>{disease.name}</Text>
                    <Text style={styles.diseaseSymptoms}>{disease.symptoms}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Emergency Help Section */}
            <TouchableOpacity style={styles.emergencySection}>
              <LinearGradient
                colors={['#ff7043', '#ff5722']}
                style={styles.emergencyGradient}
                start={[0, 0]}
                end={[1, 0]}
              >
                <Ionicons name="call" size={24} color="#fff" />
                <View style={styles.emergencyContent}>
                  <Text style={styles.emergencyTitle}>{translations[selectedLanguage].emergencyTitle}</Text>
                  <Text style={styles.emergencySubtext}>{translations[selectedLanguage].emergencySubtext}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fff4',
  },
  gradientBg: {
    minHeight: '100%',
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: "#388e3c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  languageScroll: {
    marginBottom: 20,
  },
  languageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  languageFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  languageName: {
    color: '#333',
    fontSize: 14,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#f0fff4',
    borderWidth: 2,
    borderColor: '#a5d6a7',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388e3c',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
  },
  newImageBtn: {
    backgroundColor: '#fb8c00',
  },
  diagnoseBtn: {
    backgroundColor: '#388e3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#388e3c',
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  labelText: {
    fontWeight: 'bold',
    color: '#333',
  },
  diseaseText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  medicationContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 6,
  },
  medicationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  additionalContent: {
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    marginLeft: 8,
  },
  recentScanCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 120,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recentCrop: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 2,
  },
  recentDisease: {
    fontSize: 13,
    color: '#333',
  },
  diseaseGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  diseaseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  diseaseSymptoms: {
    fontSize: 12,
    color: '#666',
  },
  emergencySection: {
    marginTop: 10,
    marginBottom: 20,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#ff5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  emergencySubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
});