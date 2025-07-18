import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Add common questions that farmers might ask
const quickQuestions = [
  { id: '1', question: "Today's crop prices?", icon: '💰' },
  { id: '2', question: "Weather forecast?", icon: '🌤️' },
  { id: '3', question: "Best time to sow wheat?", icon: '🌾' },
  { id: '4', question: "Pest control tips?", icon: '🐛' },
];

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { id: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { id: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

const SERVER_URL = 'http://10.3.5.210:5000';

const translations = {
  en: {
    headerTitle: "🎙️ Voice Assistant",
    headerSubtitle: "Ask anything about farming",
    quickQuestionsTitle: "Quick Questions",
    holdToSpeak: "Hold to Speak",
    recording: "Recording...",
    typeQuestion: "Type your question...",
    processingRequest: "Processing your request...",
    quickQuestions: [
      { id: '1', question: "Today's crop prices?", icon: '💰' },
      { id: '2', question: "Weather forecast?", icon: '🌤️' },
      { id: '3', question: "Best time to sow wheat?", icon: '🌾' },
      { id: '4', question: "Pest control tips?", icon: '🐛' },
    ],
    sendRecording: "Send Recording",
  },
  hi: {
    headerTitle: "🎙️ वॉइस असिस्टेंट",
    headerSubtitle: "खेती के बारे में कुछ भी पूछें",
    quickQuestionsTitle: "त्वरित प्रश्न",
    holdToSpeak: "बोलने के लिए दबाएं",
    recording: "रिकॉर्डिंग...",
    typeQuestion: "अपना प्रश्न लिखें...",
    processingRequest: "आपका अनुरोध प्रोसेस किया जा रहा है...",
    quickQuestions: [
      { id: '1', question: "आज के फसल के भाव?", icon: '💰' },
      { id: '2', question: "मौसम का पूर्वानुमान?", icon: '🌤️' },
      { id: '3', question: "गेहूं बोने का सही समय?", icon: '🌾' },
      { id: '4', question: "कीट नियंत्रण के उपाय?", icon: '🐛' },
    ],
    sendRecording: "रिकॉर्डिंग भेजें",
  },
  te: {
    headerTitle: "🎙️ వాయిస్ అసిస్టెంట్",
    headerSubtitle: "వ్యవసాయం గురించి ఏదైనా అడగండి",
    quickQuestionsTitle: "త్వరిత ప్రశ్నలు",
    holdToSpeak: "మాట్లాడటానికి నొక్కండి",
    recording: "రికార్డింగ్...",
    typeQuestion: "మీ ప్రశ్న టైప్ చేయండి...",
    processingRequest: "మీ అభ్యర్థన ప్రాసెస్ చేయబడుతోంది...",
    quickQuestions: [
      { id: '1', question: "నేటి పంట ధరలు?", icon: '💰' },
      { id: '2', question: "వాతావరణ సూచన?", icon: '🌤️' },
      { id: '3', question: "గోధుమలు వేయడానికి సరైన సమయం?", icon: '🌾' },
      { id: '4', question: "పురుగుల నియంత్రణ చిట్కాలు?", icon: '🐛' },
    ],
    sendRecording: "రికార్డింగ్ పంపండి",
  },
  ta: {
    headerTitle: "🎙️ குரல் உதவியாளர்",
    headerSubtitle: "விவசாயம் பற்றி எதையும் கேளுங்கள்",
    quickQuestionsTitle: "விரைவு கேள்விகள்",
    holdToSpeak: "பேச அழுத்தவும்",
    recording: "பதிவு செய்கிறது...",
    typeQuestion: "உங்கள் கேள்வியை தட்டச்சு செய்யவும்...",
    processingRequest: "உங்கள் கோரிக்கை செயலாக்கப்படுகிறது...",
    quickQuestions: [
      { id: '1', question: "இன்றைய பயிர் விலைகள்?", icon: '💰' },
      { id: '2', question: "வானிலை முன்னறிவிப்பு?", icon: '🌤️' },
      { id: '3', question: "கோதுமை விதைக்க சரியான நேரம்?", icon: '🌾' },
      { id: '4', question: "பூச்சி கட்டுப்பாட்டு குறிப்புகள்?", icon: '🐛' },
    ],
    sendRecording: "பதிவை அனுப்பு",
  },
};

export default function VoiceAssistant() {
  const [textInput, setTextInput] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecordedPlaying, setIsRecordedPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [conversations, setConversations] = useState([]);
  const soundRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Stop any audio (recorded or backend)
  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      setIsRecordedPlaying(false);
    }
  };

  // Play backend audio
  const playAudio = async (audioPath) => {
    if (!audioPath) return;
    try {
      await stopAudio();
      const { sound } = await Audio.Sound.createAsync(
        { uri: `${SERVER_URL}${audioPath}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setIsPaused(false);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
          setIsPaused(false);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Audio playback failed');
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // Play recorded audio
  const playRecordedAudio = async () => {
    if (!audioUri) return;
    try {
      await stopAudio();
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsRecordedPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsRecordedPlaying(false);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Audio playback failed');
      setIsRecordedPlaying(false);
    }
  };

  const handleTextSubmit = async () => {
    await stopAudio();
    if (!textInput.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/process_text`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text: textInput })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponseText(data.response);
      if (data.audio) {
        await playAudio(data.audio);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to process text');
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Recording Functions
  const startRecording = async () => {
    await stopAudio();
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setAudioUri(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const discardRecording = async () => {
    await stopAudio();
    setAudioUri(null);
    setIsRecordedPlaying(false);
  };

  const uploadAudio = async () => {
    if (!audioUri) return;
    await stopAudio();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        name: 'recording.wav',
        type: 'audio/wav',
      });

      const response = await fetch(`${SERVER_URL}/process_audio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponseText(`🗣️ You said: ${data.recognized}\n\n🤖 Assistant: ${data.response}`);
      if (data.audio) {
        await playAudio(data.audio);
      }
      setAudioUri(null); // Optionally clear after sending
    } catch (err) {
      Alert.alert('Error', err.message || 'Audio upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pauseAudio = async () => {
    if (soundRef.current && isPlaying && !isPaused) {
      await soundRef.current.pauseAsync();
      setIsPaused(true);
    }
  };

  const resumeAudio = async () => {
    if (soundRef.current && isPlaying && isPaused) {
      await soundRef.current.playAsync();
      setIsPaused(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setTextInput(question);
    handleTextSubmit(question);
  };

  // Stop audio when component unmounts
  React.useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update the return section with better keyboard handling
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#f0fff4', '#e8f5e9']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.mainCard}>
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

              {/* Quick Questions Section */}
              <View style={styles.quickQuestionsSection}>
                <Text style={styles.sectionTitle}>
                  {translations[selectedLanguage].quickQuestionsTitle}
                </Text>
                <View style={styles.quickGrid}>
                  {translations[selectedLanguage].quickQuestions.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.quickBtn}
                      onPress={() => handleQuickQuestion(item.question)}
                    >
                      <Text style={styles.quickIcon}>{item.icon}</Text>
                      <Text style={styles.quickText}>{item.question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Voice Input Section */}
              <View style={styles.voiceSection}>
                <LinearGradient
                  colors={recording ? ['#ff6b6b', '#ff5252'] : ['#4caf50', '#388e3c']}
                  style={styles.voiceButton}
                >
                  <TouchableOpacity
                    onPress={recording ? stopRecording : startRecording}
                    style={styles.voiceButtonInner}
                  >
                    <Ionicons 
                      name={recording ? "radio" : "mic"} 
                      size={32} 
                      color="#fff" 
                    />
                    <Text style={styles.voiceButtonText}>
                      {recording ? translations[selectedLanguage].recording : translations[selectedLanguage].holdToSpeak}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {/* Recording Preview Section */}
              {audioUri && (
                <View style={styles.recordingPreview}>
                  <View style={styles.recordingControls}>
                    <TouchableOpacity 
                      style={styles.previewButton}
                      onPress={isRecordedPlaying ? stopAudio : playRecordedAudio}
                    >
                      <Ionicons 
                        name={isRecordedPlaying ? "pause" : "play"} 
                        size={24} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.sendAudioButton}
                      onPress={uploadAudio}
                    >
                      <Ionicons name="send" size={24} color="#fff" />
                      <Text style={styles.sendButtonText}>
                        {translations[selectedLanguage].sendRecording || "Send"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.discardButton}
                      onPress={discardRecording}
                    >
                      <Ionicons name="trash" size={24} color="#ff5252" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Text Input Section - Adjusted for better visibility */}
              <View style={styles.textInputSection}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder={translations[selectedLanguage].typeQuestion}
                      value={textInput}
                      onChangeText={setTextInput}
                      multiline
                      maxHeight={80}
                    />
                    <TouchableOpacity 
                      style={styles.sendButton}
                      onPress={handleTextSubmit}
                    >
                      <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Chat Messages */}
            {responseText && (
              <View style={styles.chatContainer}>
                <View style={styles.messageContainer}>
                  <View style={styles.userMessage}>
                    <Text style={styles.messageText}>{textInput}</Text>
                  </View>
                  <View style={styles.assistantMessage}>
                    <Text style={styles.messageText}>{responseText}</Text>
                  </View>
                </View>
              </View>
            )}
            {isPlaying && (
              <View style={styles.audioControlCard}>
                <Text style={styles.audioControlLabel}>Voice Response Controls</Text>
                <View style={styles.audioButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.audioControlButton,
                      isPaused ? styles.audioPlay : styles.audioPause,
                    ]}
                    onPress={isPaused ? resumeAudio : pauseAudio}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isPaused ? "play-circle" : "pause-circle"}
                      size={36}
                      color="#fff"
                    />
                    <Text style={styles.audioButtonText}>
                      {isPaused ? "Resume" : "Pause"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.audioControlButton, styles.audioStop]}
                    onPress={stopAudio}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="stop-circle" size={36} color="#fff" />
                    <Text style={styles.audioButtonText}>Stop</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#388e3c" />
                <Text style={styles.loadingText}>
                  {translations[selectedLanguage].processingRequest}
                </Text>
              </View>
            )}

            {/* Add extra padding at bottom */}
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120, // Increased padding for keyboard
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
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
  quickQuestionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickBtn: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickText: {
    color: '#333',
    fontSize: 13,
    textAlign: 'center',
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  voiceButton: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  voiceButtonInner: {
    alignItems: 'center',
  },
  voiceButtonText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  recordingPreview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  previewButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  sendAudioButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
  },
  sendButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  discardButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  textInputSection: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    elevation: 2,
  },
  inputWrapper: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 45,
    maxHeight: 80,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 12,
    marginRight: 4,
  },
  chatContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 12,
    borderTopRightRadius: 4,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  audioControlCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    marginHorizontal: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  audioControlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 10,
  },
  audioButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioControlButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  audioPause: {
    backgroundColor: '#388e3c',
  },
  audioPlay: {
    backgroundColor: '#2196f3',
  },
  audioStop: {
    backgroundColor: '#ff5252',
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
});