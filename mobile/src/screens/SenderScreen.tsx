import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'
import AirportAutocomplete from '../components/AirportAutocomplete'

export default function SenderScreen() {
  const [originAirport, setOriginAirport] = useState('')
  const [originAirportName, setOriginAirportName] = useState('')
  const [destinationAirport, setDestinationAirport] = useState('')
  const [destinationAirportName, setDestinationAirportName] = useState('')
  const [packageWeight, setPackageWeight] = useState('')
  const [packageType, setPackageType] = useState<'carry-on' | 'checked' | 'either'>('either')
  const [description, setDescription] = useState('')
  const [receiverEmail, setReceiverEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOriginChange = (code: string, name: string) => {
    setOriginAirport(code)
    setOriginAirportName(name)
  }

  const handleDestinationChange = (code: string, name: string) => {
    setDestinationAirport(code)
    setDestinationAirportName(name)
  }


  const handleSubmit = async () => {
    if (!originAirport || !destinationAirport || !packageWeight || !packageType || !description || !receiverEmail) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Description is required and cannot be empty')
      return
    }

    if (!receiverEmail.trim()) {
      Alert.alert('Error', 'Receiver email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(receiverEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid receiver email address')
      return
    }

    const weight = parseFloat(packageWeight)
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/senders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originAirport,
          destinationAirport,
          packageWeight: weight,
          packageType,
          description: description || null,
          receiverEmail: receiverEmail.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert('Success', 'Your package listing has been created! We will notify you when we find a match.')
        setOriginAirport('')
        setOriginAirportName('')
        setDestinationAirport('')
        setDestinationAirportName('')
        setPackageWeight('')
        setPackageType('either')
        setDescription('')
        setReceiverEmail('')
      } else {
        Alert.alert('Error', data.error || 'Failed to create listing')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Send a Package</Text>
      </View>

      <View style={styles.form}>
        <AirportAutocomplete
          label="Origin Airport *"
          value={originAirport}
          onChange={handleOriginChange}
          placeholder="Search origin airport..."
          zIndex={9999}
        />

        <AirportAutocomplete
          label="Destination Airport *"
          value={destinationAirport}
          onChange={handleDestinationChange}
          placeholder="Search destination airport..."
          zIndex={9998}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Package Weight (lbs) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            value={packageWeight}
            onChangeText={setPackageWeight}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Package Type *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                packageType === 'carry-on' && styles.radioOptionActive,
              ]}
              onPress={() => setPackageType('carry-on')}
            >
              <Text
                style={[
                  styles.radioText,
                  packageType === 'carry-on' && styles.radioTextActive,
                ]}
              >
                Carry-On
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                packageType === 'checked' && styles.radioOptionActive,
              ]}
              onPress={() => setPackageType('checked')}
            >
              <Text
                style={[
                  styles.radioText,
                  packageType === 'checked' && styles.radioTextActive,
                ]}
              >
                Checked in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                packageType === 'either' && styles.radioOptionActive,
              ]}
              onPress={() => setPackageType('either')}
            >
              <Text
                style={[
                  styles.radioText,
                  packageType === 'either' && styles.radioTextActive,
                ]}
              >
                Either
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Brief description of the package..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Receiver Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="receiver@example.com"
            value={receiverEmail}
            onChangeText={setReceiverEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>
            The receiver must have an account with this email to track and pick up the package
          </Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={16} color="#1e40af" />
            <Text style={styles.infoText}>
              You will only be matched with travelers whose flights are at least 24 hours away.
              Package must be dropped off at least 3 hours before flight departure.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create Package Listing</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#7AA1C9',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  radioOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOptionActive: {
    borderColor: '#7AA1C9',
    backgroundColor: '#f3f4f6',
  },
  radioText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#7AA1C9',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#7AA1C9',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#1e40af',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  helperText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },
  listingsSection: {
    padding: 20,
    paddingTop: 0,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  listingsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listingDetails: {
    gap: 6,
  },
  listingDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  listingDescription: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 4,
  },
  listingDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
})
