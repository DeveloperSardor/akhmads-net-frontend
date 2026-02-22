import axios from 'axios';



const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||'https://api.akhmads.net/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
