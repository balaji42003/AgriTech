import { Picker } from '@react-native-picker/picker'; // Add this import at the top
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Language support
const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { id: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { id: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

const translations = {
  en: {
    headerTitle: "Crop Cost Estimator",
    headerSubtitle: "Plan your farming budget wisely",
    cropDetails: "Crop Details",
    cropType: "Select Crop Type",
    landArea: "Land Area (Acres)",
    location: "Your Location",
    calculate: "Calculate Estimate",
    commonCrops: "Common Crops",
    resultTitle: "Estimated Costs",
    perAcre: "Per Acre",
    totalCost: "Total Cost",
    includes: "Includes:",
    seeds: "Seeds",
    fertilizers: "Fertilizers",
    pesticides: "Pesticides",
    irrigation: "Irrigation",
    labor: "Labor",
    machinery: "Machinery",
  },
  hi: {
    headerTitle: "फसल लागत अनुमानक",
    headerSubtitle: "अपना कृषि बजट समझदारी से बनाएं",
    cropDetails: "फसल विवरण",
    cropType: "फसल प्रकार चुनें",
    landArea: "भूमि क्षेत्र (एकड़)",
    location: "आपका स्थान",
    calculate: "अनुमान लगाएं",
    commonCrops: "सामान्य फसलें",
    resultTitle: "अनुमानित लागत",
    perAcre: "प्रति एकड़",
    totalCost: "कुल लागत",
    includes: "शामिल हैं:",
    seeds: "बीज",
    fertilizers: "उर्वरक",
    pesticides: "कीटनाशक",
    irrigation: "सिंचाई",
    labor: "श्रम",
    machinery: "मशीनरी",
  },
  te: {
    headerTitle: "పంట ఖర్చు అంచనా",
    headerSubtitle: "మీ వ్యవసాయ బడ్జెట్‌ను తెలివిగా ప్రణాళిక చేసుకోండి",
    cropDetails: "పంట వివరాలు",
    cropType: "పంట రకం ఎంచుకోండి",
    landArea: "భూమి విస్తీర్ణం (ఎకరాలు)",
    location: "మీ స్థానం",
    calculate: "అంచనాను లెక్కించండి",
    commonCrops: "సాధారణ పంటలు",
    resultTitle: "అంచనా వ్యయాలు",
    perAcre: "ప్రతి ఎకరం",
    totalCost: "మొత్తం ఖర్చు",
    includes: "ఇందులో ఉన్నాయి:",
    seeds: "విత్తనాలు",
    fertilizers: "రసాయనాలు",
    pesticides: "కీటనాశకాలు",
    irrigation: "నీరు అందించడం",
    labor: "శ్రమ",
    machinery: "యంత్రాలు",
  },
  ta: {
    headerTitle: "பயிர் செலவு மதிப்பீடு",
    headerSubtitle: "உங்கள் விவசாய பட்ஜெட்டை புத்திசாலித்தனமாக திட்டமிடுங்கள்",
    cropDetails: "பயிர் விவரங்கள்",
    cropType: "பயிர் வகையைத் தேர்ந்தெடுக்கவும்",
    landArea: "நிலப் பரப்பளவு (எக்கரங்கள்)",
    location: "உங்கள் இடம்",
    calculate: "மதிப்பீட்டை கணக்கிடவும்",
    commonCrops: "பொதுவான பயிர்கள்",
    resultTitle: "மதிப்பீட்டுக்கான செலவுகள்",
    perAcre: "ஒரு எக்கரத்திற்கு",
    totalCost: "மொத்த செலவு",
    includes: "இதில் அடங்கும்:",
    seeds: "விதைகள்",
    fertilizers: "உயிரூட்டிகள்",
    pesticides: "கீடணுக்களால்",
    irrigation: "நீர் வழங்கல்",
    labor: "தொழிலாளர்",
    machinery: "இயந்திரங்கள்",
  }
};

const commonCrops = [
  { id: 'rice', name: 'Rice', icon: '🌾' },
  { id: 'wheat', name: 'Wheat', icon: '🌾' },
  { id: 'banana', name: 'Banana', icon: '🍌' },
  { id: 'brinjal', name: 'Brinjal', icon: '🍆' },
  { id: 'cotton', name: 'Cotton', icon: '🌿' },
  { id: 'corn', name: 'Corn', icon: '🌽' },
  { id: 'sugarcane', name: 'Sugarcane', icon: '🎋' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'chilli', name: 'Chilli', icon: '🌶️' },
];

export default function CropCostEstimator() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [area, setArea] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState(null);

  const acreOptions = Array.from({ length: 20 }, (_, i) => i + 1); // 1 to 20 acres

  const handleCalculate = async () => {
    setShowResults(false);
    setError('');
    setLoading(true);
    setEstimate(null);

    if (!selectedCrop || !area) {
      setError('Please select a crop and enter land area.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://192.168.99.246:5000/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: selectedCrop,
          acres: area
        })
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setEstimate({
        table: data.table,
        total: data.total_cost_row,
        raw: data.raw_response
      });
      setShowResults(true);
    } catch (err) {
      setError('Failed to get estimate. Please try again.');
    }
    setLoading(false);
  };

  // Helper to parse Gemini response into items and total cost
  function parseEstimateResponse(response) {
    if (!response) return { items: [], total: null };
    const lines = response.split('\n').map(l => l.trim()).filter(l => l);
    const items = [];
    let total = null;
    lines.forEach(line => {
      // Bullet point or dash
      if (line.startsWith('-')) {
        // Remove leading dash and split by colon
        const [label, ...rest] = line.replace(/^-/, '').split(':');
        items.push({
          label: label.trim(),
          value: rest.join(':').trim()
        });
      }
      // Total cost line
      if (/total/i.test(line) && /INR/i.test(line)) {
        total = line.replace(/^\-/, '').replace(/Total\s*Estimated\s*Cost\s*:/i, '').trim();
      }
    });
    return { items, total };
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f0fff4', '#e8f5e9']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
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

          {/* Main Card */}
          <View style={styles.mainCard}>
            {/* Common Crops Section */}
            <Text style={styles.sectionTitle}>{translations[selectedLanguage].commonCrops}</Text>
            <View style={styles.cropsGrid}>
              {commonCrops.map(crop => (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.cropButton,
                    selectedCrop === crop.id && styles.selectedCrop
                  ]}
                  onPress={() => setSelectedCrop(crop.id)}
                >
                  <Text style={styles.cropIcon}>{crop.icon}</Text>
                  <Text style={styles.cropName}>{crop.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>{translations[selectedLanguage].landArea}</Text>
              <View style={styles.acreInputRow}>
                <TouchableOpacity
                  style={styles.acreButton}
                  onPress={() => setArea(prev => Math.max(1, Number(prev) - 1).toString())}
                  disabled={Number(area) <= 1}
                >
                  <Text style={styles.acreButtonText}>-</Text>
                </TouchableOpacity>
                <Picker
                  selectedValue={area ? Number(area) : 1}
                  style={styles.acrePicker}
                  onValueChange={value => setArea(value.toString())}
                  mode="dropdown"
                >
                  {acreOptions.map(val => (
                    <Picker.Item key={val} label={`${val}`} value={val} />
                  ))}
                </Picker>
                <TouchableOpacity
                  style={styles.acreButton}
                  onPress={() => setArea(prev => Math.min(20, Number(prev) + 1).toString())}
                  disabled={Number(area) >= 20}
                >
                  <Text style={styles.acreButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Calculate Button */}
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={handleCalculate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.calculateButtonText}>
                  {translations[selectedLanguage].calculate}
                </Text>
              )}
            </TouchableOpacity>

            {/* Error Message */}
            {error ? (
              <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</Text>
            ) : null}

            {/* Results Section */}
            {showResults && (
              <View style={styles.resultsCard}>
                <Text style={styles.resultTitle}>
                  {translations[selectedLanguage].resultTitle}
                </Text>
                {estimate && estimate.table && estimate.table.length > 0 ? (
                  <View>
                    {/* Table Header */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 6, marginBottom: 6 }}>
                      <Text style={{ flex: 2, fontWeight: 'bold', color: '#388e3c' }}>Item</Text>
                      <Text style={{ flex: 3, fontWeight: 'bold', color: '#388e3c' }}>Description</Text>
                      <Text style={{ flex: 2, fontWeight: 'bold', color: '#388e3c', textAlign: 'right' }}>Estimated Cost (INR)</Text>
                    </View>
                    {/* Table Rows */}
                    {estimate.table.map((row, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderColor: '#eee' }}>
                        <Text style={{ flex: 2, color: '#333' }}>{row['Item']}</Text>
                        <Text style={{ flex: 3, color: '#333' }}>{row['Description']}</Text>
                        <Text style={{ flex: 2, color: '#333', textAlign: 'right' }}>{row['Estimated Cost (INR)']}</Text>
                      </View>
                    ))}
                    {/* Total Cost Row */}
                    {estimate.total && (
                      <View style={{ flexDirection: 'row', paddingVertical: 8, backgroundColor: '#e8f5e9', borderRadius: 8, marginTop: 8 }}>
                        <Text style={{ flex: 2, fontWeight: 'bold', color: '#2e7d32' }}>{estimate.total['Item']}</Text>
                        <Text style={{ flex: 3, fontWeight: 'bold', color: '#2e7d32' }}>{estimate.total['Description']}</Text>
                        <Text style={{ flex: 2, fontWeight: 'bold', color: '#2e7d32', textAlign: 'right' }}>{estimate.total['Estimated Cost (INR)']}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text>No estimate available.</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 16,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cropButton: {
    width: (width - 80) / 3,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCrop: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  cropIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  cropName: {
    fontSize: 14,
    color: '#333',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 8,
    fontWeight: '500',
  },
  acreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  acreButton: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
  },
  acreButtonText: {
    fontSize: 22,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  acrePicker: {
    flex: 1,
    height: 70,
  },
  calculateButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    marginTop: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 16,
  },
});