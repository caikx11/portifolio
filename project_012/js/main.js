// Blog Simples - JavaScript Principal

class BlogApp {
    constructor() {
        this.posts = [];
        this.categories = new Set();
        this.tags = new Set();
        this.currentCategory = null;
        this.currentTag = null;

        this.init();
    }

    async init() {
        await this.loadPosts();
        this.extractMetadata();
        this.render();
        this.bindEvents();
    }

    async loadPosts() {
        try {
            // Load sample posts
            const responses = await Promise.all([
                fetch('posts/post1.json'),
                fetch('posts/post2.json')
            ]);

            const postsData = await Promise.all(responses.map(res => res.json()));
            this.posts = [...postsData[0], ...postsData[1]]; // Combine arrays

            // Sort by date (newest first)
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading posts:', error);
            // Create fallback posts if loading fails
            this.posts = this.createFallbackPosts();
        }
    }

    createFallbackPosts() {
        return [
            {
                id: 1,
                title: "Bem-vindo ao nosso blog",
                excerpt: "Este é o primeiro post do nosso blog simples. Aqui vamos compartilhar dicas, tutoriais e novidades sobre desenvolvimento web.",
                content: "<p>Este é o conteúdo completo do primeiro post. Neste artigo introdutório, apresentamos o propósito do blog e o que os leitores podem esperar encontrar em nossas publicações futuras.</p><p>Agradecemos pela visita e convidamos todos a participar ativamente deixando comentários e sugestões para melhorar nossa comunidade.</p>",
                date: "2026-10-09",
                author: "Equipe do Blog",
                category: "Introdução",
                tags: ["bem-vindo", "primeiro-post", "anúncio"]
            },
            {
                id: 2,
                title: "Dicas para iniciantes em HTML e CSS",
                excerpt: "Aprenda os fundamentos essenciais para começar sua jornada no desenvolvimento web com boas práticas.",
                content: "<p>Neste post, compartilhamos dicas valiosas para quem está começando a aprender HTML e CSS. Cobrimos desde a estrutura básica até técnicas avançadas de estilização.</p><ul><li>Use semântica HTML adequada</li><li>Aprenda Flexbox e Grid para layouts</li><li>Pratique responsividade desde o início</li><li>Mantenha seu código organizado e comentado</li></ul><p>Lembre-se: a prática constante é a chave para se tornar um bom desenvolvedor!</p>",
                date: "2026-10-08",
                author: "Especialista Web",
                category: "Desenvolvimento Web",
                tags: ["HTML", "CSS", "iniciantes", "tutorial"]
            }
        ];
    }

    extractMetadata() {
        this.posts.forEach(post => {
            this.categories.add(post.category);
            post.tags.forEach(tag => this.tags.add(tag));
        });
    }

    bindEvents() {
        // Event listeners will be added after rendering
    }

    render() {
        this.renderCategories();
        this.renderTags();
        this.renderPosts();
    }

    renderCategories() {
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        // Add "All" category option
        const allItem = document.createElement('li');
        const allLink = document.createElement('a');
        allLink.href = '#';
        allLink.textContent = 'Todos';
        allLink.dataset.category = '';
        if (!this.currentCategory) allLink.classList.add('active');
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.filterByCategory('');
            this.setActiveLink(e.target, '.category-list a');
        });
        allItem.appendChild(allLink);
        categoryList.appendChild(allItem);

        // Add other categories
        this.categories.forEach(category => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = category;
            if (this.currentCategory === category) link.classList.add('active');
            link.dataset.category = category;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(category);
                this.setActiveLink(e.target, '.category-list a');
            });
            li.appendChild(link);
            categoryList.appendChild(li);
        });
    }

    renderTags() {
        const tagCloud = document.getElementById('tag-cloud');
        tagCloud.innerHTML = '';

        // Convert Set to array and sort by frequency (simplified)
        const tagsArray = Array.from(this.tags);
        tagsArray.sort(); // Alphabetical for simplicity

        tagsArray.slice(0, 15).forEach(tag => { // Limit to 15 tags
            const tagElement = document.createElement('a');
            tagElement.href = '#';
            tagElement.textContent = tag;
            tagElement.className = 'tag';
            tagElement.dataset.tag = tag;
            if (this.currentTag === tag) tagElement.classList.add('active');
            tagElement.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByTag(tag);
                this.setActiveLink(e.target, '.tag');
            });
            tagCloud.appendChild(tagElement);
        });
    }

    renderPosts() {
        const postList = document.getElementById('post-list');
        postList.innerHTML = '';

        const filteredPosts = this.getFilteredPosts();

        if (filteredPosts.length === 0) {
            postList.innerHTML = '<p class="no-posts">Nenhum post encontrado para os filtros selecionados.</p>';
            return;
        }

        filteredPosts.forEach(post => {
            const postCard = document.createElement('article');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <div class="post-header">
                    <h2 class="post-title"><a href="#">${post.title}</a></h2>
                    <div class="post-meta">
                        <span><strong>${post.date}</strong></span>
                        <span>${post.author}</span>
                    </div>
                </div>
                <p class="post-excerpt">${this.stripHtml(post.excerpt)}</p>
                <div class="post-footer">
                    <a href="#" class="read-more">Leia mais</a>
                    <div class="tags">
                        ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                    </div>
                </div>
            `;

            // Add click event to read more link
            const readMoreLink = postCard.querySelector('.read-more');
            readMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFullPost(post.id);
            });

            // Add click event to post title
            const titleLink = postCard.querySelector('.post-title a');
            titleLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFullPost(post.id);
            });

            postList.appendChild(postCard);
        });
    }

    getFilteredPosts() {
        return this.posts.filter(post => {
            const matchesCategory = !this.currentCategory || post.category === this.currentCategory;
            const matchesTag = !this.currentTag || post.tags.includes(this.currentTag);
            return matchesCategory && matchesTag;
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentTag = null; // Reset tag filter when changing category
        this.render();
    }

    filterByTag(tag) {
        this.currentTag = tag;
        this.render();
    }

    setActiveLink(clickedLink, selector) {
        // Remove active class from all links
        document.querySelectorAll(selector).forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        clickedLink.classList.add('active');
    }

    showFullPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Create modal for full post
        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="post-modal-content">
                <span class="close-modal">&times;</span>
                <h1>${post.title}</h1>
                <div class="post-meta">
                    <span>${post.date}</span>
                    <span>${post.author}</span>
                    <span>${post.category}</span>
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
                <div class="post-tags">
                    <strong>Tags:</strong> ${post.tags.map(tag => `<span class="tag-small">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        const style = { remove() {} };

        // Add modal to body
        document.body.appendChild(modal);
        const esc = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); } };
        document.addEventListener('keydown', esc);

        // Close modal when clicking X
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
}

// Initialize the blog app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
});