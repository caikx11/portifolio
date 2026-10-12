class TextAnalyzer {
    constructor() {
        this.textInput = document.getElementById('text-input');
        this.clearBtn = document.getElementById('clear-btn');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.resultsSection = document.getElementById('results-section');

        // Stats elements
        this.wordCountEl = document.getElementById('word-count');
        this.sentenceCountEl = document.getElementById('sentence-count');
        this.charCountEl = document.getElementById('char-count');
        this.charCountNoSpacesEl = document.getElementById('char-count-no-spaces');
        this.paragraphCountEl = document.getElementById('paragraph-count');
        this.lineCountEl = document.getElementById('line-count');

        // Readability elements
        this.fleschScoreEl = document.getElementById('flesch-score');
        this.fleschInterpretationEl = document.getElementById('flesch-interpretation');
        this.fkGradeEl = document.getElementById('fk-grade');
        this.fkInterpretationEl = document.getElementById('fk-interpretation');
        this.fogIndexEl = document.getElementById('fog-index');
        this.fogInterpretationEl = document.getElementById('fog-interpretation');
        this.smogIndexEl = document.getElementById('smog-index');
        this.smogInterpretationEl = document.getElementById('smog-interpretation');
        this.ariScoreEl = document.getElementById('ari-score');
        this.ariInterpretationEl = document.getElementById('ari-interpretation');
        this.clIndexEl = document.getElementById('cl-index');
        this.clInterpretationEl = document.getElementById('cl-interpretation');

        // Word frequency
        this.wordFrequencyList = document.getElementById('word-frequency-list');

        this.init();
    }

    init() {
        this.clearBtn.addEventListener('click', () => this.clearText());
        this.analyzeBtn.addEventListener('click', () => this.analyzeText());

        // Also analyze on input with a small delay for better UX
        let timeoutId;
        this.textInput.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (this.textInput.value.trim() !== '') {
                    this.analyzeText();
                }
            }, 500);
        });
    }

    clearText() {
        this.textInput.value = '';
        this.resetResults();
        this.resultsSection.style.display = 'none';
    }

    resetResults() {
        // Reset all stats to 0
        this.wordCountEl.textContent = '0';
        this.sentenceCountEl.textContent = '0';
        this.charCountEl.textContent = '0';
        this.charCountNoSpacesEl.textContent = '0';
        this.paragraphCountEl.textContent = '0';
        this.lineCountEl.textContent = '0';

        // Reset readability scores
        this.fleschScoreEl.textContent = '0';
        this.fleschInterpretationEl.textContent = '—';
        this.fkGradeEl.textContent = '0';
        this.fkInterpretationEl.textContent = '—';
        this.fogIndexEl.textContent = '0';
        this.fogInterpretationEl.textContent = '—';
        this.smogIndexEl.textContent = '0';
        this.smogInterpretationEl.textContent = '—';
        this.ariScoreEl.textContent = '0';
        this.ariInterpretationEl.textContent = '—';
        this.clIndexEl.textContent = '0';
        this.clInterpretationEl.textContent = '—';

        // Clear word frequency
        this.wordFrequencyList.innerHTML = '<p>Analise um texto para ver a frequência de palavras.</p>';
    }

    analyzeText() {
        const text = this.textInput.value.trim();

        if (text === '') {
            alert('Por favor, insira algum texto para analisar.');
            return;
        }

        // Calculate basic stats
        const stats = this.calculateBasicStats(text);

        // Update stats display
        this.updateStatsDisplay(stats);

        // Calculate readability scores
        const readability = this.calculateReadability(text, stats);

        // Update readability display
        this.updateReadabilityDisplay(readability);

        // Calculate word frequency
        const wordFrequency = this.calculateWordFrequency(text);

        // Update word frequency display
        this.updateWordFrequencyDisplay(wordFrequency);

        // Show results section
        this.resultsSection.style.display = 'block';
    }

    calculateBasicStats(text) {
        // Word count (split by whitespace and filter out empty strings)
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // Sentence count (split by ., !, ?)
        const sentences = text.match(/[.!?]+/g) || [];
        const sentenceCount = sentences.length;

        // Character count (including spaces)
        const charCount = text.length;

        // Character count (excluding spaces)
        const charCountNoSpaces = text.replace(/\s+/g, '').length;

        // Paragraph count (split by double newlines or blocks separated by empty lines)
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
        const paragraphCount = paragraphs.length;

        // Line count (split by newline)
        const lines = text.split('\n');
        const lineCount = lines.length;

        return {
            wordCount,
            sentenceCount,
            charCount,
            charCountNoSpaces,
            paragraphCount,
            lineCount
        };
    }

    calculateReadability(text, stats) {
        const { wordCount, sentenceCount, charCount } = stats;

        // Avoid division by zero
        if (sentenceCount === 0 || wordCount === 0) {
            return {
                flesch: 0,
                fkGrade: 0,
                fogIndex: 0,
                smogIndex: 0,
                ari: 0,
                clIndex: 0
            };
        }

        // Count syllables (approximation)
        const syllableCount = this.estimateSyllableCount(text);

        // Count complex words (words with 3+ syllables)
        const complexWordCount = this.countComplexWords(text);

        // Flesch Reading Ease
        // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        const flesch = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

        // Flesch-Kincaid Grade Level
        // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        const fkGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;

        // Gunning Fog Index
        // 0.4 * ((words/sentences) + 100 * (complex words/words))
        const fogIndex = 0.4 * ((wordCount / sentenceCount) + 100 * (complexWordCount / wordCount));

        // SMOG Index
        // 1.043 * sqrt(complex words * (30 / sentences)) + 3.1291
        const smogIndex = 1.043 * Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3.1291;

        // Automated Readability Index
        // 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
        const ari = 4.71 * (charCount / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;

        // Coleman-Liau Index
        // 0.0588 * L - 0.296 * S - 15.8
        // where L = average number of letters per 100 words
        // and S = average number of sentences per 100 words
        const lettersPer100Words = (stats.charCountNoSpaces / wordCount) * 100;
        const sentencesPer100Words = (sentenceCount / wordCount) * 100;
        const clIndex = 0.0588 * lettersPer100Words - 0.296 * sentencesPer100Words - 15.8;

        return {
            flesch: Math.max(0, flesch), // Ensure non-negative
            fkGrade: Math.max(0, fkGrade),
            fogIndex: Math.max(0, fogIndex),
            smogIndex: Math.max(0, smogIndex),
            ari: Math.max(0, ari),
            clIndex: Math.max(0, clIndex)
        };
    }

    estimateSyllableCount(text) {
        // Simple syllable counting approximation
        // This is not perfect but works well enough for readability formulas
        const words = text.toLowerCase().match(/\b[a-z]+'\b|\b[a-z]+\b/g) || [];
        let syllableCount = 0;

        words.forEach(word => {
            // Remove non-alphabetic characters
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord.length === 0) return;

            // Count vowel groups
            const vowelGroups = cleanWord.match(/[aeiouy]+/g);
            let count = vowelGroups ? vowelGroups.length : 1;

            // Subtract silent e
            if (cleanWord.endsWith('e') && !cleanWord.endsWith('le') && count > 1) {
                count--;
            }

            // Add for words ending in le
            if (cleanWord.endsWith('le') && cleanWord.length > 2 &&
                !/[aeiou]l/.test(cleanWord.charAt(cleanWord.length - 3))) {
                count++;
            }

            // Every word has at least one syllable
            syllableCount += Math.max(1, count);
        });

        return syllableCount;
    }

    countComplexWords(text) {
        // Count words with 3 or more syllables
        const words = text.toLowerCase().match(/\b[a-z]+'\b|\b[a-z]+\b/g) || [];
        let complexCount = 0;

        words.forEach(word => {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord.length === 0) return;

            const syllableCount = this.estimateSyllableForWord(cleanWord);
            if (syllableCount >= 3) {
                complexCount++;
            }
        });

        return complexCount;
    }

    estimateSyllableForWord(word) {
        // Estimate syllables for a single word
        const vowelGroups = word.match(/[aeiouy]+/g);
        let count = vowelGroups ? vowelGroups.length : 1;

        // Subtract silent e
        if (word.endsWith('e') && !word.endsWith('le') && count > 1) {
            count--;
        }

        // Add for words ending in le
        if (word.endsWith('le') && word.length > 2 &&
            !/[aeiou]l/.test(word.charAt(word.length - 3))) {
            count++;
        }

        return Math.max(1, count);
    }

    calculateWordFrequency(text) {
        // Get words (alphanumeric sequences)
        const words = text.toLowerCase()
            .match(/\b[a-zA-Z]+'/g)
            ? [...text.toLowerCase().match(/\b[a-zA-Z]+'/g), ...text.toLowerCase().match(/\b[a-zA-Z]+\b/g)]
            : text.toLowerCase().match(/\b[a-zA-Z]+\b/g) || [];

        // Filter out very short words (less than 2 characters) and common stop words
        const stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
            'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
            'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'um', 'uma', 'uns', 'umas', 'para', 'por',
            'com', 'não', 'se', 'que', 'esta', 'este', 'estes', 'estas', 'ele', 'ela', 'eles', 'elas'
        ]);

        // Count word frequencies
        const freqMap = new Map();
        words.forEach(word => {
            const cleanWord = word.replace(/[^a-zA-Z']/g, '').toLowerCase();
            if (cleanWord.length >= 2 && !stopWords.has(cleanWord)) {
                freqMap.set(cleanWord, (freqMap.get(cleanWord) || 0) + 1);
            }
        });

        // Sort by frequency (descending)
        return Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 words
    }

    updateStatsDisplay(stats) {
        this.wordCountEl.textContent = stats.wordCount.toLocaleString();
        this.sentenceCountEl.textContent = stats.sentenceCount.toLocaleString();
        this.charCountEl.textContent = stats.charCount.toLocaleString();
        this.charCountNoSpacesEl.textContent = stats.charCountNoSpaces.toLocaleString();
        this.paragraphCountEl.textContent = stats.paragraphCount.toLocaleString();
        this.lineCountEl.textContent = stats.lineCount.toLocaleString();
    }

    updateReadabilityDisplay(scores) {
        // Flesch Reading Ease
        this.fleschScoreEl.textContent = scores.flesch.toFixed(2);
        this.fleschInterpretationEl.textContent = this.interpretFlesch(scores.flesch);

        // Flesch-Kincaid Grade
        this.fkGradeEl.textContent = scores.fkGrade.toFixed(2);
        this.fkInterpretationEl.textContent = this.interpretFkGrade(scores.fkGrade);

        // Gunning Fog Index
        this.fogIndexEl.textContent = scores.fogIndex.toFixed(2);
        this.fogInterpretationEl.textContent = this.interpretFogIndex(scores.fogIndex);

        // SMOG Index
        this.smogIndexEl.textContent = scores.smogIndex.toFixed(2);
        this.smogInterpretationEl.textContent = this.interpretSmogIndex(scores.smogIndex);

        // Automated Readability Index
        this.ariScoreEl.textContent = scores.ari.toFixed(2);
        this.ariInterpretationEl.textContent = this.interpretAri(scores.ari);

        // Coleman-Liau Index
        this.clIndexEl.textContent = scores.clIndex.toFixed(2);
        this.clInterpretationEl.textContent = this.interpretClIndex(scores.clIndex);
    }

    interpretFlesch(score) {
        if (score >= 90) return 'Muito Fácil (5º ano)';
        if (score >= 80) return 'Fácil (6º ano)';
        if (score >= 70) return 'Razoavelmente Fácil (7º ano)';
        if (score >= 60) return 'Padrão (8º-9º ano)';
        if (score >= 50) return 'Razoavelmente Difícil (10º-12º ano)';
        if (score >= 30) return 'Difícil (Faculdade)';
        return 'Muito Difícil (Formado universitário)';
    }

    interpretFkGrade(score) {
        if (score <= 5) return '5º ano ou menos';
        if (score <= 6) return '6º ano';
        if (score <= 7) return '7º ano';
        if (score <= 8) return '8º ano';
        if (score <= 9) return '9º ano';
        if (score <= 10) return '10º ano';
        if (score <= 11) return '11º ano';
        if (score <= 12) return '12º ano';
        if (score <= 13) return 'Ensino médio';
        if (score <= 16) return 'Ensino superior';
        return 'Formado universitário';
    }

    interpretFogIndex(score) {
        if (score <= 6) return '6º ano ou menos';
        if (score <= 8) return '8º ano';
        if (score <= 10) return '10º ano';
        if (score <= 12) return '12º ano';
        if (score <= 14) return 'Ensino médio';
        if (score <= 16) return 'Ensino superior';
        return 'Formado universitário';
    }

    interpretSmogIndex(score) {
        if (score <= 6) return '6º ano ou menos';
        if (score <= 8) return '8º ano';
        if (score <= 10) return '10º ano';
        if (score <= 12) return '12º ano';
        if (score <= 14) return 'Ensino médio';
        if (score <= 16) return 'Ensino superior';
        return 'Formado universitário';
    }

    interpretAri(score) {
        if (score <= 1) return '5-6 anos';
        if (score <= 2) return '6-7 anos';
        if (score <= 3) return '7-8 anos';
        if (score <= 4) return '8-9 anos';
        if (score <= 5) return '9-10 anos';
        if (score <= 6) return '10-11 anos';
        if (score <= 7) return '11-12 anos';
        if (score <= 8) return '12-13 anos';
        if (score <= 9) return '13-14 anos';
        if (score <= 10) return '14-15 anos';
        if (score <= 11) return '15-16 anos';
        if (score <= 12) return '16-17 anos';
        if (score <= 13) return '17-18 anos';
        if (score <= 14) return '18-22 anos';
        return '22+ anos';
    }

    interpretClIndex(score) {
        if (score <= 5) return '5º ano';
        if (score <= 6) return '6º ano';
        if (score <= 7) return '7º ano';
        if (score <= 8) return '8º ano';
        if (score <= 9) return '9º ano';
        if (score <= 10) return '10º ano';
        if (score <= 11) return '11º ano';
        if (score <= 12) return '12º ano';
        if (score <= 13) return 'Ensino médio';
        if (score <= 15) return 'Ensino superior';
        return 'Formado universitário';
    }

    updateWordFrequencyDisplay(frequencies) {
        if (frequencies.length === 0) {
            this.wordFrequencyList.innerHTML = '<p>Nenhuma palavra significativa encontrada.</p>';
            return;
        }

        this.wordFrequencyList.innerHTML = '';
        frequencies.forEach(([word, count]) => {
            const item = document.createElement('div');
            item.className = 'word-frequency-item';
            item.innerHTML = `
                <span class="word-frequency-word">${word}</span>
                <span class="word-frequency-count">${count}</span>
            `;
            this.wordFrequencyList.appendChild(item);
        });
    }
}

// Initialize the analyzer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.textAnalyzer = new TextAnalyzer();
});