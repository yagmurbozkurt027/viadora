// API URL'yi dinamik olarak belirle
export const getApiUrl = () => {
  // Production'da environment variable kullan
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Development'ta environment variable kullan
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602')
      : 'https://butik-proje-a02ueo36q-yagmurs-projects-54afa3cf.vercel.app';
  }
  
  // Fallback
  return process.env.NEXT_PUBLIC_API_URL || 'https://butik-proje-a02ueo36q-yagmurs-projects-54afa3cf.vercel.app';
};

// API çağrıları için helper fonksiyon
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Token varsa ekle
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(url, {
    ...defaultOptions,
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}; 