import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { API_BASE_URL } from '../config'

interface Airport {
  code: string
  name: string
  city: string
  country: string
}

interface AirportAutocompleteProps {
  value: string
  onChange: (airportCode: string, airportName: string) => void
  placeholder?: string
  label?: string
  zIndex?: number
}

export default function AirportAutocomplete({
  value,
  onChange,
  placeholder = 'Search airports...',
  label,
  zIndex = 1000,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [airports, setAirports] = useState<Airport[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length >= 1) {
      searchAirports(query)
    } else {
      setAirports([])
      setShowSuggestions(false)
    }
  }, [query])

  const searchAirports = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/airports/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      if (response.ok) {
        setAirports(data.airports || [])
        setShowSuggestions(data.airports && data.airports.length > 0)
      }
    } catch (error) {
      console.error('Error searching airports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (airport: Airport) => {
    onChange(airport.code, airport.name)
    setQuery(`${airport.code} - ${airport.name}`)
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    if (query.length >= 1 && airports.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    // Delay to allow selection
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleChangeText = (text: string) => {
    setQuery(text)
    // Clear selection if user is typing
    if (value && text !== value) {
      onChange('', '')
    }
  }

  return (
    <View style={[styles.container, { zIndex: zIndex || 9999 }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, { zIndex: zIndex || 9999 }]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={query || value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="characters"
          placeholderTextColor="#9ca3af"
        />
        {showSuggestions && airports.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView
              style={styles.suggestionsList}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {airports.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.suggestionItem}
                  onPress={() => handleSelect(item)}
                >
                  <View>
                    <Text style={styles.airportCode}>{item.code}</Text>
                    <Text style={styles.airportName}>{item.name}</Text>
                    <Text style={styles.airportLocation}>
                      {item.city}, {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    zIndex: 9999,
    elevation: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
    zIndex: 9999,
    elevation: 10,
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
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 99999,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  airportCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7AA1C9',
    marginBottom: 2,
  },
  airportName: {
    fontSize: 13,
    color: '#1f2937',
    marginBottom: 2,
  },
  airportLocation: {
    fontSize: 11,
    color: '#6b7280',
  },
})
