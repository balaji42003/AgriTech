import { LinearGradient } from "expo-linear-gradient";
import * as Location from 'expo-location'; // Add this import at the top
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import farmLogo from "../assets/farm-logo.jpg";

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { id: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { id: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

const translations = {
  en: {
    headerTitle: "🌱 Smart Agriculture Platform",
    weatherTitle: "Today's Weather",
    loadingWeather: "Loading weather...",
    detectingLocation: "Detecting location...",
    newsTitle: "Agri News & Tips",
    loadingNews: "Loading news...",
    footer: "Empowering Farmers with Technology 🚜",
    features: [
      { name: "Disease Diagnosis", route: "modules/DiseaseDiagnosis", icon: "🩺", desc: "Detect plant diseases and get medication advice." },
      { name: "Voice Assistant", route: "modules/VoiceAssistant", icon: "💬", desc: "Ask questions by voice or text and get instant answers." },
      { name: "Crop Cost Estimator", route: "modules/CropCostEstimator", icon: "💰", desc: "Estimate costs for your crops based on area and location." },
      { name: "Water Scheduler", route: "modules/WaterScheduler", icon: "💧", desc: "Plan and optimize your farm's watering schedule." },
      { name: "Motor Control", route: "modules/MotorControlPanel", icon: "🔌", desc: "Remotely control and schedule your water motors." },
    ]
  },
  hi: {
    headerTitle: "🌱 स्मार्ट कृषि मंच",
    weatherTitle: "आज का मौसम",
    loadingWeather: "मौसम की जानकारी लोड हो रही है...",
    detectingLocation: "स्थान का पता लगाया जा रहा है...",
    newsTitle: "कृषि समाचार और सुझाव",
    loadingNews: "समाचार लोड हो रहे हैं...",
    footer: "किसानों को तकनीक से सशक्त बनाना 🚜",
    features: [
      { name: "रोग निदान", route: "modules/DiseaseDiagnosis", icon: "🩺", desc: "पौधों की बीमारियों का पता लगाएं और दवा की सलाह लें।" },
      { name: "वॉइस असिस्टेंट", route: "modules/VoiceAssistant", icon: "💬", desc: "आवाज या टेक्स्ट से प्रश्न पूछें और तुरंत जवाब पाएं।" },
      { name: "फसल लागत अनुमान", route: "modules/CropCostEstimator", icon: "💰", desc: "क्षेत्र और स्थान के आधार पर फसलों की लागत का अनुमान लगाएं।" },
      { name: "पानी शेड्यूलर", route: "modules/WaterScheduler", icon: "💧", desc: "अपने खेत की सिंचाई की योजना बनाएं।" },
      { name: "मोटर नियंत्रण", route: "modules/MotorControlPanel", icon: "🔌", desc: "पानी के मोटर को दूर से नियंत्रित करें।" },
    ]
  },
  te: {
    headerTitle: "🌱 స్మార్ట్ వ్యవసాయ వేదిక",
    weatherTitle: "నేటి వాతావరణం",
    loadingWeather: "వాతావరణ సమాచారం లోడ్ అవుతోంది...",
    detectingLocation: "స్థానం కనుగొనబడుతోంది...",
    newsTitle: "వ్యవసాయ వార్తలు మరియు చిట్కాలు",
    loadingNews: "వార్తలు లోడ్ అవుతున్నాయి...",
    footer: "రైతులను సాంకేతికతతో శక్తివంతం చేస్తోంది 🚜",
    features: [
      { name: "వ్యాధి నిర్ధారణ", route: "modules/DiseaseDiagnosis", icon: "🩺", desc: "మొక్కల వ్యాధులను గుర్తించి మందుల సలహా పొందండి." },
      { name: "వాయిస్ సహాయకుడు", route: "modules/VoiceAssistant", icon: "💬", desc: "వాయిస్ లేదా టెక్స్ట్ ద్వారా ప్రశ్నలు అడగండి." },
      { name: "పంట ఖర్చు అంచనా", route: "modules/CropCostEstimator", icon: "💰", desc: "విస్తీర్ణం మరియు ప్రాంతం ఆధారంగా పంటల ఖర్చును అంచనా వేయండి." },
      { name: "నీటి షెడ్యూలర్", route: "modules/WaterScheduler", icon: "💧", desc: "మీ పొలానికి నీటి తోటి ప్రణాళిక." },
      { name: "మోటార్ నియంత్రణ", route: "modules/MotorControlPanel", icon: "🔌", desc: "నీటి మోటార్లను దూరం నుండి నియంత్రించండి." },
    ]
  },
  ta: {
    headerTitle: "🌱 ஸ்மார்ட் விவசாய தளம்",
    weatherTitle: "இன்றைய வானிலை",
    loadingWeather: "வானிலை தகவல் ஏற்றப்படுகிறது...",
    detectingLocation: "இருப்பிடம் கண்டறியப்படுகிறது...",
    newsTitle: "விவசாய செய்திகள் & குறிப்புகள்",
    loadingNews: "செய்திகள் ஏற்றப்படுகிறது...",
    footer: "விவசாயிகளை தொழில்நுட்பத்தால் மேம்படுத்துகிறோம் 🚜",
    features: [
      { name: "நோய் கண்டறிதல்", route: "modules/DiseaseDiagnosis", icon: "🩺", desc: "தாவர நோய்களை கண்டறிந்து மருந்து ஆலோசனை பெறுங்கள்." },
      { name: "குரல் உதவியாளர்", route: "modules/VoiceAssistant", icon: "💬", desc: "குரல் அல்லது உரை மூலம் கேள்விகள் கேட்கவும்." },
      { name: "பயிர் செலவு மதிப்பீடு", route: "modules/CropCostEstimator", icon: "💰", desc: "பரப்பளவு மற்றும் இடத்தின் அடிப்படையில் பயிர் செலவை மதிப்பீடு செய்யுங்கள்." },
      { name: "நீர் அட்டவணை", route: "modules/WaterScheduler", icon: "💧", desc: "உங்கள் பண்ணையின் நீர்ப்பாசன அட்டவணை." },
      { name: "மோட்டார் கட்டுப்பாடு", route: "modules/MotorControlPanel", icon: "🔌", desc: "நீர் மோட்டார்களை தொலைவில் இருந்து கட்டுப்படுத்துங்கள்." },
    ]
  }
};

const features = [
  { name: "Disease Diagnosis", route: "modules/DiseaseDiagnosis", icon: "🩺", desc: "Detect plant diseases and get medication advice." },
  { name: "Voice Assistant", route: "modules/VoiceAssistant", icon: "💬", desc: "Ask questions by voice or text and get instant answers." },
  { name: "Crop Cost Estimator", route: "modules/CropCostEstimator", icon: "💰", desc: "Estimate costs for your crops based on area and location." },
  { name: "Water Scheduler", route: "modules/WaterScheduler", icon: "💧", desc: "Plan and optimize your farm's watering schedule." },
  { name: "Motor Control", route: "modules/MotorControlPanel", icon: "🔌", desc: "Remotely control and schedule your water motors." },
];

const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_WIDTH = (width - CARD_GAP) / 2; // Two cards + one gap fill the width
const SIDE_PADDING = 0;

// Add this weather icon mapping object at the top of the file, after imports
const weatherIcons = {
  '01d': '☀️', // clear sky day
  '01n': '🌙', // clear sky night
  '02d': '⛅', // few clouds day
  '02n': '☁️', // few clouds night
  '03d': '☁️', // scattered clouds
  '03n': '☁️', // scattered clouds
  '04d': '☁️', // broken clouds
  '04n': '☁️', // broken clouds
  '09d': '🌧️', // shower rain
  '09n': '🌧️', // shower rain
  '10d': '🌦️', // rain day
  '10n': '🌧️', // rain night
  '11d': '⛈️', // thunderstorm
  '11n': '⛈️', // thunderstorm
  '13d': '❄️', // snow
  '13n': '❄️', // snow
  '50d': '🌫️', // mist
  '50n': '🌫️', // mist
  default: '🌤️' // default icon
};

export default function Index() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [news, setNews] = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        
        // Fetch weather using user's coordinates
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=01ab8b07a6b20baa3a38f65717cf32d1&units=metric`
        );
        const data = await response.json();
        
        if (data.main) {
          setWeather({
            temp: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            location: data.name,      // City name from API
            country: data.sys.country // Country code from API
          });
        }
      } catch (error) {
        setErrorMsg('Error fetching weather data');
        console.error(error);
      }
    })();
  }, []);

  // Update the news fetching logic in useEffect
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using 'top-headlines' instead of 'everything' endpoint for better results
        const response = await fetch(
          'https://newsapi.org/v2/top-headlines?' + 
          new URLSearchParams({
            country: 'in', // Specific to India
            category: 'business', // This usually includes agriculture news
            pageSize: 15,
            apiKey: '79febdcaa09e4bc5b904a437eb1f4cff',
            q: 'agriculture OR farming OR crops OR farmers'
          })
        );

        const data = await response.json();
        
        if (data.status === 'ok' && data.articles?.length > 0) {
          const farmingNews = data.articles
            .filter(article => 
              article.title && 
              !article.title.includes('[Removed]') &&
              article.description
            )
            .map(article => ({
              ...article,
              title: article.title.split('|')[0].trim() // Clean up titles
            }))
            .slice(0, 15);

          if (farmingNews.length > 0) {
            console.log('Fetched news count:', farmingNews.length);
            setNews(farmingNews);
          } else {
            // Fallback news if no agriculture news is found
            setNews([{
              title: "Stay tuned for latest agriculture updates",
              publishedAt: new Date().toISOString(),
              source: { name: "Smart Agri" }
            }]);
          }
        } else {
          throw new Error('No articles received');
        }
      } catch (error) {
        console.error('News fetch error:', error);
        // Set default news when API fails
        setNews([{
          title: "Unable to fetch news at the moment. Check your internet connection.",
          publishedAt: new Date().toISOString(),
          source: { name: "System" }
        }]);
      }
    };

    // Initial fetch
    fetchNews();

    // Rotate news every 8 seconds
    const rotateNews = setInterval(() => {
      setCurrentNewsIndex(prevIndex => {
        if (news.length > 0) {
          return (prevIndex + 1) % news.length;
        }
        return 0;
      });
    }, 8000);

    // Refresh news every 15 minutes
    const refreshNews = setInterval(fetchNews, 900000);

    return () => {
      clearInterval(rotateNews);
      clearInterval(refreshNews);
    };
  }, []); // Keep empty dependency array

  // Add this separate useEffect to handle news rotation when news array changes
  useEffect(() => {
    if (news.length > 0 && currentNewsIndex >= news.length) {
      setCurrentNewsIndex(0);
    }
  }, [news.length]);

  // Update your renderItem function to use translations
  const renderItem = ({ item }) => {
    const translatedFeature = translations[selectedLanguage].features.find(f => f.route === item.route);
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push(`/${item.route}`)}
      >
        <LinearGradient
          colors={["#f1f8e9", "#e8f5e9", "#c8e6c9"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.cardGradient}
        >
          <Text style={styles.icon}>{translatedFeature.icon}</Text>
          <Text style={styles.title}>{translatedFeature.name}</Text>
          <Text style={styles.desc}>{translatedFeature.desc}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#f0fff4", "#e8f5e9", "#fffde4"]}
      style={styles.root}
    >
      <View style={styles.headerSection}>
        <Text style={styles.header}>{translations[selectedLanguage].headerTitle}</Text>
        
        {/* Add Language Selector */}
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

        <View style={styles.logoShadowWrap}>
          <Image source={farmLogo} style={styles.logoWide} resizeMode="cover" />
        </View>
      </View>

      {/* Update weather section */}
      <View style={styles.bottomSection}>
        <View style={styles.weatherBox}>
          <Text style={styles.weatherTitle}>{translations[selectedLanguage].weatherTitle}</Text>
          {weather ? (
            <View style={styles.weatherRow}>
              <Text style={styles.weatherIcon}>
                {weatherIcons[weather.icon] || weatherIcons.default}
              </Text>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherDesc}>{weather.description}</Text>
            </View>
          ) : (
            <Text style={styles.weatherDesc}>
              {errorMsg || translations[selectedLanguage].loadingWeather}
            </Text>
          )}
          <Text style={styles.weatherLocation}>
            {weather ? `${weather.location}, ${weather.country}` : translations[selectedLanguage].detectingLocation}
          </Text>
        </View>
      </View>

      {/* Features grid in the middle */}
      <View style={styles.gridSection}>
        <Animated.FlatList
          data={translations[selectedLanguage].features}
          renderItem={renderItem}
          keyExtractor={item => item.route}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate={Platform.OS === "ios" ? 0 : 0.98}
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING,
          }}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      </View>

      {/* Update news section */}
      <View style={styles.newsSection}>
        <View style={styles.newsBox}>
          <Text style={styles.newsTitle}>{translations[selectedLanguage].newsTitle}</Text>
          {news.length === 0 ? (
            <View style={styles.newsLoadingContainer}>
              <ActivityIndicator size="small" color="#388e3c" />
              <Text style={styles.newsItem}>
                {translations[selectedLanguage].loadingNews}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.newsItem}>
                • {news[currentNewsIndex]?.title || translations[selectedLanguage].loadingNews}
              </Text>
              {news[currentNewsIndex]?.publishedAt && (
                <Text style={[styles.newsItem, styles.newsDate]}>
                  {new Date(news[currentNewsIndex].publishedAt).toLocaleDateString()}
                </Text>
              )}
              {news[currentNewsIndex]?.source?.name && (
                <Text style={[styles.newsItem, styles.newsSource]}>
                  Source: {news[currentNewsIndex].source.name}
                </Text>
              )}
            </>
          )}
        </View>
      </View>
      <Text style={styles.footer}>{translations[selectedLanguage].footer}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0fff4",
  },
  headerSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 38,
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "#dcedc8",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  logoShadowWrap: {
    shadowColor: "#388e3c",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    shadowOpacity: 0.18,
    borderRadius: 32,
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  logoWide: {
    width: width * 0.92,
    height: 150,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#a8e063",
    backgroundColor: "#fff",
  },
  gridSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 160, // Increased height for better spacing
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    elevation: 3,
    shadowColor: "#388e3c",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    margin: 6,
  },
  cardGradient: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  icon: {
    fontSize: 36, // Slightly larger icon
    marginBottom: 12,
    color: "#2e7d32", // Darker green for better contrast
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1b5e20", // Darker green for better readability
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  desc: {
    fontSize: 12,
    color: "#388e3c",
    textAlign: "center",
    paddingHorizontal: 4,
    lineHeight: 16,
    opacity: 0.85,
  },
  bottomSection: {
    width: "92%",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4, // Reduced from 10 to bring features grid closer
  },
  weatherBox: {
    backgroundColor: "#e6f9ec",
    borderRadius: 14,
    padding: 12,
    marginBottom: 0, // Reduced from 10 to remove extra space
    alignItems: "center",
    elevation: 1,
  },
  weatherTitle: {
    fontWeight: "bold",
    color: "#388e3c",
    fontSize: 15,
    marginBottom: 4,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  weatherIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#185a9d",
    marginRight: 8,
  },
  weatherDesc: {
    fontSize: 15,
    color: "#388e3c",
  },
  weatherLocation: {
    fontSize: 12,
    color: "#185a9d",
    marginTop: 2,
  },
  newsSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 0,
  },
  newsBox: {
    backgroundColor: "#e6f9ec",
    borderRadius: 14,
    padding: 12,
    elevation: 1,
    width: "92%",
    alignSelf: "center",
    marginTop: 0,
  },
  newsTitle: {
    fontWeight: "bold",
    color: "#bfa100",
    fontSize: 15,
    marginBottom: 4,
  },
  newsItem: {
    fontSize: 13,
    color: "#388e3c",
    marginBottom: 2,
    lineHeight: 18,
  },
  newsDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  newsSource: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    color: "#388e3c",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 18,
    fontSize: 16,
    opacity: 0.7,
    letterSpacing: 1,
  },
  languageScroll: {
    marginVertical: 10,
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
  newsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  newsErrorText: {
    color: '#d32f2f',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
