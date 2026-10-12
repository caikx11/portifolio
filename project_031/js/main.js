class MeditationApp {
    constructor() {
        this.currentMode = 'timer';

        // Timer state
        this.timerDuration = 300; // 5 min default
        this.timerRemaining = 300;
        this.timerInterval = null;
        this.isTimerRunning = false;

        // Breathing state
        this.breathingPattern = '4-7-8';
        this.isBreathingRunning = false;
        this.breathingInterval = null;
        this.breathingCycles = 0;
        this.breathingStartTime = null;
        this.breathingTimerInterval = null;

        // Sound URLs (usando links de áudio gratuitos confiáveis)
        this.sounds = {
            none: null,
            rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
            forest: 'https://actions.google.com/sounds/v1/ambiences/outdoor_daytime_forest.ogg',
            ocean: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
            fire: 'https://actions.google.com/sounds/v1/ambiences/fireplace.ogg',
            'white-noise': 'https://actions.google.com/sounds/v1/weather/gentle_wind_through_trees.ogg',
            birds: 'https://actions.google.com/sounds/v1/animals/birds_forest.ogg',
            night: 'https://actions.google.com/sounds/v1/animals/crickets_night.ogg',
            stream: 'https://actions.google.com/sounds/v1/water/stream_gentle.ogg',
            wind: 'https://actions.google.com/sounds/v1/weather/wind_through_trees.ogg'
        };
        this.currentSound = 'none';
        this.bgAudioVolume = 0.5;

        // Load saved settings first
        this.loadSavedSettings();

        // Stats with enhanced tracking
        this.stats = JSON.parse(localStorage.getItem('meditation_stats')) || {
            totalSessions: 0,
            totalMinutes: 0,
            lastSessionDate: null,
            streak: 0,
            history: [], // Array of {date, duration, mode, type}
            timerUsage: {}, // Count of each timer preset used
            breathingPatterns: {}, // Count of each breathing pattern used
            goals: {
                dailyMinutes: 10,
                weeklySessions: 5,
                weeklyMinutes: 70
            }
        };

        // User Settings
        this.settings = JSON.parse(localStorage.getItem('meditation_settings')) || {
            timerDuration: 300,
            customMinutes: 5,
            customSeconds: 0,
            currentSound: 'none',
            volume: 50,
            breathingPattern: '4-7-8',
            customBreathing: {
                inhale: 4,
                hold: 7,
                exhale: 8,
                pause: 0
            }
        };

        this.initDOMElements();
        this.initEventListeners();
        this.applySavedSettings();
        this.updateStatsDisplay();
        this.renderEnhancedStats();
    }

    loadSavedSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('meditation_settings'));
        if (savedSettings) {
            this.settings = savedSettings;
        }
    }

    applySavedSettings() {
        if (!this.settings) return;

        // Apply timer settings
        this.setTimerDuration(this.settings.timerDuration || 300);
        if (this.customMinutes) this.customMinutes.value = this.settings.customMinutes || 5;
        if (this.customSeconds) this.customSeconds.value = this.settings.customSeconds || 0;

        // Apply sound settings
        this.setSound(this.settings.currentSound || 'none');
        if (this.soundBtns) {
            this.soundBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.sound === this.settings.currentSound);
            });
        }
        if (this.volumeSlider) {
            this.volumeSlider.value = this.settings.volume || 50;
            if (this.volumeValue) this.volumeValue.textContent = `${this.settings.volume || 50}%`;
            this.bgAudioVolume = (this.settings.volume || 50) / 100;
        }

        // Apply breathing settings
        this.breathingPattern = this.settings.breathingPattern || '4-7-8';
        if (this.breathingPresets) {
            this.breathingPresets.forEach(preset => {
                preset.classList.toggle('active', preset.dataset.pattern === this.settings.breathingPattern);
            });
        }

        if (this.settings.breathingPattern === 'custom') {
            if (this.customBreathingInputs) this.customBreathingInputs.style.display = 'block';
            document.getElementById('inhale-time').value = this.settings.customBreathing?.inhale || 4;
            document.getElementById('hold-time').value = this.settings.customBreathing?.hold || 0;
            document.getElementById('exhale-time').value = this.settings.customBreathing?.exhale || 4;
            document.getElementById('pause-time').value = this.settings.customBreathing?.pause || 0;
        } else {
            if (this.customBreathingInputs) this.customBreathingInputs.style.display = 'none';
        }
    }

    initDOMElements() {
        // Modes
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.modeContents = document.querySelectorAll('.mode-content');

        // Timer Elements
        this.timerText = document.getElementById('timer-text');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.presetBtns = document.querySelectorAll('.preset-btn');
        this.customMinutes = document.getElementById('custom-minutes');
        this.customSeconds = document.getElementById('custom-seconds');
        this.setCustomTimeBtn = document.getElementById('set-custom-time');

        // Sound Elements
        this.soundBtns = document.querySelectorAll('.sound-btn');
        this.volumeSlider = document.getElementById('volume');
        this.volumeValue = document.getElementById('volume-value');
        this.bgAudio = document.getElementById('background-sound');
        this.bellAudio = document.getElementById('bell-sound');

        // Breathing Elements
        this.breathingCircle = document.getElementById('breathing-circle');
        this.breathingText = document.getElementById('breathing-text');
        this.breathingPresets = document.querySelectorAll('.breathing-preset');
        this.breathingStartBtn = document.getElementById('breathing-start-btn');
        this.breathingStopBtn = document.getElementById('breathing-stop-btn');
        this.cyclesCount = document.getElementById('cycles-count');
        this.breathingTimeDisplay = document.getElementById('breathing-time');
        this.customBreathingInputs = document.getElementById('custom-breathing');

        // Guided
        this.guidedList = document.getElementById('guided-list');

        // Stats Elements
        this.totalSessionsDisplay = document.getElementById('total-sessions');
        this.totalMinutesDisplay = document.getElementById('total-minutes');
        this.streakDisplay = document.getElementById('streak');

        // Settings Elements
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        this.loadSettingsBtn = document.getElementById('load-settings-btn');

        // Enhanced Stats Elements (will be added to HTML)
        this.enhancedStatsContainer = document.createElement('div');
        this.enhancedStatsContainer.id = 'enhanced-stats';
        document.querySelector('.session-stats').appendChild(this.enhancedStatsContainer);
    }

    initEventListeners() {
        // Mode Switching
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeBtns.forEach(b => b.classList.remove('active'));
                this.modeContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const mode = btn.dataset.mode;
                document.getElementById(`${mode}-mode`).classList.add('active');
                this.currentMode = mode;

                if (mode === 'guided') {
                    this.renderGuidedMeditations();
                }
            });
        });

        // Timer Events
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setTimerDuration(parseInt(btn.dataset.time));
                // Track timer usage
                const timeKey = btn.dataset.time;
                this.stats.timerUsage[timeKey] = (this.stats.timerUsage[timeKey] || 0) + 1;
                this.saveStats();
            });
        });

        this.setCustomTimeBtn.addEventListener('click', () => {
            const mins = parseInt(this.customMinutes.value) || 0;
            const secs = parseInt(this.customSeconds.value) || 0;
            const totalSecs = mins * 60 + secs;
            if (totalSecs > 0) {
                this.presetBtns.forEach(b => b.classList.remove('active'));
                this.setTimerDuration(totalSecs);
                // Track custom timer usage
                const timeKey = `custom_${totalSecs}`;
                this.stats.timerUsage[timeKey] = (this.stats.timerUsage[timeKey] || 0) + 1;
                this.saveStats();
            }
        });

        // Sound Events
        this.soundBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.soundBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setSound(btn.dataset.sound);
            });
        });

        this.volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            this.volumeValue.textContent = `${val}%`;
            this.bgAudioVolume = val / 100;
            if (this.currentSound !== 'none' && this.isTimerRunning) {
                this.playSound();
            }

        // Track session completion for statistics
        if (this.settings?.enableStats !== false) {
            this.updateSessionStats('Timer', this.timerDuration, 'Timer Timer');
        }
        });

        // Breathing Events
        this.breathingPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                this.breathingPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                this.breathingPattern = preset.dataset.pattern;

                if (this.breathingPattern === 'custom') {
                    this.customBreathingInputs.style.display = 'block';
                } else {
                    this.customBreathingInputs.style.display = 'none';
                }

                // Track breathing pattern usage
                const patternKey = this.breathingPattern;
                if (patternKey !== 'custom') {
                    this.stats.breathingPatterns[patternKey] = (this.stats.breathingPatterns[patternKey] || 0) + 1;
                    this.saveStats();
                }

                // Track session completion for statistics
                if (this.settings?.enableStats !== false) {
                    this.updateSessionStats('Breathing', this.getBreathingDuration(this.breathingPattern), `Pattern: ${this.breathingPattern}`);
                }
            });
        });

        this.breathingStartBtn.addEventListener('click', () => this.startBreathing());
        this.breathingStopBtn.addEventListener('click', () => this.stopBreathing());

        // Track custom breathing pattern changes
        document.getElementById('inhale-time').addEventListener('change', () => this.saveStats());
        document.getElementById('hold-time').addEventListener('change', () => this.saveStats());
        document.getElementById('exhale-time').addEventListener('change', () => this.saveStats());
        document.getElementById('pause-time').addEventListener('change', () => this.saveStats());

        // Settings Events
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.loadSettingsBtn.addEventListener('click', () => this.loadSettings());
    }

    // --- Native Notification & Session Stats Functions ---
    triggerNativeNotification(message, title = 'Mente Serena') {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    tag: 'meditation-complete',
                    data: { timestamp: Date.now() }
                });
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: message,
                            tag: 'meditation-complete',
                            data: { timestamp: Date.now() }
                        });
                    }
                });
            }
        }
    }

    updateSessionStats(mode, duration, details) {
        const today = new Date().toISOString().split('T')[0];
        this.stats.history.push({
            date: today,
            duration: duration,
            mode: mode,
            details: details,
            timestamp: new Date().toISOString()
        });

        if (this.stats.history.length > 100) {
            this.stats.history = this.stats.history.slice(-100);
        }

        if (this.stats.lastSessionDate) {
            const lastDate = new Date(this.stats.lastSessionDate);
            const currentDate = new Date(today);
            const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.stats.streak++;
            } else if (diffDays > 1) {
                this.stats.streak = 1;
            }
        } else {
            this.stats.streak = 1;
        }

        this.stats.totalSessions++;
        this.stats.totalMinutes += duration;
        this.stats.lastSessionDate = today;

        localStorage.setItem('meditation_stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        this.renderEnhancedStats();
    }

    getBreathingDuration(pattern) {
        const timings = this.getBreathingTimings();
        return timings.inhale + (timings.hold || 0) + (timings.exhale || 0) + (timings.pause || 0);
    }

    formatTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // --- Timer Functions ---
    setTimerDuration(seconds) {
        if (this.isTimerRunning) this.pauseTimer();
        this.timerDuration = seconds;
        this.timerRemaining = seconds;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.timerRemaining / 60);
        const secs = this.timerRemaining % 60;
        this.timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    startTimer() {
        if (this.isTimerRunning) return;
        this.isTimerRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.playSound();

        this.timerInterval = setInterval(() => {
            this.timerRemaining--;
            this.updateTimerDisplay();

            if (this.timerRemaining <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isTimerRunning) return;
        this.isTimerRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timerInterval);
        this.pauseSound();
    }

    resetTimer() {
        this.pauseTimer();
        this.timerRemaining = this.timerDuration;
        this.updateTimerDisplay();
    }

    completeTimer() {
        this.pauseTimer();
        this.playBell();
        const minutesCompleted = Math.round(this.timerDuration / 60);
        this.updateSessionStats('timer', minutesCompleted, `Timer: ${this.timerDuration}s`);
        this.showCompletionEffect();
        alert('Sessão de meditação concluída!');
        this.resetTimer();
        this.triggerNativeNotification('Timer concluído! Você meditou por ' + this.formatTimer(this.timerDuration) + '.', 'Timer Completion');
    }

    showCompletionEffect() {
        // Add a visual completion effect
        const timerDisplay = document.getElementById('time-circle');
        timerDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            timerDisplay.style.transform = 'scale(1)';
        }, 300);
    }

    // --- Sound Functions ---
    setSound(soundKey) {
        this.currentSound = soundKey;
        if (this.isTimerRunning) {
            this.playSound();
        }
    }

    playSound() {
        if (this.currentSound === 'none') {
            this.bgAudio.pause();
            return;
        }
        const src = this.sounds[this.currentSound];
        if (src) {
            this.bgAudio.src = src;
            this.bgAudio.volume = this.bgAudioVolume;
            this.bgAudio.play().catch(e => console.log('Audio autoplay prevented'));
        }
    }

    pauseSound() {
        this.bgAudio.pause();
    }

    playBell() {
        this.bellAudio.play().catch(e => console.log('Bell play error'));
    }

    // --- Breathing Functions ---
    getBreathingTimings() {
        switch (this.breathingPattern) {
            case '4-7-8':
                return { inhale: 4, hold: 7, exhale: 8, pause: 0 };
            case 'box':
                return { inhale: 4, hold: 4, exhale: 4, pause: 4 };
            case '4-4-6-2':
                return { inhale: 4, hold: 4, exhale: 6, pause: 2 };
            case 'custom':
                return {
                    inhale: parseInt(document.getElementById('inhale-time').value) || 4,
                    hold: parseInt(document.getElementById('hold-time').value) || 0,
                    exhale: parseInt(document.getElementById('exhale-time').value) || 4,
                    pause: parseInt(document.getElementById('pause-time').value) || 0
                };
            default:
                return { inhale: 4, hold: 4, exhale: 4, pause: 4 };
        }
    }

    startBreathing() {
        if (this.isBreathingRunning) return;
        this.isBreathingRunning = true;
        this.breathingStartBtn.disabled = true;
        this.breathingStopBtn.disabled = false;
        this.breathingCycles = 0;
        this.cyclesCount.textContent = '0';

        this.breathingStartTime = Date.now();
        this.breathingTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.breathingStartTime) / 1000);
            const m = Math.floor(elapsed / 60);
            const s = elapsed % 60;
            this.breathingTimeDisplay.textContent = `${m}:${String(s).padStart(2, '0')}`;
        }, 1000);

        this.runBreathingCycle();
    }

    async runBreathingCycle() {
        const timings = this.getBreathingTimings();

        while (this.isBreathingRunning) {
            // Inhale
            this.breathingText.textContent = 'Inspire...';
            this.breathingCircle.style.transition = `transform ${timings.inhale}s cubic-bezier(0.4, 0, 0.2, 1)`;
            this.breathingCircle.style.transform = 'scale(1.1)';
            await this.wait(timings.inhale * 1000);
            if (!this.isBreathingRunning) break;

            // Hold
            if (timings.hold > 0) {
                this.breathingText.textContent = 'Segure o ar...';
                await this.wait(timings.hold * 1000);
                if (!this.isBreathingRunning) break;
            }

            // Exhale
            this.breathingText.textContent = 'Expire...';
            this.breathingCircle.style.transition = `transform ${timings.exhale}s cubic-bezier(0.4, 0, 0.2, 1)`;
            this.breathingCircle.style.transform = 'scale(1)';
            await this.wait(timings.exhale * 1000);
            if (!this.isBreathingRunning) break;

            // Pause
            if (timings.pause > 0) {
                this.breathingText.textContent = 'Pausa...';
                await this.wait(timings.pause * 1000);
                if (!this.isBreathingRunning) break;
            }

            this.breathingCycles++;
            this.cyclesCount.textContent = this.breathingCycles;
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stopBreathing() {
        this.isBreathingRunning = false;
        this.breathingStartBtn.disabled = false;
        this.breathingStopBtn.disabled = true;
        clearInterval(this.breathingTimerInterval);

        this.breathingCircle.style.transform = 'scale(1)';
        this.breathingText.textContent = 'Pronto para começar?';

        const elapsedMinutes = Math.round((Date.now() - this.breathingStartTime) / 60000);
        if (elapsedMinutes > 0) {
            this.updateSessionStats('breathing', elapsedMinutes, `Pattern: ${this.breathingPattern}`);
        }

        this.triggerNativeNotification('Respiração concluída! Você respirou por ' + elapsedMinutes + ' minutos.', 'Breathing Session Complete');
    }

    // --- Enhanced Sound Functions ---

    // --- Enhanced Sound Functions ---
    setupAdvancedSoundControls() {
        // This would be implemented if we had more advanced sound features
        // For now, we'll keep the basic sound system
    }

    // --- Guided Meditations ---
    renderGuidedMeditations() {
        const tracks = [
            { id: 1, title: 'Alívio de Estresse e Ansiedade', duration: '10 min', instructor: 'Ana Silva', desc: 'Uma prática suave focada em liberar tensões corporais e acalmar pensamentos acelerados.' },
            { id: 2, title: 'Foco e Clareza Mental', duration: '15 min', instructor: 'Carlos Mendes', desc: 'Exercício de atenção plena direcionado para aumentar a concentração nas atividades de trabalho.' },
            { id: 3, title: 'Sono Profundo e Relaxamento', duration: '20 min', instructor: 'Juliana Costa', desc: 'Indução ao relaxamento profundo para preparar a mente e o corpo para dormir melhor.' },
            { id: 4, title: 'Pausa Rápida para o Trabalho', duration: '5 min', instructor: 'Roberto Lima', desc: 'Micro-meditação ideal para fazer entre reuniões ou durante momentos de sobrecarga.' },
            { id: 5, title: 'Meditação da Gratidão', duration: '10 min', instructor: 'Fernanda Rocha', desc: 'Cultive sentimentos de gratidão e apreciação pelas coisas simples da vida.' },
            { id: 6, title: 'Scan Corporal Completo', duration: '25 min', instructor: 'Dr. Paulo Alves', desc: 'Varredura consciente pelo corpo para identificar e liberar tensões físicas e emocionais.' }
        ];

        this.guidedList.innerHTML = tracks.map(track => `
            <div class="guided-item">
                <div class="guided-info">
                    <h4>${track.title}</h4>
                    <p>${track.desc}</p>
                    <div class="guided-meta">
                        <span>⏱️ ${track.duration}</span>
                        <span>👤 ${track.instructor}</span>
                    </div>
                </div>
                <button class="primary-btn" onclick="window.meditationApp.playGuidedMeditation('${track.title}', '${track.desc}')">Ouvir</button>
            </div>
        `).join('');
    }

    // --- Stats & Persistence ---
    recordSession(minutes, mode = 'timer', details = '') {
        const today = new Date().toISOString().split('T')[0];

        // Add to history
        this.stats.history.push({
            date: today,
            duration: minutes,
            mode: mode,
            details: details,
            timestamp: new Date().toISOString()
        });

        // Keep only last 100 entries
        if (this.stats.history.length > 100) {
            this.stats.history = this.stats.history.slice(-100);
        }

        // Update streak
        if (this.stats.lastSessionDate) {
            const lastDate = new Date(this.stats.lastSessionDate);
            const currentDate = new Date(today);
            const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.stats.streak++;
            } else if (diffDays > 1) {
                this.stats.streak = 1;
            }
        } else {
            this.stats.streak = 1;
        }

        this.stats.totalSessions++;
        this.stats.totalMinutes += minutes;
        this.stats.lastSessionDate = today;

        localStorage.setItem('meditation_stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        this.renderEnhancedStats();
    }

    saveSettings() {
        // Collect current settings
        this.settings = {
            timerDuration: this.timerDuration,
            customMinutes: parseInt(this.customMinutes.value) || 5,
            customSeconds: parseInt(this.customSeconds.value) || 0,
            currentSound: this.currentSound,
            volume: parseInt(this.volumeSlider.value) || 50,
            breathingPattern: this.breathingPattern,
            customBreathing: {
                inhale: parseInt(document.getElementById('inhale-time').value) || 4,
                hold: parseInt(document.getElementById('hold-time').value) || 0,
                exhale: parseInt(document.getElementById('exhale-time').value) || 4,
                pause: parseInt(document.getElementById('pause-time').value) || 0
            }
        };

        localStorage.setItem('meditation_settings', JSON.stringify(this.settings));
        alert('Configurações salvas com sucesso!');
    }

    loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('meditation_settings'));
        if (!savedSettings) {
            alert('Nenhuma configuração salva encontrada.');
            return;
        }

        this.settings = savedSettings;

        // Apply timer settings
        this.setTimerDuration(this.settings.timerDuration);
        this.customMinutes.value = this.settings.customMinutes;
        this.customSeconds.value = this.settings.customSeconds;

        // Apply sound settings
        this.setSound(this.settings.currentSound);
        this.soundBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sound === this.settings.currentSound);
        });
        this.volumeSlider.value = this.settings.volume;
        this.volumeValue.textContent = `${this.settings.volume}%`;
        this.bgAudioVolume = this.settings.volume / 100;

        // Apply breathing settings
        this.breathingPattern = this.settings.breathingPattern;
        this.breathingPresets.forEach(preset => {
            preset.classList.toggle('active', preset.dataset.pattern === this.settings.breathingPattern);
        });

        if (this.settings.breathingPattern === 'custom') {
            this.customBreathingInputs.style.display = 'block';
            document.getElementById('inhale-time').value = this.settings.customBreathing.inhale;
            document.getElementById('hold-time').value = this.settings.customBreathing.hold;
            document.getElementById('exhale-time').value = this.settings.customBreathing.exhale;
            document.getElementById('pause-time').value = this.settings.customBreathing.pause;
        } else {
            this.customBreathingInputs.style.display = 'none';
        }

        // If timer is running, apply volume immediately
        if (this.isTimerRunning && this.currentSound !== 'none') {
            this.playSound();
        }

        alert('Configurações carregadas com sucesso!');
    }

    updateStatsDisplay() {
        this.totalSessionsDisplay.textContent = this.stats.totalSessions;
        this.totalMinutesDisplay.textContent = this.stats.totalMinutes;
        this.streakDisplay.textContent = this.stats.streak;
    }

    renderEnhancedStats() {
        // Create enhanced statistics view
        const  today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        // Filter history for today and this week
        const todayHistory = this.stats.history.filter(entry =>
            new Date(entry.date).toDateString() === today.toDateString()
        );

        const weekHistory = this.stats.history.filter(entry =>
            new Date(entry.date) >= weekStart
        );

        const todayMinutes = todayHistory.reduce((sum, entry) => sum + entry.duration, 0);
        const weekSessions = weekHistory.length;
        const weekMinutes = weekHistory.reduce((sum, entry) => sum + entry.duration, 0);

        // Calculate averages
        const avgSessionLength = this.stats.totalSessions > 0 ?
            Math.round(this.stats.totalMinutes / this.stats.totalSessions) : 0;

        const mostUsedTimer = Object.entries(this.stats.timerUsage)
            .sort(([,a], [,b]) => b - a)[0] || ['0', 0];

        const mostUsedBreathing = Object.entries(this.stats.breathingPatterns)
            .sort(([,a], [,b]) => b - a)[0] || ['0', 0];

        // Format timer usage for display
        const timerLabel = String(mostUsedTimer[0]) === '0' ? 'Nenhum' :
            String(mostUsedTimer[0]).startsWith('custom_') ?
                `${parseInt(mostUsedTimer[0].split('_')[1])/60} min personalizado` :
                `${parseInt(mostUsedTimer[0])/60} min`;

        const breathingLabel = String(mostUsedBreathing[0]) === '0' ? 'Nenhum' :
            String(mostUsedBreathing[0]).replace('-', ' to ').toUpperCase();

        // Goals progress
        const dailyProgress = Math.min(100, Math.round((todayMinutes / this.stats.goals.dailyMinutes) * 100));
        const weeklySessionsProgress = Math.min(100, Math.round((weekSessions / this.stats.goals.weeklySessions) * 100));
        const weeklyMinutesProgress = Math.min(100, Math.round((weekMinutes / this.stats.goals.weeklyMinutes) * 100));

        this.enhancedStatsContainer.innerHTML = `
            <div class="enhanced-stats-grid">
                <div class="stat-card">
                    <h4>Hoje</h4>
                    <div class="stat-value">${todayMinutes} min</div>
                    <div class="stat-label">Meditação</div>
                </div>
                <div class="stat-card">
                    <h4>Esta Semana</h4>
                    <div class="stat-value">${weekSessions} sessões</div>
                    <div class="stat-label">${weekMinutes} min</div>
                </div>
                <div class="stat-card">
                    <h4>Média por Sessão</h4>
                    <div class="stat-value">${avgSessionLength} min</div>
                    <div class="stat-label">Duração</div>
                </div>
                <div class="stat-card">
                    <h4>Preferências</h4>
                    <div class="stat-value">${timerLabel}</div>
                    <div class="stat-label">Timer mais usado</div>
                </div>
                <div class="stat-card">
                    <h4>Respiração</h4>
                    <div class="stat-value">${breathingLabel}</div>
                    <div class="stat-label">Padrão mais usado</div>
                </div>
                <div class="stat-card">
                    <h4>Metas Diárias</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${dailyProgress}%"></div>
                    </div>
                    <div class="stat-label">${todayMinutes}/${this.stats.goals.dailyMinutes} min</div>
                </div>
                <div class="stat-card">
                    <h4>Metas Semanais</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${weeklySessionsProgress}%"></div>
                    </div>
                    <div class="stat-label">${weekSessions}/${this.stats.goals.weeklySessions} sessões</div>
                </div>
                <div class="stat-card">
                    <h4>Minutos Semanais</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${weeklyMinutesProgress}%"></div>
                    </div>
                    <div class="stat-label">${weekMinutes}/${this.stats.goals.weeklyMinutes} min</div>
                </div>
            </div>

            <div class="history-section">
                <h3>Histórico Recent</h3>
                <div class="history-list" id="history-list">
                    ${this.stats.history.slice(-5).reverse().map(entry => {
                        const date = new Date(entry.date);
                        const formattedDate = date.toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short'
                        });
                        return `
                            <div class="history-item">
                                <span class="history-date">${formattedDate}</span>
                                <span class="history-duration">${entry.duration} min</span>
                                <span class="history-mode">${entry.mode === 'timer' ? '⏱️ Timer' : entry.mode === 'breathing' ? '🫁 Respiração' : '🎧 Guiada'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add styles for enhanced stats if not already present
        this.addEnhancedStatsStyles();
    }

    addEnhancedStatsStyles() {
        // Check if styles already exist
        if (document.getElementById('enhanced-stats-styles')) return;

        const style = document.createElement('style');
        style.id = 'enhanced-stats-styles';
        style.textContent = `
            .enhanced-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 25px;
            }

            .stat-card h4 {
                font-size: 0.9rem;
                color: #718096;
                margin-bottom: 8px;
            }

            .stat-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: #2d3748;
                display: block;
            }

            .stat-label {
                font-size: 0.85rem;
                color: #718096;
                display: block;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
                margin: 5px 0;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #48bb78, #38a169);
                transition: width 0.3s ease;
            }

            .history-section {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }

            .history-section h3 {
                font-size: 1.1rem;
                color: #4a5568;
                margin-bottom: 15px;
                text-align: center;
            }

            .history-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .history-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: #f7fafc;
                border-radius: 6px;
                font-size: 0.9rem;
            }

            .history-date {
                color: #718096;
            }

            .history-duration {
                font-weight: 600;
                color: #2d3748;
            }

            .history-mode {
                font-size: 0.85rem;
            }

            @media (max-width: 600px) {
                .enhanced-stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }

    showCompletionEffect() {
        // Add a visual completion effect
        const timerDisplay = document.getElementById('time-circle');
        timerDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            timerDisplay.style.transform = 'scale(1)';
        }, 300);
    }

    // Start app
}

// Start app
document.addEventListener('DOMContentLoaded', () => {
    window.meditationApp = new MeditationApp();
});