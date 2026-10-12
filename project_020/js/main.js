// Sistema de Chat Simulado
class ChatApp {
    constructor() {
        this.rooms = [];
        this.messages = [];
        this.currentRoomId = null;
        this.user = {
            id: 1,
            name: "Usuário"
        };

        this.init();
    }

    init() {
        // Carregar dados iniciais
        this.loadInitialData();
        // Configurar event listeners
        this.setupEventListeners();
        // Renderizar interface inicial
        this.renderRoomsList();
    }

    loadInitialData() {
        // Dados de exemplo para salas
        this.rooms = [
            { id: 1, name: "Geral", description: "Sala principal para conversas gerais", userCount: 5 },
            { id: 2, name: "Tecnologia", description: "Discussões sobre programação e tecnologia", userCount: 3 },
            { id: 3, name: "Games", description: "Sobre jogos e entretenimento", userCount: 2 },
            { id: 4, name: "Música", description: "Compartilhando playlists e descobertas musicais", userCount: 4 }
        ];

        // Dados de exemplo para mensagens
        this.messages = {
            1: [ // Sala Geral
                { id: 1, roomId: 1, userId: 1, text: "Olá a todos! Como está todo mundo hoje?", timestamp: "2026-10-09 10:30" },
                { id: 2, roomId: 1, userId: 2, text: "Oi! Tudo bem, e com você?", timestamp: "2026-10-09 10:31" },
                { id: 3, roomId: 1, userId: 3, text: "Também tá bom! Só trabalhando nesse novo projeto.", timestamp: "2026-10-09 10:32" }
            ],
            2: [ // Sala Tecnologia
                { id: 4, roomId: 2, userId: 4, text: "Alguém mais tá trabalhando com React atualmente?", timestamp: "2026-10-09 11:15" },
                { id: 5, roomId: 2, userId: 5, text: "Sim! Estou aprendendo hooks agora.", timestamp: "2026-10-09 11:16" }
            ],
            3: [], // Sala Games
            4: []  // Sala Música
        };
    }

    setupEventListeners() {
        // Event listener para criar nova sala
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.showCreateRoomModal());
        }

        // Event listener para enviar mensagem
        const messageForm = document.getElementById('message-form');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Event listener para busca de salas
        const roomSearch = document.getElementById('room-search');
        if (roomSearch) {
            roomSearch.addEventListener('input', (e) => this.filterRooms(e.target.value));
        }
    }

    showCreateRoomModal() {
        const roomName = prompt("Digite o nome da nova sala:");
        if (roomName && roomName.trim() !== '') {
            const roomDescription = prompt("Digite uma descrição para a sala (opcional):") || "";
            this.createRoom(roomName.trim(), roomDescription);
        }
    }

    createRoom(name, description = "") {
        const newRoom = {
            id: Date.now(), // ID simples baseado no timestamp
            name: name,
            description: description,
            userCount: 1
        };

        this.rooms.push(newRoom);
        this.messages[newRoom.id] = [];
        this.renderRoomsList();
        this.selectRoom(newRoom.id);
    }

    filterRooms(searchTerm) {
        const roomsList = document.getElementById('rooms-list');
        if (!roomsList) return;

        const searchLower = searchTerm.toLowerCase();
        const roomItems = roomsList.getElementsByTagName('li');

        Array.from(roomItems).forEach(item => {
            const roomName = item.querySelector('.room-name').textContent.toLowerCase();
            if (roomName.includes(searchLower)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    selectRoom(roomId) {
        this.currentRoomId = roomId;

        // Atualizar seleção visual
        const roomItems = document.querySelectorAll('#rooms-list li');
        roomItems.forEach(item => {
            item.classList.remove('active');
            const roomIdAttr = parseInt(item.dataset.roomId);
            if (roomIdAttr === roomId) {
                item.classList.add('active');
            }
        });

        // Atualizar cabeçalho da sala
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
            document.getElementById('current-room-name').textContent = room.name;
        }

        // Carregar mensagens da sala
        this.loadMessages();
    }

    loadMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        // Limpar mensagens existentes
        messagesContainer.innerHTML = '';

        // Carregar mensagens da sala atual
        const roomMessages = this.messages[this.currentRoomId] || [];

        roomMessages.forEach(message => {
            this.addMessageToDOM(message);
        });

        // Scroll para o final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput || !this.currentRoomId) return;

        const text = messageInput.value.trim();
        if (text === '') return;

        const newMessage = {
            id: Date.now(),
            roomId: this.currentRoomId,
            userId: this.user.id,
            text: text,
            timestamp: new Date().toLocaleString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Adicionar mensagem ao array
        if (!this.messages[this.currentRoomId]) {
            this.messages[this.currentRoomId] = [];
        }
        this.messages[this.currentRoomId].push(newMessage);

        // Adicionar mensagem ao DOM
        this.addMessageToDOM(newMessage);

        // Limpar input e focar
        messageInput.value = '';
        messageInput.focus();

        // Scroll para o final
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addMessageToDOM(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.userId === this.user.id ? 'sent' : 'received'}`;

        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message.text)}</div>
            <div class="message-time">${message.timestamp}</div>
        `;

        messagesContainer.appendChild(messageDiv);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderRoomsList() {
        const roomsList = document.getElementById('rooms-list');
        if (!roomsList) return;

        roomsList.innerHTML = '';

        this.rooms.forEach(room => {
            const roomItem = document.createElement('li');
            roomItem.dataset.roomId = room.id;
            roomItem.className = room.id === this.currentRoomId ? 'active' : '';

            roomItem.innerHTML = `
                <div class="room-info">
                    <span class="room-name">${room.name}</span>
                    <span class="room-count">${room.userCount} online</span>
                </div>
            `;

            roomItem.addEventListener('click', () => this.selectRoom(room.id));
            roomsList.appendChild(roomItem);
        });

        // Se nenhuma sala estiver selecionada, selecionar a primeira
        if (this.currentRoomId === null && this.rooms.length > 0) {
            this.selectRoom(this.rooms[0].id);
        }
    }
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});