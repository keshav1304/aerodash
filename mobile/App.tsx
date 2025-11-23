import React, { useState, useEffect } from 'react'
import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Provider as PaperProvider } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context'

import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import HomeScreen from './src/screens/HomeScreen'
import TravelerScreen from './src/screens/TravelerScreen'
import SenderScreen from './src/screens/SenderScreen'
import ActivePackagesScreen from './src/screens/ActivePackagesScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import QRCodeScreen from './src/screens/QRCodeScreen'
import { AuthContext } from './src/context/AuthContext'
import { API_BASE_URL } from './src/config'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  const insets = useSafeAreaInsets()
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7AA1C9',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen 
        name="Traveler" 
        component={TravelerScreen}
        options={{
          tabBarLabel: 'Flights',
          tabBarIcon: ({ color }) => <TabIcon name="airplane" color={color} />,
        }}
      />
      <Tab.Screen 
        name="Sender" 
        component={SenderScreen}
        options={{
          tabBarLabel: 'Send Package',
          tabBarIcon: ({ color }) => <TabIcon name="cube" color={color} />,
        }}
      />
      <Tab.Screen 
        name="ActivePackages" 
        component={ActivePackagesScreen}
        options={{
          tabBarLabel: 'Active',
          tabBarIcon: ({ color }) => <TabIcon name="package" color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

function TabIcon({ name, color }: { name: string; color: string }) {
  const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
    home: 'home',
    airplane: 'airplane',
    cube: 'package-variant',
    package: 'package-variant-closed',
    heart: 'heart',
    person: 'account',
  }
  
  const iconName = iconMap[name] || 'circle'
  return <MaterialCommunityIcons name={iconName} size={24} color={color} />
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkToken()
  }, [])

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setUserToken(token)
        } else {
          await AsyncStorage.removeItem('token')
        }
      }
    } catch (error) {
      console.error('Error checking token:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const authContext = {
    signIn: async (token: string, userData: any) => {
      await AsyncStorage.setItem('token', token)
      setUserToken(token)
      setUser(userData)
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token')
      setUserToken(null)
      setUser(null)
    },
    user,
  }

  if (isLoading) {
    return null // You can add a loading screen here
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthContext.Provider value={authContext}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {userToken ? (
                <>
                  <Stack.Screen name="Main" component={MainTabs} />
                  <Stack.Screen name="QRCode" component={QRCodeScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

