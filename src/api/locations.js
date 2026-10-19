// Auto-split from src/api.js — domain module: locations.js
import axios from 'axios'
import { BASE_URL } from './http'

// Locations
export const getLocations = () =>
  axios.get(`${BASE_URL}/api/locations`);
