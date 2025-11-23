import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#7AA1C9', '#5A8BB9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Welcome to AeroDash</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.card, styles.compactCard]}
            onPress={() => navigation.navigate('Traveler')}
          >
            <MaterialCommunityIcons name="airplane" size={32} color="#7AA1C9" />
            <Text style={styles.cardTitle}>Flights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.compactCard]}
            onPress={() => navigation.navigate('Sender')}
          >
            <MaterialCommunityIcons name="package-variant" size={32} color="#7AA1C9" />
            <Text style={styles.cardTitle}>Send Package</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ActivePackages')}
        >
          <View style={styles.activePackagesRow}>
            <MaterialCommunityIcons name="package-variant-closed" size={32} color="#7AA1C9" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Active Packages</Text>
            </View>
          </View>
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
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  activePackagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  cardDescriptionLeft: {
    textAlign: 'left',
  },
})

