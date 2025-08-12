import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export const useAdvancedSearch = (products = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: 10000 },
    stockStatus: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isSearching, setIsSearching] = useState(false);

  // Arama geçmişini localStorage'dan yükle
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Arama geçmişini localStorage'a kaydet
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 10)));
    }
  }, [searchHistory]);

  // Otomatik tamamlama için öneriler oluştur
  const generateSuggestions = useCallback((term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    const suggestions = [];
    const termLower = term.toLowerCase();

    // Ürün adlarından öneriler
    products.forEach(product => {
      if (product.name.toLowerCase().includes(termLower)) {
        suggestions.push({
          type: 'product',
          text: product.name,
          value: product.name
        });
      }
    });

    // Kategorilerden öneriler
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(termLower)) {
        suggestions.push({
          type: 'category',
          text: `Kategori: ${category}`,
          value: category
        });
      }
    });

    // Arama geçmişinden öneriler
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(termLower)) {
        suggestions.push({
          type: 'history',
          text: `Geçmiş: ${historyItem}`,
          value: historyItem
        });
      }
    });

    // Tekrarları kaldır ve ilk 5 öneriyi al
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.value === suggestion.value)
    ).slice(0, 5);

    setSuggestions(uniqueSuggestions);
  }, [products, searchHistory]);

  // Debounced arama
  const debouncedSearch = useCallback(
    debounce((term) => {
      generateSuggestions(term);
    }, 300),
    [generateSuggestions]
  );

  // Arama terimi değiştiğinde
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Ürünleri filtrele
  const filterProducts = useCallback(() => {
    setIsSearching(true);

    let filtered = [...products];

    // Metin araması
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Kategori filtresi
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Fiyat aralığı filtresi
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
    );

    // Stok durumu filtresi
    if (filters.stockStatus === 'inStock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (filters.stockStatus === 'lowStock') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock < 5);
    } else if (filters.stockStatus === 'outOfStock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setIsSearching(false);
  }, [products, searchTerm, filters]);

  // Filtreler değiştiğinde ürünleri yeniden filtrele
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  // Arama yap
  const performSearch = (term) => {
    setSearchTerm(term);
    
    // Arama geçmişine ekle
    if (term && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 9)]);
    }
  };

  // Öneri seç
  const selectSuggestion = (suggestion) => {
    performSearch(suggestion.value);
    setSuggestions([]);
  };

  // Filtreleri güncelle
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: { min: 0, max: 10000 },
      stockStatus: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearchTerm('');
  };

  // Arama geçmişini temizle
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // İstatistikler
  const getSearchStats = () => {
    const totalProducts = products.length;
    const filteredCount = filteredProducts.length;
    const appliedFilters = Object.values(filters).filter(f => 
      f !== 'all' && f !== 'asc' && f !== 'name'
    ).length + (searchTerm ? 1 : 0);

    return {
      totalProducts,
      filteredCount,
      appliedFilters,
      hasResults: filteredCount > 0
    };
  };

  return {
    // State
    searchTerm,
    suggestions,
    searchHistory,
    filters,
    filteredProducts,
    isSearching,
    
    // Actions
    performSearch,
    selectSuggestion,
    updateFilter,
    resetFilters,
    clearSearchHistory,
    
    // Utils
    getSearchStats
  };
}; 