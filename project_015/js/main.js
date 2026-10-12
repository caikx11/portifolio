// Application state
let notes = [];
let categories = ['Trabalho', 'Pessoal', 'Estudos', 'Ideias', 'Lembretes'];
let tags = [];
let currentNoteId = null; // For editing existing notes
let filterCategory = '';
let searchTerm = '';

// DOM Elements
const newNoteBtn = document.getElementById('new-note-btn');
const searchInput = document.getElementById('search-input');
const categoriesList = document.getElementById('categories-list');
const tagsList = document.getElementById('tags-list');
const notesList = document.getElementById('notes-list');
const noteModal = document.getElementById('note-modal');
const closeNoteModal = document.getElementById('close-note-modal');
const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const noteCategorySelect = document.getElementById('note-category');
const noteTagsInput = document.getElementById('note-tags');
const modalTitle = document.getElementById('modal-title');
const deleteNoteBtn = document.getElementById('delete-note-btn');

// Initialize the application
async function init() {
    // Load data from localStorage
    loadData();

    // Set up event listeners
    newNoteBtn.addEventListener('click', openNewNoteModal);
    searchInput.addEventListener('input', handleSearch);
    closeNoteModal.addEventListener('click', closeModal);
    noteForm.addEventListener('submit', saveNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    // Initial render
    render();
}

// Load data from localStorage
function loadData() {
    const savedNotes = localStorage.getItem('notes');
    const savedCategories = localStorage.getItem('categories');
    const savedTags = localStorage.getItem('tags');

    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
        } catch (e) {
            console.error('Error parsing notes from localStorage:', e);
            notes = [];
        }
    }

    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
        } catch (e) {
            console.error('Error parsing categories from localStorage:', e);
            categories = ['Trabalho', 'Pessoal', 'Estudos', 'Ideias', 'Lembretes'];
        }
    }

    if (savedTags) {
        try {
            tags = JSON.parse(savedTags);
        } catch (e) {
            console.error('Error parsing tags from localStorage:', e);
            tags = [];
        }
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('tags', JSON.stringify(tags));
}

// Open modal for new note
function openNewNoteModal() {
    currentNoteId = null;
    modalTitle.textContent = 'Nova Nota';
    noteForm.reset();
    noteCategorySelect.value = '';
    noteTagsInput.value = '';
    deleteNoteBtn.style.display = 'none'; // Hide delete button for new notes
    noteModal.style.display = 'block';
}

// Open modal for editing existing note
function openEditNoteModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    currentNoteId = noteId;
    modalTitle.textContent = 'Editar Nota';
    noteIdInput.value = note.id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteCategorySelect.value = note.category || '';
    noteTagsInput.value = note.tags ? note.tags.join(', ') : '';
    deleteNoteBtn.style.display = 'inline-block'; // Show delete button for existing notes
    noteModal.style.display = 'block';
}

// Close modal
function closeModal() {
    noteModal.style.display = 'none';
    currentNoteId = null;
    noteForm.reset();
}

// Save note (new or update)
function saveNote(e) {
    e.preventDefault();

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const category = noteCategorySelect.value;
    const tagsInput = noteTagsInput.value.trim();

    if (!title || !content) {
        alert('Por favor, preencha o título e o conteúdo da nota.');
        return;
    }

    // Process tags
    const noteTags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

    const noteData = {
        id: currentNoteId || Date.now().toString(),
        title,
        content,
        category: category || null,
        tags: noteTags.length > 0 ? noteTags : [],
        createdAt: currentNoteId ? notes.find(n => n.id === currentNoteId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (currentNoteId) {
        // Update existing note
        const index = notes.findIndex(n => n.id === currentNoteId);
        if (index !== -1) {
            notes[index] = noteData;
        }
    } else {
        // Add new note
        notes.push(noteData);
    }

    // Update global tags list
    updateGlobalTags();

    // Save and render
    saveData();
    render();
    closeModal();
}

// Delete current note
function deleteCurrentNote() {
    if (!currentNoteId) return;

    if (confirm('Tem certeza que deseja excluir esta nota?')) {
        notes = notes.filter(n => n.id !== currentNoteId);
        saveData();
        render();
        closeModal();
    }
}

// Update global tags list based on all notes
function updateGlobalTags() {
    const allTags = notes
        .flatMap(note => note.tags || [])
        .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

    tags = [...new Set([...tags, ...allTags])]; // Merge with existing tags and remove duplicates
}

// Filter notes based on category and search
function getFilteredNotes() {
    return notes.filter(note => {
        // Category filter
        if (filterCategory && note.category !== filterCategory) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const searchableText = `${note.title} ${note.content} ${note.tags?.join(' ') || ''}`.toLowerCase();
            if (!searchableText.includes(searchTerm.toLowerCase())) {
                return false;
            }
        }

        return true;
    });
}

// Render categories list
function renderCategories() {
    categoriesList.innerHTML = `
        <h3>Categorias</h3>
        ${categories.map(category => {
            const count = notes.filter(note => note.category === category).length;
            return `
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        }).join('')}
    `;

    // Add click events to category items
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.querySelector('.category-name').textContent;
            filterCategory = filterCategory === category ? '' : category;
            render();
        });
    });
}

// Render tags list
function renderTags() {
    tagsList.innerHTML = `
        <h3>Tags Populares</h3>
        ${tags.slice(0, 10).map(tag => { // Show top 10 tags
            const count = notes.filter(note => note.tags && note.tags.includes(tag)).length;
            return `
                <div class="tag-item">
                    <span class="tag-name">${tag}</span>
                    <span class="tag-count">${count}</span>
                </div>
            `;
        }).join('')}
    `;

    // Add click events to tag items
    document.querySelectorAll('.tag-item').forEach(item => {
        item.addEventListener('click', () => {
            const tag = item.querySelector('.tag-name').textContent;
            // For simplicity, we'll add the tag to search
            searchInput.value = tag;
            handleSearch();
        });
    });
}

// Render notes list
function renderNotes() {
    const filteredNotes = getFilteredNotes();

    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma nota encontrada</p>
                ${filterCategory || searchTerm ?
                    `<button id="clear-filters-btn" class="btn-primary">Limpar filtros</button>` :
                    `<button id="new-note-from-empty" class="btn-primary">+ Primeira Nota</button>`}
            </div>
        `;

        // Add event listener for clear filters button
        const clearFiltersBtn = document.querySelector('#clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                filterCategory = '';
                searchTerm = '';
                searchInput.value = '';
                render();
            });
        }

        // Add event listener for new note button in empty state
        const newNoteFromEmpty = document.querySelector('#new-note-from-empty');
        if (newNoteFromEmpty) {
            newNoteFromEmpty.addEventListener('click', openNewNoteModal);
        }

        return;
    }

    notesList.innerHTML = filteredNotes.map(note => {
        const date = new Date(note.updatedAt);
        const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        return `
            <div class="note-card" data-id="${note.id}">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-meta">
                        <span>${note.category || 'Sem categoria'}</span>
                        <span class="note-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="note-content">
                    ${note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                </div>
                ${note.tags && note.tags.length > 0 ?
                    `<div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>` : ''}
            </div>
        `;
    }).join('');

    // Add click events to note cards
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', () => {
            const noteId = card.getAttribute('data-id');
            openEditNoteModal(noteId);
        });
    });
}

// Handle search input
function handleSearch() {
    searchTerm = searchInput.value.trim();
    render();
}

// Main render function
function render() {
    renderCategories();
    renderTags();
    renderNotes();
    saveData(); // Save after each render to ensure data persistence
}

// Start the application
document.addEventListener('DOMContentLoaded', init);