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
  RefreshControl,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'
import AirportAutocomplete from '../components/AirportAutocomplete'
import CustomDateTimePicker from '../components/DateTimePicker'

export default function TravelerScreen() {
  const [originAirport, setOriginAirport] = useState('')
  const [originAirportName, setOriginAirportName] = useState('')
  const [destinationAirport, setDestinationAirport] = useState('')
  const [destinationAirportName, setDestinationAirportName] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [departureTime, setDepartureTime] = useState<Date | null>(null)
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null)
  const [availableWeight, setAvailableWeight] = useState('')
  const [loading, setLoading] = useState(false)
  const [listings, setListings] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Calculate minimum date (24 hours from now)
  const getMinimumDate = (): Date => {
    const minDate = new Date()
    minDate.setHours(minDate.getHours() + 24)
    return minDate
  }

  const [minimumDate] = useState<Date>(getMinimumDate())

  // Load listings and matches
  useFocusEffect(
    React.useCallback(() => {
      loadData()
    }, [])
  )

  const loadData = async () => {
    try {
      setLoadingListings(true)
      const token = await AsyncStorage.getItem('token')
      
      // Load traveler listings
      const listingsResponse = await fetch(`${API_BASE_URL}/api/travelers/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const listingsData = await listingsResponse.json()

      // Load matches to see which flights are carrying packages
      const matchesResponse = await fetch(`${API_BASE_URL}/api/matches?type=traveler`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const matchesData = await matchesResponse.json()

      if (listingsResponse.ok) {
        setListings(listingsData.listings || [])
      }
      
      if (matchesResponse.ok) {
        setMatches(matchesData.matches || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingListings(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleOriginChange = (code: string, name: string) => {
    setOriginAirport(code)
    setOriginAirportName(name)
  }

  const handleDestinationChange = (code: string, name: string) => {
    setDestinationAirport(code)
    setDestinationAirportName(name)
  }

  const handleSubmit = async () => {
    if (
      !originAirport ||
      !destinationAirport ||
      !departureTime ||
      !arrivalTime ||
      !availableWeight
    ) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    // Validate dates - must be at least 24 hours in advance
    if (departureTime < minimumDate) {
      Alert.alert(
        'Error',
        'Departure time must be at least 24 hours from now'
      )
      return
    }

    if (arrivalTime <= departureTime) {
      Alert.alert('Error', 'Arrival time must be after departure time')
      return
    }

    const weight = parseFloat(availableWeight)
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight')
      return
    }

    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/travelers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originAirport,
          destinationAirport,
          flightNumber: flightNumber || null,
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          availableWeight: weight,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your flight listing has been created! We will notify you of any matches.'
        )
        setOriginAirport('')
        setOriginAirportName('')
        setDestinationAirport('')
        setDestinationAirportName('')
        setFlightNumber('')
        setDepartureTime(null)
        setArrivalTime(null)
        setAvailableWeight('')
        setShowForm(false)
        loadData()
      } else {
        Alert.alert('Error', data.error || 'Failed to create listing')
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Check if a listing has active matches (carrying packages)
  // Only show as carrying if matches are accepted (not just pending)
  const hasActiveMatches = (listingId: string) => {
    return matches.some(
      (match) =>
        match.travelerListingId === listingId &&
        match.status === 'accepted'
    )
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Flights</Text>
      </View>

      {loadingListings ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7AA1C9" />
        </View>
      ) : (
        <>
          {/* Flights List */}
          {listings.length > 0 && (
            <View style={styles.listingsSection}>
              {listings.map((listing) => {
                const isCarryingPackage = hasActiveMatches(listing.id)
                const matchCount = matches.filter(
                  (m) =>
                    m.travelerListingId === listing.id &&
                    m.status === 'accepted'
                ).length

                return (
                  <View
                    key={listing.id}
                    style={[
                      styles.flightCard,
                      isCarryingPackage && styles.flightCardHighlighted,
                    ]}
                  >
                    <View style={styles.flightHeader}>
                      <View style={styles.flightRoute}>
                        <MaterialCommunityIcons
                          name="airplane"
                          size={20}
                          color={isCarryingPackage ? '#7AA1C9' : '#374151'}
                        />
                        <Text
                          style={[
                            styles.flightRouteText,
                            isCarryingPackage && styles.flightRouteTextHighlighted,
                          ]}
                        >
                          {listing.originAirport} → {listing.destinationAirport}
                        </Text>
                      </View>
                      {isCarryingPackage && (
                        <View style={styles.packageBadge}>
                          <MaterialCommunityIcons
                            name="package-variant"
                            size={14}
                            color="#ffffff"
                          />
                          <Text style={styles.packageBadgeText}>
                            {matchCount} {matchCount === 1 ? 'Package' : 'Packages'}
                          </Text>
                        </View>
                      )}
                    </View>
                    {listing.flightNumber && (
                      <Text style={styles.flightNumber}>
                        Flight: {listing.flightNumber}
                      </Text>
                    )}
                    <View style={styles.flightDetails}>
                      <View style={styles.flightDetailRow}>
                        <MaterialCommunityIcons
                          name="calendar-clock"
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.flightDetailText}>
                          Departure: {formatDateTime(listing.departureTime)}
                        </Text>
                      </View>
                      <View style={styles.flightDetailRow}>
                        <MaterialCommunityIcons
                          name="calendar-check"
                          size={14}
                          color="#6b7280"
                        />
                        <Text style={styles.flightDetailText}>
                          Arrival: {formatDateTime(listing.arrivalTime)}
                        </Text>
                      </View>
                      <View style={styles.flightDetailRow}>
                        <MaterialCommunityIcons name="weight" size={14} color="#6b7280" />
                        <Text style={styles.flightDetailText}>
                          Available: {listing.availableWeight} lbs
                        </Text>
                      </View>
                    </View>
                    {!listing.isActive && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          )}

          {/* Add Flight Button */}
          <View style={[styles.addFlightSection, listings.length === 0 && styles.addFlightSectionNoFlights]}>
            {!showForm ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowForm(true)}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Add New Flight</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Add New Flight</Text>
                  <TouchableOpacity onPress={() => setShowForm(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <AirportAutocomplete
                    label="Origin Airport *"
                    value={originAirport}
                    onChange={handleOriginChange}
                    placeholder="Search origin airport..."
                    zIndex={1000}
                  />

                  <AirportAutocomplete
                    label="Destination Airport *"
                    value={destinationAirport}
                    onChange={handleDestinationChange}
                    placeholder="Search destination airport..."
                    zIndex={999}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Flight Number (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., AA123"
                      value={flightNumber}
                      onChangeText={setFlightNumber}
                      autoCapitalize="characters"
                    />
                  </View>

                  <CustomDateTimePicker
                    label="Departure Date & Time *"
                    value={departureTime}
                    onChange={setDepartureTime}
                    minimumDate={minimumDate}
                    required
                  />

                  <CustomDateTimePicker
                    label="Arrival Date & Time *"
                    value={arrivalTime}
                    onChange={setArrivalTime}
                    minimumDate={
                      departureTime
                        ? new Date(departureTime.getTime() + 30 * 60 * 1000)
                        : minimumDate
                    }
                    required
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Available Weight (lbs) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 5"
                      value={availableWeight}
                      onChangeText={setAvailableWeight}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.infoBox}>
                    <View style={styles.infoHeader}>
                      <MaterialCommunityIcons
                        name="information"
                        size={16}
                        color="#1e40af"
                      />
                      <Text style={styles.infoText}>
                        Flight must be at least 24 hours from now. Package senders
                        must deliver packages at least 3 hours before your flight
                        departure.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formButtons}>
                    <TouchableOpacity
                      style={[styles.formButton, styles.cancelButton]}
                      onPress={() => {
                        setShowForm(false)
                        setOriginAirport('')
                        setOriginAirportName('')
                        setDestinationAirport('')
                        setDestinationAirportName('')
                        setFlightNumber('')
                        setDepartureTime(null)
                        setArrivalTime(null)
                        setAvailableWeight('')
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.formButton, styles.submitButton, loading && styles.buttonDisabled]}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.submitButtonText}>Create Listing</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {listings.length === 0 && !showForm && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="airplane-off"
                size={48}
                color="#9ca3af"
              />
              <Text style={styles.emptyText}>No flights added yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first flight to start helping others send packages
              </Text>
            </View>
          )}
        </>
      )}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#e0e7ff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  listingsSection: {
    padding: 16,
  },
  flightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightCardHighlighted: {
    borderColor: '#7AA1C9',
    backgroundColor: '#f0f7ff',
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  flightRouteText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  flightRouteTextHighlighted: {
    color: '#7AA1C9',
  },
  packageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7AA1C9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  packageBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  flightNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  flightDetails: {
    gap: 6,
  },
  flightDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flightDetailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  inactiveBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  inactiveText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  addFlightSection: {
    padding: 16,
    paddingTop: 0,
  },
  addFlightSectionNoFlights: {
    paddingTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7AA1C9',
    borderRadius: 12,
    padding: 14,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 0,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
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
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
})
