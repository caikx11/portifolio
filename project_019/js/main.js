// Application state
let recipes = [];
let favorites = [];
let categories = [];
let activeCategory = '';
let activeDifficulty = '';
let activeTime = '';
let searchTerm = '';
let activeIngredients = '';
let currentView = 'grid'; // 'grid' or 'list'

// DOM Elements
const recipesContainer = document.getElementById('recipes-container');
const recipesCount = document.getElementById('recipes-count');
const categoryFilter = document.getElementById('category-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const timeFilter = document.getElementById('time-filter');
const searchInput = document.getElementById('search-input');
const ingredientsFilter = document.getElementById('ingredients-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const emptyState = document.getElementById('empty-state');
const favoritesList = document.getElementById('favorites-list');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');

const recipeModal = document.getElementById('recipe-modal');
const closeRecipeModal = document.getElementById('close-recipe-modal');
const recipeDetail = document.getElementById('recipe-detail');

// Initialize application
async function init() {
    loadFavorites();
    await fetchRecipes();
    setupEventListeners();
    render();
}

// Fetch recipes from JSON database or fallback
async function fetchRecipes() {
    try {
        const response = await fetch('../recipes/database.json');
        if (!response.ok) throw new Error('Failed to fetch recipes');
        recipes = await response.json();
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipes = getFallbackRecipes();
    }

    // Extract unique categories
    categories = [...new Set(recipes.map(r => r.category))];
    populateCategoryDropdown();
}

// Fallback recipes
function getFallbackRecipes() {
    return [
        {
            id: "1",
            title: "Bolo de Cenoura com Cobertura de Chocolate",
            category: "Sobremesa",
            difficulty: "Fácil",
            time: 45,
            servings: 8,
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400",
            ingredients: [
                "3 cenouras médias raladas",
                "4 ovos",
                "1 xícara de óleo de soja",
                "2 xícaras de açúcar",
                "2 xícaras de farinha de trigo",
                "1 colher de sopa de fermento em pó",
                "1 lata de leite condensado",
                "1 colher de sopa de manteiga",
                "3 colheres de sopa de chocolate em pó"
            ],
            instructions: [
                "No liquidificador, bata as cenouras, ovos, óleo e açúcar até obter uma mistura homogênea.",
                "Despeje em uma tigela e misture delicadamente a farinha e o fermento.",
                "Asse em forno preaquecido a 180°C por cerca de 40 minutos.",
                "Para a cobertura, leve o leite condensado, manteiga e chocolate ao fogo baixo até engrossar. Cubra o bolo pronto."
            ]
        }
    ];
}

// Populate category dropdown
function populateCategoryDropdown() {
    categoryFilter.innerHTML = '<option value="">Todas</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        render();
    });

    categoryFilter.addEventListener('change', (e) => {
        activeCategory = e.target.value;
        render();
    });

    difficultyFilter.addEventListener('change', (e) => {
        activeDifficulty = e.target.value;
        render();
    });

    timeFilter.addEventListener('change', (e) => {
        activeTime = e.target.value;
        render();
    });

    ingredientsFilter.addEventListener('input', (e) => {
        activeIngredients = e.target.value.trim();
        render();
    });

    clearFiltersBtn.addEventListener('click', clearFilters);
    resetFiltersBtn.addEventListener('click', clearFilters);

    gridViewBtn.addEventListener('click', () => {
        currentView = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        renderRecipesList();
    });

    listViewBtn.addEventListener('click', () => {
        currentView = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        renderRecipesList();
    });

    closeRecipeModal.addEventListener('click', () => {
        recipeModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            recipeModal.classList.add('hidden');
        }
    });

    // Add recipe button
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    if (addRecipeBtn) {
        addRecipeBtn.addEventListener('click', () => {
            document.getElementById('add-recipe-modal').classList.remove('hidden');
        });
    }
}

// Clear all filters
function clearFilters() {
    searchTerm = '';
    activeCategory = '';
    activeDifficulty = '';
    activeTime = '';
    activeIngredients = '';

    searchInput.value = '';
    categoryFilter.value = '';
    difficultyFilter.value = '';
    timeFilter.value = '';
    ingredientsFilter.value = '';

    render();
}

// Filter recipes
function getFilteredRecipes() {
    return recipes.filter(recipe => {
        // Search term filter
        if (searchTerm) {
            const matchTitle = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchIng = recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!matchTitle && !matchIng) return false;
        }

        // Category filter
        if (activeCategory && recipe.category !== activeCategory) return false;

        // Difficulty filter
        if (activeDifficulty && recipe.difficulty !== activeDifficulty) return false;

        // Time filter
        if (activeTime) {
            const maxTime = parseInt(activeTime);
            if (recipe.time > maxTime) return false;
        }

        // Ingredients filter
        if (activeIngredients) {
            const filterIngs = activeIngredients.toLowerCase().split(',').map(i => i.trim()).filter(Boolean);
            const recipeIngsText = recipe.ingredients.join(' ').toLowerCase();
            const matchesAll = filterIngs.every(ing => recipeIngsText.includes(ing));
            if (!matchesAll) return false;
        }

        return true;
    });
}

// Toggle favorite
function toggleFavorite(recipeId, event) {
    if (event) event.stopPropagation();

    const index = favorites.indexOf(recipeId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(recipeId);
    }

    saveFavorites();
    render();
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
}

// Load favorites from localStorage
function loadFavorites() {
    const saved = localStorage.getItem('recipeFavorites');
    if (saved) {
        try {
            favorites = JSON.parse(saved);
        } catch (e) {
            favorites = [];
        }
    }
}

// Open recipe detail modal
function openRecipeModal(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const isFav = favorites.includes(recipe.id);

    recipeDetail.innerHTML = `
        <div class="recipe-detail-header">
            <img src="${recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=400'}" alt="${recipe.title}" class="recipe-detail-image" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=400'">
            <div class="recipe-detail-info">
                <h2>${recipe.title}</h2>
                <div class="recipe-detail-meta">
                    <span>⏱️ ${recipe.time} min</span>
                    <span>📊 ${recipe.difficulty}</span>
                    <span>🍽️ ${recipe.servings} porções</span>
                    <span>📂 ${recipe.category}</span>
                </div>
                <button class="btn-primary" onclick="toggleFavorite('${recipe.id}'); openRecipeModal('${recipe.id}');">
                    ${isFav ? '⭐ Remover dos Favoritos' : '☆ Adicionar aos Favoritos'}
                </button>
            </div>
        </div>
        <div class="recipe-detail-section">
            <h3>Ingredientes</h3>
            <ul>
                ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
        </div>
        <div class="recipe-detail-section">
            <h3>Modo de Preparo</h3>
            <ol>
                ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
            </ol>
        </div>
    `;

    recipeModal.classList.remove('hidden');
}

// Render recipes list
function renderRecipesList() {
    const filtered = getFilteredRecipes();
    recipesCount.textContent = `${filtered} ${filtered.length === 1 ? 'Receita encontrada' : 'Receitas encontradas'}`;

    if (filtered.length === 0) {
        recipesContainer.innerHTML = '';
        recipesContainer.className = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    recipesContainer.className = currentView === 'grid' ? 'recipes-grid' : 'recipes-list';

    recipesContainer.innerHTML = filtered.map(recipe => {
        const isFav = favorites.includes(recipe.id);
        const listViewClass = currentView === 'list' ? ' list-view' : '';

        return `
            <div class="recipe-card${listViewClass}" onclick="openRecipeModal('${recipe.id}')">
                <img src="${recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=400'}" alt="${recipe.title}" class="recipe-image" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=400'">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.time} min</span>
                        <span>📊 ${recipe.difficulty}</span>
                        <span>🍽️ ${recipe.servings} porções</span>
                    </div>
                    <div class="recipe-tags">
                        <span class="recipe-tag">${recipe.category}</span>
                        ${isFav ? '<span class="recipe-tag favorite">⭐ Favorita</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render favorites sidebar
function renderFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="font-size: 0.85rem; color: #7f8c8d;">Nenhuma receita favoritada ainda.</p>';
        return;
    }

    const favRecipes = recipes.filter(r => favorites.includes(r.id));

    favoritesList.innerHTML = favRecipes.map(recipe => `
        <div class="favorite-item" onclick="openRecipeModal('${recipe.id}')">
            <span>${recipe.title}</span>
            <button class="remove-favorite" onclick="toggleFavorite('${recipe.id}', event)" title="Remover">&times;</button>
        </div>
    `).join('');
}

// Main render
function render() {
    renderRecipesList();
    renderFavorites();
}

// Start app
document.addEventListener('DOMContentLoaded', init);