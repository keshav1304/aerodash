import type { NextApiRequest, NextApiResponse } from 'next'
import { setCorsHeaders } from '../../../lib/cors'

// This is a mock flight lookup API
// In production, you would integrate with a real flight API like:
// - AviationStack (free tier available)
// - FlightAware API
// - Amadeus API
// For now, we'll return estimated times based on route

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { flightNumber, originAirport, destinationAirport, departureDate } = req.query

  if (!flightNumber || !originAirport || !destinationAirport) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    // Mock flight data - in production, call a real flight API
    // For now, estimate arrival time based on typical flight durations
    const flightDurations: { [key: string]: number } = {
      // US Domestic routes (hours)
      'JFK-LAX': 6.5,
      'LAX-JFK': 6.5,
      'JFK-SFO': 6.5,
      'SFO-JFK': 6.5,
      'ORD-LAX': 4.5,
      'LAX-ORD': 4.5,
      'DFW-LAX': 3.5,
      'LAX-DFW': 3.5,
      // International routes
      'JFK-LHR': 7.5,
      'LHR-JFK': 8.5,
      'LAX-NRT': 11,
      'NRT-LAX': 10,
    }

    const route = `${originAirport}-${destinationAirport}`
    const duration = flightDurations[route] || 4 // Default 4 hours

    const departure = departureDate 
      ? new Date(departureDate as string)
      : new Date()
    
    const arrival = new Date(departure.getTime() + duration * 60 * 60 * 1000)

    // Return mock flight data
    res.status(200).json({
      flightNumber: flightNumber as string,
      originAirport: originAirport as string,
      destinationAirport: destinationAirport as string,
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      duration: duration,
      status: 'scheduled',
    })
  } catch (error) {
    console.error('Error looking up flight:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

