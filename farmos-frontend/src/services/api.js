import axios from 'axios';

// this is your Spring Boot server address
// every API call will go here
const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;