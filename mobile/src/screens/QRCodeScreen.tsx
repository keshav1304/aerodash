import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

// Polyfill for TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

interface QRCodeScreenProps {
  route: {
    params: {
      matchId: string
      matchType: 'dropoff' | 'pickup' | 'destination-dropoff' | 'destination-pickup'
      matchData: any
    }
  }
  navigation: any
}

export default function QRCodeScreen({ route, navigation }: QRCodeScreenProps) {
  const { matchId, matchType, matchData } = route.params
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [dropOffCompleted, setDropOffCompleted] = useState(matchData.dropOffCompleted || false)
  const [pickUpCompleted, setPickUpCompleted] = useState(matchData.pickUpCompleted || false)
  const [destinationDropOffCompleted, setDestinationDropOffCompleted] = useState(matchData.destinationDropOffCompleted || false)
  const [destinationPickUpCompleted, setDestinationPickUpCompleted] = useState(matchData.destinationPickUpCompleted || false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [issueDescription, setIssueDescription] = useState('')
  const [submittingIssue, setSubmittingIssue] = useState(false)
  
  // Check if current user is the traveler
  const isTraveler = user?.id === matchData.travelerId
  // Show report issue button only for travelers on pickup screens (before they complete pickup)
  const showReportIssueButton = isTraveler && (
    (matchType === 'pickup' && !pickUpCompleted) ||
    (matchType === 'destination-dropoff' && !destinationDropOffCompleted)
  )

  // Create QR code data - contains match ID and type for scanning
  const qrData = JSON.stringify({
    matchId,
    type: matchType,
    timestamp: new Date().toISOString(),
    origin: matchData.travelerListing.originAirport,
    destination: matchData.travelerListing.destinationAirport,
  })

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Match QR Code - ${matchType === 'dropoff' ? 'Drop Off' : 'Pick Up'}\nMatch ID: ${matchId}`,
        title: 'AeroDash QR Code',
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const openCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take a picture.')
        return
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Picture taken successfully, but we don't need to do anything with it
        console.log('Picture taken:', result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error opening camera:', error)
      Alert.alert('Error', 'Failed to open camera. Please try again.')
    }
  }

  const handleDropOffComplete = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/dropoff-complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDropOffCompleted(true)
        // Open camera to take picture
        await openCamera()
        Alert.alert('Success', 'Drop-off marked as completed! The traveler can now pick up the package.')
      } else {
        const data = await response.json()
        Alert.alert('Error', data.error || 'Failed to mark drop-off as completed')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePickUpComplete = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/pickup-complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPickUpCompleted(true)
        // Open camera to take picture
        await openCamera()
        Alert.alert('Success', 'Package pick-up marked as completed!')
      } else {
        const data = await response.json()
        Alert.alert('Error', data.error || 'Failed to mark pick-up as completed')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationDropOffComplete = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/destination-dropoff-complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDestinationDropOffCompleted(true)
        Alert.alert('Success', 'Destination drop-off marked as completed! The receiver can now pick up the package.')
      } else {
        const data = await response.json()
        Alert.alert('Error', data.error || 'Failed to mark destination drop-off as completed')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationPickUpComplete = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/destination-pickup-complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDestinationPickUpCompleted(true)
        // Open camera to take picture
        await openCamera()
        Alert.alert('Success', 'Package delivery completed! Thank you for using our service.')
      } else {
        const data = await response.json()
        Alert.alert('Error', data.error || 'Failed to mark destination pick-up as completed')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      Alert.alert('Error', 'Please describe the issue')
      return
    }

    setSubmittingIssue(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/report-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: issueDescription.trim(),
        }),
      })

      if (response.ok) {
        setShowIssueModal(false)
        setIssueDescription('')
        setShowInstructionsModal(true)
      } else {
        const data = await response.json()
        Alert.alert('Error', data.error || 'Failed to report issue')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.')
    } finally {
      setSubmittingIssue(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#7AA1C9', '#5A8BB9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {matchType === 'dropoff' ? 'Drop-Off QR Code' : 
           matchType === 'pickup' ? 'Pick-Up QR Code' :
           matchType === 'destination-dropoff' ? 'Destination Drop-Off QR Code' :
           'Destination Pick-Up QR Code'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrData}
              size={280}
              color="#1f2937"
              backgroundColor="#ffffff"
            />
          </View>
          <Text style={styles.qrLabel}>
            {matchType === 'dropoff' ? 'Origin Drop-Off' : 
             matchType === 'pickup' ? 'Origin Pick-Up' :
             matchType === 'destination-dropoff' ? 'Destination Drop-Off' :
             'Destination Pick-Up'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Match Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Route:</Text>
            <Text style={styles.infoValue}>
              {matchData.travelerListing.originAirport} → {matchData.travelerListing.destinationAirport}
            </Text>
          </View>
          {matchData.travelerListing.flightNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Flight:</Text>
              <Text style={styles.infoValue}>
                {matchData.travelerListing.flightNumber}
              </Text>
            </View>
          )}
          {matchData.travelerListing.departureTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Departure:</Text>
              <Text style={styles.infoValue}>
                {new Date(matchData.travelerListing.departureTime).toLocaleString()}
              </Text>
            </View>
          )}
          {matchType === 'dropoff' && matchData.senderListing && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Package Weight:</Text>
              <Text style={styles.infoValue}>
                {matchData.senderListing.packageWeight} lbs
              </Text>
            </View>
          )}
        </View>

        {matchType === 'dropoff' && !dropOffCompleted && (
          <TouchableOpacity 
            style={[styles.completeButton, loading && styles.buttonDisabled]} 
            onPress={handleDropOffComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.completeButtonText}> Drop Off Completed</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {matchType === 'dropoff' && dropOffCompleted && (
          <View style={styles.completedBadge}>
            <View style={styles.completedIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#065f46" />
              <Text style={styles.completedText}> Drop-off completed</Text>
            </View>
            <Text style={styles.completedSubtext}>Traveler can now pick up the package</Text>
          </View>
        )}

        {matchType === 'pickup' && !pickUpCompleted && (
          <TouchableOpacity 
            style={[styles.completeButton, loading && styles.buttonDisabled]} 
            onPress={handlePickUpComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.completeButtonText}> Package Picked Up</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {matchType === 'pickup' && pickUpCompleted && (
          <View style={styles.completedBadge}>
            <View style={styles.completedIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#065f46" />
              <Text style={styles.completedText}> Package picked up</Text>
            </View>
          </View>
        )}

        {showReportIssueButton && !pickUpCompleted && matchType === 'pickup' && (
          <TouchableOpacity 
            style={[styles.issueButton, loading && styles.buttonDisabled]} 
            onPress={() => setShowIssueModal(true)}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#ffffff" />
              <Text style={styles.issueButtonText}> Report Issue with Package</Text>
            </View>
          </TouchableOpacity>
        )}

        {showReportIssueButton && !destinationDropOffCompleted && matchType === 'destination-dropoff' && (
          <TouchableOpacity 
            style={[styles.issueButton, loading && styles.buttonDisabled]} 
            onPress={() => setShowIssueModal(true)}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#ffffff" />
              <Text style={styles.issueButtonText}> Report Issue with Package</Text>
            </View>
          </TouchableOpacity>
        )}

        {matchType === 'destination-dropoff' && !destinationDropOffCompleted && (
          <TouchableOpacity 
            style={[styles.completeButton, loading && styles.buttonDisabled]} 
            onPress={handleDestinationDropOffComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.completeButtonText}> Drop Off at Destination Completed</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {matchType === 'destination-dropoff' && destinationDropOffCompleted && (
          <View style={styles.completedBadge}>
            <View style={styles.completedIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#065f46" />
              <Text style={styles.completedText}> Destination drop-off completed</Text>
            </View>
            <Text style={styles.completedSubtext}>Receiver can now pick up the package</Text>
          </View>
        )}

        {matchType === 'destination-pickup' && !destinationPickUpCompleted && (
          <TouchableOpacity 
            style={[styles.completeButton, loading && styles.buttonDisabled]} 
            onPress={handleDestinationPickUpComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.completeButtonText}> Package Picked Up at Destination</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {matchType === 'destination-pickup' && destinationPickUpCompleted && (
          <View style={styles.completedBadge}>
            <View style={styles.completedIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#065f46" />
              <Text style={styles.completedText}> Package delivery completed!</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Active Packages</Text>
        </TouchableOpacity>
      </View>

      {/* Issue Report Modal */}
      <Modal
        visible={showIssueModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIssueModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !submittingIssue && setShowIssueModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Issue</Text>
              <TouchableOpacity
                onPress={() => setShowIssueModal(false)}
                disabled={submittingIssue}
              >
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Please describe the issue you encountered with the package
            </Text>
            <TextInput
              style={styles.issueInput}
              placeholder="Describe the issue..."
              value={issueDescription}
              onChangeText={setIssueDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submittingIssue}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowIssueModal(false)
                  setIssueDescription('')
                }}
                disabled={submittingIssue}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, submittingIssue && styles.buttonDisabled]}
                onPress={handleReportIssue}
                disabled={submittingIssue || !issueDescription.trim()}
              >
                {submittingIssue ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Instructions Modal */}
      <Modal
        visible={showInstructionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInstructionsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInstructionsModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.instructionsHeader}>
              <MaterialCommunityIcons name="information" size={48} color="#7AA1C9" />
              <Text style={styles.instructionsTitle}>Important Instructions</Text>
            </View>
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsText}>
                Your issue has been reported. Please follow these steps:
              </Text>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Put the package back into the same locker where you found it
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Close the locker securely
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Our team will review your report and contact you if needed
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => {
                setShowInstructionsModal(false)
                navigation.goBack()
              }}
            >
              <Text style={styles.submitButtonText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  shareButton: {
    backgroundColor: '#7AA1C9',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  completedIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  completedText: {
    color: '#065f46',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedSubtext: {
    color: '#047857',
    fontSize: 12,
  },
  issueButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  issueInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
    minHeight: 120,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#7AA1C9',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  instructionsContent: {
    marginBottom: 24,
  },
  instructionsText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7AA1C9',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
})

