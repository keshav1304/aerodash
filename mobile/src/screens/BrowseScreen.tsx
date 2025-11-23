import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

export default function BrowseScreen() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchOrigin, setSearchOrigin] = useState('')
  const [searchDestination, setSearchDestination] = useState('')
  const [listingType, setListingType] = useState<'traveler' | 'sender'>('traveler')
  const { user } = useContext(AuthContext)

  useEffect(() => {
    loadListings()
  }, [listingType])

  const loadListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchOrigin) params.append('originAirport', searchOrigin.toUpperCase())
      if (searchDestination) params.append('destinationAirport', searchDestination.toUpperCase())
      params.append('type', listingType)

      const token = await AsyncStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/search/listings?${params.toString()}`, {
        headers,
      })
      const data = await response.json()

      if (response.ok) {
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error('Error loading listings:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadListings()
  }

  const handleSearch = () => {
    loadListings()
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Listings</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              listingType === 'traveler' && styles.toggleButtonActive,
            ]}
            onPress={() => setListingType('traveler')}
          >
            <View style={styles.toggleContent}>
              <MaterialCommunityIcons 
                name="airplane" 
                size={16} 
                color={listingType === 'traveler' ? '#ffffff' : '#6b7280'} 
              />
              <Text
                style={[
                  styles.toggleText,
                  listingType === 'traveler' && styles.toggleTextActive,
                ]}
              >
                Travelers
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              listingType === 'sender' && styles.toggleButtonActive,
            ]}
            onPress={() => setListingType('sender')}
          >
            <View style={styles.toggleContent}>
              <MaterialCommunityIcons 
                name="package-variant" 
                size={16} 
                color={listingType === 'sender' ? '#ffffff' : '#6b7280'} 
              />
              <Text
                style={[
                  styles.toggleText,
                  listingType === 'sender' && styles.toggleTextActive,
                ]}
              >
                Packages
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Origin (optional)"
          value={searchOrigin}
          onChangeText={setSearchOrigin}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Destination (optional)"
          value={searchDestination}
          onChangeText={setSearchDestination}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7AA1C9" />
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No listings found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or check back later
          </Text>
        </View>
      ) : (
        <View style={styles.listingsContainer}>
          {listings.map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <Text style={styles.listingName}>{listing.user.name}</Text>
                <View style={styles.listingBadge}>
                  <Text style={styles.listingBadgeText}>
                    {listingType === 'traveler' ? 'Traveler' : 'Sender'}
                  </Text>
                </View>
              </View>

              <View style={styles.listingDetails}>
                <View style={styles.routeContainer}>
                  <MaterialCommunityIcons name="airplane" size={16} color="#374151" />
                  <Text style={styles.routeText}>
                    {listing.originAirport || listing.origin} → {listing.destinationAirport || listing.destination}
                  </Text>
                </View>
                {listingType === 'traveler' ? (
                  <>
                    {listing.flightNumber && (
                      <Text style={styles.detailText}>
                        Flight: {listing.flightNumber}
                      </Text>
                    )}
                    <Text style={styles.detailText}>
                      Available: {listing.availableWeight} lbs
                    </Text>
                    {listing.departureTime && (
                      <Text style={styles.detailText}>
                        Departure: {new Date(listing.departureTime).toLocaleString()}
                      </Text>
                    )}
                    {listing.arrivalTime && (
                      <Text style={styles.detailText}>
                        Arrival: {new Date(listing.arrivalTime).toLocaleString()}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.detailText}>
                      Weight: {listing.packageWeight} lbs
                    </Text>
                    <Text style={styles.detailText}>
                      Type: {listing.packageType === 'carry-on' ? 'Carry-On' : listing.packageType === 'checked' ? 'Checked in' : 'Either'}
                    </Text>
                    {listing.description && (
                      <Text style={styles.descriptionText}>
                        {listing.description}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
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
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#7AA1C9',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#7AA1C9',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  listingsContainer: {
    padding: 16,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  listingBadge: {
    backgroundColor: '#7AA1C9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listingBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  listingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
})

