// Mock API endpoint for news data
// In a real application, this would be a backend server
// For this project, we'll simulate an API delay and return the news data

let newsData = [];
async function loadNews() {
  if (newsData.length) return newsData;
  const res = await fetch('data/articles.json');
  const json = await res.json();
  newsData = Array.isArray(json) ? json : (json.articles || []);
  return newsData;
}

// Simulate network delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock API handler
async function getNews(filters = {}) {
  // Simulate network delay (500ms - 1500ms)
  await delay(Math.random() * 1000 + 500);

  await loadNews();

  // Apply filters
  let filteredNews = [...newsData];

  if (filters.category) {
    filteredNews = filteredNews.filter(news =>
      news.category.toLowerCase() === filters.category.toLowerCase()
    );
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredNews = filteredNews.filter(news =>
      news.title.toLowerCase().includes(searchTerm) ||
      news.summary.toLowerCase().includes(searchTerm) ||
      news.content.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by date (newest first)
  filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 8;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  return {
    news: paginatedNews,
    pagination: {
      page: page,
      limit: limit,
      total: filteredNews.length,
      totalPages: Math.ceil(filteredNews.length / limit)
    }
  };
}

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getNews };
} else {
  window.getNews = getNews;
}