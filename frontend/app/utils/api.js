// API URL'yi dinamik olarak belirle
export const getApiUrl = () => {
  // Production'da Vercel backend, development'da localhost
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:6602';
    } else {
      return 'https://butik-proje-dn2lve05j-yagmurs-projects-54afa3cf.vercel.app';
    }
  }
  return 'https://butik-proje-dn2lve05j-yagmurs-projects-54afa3cf.vercel.app';
};

// API çağrıları için helper fonksiyon
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api${endpoint}`;
  
  console.log('API URL:', url); // Debug için
  
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