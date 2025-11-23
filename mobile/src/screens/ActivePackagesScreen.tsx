import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

export default function ActivePackagesScreen() {
  const navigation = useNavigation()
  const [matches, setMatches] = useState<any[]>([])
  const [pendingListings, setPendingListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useContext(AuthContext)
  const isFirstLoad = React.useRef(true)

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const showLoading = isFirstLoad.current
      if (isFirstLoad.current) {
        isFirstLoad.current = false
      }
      loadData(showLoading)
    }, [])
  )

  const loadData = async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const token = await AsyncStorage.getItem('token')
      
      // Load matches
      const matchesResponse = await fetch(`${API_BASE_URL}/api/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const matchesData = await matchesResponse.json()
      
      // Load pending listings (for senders)
      const listingsResponse = await fetch(`${API_BASE_URL}/api/senders/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const listingsData = await listingsResponse.json()

      if (matchesResponse.ok) {
        // Filter out completed matches (backend should already do this, but adding as safeguard)
        const activeMatches = (matchesData.matches || []).filter((m: any) => m.status !== 'completed')
        setMatches(activeMatches)
      }
      
      if (listingsResponse.ok) {
        // Filter to only show listings that don't have accepted matches
        const acceptedMatchListingIds = new Set(
          (matchesData.matches || [])
            .filter((m: any) => m.status === 'accepted')
            .map((m: any) => m.senderListingId)
        )
        const pending = (listingsData.listings || []).filter(
          (listing: any) => !acceptedMatchListingIds.has(listing.id) && listing.isActive
        )
        setPendingListings(pending)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        loadData(false)
        Alert.alert('Success', 'Match status updated')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update match status')
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10b981'
      case 'rejected': return '#ef4444'
      case 'completed': return '#7AA1C9'
      default: return '#f59e0b'
    }
  }

  const getUserRole = (match: any) => {
    if (match.travelerId === user?.id) return 'traveler'
    if (match.senderId === user?.id) return 'sender'
    if (match.receiverId === user?.id) return 'receiver'
    return 'unknown'
  }

  const renderMatchCard = (match: any) => {
    const userRole = getUserRole(match)
    const isTraveler = userRole === 'traveler'
    const isSender = userRole === 'sender'
    const isReceiver = userRole === 'receiver'
    
    const sender = match.sender
    const receiver = match.receiver || match.senderListing?.receiver
    const traveler = match.traveler

    // Determine flow text based on user's role
    let flowText = ''
    if (isSender) {
      flowText = `From You to ${receiver?.name || 'Receiver'}`
    } else if (isReceiver) {
      // Receivers don't need to see sender name - it's their package
      flowText = 'Package for You'
    } else {
      // Traveler view
      flowText = `From ${sender?.name || 'Unknown'} to ${receiver?.name || 'Receiver'}`
    }

    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.matchHeaderLeft}>
            <View style={styles.packageFlowContainer}>
              <View style={styles.flowBadge}>
                <MaterialCommunityIcons name="arrow-right" size={14} color="#7AA1C9" />
                <Text style={styles.flowText}>
                  {flowText}
          </Text>
        </View>
      </View>
            {isSender && match.status === 'accepted' && (
              <Text style={styles.matchSubtext}>
                Traveler: Anonymous
                    </Text>
            )}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(match.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {match.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.matchDetails}>
              <View style={styles.routeContainer}>
                <MaterialCommunityIcons name="airplane" size={16} color="#374151" />
                <Text style={styles.routeText}>
                  {match.travelerListing.originAirport} → {match.travelerListing.destinationAirport}
                </Text>
              </View>
          {isTraveler || isReceiver ? (
                <>
                  <Text style={styles.weightText}>
                    Package Weight: {match.senderListing.packageWeight} lbs
                  </Text>
                  {isTraveler && (
                    <Text style={styles.detailText}>
                      Package Type: {match.senderListing.packageType === 'carry-on' ? 'Carry-On' : match.senderListing.packageType === 'checked' ? 'Checked in' : 'Either'}
                    </Text>
                  )}
              {isReceiver && match.travelerListing.arrivalTime && (
                <View style={styles.estimatedPickupContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#7AA1C9" />
                  <View style={styles.estimatedPickupText}>
                    <Text style={styles.estimatedPickupLabel}>Estimated Pickup Time:</Text>
                    <Text style={styles.estimatedPickupValue}>
                      {(() => {
                        const arrivalTime = new Date(match.travelerListing.arrivalTime)
                        // Add 2 hours buffer for traveler to drop off at destination airport
                        const estimatedPickup = new Date(arrivalTime.getTime() + 2 * 60 * 60 * 1000)
                        return estimatedPickup.toLocaleString()
                      })()}
                    </Text>
                  </View>
                </View>
              )}
                </>
              ) : (
                <Text style={styles.weightText}>
                  Available Space: {match.travelerListing.availableWeight} lbs
                </Text>
              )}
            </View>

        {/* Traveler Actions */}
            {match.status === 'pending' && isTraveler && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => updateMatchStatus(match.id, 'accepted')}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => updateMatchStatus(match.id, 'rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

        {match.status === 'pending' && isSender && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
              Waiting for a traveler to accept or reject
                </Text>
              </View>
            )}

        {/* Traveler Accepted Actions */}
            {match.status === 'accepted' && isTraveler && (() => {
              const departureTime = new Date(match.travelerListing.departureTime)
              const dropOffDeadline = new Date(departureTime.getTime() - 3 * 60 * 60 * 1000)
              const canPickUp = match.dropOffCompleted || false
              const destinationDropOffCompleted = match.destinationDropOffCompleted || false
              
              return (
                <View>
                  {!canPickUp && (
                    <>
                      <View style={styles.deadlineInfoContainer}>
                        <Text style={styles.deadlineInfoText}>
                          Package drop-off deadline: {dropOffDeadline.toLocaleString()}
                        </Text>
                        <Text style={styles.deadlineInfoSubtext}>
                          Sender must deliver package at least 3 hours before your flight
                        </Text>
                      </View>
                      <View style={styles.waitingContainer}>
                        <Text style={styles.waitingText}>
                          Waiting for sender to complete drop-off
                        </Text>
                      </View>
                    </>
                  )}
                  
                  {canPickUp && !match.pickUpCompleted && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.qrButton]}
                      onPress={() => (navigation as any).navigate('QRCode', {
                        matchId: match.id,
                        matchType: 'pickup',
                        matchData: match,
                      })}
                    >
                      <View style={styles.buttonContent}>
                        <MaterialCommunityIcons name="qrcode" size={18} color="#ffffff" />
                        <Text style={styles.actionButtonText}> Ready to Pick Up - Generate QR Code</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {match.pickUpCompleted && !destinationDropOffCompleted && (
                    <>
                      <View style={styles.deadlineInfoContainer}>
                        <Text style={styles.deadlineInfoText}>
                          Package picked up! Ready to drop off at destination
                        </Text>
                        <Text style={styles.deadlineInfoSubtext}>
                          Destination: {match.travelerListing.destinationAirport}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.qrButton]}
                        onPress={() => (navigation as any).navigate('QRCode', {
                          matchId: match.id,
                          matchType: 'destination-dropoff',
                          matchData: match,
                        })}
                      >
                        <View style={styles.buttonContent}>
                          <MaterialCommunityIcons name="qrcode" size={18} color="#ffffff" />
                          <Text style={styles.actionButtonText}> Drop Off at Destination - Generate QR Code</Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  {destinationDropOffCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>
                        Package dropped off at destination
                      </Text>
                      <Text style={styles.completedSubtext}>
                    Waiting for receiver to pick up at {match.travelerListing.destinationAirport}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })()}

        {/* Sender Accepted Actions */}
        {match.status === 'accepted' && isSender && (() => {
              const departureTime = new Date(match.travelerListing.departureTime)
              const dropOffDeadline = new Date(departureTime.getTime() - 3 * 60 * 60 * 1000)
              const now = new Date()
              const canDropOff = now <= dropOffDeadline
              const destinationDropOffCompleted = match.destinationDropOffCompleted || false
              const destinationPickUpCompleted = match.destinationPickUpCompleted || false
              
              return (
                <View>
                  {!match.dropOffCompleted && (
                    <>
                      <View style={styles.acceptedContainer}>
                        <View style={styles.completedIconContainer}>
                          <MaterialCommunityIcons name="check-circle" size={18} color="#065f46" />
                          <Text style={styles.acceptedText}>
                            Match accepted!
                          </Text>
                        </View>
                        <Text style={styles.deadlineText}>
                          Drop-off deadline: {dropOffDeadline.toLocaleString()}
                        </Text>
                        <Text style={styles.deadlineSubtext}>
                          Package must be delivered at least 3 hours before flight departure
                        </Text>
                      </View>
                      {canDropOff && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.qrButton]}
                          onPress={() => (navigation as any).navigate('QRCode', {
                            matchId: match.id,
                            matchType: 'dropoff',
                            matchData: match,
                          })}
                        >
                          <View style={styles.buttonContent}>
                            <MaterialCommunityIcons name="qrcode" size={18} color="#ffffff" />
                            <Text style={styles.actionButtonText}> Ready to Drop Off - Generate QR Code</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {match.dropOffCompleted && !destinationDropOffCompleted && (
                    <View style={styles.waitingContainer}>
                      <Text style={styles.waitingText}>
                        Package dropped off. Waiting for traveler to pick up and deliver to destination.
                      </Text>
                    </View>
                  )}

              {destinationDropOffCompleted && !destinationPickUpCompleted && (
                <View style={styles.waitingContainer}>
                  <Text style={styles.waitingText}>
                    Package delivered to destination. Waiting for receiver to pick up at {match.travelerListing.destinationAirport}.
                  </Text>
                </View>
              )}

              {destinationPickUpCompleted && (
                <View style={styles.completedBadge}>
                  <View style={styles.completedIconContainer}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#065f46" />
                    <Text style={styles.completedText}>
                      Package delivery completed!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )
        })()}

        {/* Receiver Actions */}
        {(match.status === 'pending' || match.status === 'accepted') && isReceiver && (() => {
          const destinationDropOffCompleted = match.destinationDropOffCompleted || false
          const destinationPickUpCompleted = match.destinationPickUpCompleted || false
          
          // Calculate estimated pickup time
          const getEstimatedPickupTime = () => {
            if (!match.travelerListing.arrivalTime) return null
            const arrivalTime = new Date(match.travelerListing.arrivalTime)
            // Add 2 hours buffer for traveler to drop off at destination airport
            const estimatedPickup = new Date(arrivalTime.getTime() + 2 * 60 * 60 * 1000)
            return estimatedPickup
          }
          
          const estimatedPickup = getEstimatedPickupTime()
          
          return (
            <View>
              {match.status === 'pending' && (
                <View style={styles.waitingContainer}>
                  <Text style={styles.waitingText}>
                    Waiting for a traveler to accept or reject
                  </Text>
                  {estimatedPickup && (
                    <View style={styles.estimatedPickupInfo}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#92400e" />
                      <Text style={styles.estimatedPickupInfoText}>
                        Estimated pickup: {estimatedPickup.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {match.status === 'accepted' && !destinationDropOffCompleted && (
                <View style={styles.waitingContainer}>
                  <Text style={styles.waitingText}>
                    Waiting for traveler to deliver package to destination airport
                  </Text>
                  {estimatedPickup && (
                    <View style={styles.estimatedPickupInfo}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#92400e" />
                      <Text style={styles.estimatedPickupInfoText}>
                        Estimated pickup: {estimatedPickup.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}

                  {destinationDropOffCompleted && !destinationPickUpCompleted && (
                    <>
                      <View style={styles.deadlineInfoContainer}>
                        <Text style={styles.deadlineInfoText}>
                          Package ready for pick-up at destination
                        </Text>
                        <Text style={styles.deadlineInfoSubtext}>
                          Destination: {match.travelerListing.destinationAirport}
                        </Text>
                        {estimatedPickup && (
                          <Text style={styles.deadlineInfoSubtext}>
                            You can now pick up your package
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.qrButton]}
                        onPress={() => (navigation as any).navigate('QRCode', {
                          matchId: match.id,
                          matchType: 'destination-pickup',
                          matchData: match,
                        })}
                      >
                        <View style={styles.buttonContent}>
                          <MaterialCommunityIcons name="qrcode" size={18} color="#ffffff" />
                          <Text style={styles.actionButtonText}> Pick Up at Destination</Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  {destinationPickUpCompleted && (
                    <View style={styles.completedBadge}>
                      <View style={styles.completedIconContainer}>
                        <MaterialCommunityIcons name="check-circle" size={18} color="#065f46" />
                        <Text style={styles.completedText}>
                          Package delivery completed!
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )
            })()}
          </View>
        )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7AA1C9" />
      </View>
    )
  }

  // Separate matches by type
  const sentPackages = matches.filter(m => getUserRole(m) === 'sender')
  const receivedPackages = matches.filter(m => getUserRole(m) === 'receiver')
  // Travelers see both pending (to accept/reject) and accepted (packages they're carrying) matches
  const travelerMatches = matches.filter(m => getUserRole(m) === 'traveler')
  const pendingTravelerMatches = travelerMatches.filter(m => m.status === 'pending')
  const carryingPackages = travelerMatches.filter(m => m.status === 'accepted')

  const hasContent = matches.length > 0 || pendingListings.length > 0 || pendingTravelerMatches.length > 0

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Packages</Text>
      </View>

      {!hasContent && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No active packages</Text>
          <Text style={styles.emptySubtext}>
            {user ? 'Create a listing to start matching!' : 'Create a listing to start matching!'}
          </Text>
        </View>
      )}

      {/* Pending Package Listings Section */}
      {pendingListings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>My Sent Packages (Pending)</Text>
          </View>
          {pendingListings.map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <View style={styles.listingInfo}>
                  <View style={styles.packageFlowContainer}>
                    <View style={styles.flowBadge}>
                      <MaterialCommunityIcons name="arrow-right" size={14} color="#7AA1C9" />
                      <Text style={styles.flowText}>
                        From {user?.name || 'You'} to {listing.receiver?.name || 'Receiver'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.routeContainer}>
                    <MaterialCommunityIcons name="airplane" size={16} color="#374151" />
                    <Text style={styles.routeText}>
                      {listing.originAirport} → {listing.destinationAirport}
                    </Text>
                  </View>
                  <Text style={styles.weightText}>
                    Weight: {listing.packageWeight} lbs • {listing.packageType === 'carry-on' ? 'Carry-On' : listing.packageType === 'checked' ? 'Checked in' : 'Either'}
                  </Text>
                  {listing.description && (
                    <Text style={styles.descriptionText}>{listing.description}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                  <Text style={styles.statusText}>PENDING</Text>
                </View>
              </View>
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  Waiting for a traveler to accept or reject
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* My Sent Packages */}
      {sentPackages.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>My Sent Packages</Text>
          </View>
          {sentPackages.map(renderMatchCard)}
        </View>
      )}

      {/* My Received Packages */}
      {receivedPackages.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="package-variant-closed" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>My Received Packages</Text>
          </View>
          {receivedPackages.map(renderMatchCard)}
        </View>
      )}

      {/* Pending Package Requests for Travelers */}
      {pendingTravelerMatches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>Pending Package Requests</Text>
          </View>
          {pendingTravelerMatches.map(renderMatchCard)}
        </View>
      )}

      {/* Packages I'm Carrying */}
      {carryingPackages.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="airplane" size={20} color="#6b7280" />
            <Text style={styles.sectionTitle}>Packages I'm Carrying</Text>
          </View>
          {carryingPackages.map(renderMatchCard)}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  listingInfo: {
    flex: 1,
  },
  matchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  matchHeaderLeft: {
    flex: 1,
  },
  packageFlowContainer: {
    marginBottom: 8,
  },
  flowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  flowText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  matchSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  matchDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 4,
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  receiverText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  qrButton: {
    backgroundColor: '#10b981',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  waitingContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  waitingText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  acceptedContainer: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptedText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  deadlineText: {
    color: '#065f46',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  deadlineSubtext: {
    color: '#047857',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  deadlineInfoContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deadlineInfoText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  deadlineInfoSubtext: {
    color: '#3b82f6',
    fontSize: 12,
    textAlign: 'center',
  },
  anonymousText: {
    color: '#6b7280',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
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
  completedSubtext: {
    color: '#047857',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  estimatedPickupContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  estimatedPickupText: {
    flex: 1,
  },
  estimatedPickupLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  estimatedPickupValue: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  estimatedPickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    justifyContent: 'center',
  },
  estimatedPickupInfoText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
})
