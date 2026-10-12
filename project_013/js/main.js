// Sistema de Reservas - JavaScript Principal

class ReservationApp {
    constructor() {
        this.selectedService = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.services = [];
        this.reservations = [];
        this.blockedDates = []; // Dates that are not available
        this.bookedSlots = {} // Object to store booked time slots by date

        this.init();
    }

    async init() {
        await this.loadServices();
        await this.loadReservations();
        this.setupCalendar();
        this.bindEvents();
        this.render();
    }

    async loadServices() {
        try {
            // In a real app, this would come from an API
            // For now, we'll use sample data
            this.services = [
                {
                    id: 1,
                    name: "Consulta de Rotina",
                    description: "Consulta médica geral para avaliação de saúde",
                    price: "R$ 150,00",
                    duration: 30 // minutes
                },
                {
                    id: 2,
                    name: "Consulta Especializada",
                    description: "Consulta com especialista em área específica",
                    price: "R$ 250,00",
                    duration: 45
                },
                {
                    id: 3,
                    name: "Procedimento Cirúrgico Menor",
                    description: "Procedimentos cirúrgicos de baixa complexidade",
                    price: "R$ 800,00",
                    duration: 60
                },
                {
                    id: 4,
                    name: "Acompanhamento Pré-Natal",
                    description: "Consultas de acompanhamento durante a gestação",
                    price: "R$ 180,00",
                    duration: 30
                }
            ];
        } catch (error) {
            console.error('Error loading services:', error);
        }
    }

    async loadReservations() {
        try {
            // In a real app, this would come from an API
            // For now, we'll use sample data or localStorage
            const stored = localStorage.getItem('reservations');
            if (stored) {
                this.reservations = JSON.parse(stored);
            } else {
                // Sample reservations for demonstration
                this.reservations = [
                    {
                        id: 1,
                        serviceId: 1,
                        date: "2026-10-15",
                        time: "14:30",
                        patientName: "João Silva",
                        contact: "(11) 99999-9999"
                    },
                    {
                        id: 2,
                        serviceId: 2,
                        date: "2026-10-16",
                        time: "09:00",
                        patientName: "Maria Oliveira",
                        contact: "(11) 88888-8888"
                    }
                ];
                this.saveReservations();
            }

            // Process reservations to create booked slots map
            this.processReservations();
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
    }

    processReservations() {
        this.bookedSlots = {};
        this.reservations.forEach(reservation => {
            const date = reservation.date;
            const time = reservation.time;

            if (!this.bookedSlots[date]) {
                this.bookedSlots[date] = [];
            }
            this.bookedSlots[date].push(time);
        });
    }

    saveReservations() {
        localStorage.setItem('reservations', JSON.stringify(this.reservations));
    }

    setupCalendar() {
        // Initialize calendar to current month
        this.currentDate = new Date();
        this.displayedMonth = this.currentDate.getMonth();
        this.displayedYear = this.currentDate.getFullYear();
        this.renderCalendar();
    }

    bindEvents() {
        // Service selection events
        document.getElementById('service-list').addEventListener('click', (e) => {
            const serviceItem = e.target.closest('.service-item');
            if (serviceItem) {
                this.selectService(serviceItem.dataset.serviceId);
            }
        });

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.navigateMonth(-1);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.navigateMonth(1);
        });

        // Confirmation button
        document.getElementById('confirm-btn').addEventListener('click', () => {
            this.confirmReservation();
        });
    }

    render() {
        this.renderServices();
        this.renderMyReservations();
    }

    renderServices() {
        const serviceList = document.getElementById('service-list');
        serviceList.innerHTML = '';

        this.services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'service-item';
            serviceItem.dataset.serviceId = service.id;
            serviceItem.innerHTML = `
                <div class="service-name">${service.name}</div>
                <div class="service-description">${service.description}</div>
                <div class="service-price">${service.price}</div>
            `;
            serviceList.appendChild(serviceItem);
        });
    }

    selectService(serviceId) {
        // Update UI
        document.querySelectorAll('.service-item').forEach(item => {
            item.classList.remove('selected');
        });
        const selectedItem = document.querySelector(`.service-item[data-service-id="${serviceId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        this.selectedService = this.services.find(s => s.id == serviceId) || null;

        // Reset date and time selection when service changes
        this.resetDateTimeSelection();

        // Enable calendar if service is selected
        if (this.selectedService) {
            document.getElementById('calendar-section').style.display = 'block';
        } else {
            document.getElementById('calendar-section').style.display = 'none';
        }
    }

    resetDateTimeSelection() {
        this.selectedDate = null;
        this.selectedTime = null;

        // Hide time and confirmation sections
        document.getElementById('time-section').style.display = 'none';
        document.getElementById('confirmation-section').style.display = 'none';

        // Clear time slots
        document.getElementById('time-slots').innerHTML = '';

        // Clear reservation details
        document.getElementById('reservation-details').innerHTML = '';

        // Reset calendar selection
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        // Add calendar header
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        const headerHTML = `
            <div class="calendar-header">
                <button id="prev-month">&#9664;</button>
                <div id="current-month">${monthNames[this.displayedMonth]} ${this.displayedYear}</div>
                <button id="next-month">&#9654;</button>
            </div>

            <div class="calendar-header">
                <div>Dom</div>
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sáb</div>
            </div>
        `;

        calendar.innerHTML = headerHTML;

        // Update month display
        document.getElementById('current-month').textContent = `${monthNames[this.displayedMonth]} ${this.displayedYear}`;

        // Get first day of the month
        const firstDay = new Date(this.displayedYear, this.displayedMonth, 1);
        const daysInMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0).getDate();

        // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
        const startingDay = firstDay.getDay();

        // Add empty cells for days before the 1st
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            calendar.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.date = `${this.displayedYear}-${String(this.displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            const dayDate = document.createElement('div');
            dayDate.className = 'day-date';
            const dateObj = new Date(this.displayedYear, this.displayedMonth, day);
            dayDate.textContent = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
            dayElement.appendChild(dayDate);

            // Mark today
            const today = new Date();
            if (dateObj.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Mark blocked dates (past dates, for example)
            if (dateObj < today) {
                dayElement.classList.add('disabled');
                dayElement.title = "Data não disponível";
            } else {
                // Check if date has events
                const dateKey = `${this.displayedYear}-${String(this.displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (this.bookedSlots[dateKey] && this.bookedSlots[dateKey].length > 0) {
                    const eventsDiv = document.createElement('div');
                    eventsDiv.className = 'day-events';
                    eventsDiv.textContent = `${this.bookedSlots[dateKey].length} reservas`;
                    dayElement.appendChild(eventsDiv);
                }
            }

            // Add click handler for available dates
            if (!dayElement.classList.contains('disabled')) {
                dayElement.addEventListener('click', () => {
                    this.selectDate(dayElement);
                });
            }

            calendar.appendChild(dayElement);
        }
    }

    navigateMonth(direction) {
        this.displayedMonth += direction;

        // Adjust year if needed
        if (this.displayedMonth < 0) {
            this.displayedMonth = 11;
            this.displayedYear--;
        } else if (this.displayedMonth > 11) {
            this.displayedMonth = 0;
            this.displayedYear++;
        }

        this.renderCalendar();
    }

    selectDate(dayElement) {
        // Update UI
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        dayElement.classList.add('selected');

        this.selectedDate = dayElement.dataset.date;

        // Show time section
        document.getElementById('time-section').style.display = 'block';
        this.renderTimeSlots();
    }

    renderTimeSlots() {
        const timeSlots = document.getElementById('time-slots');
        timeSlots.innerHTML = '';

        if (!this.selectedService || !this.selectedDate) return;

        // Generate time slots for the day (9 AM to 5 PM, 30-minute intervals)
        const startHour = 9;
        const endHour = 17;
        const interval = 30; // minutes

        const bookedTimes = this.bookedSlots[this.selectedDate] || [];

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.dataset.time = time;

                const label = document.createElement('div');
                label.className = 'time-slot-label';
                label.textContent = time;
                timeSlot.appendChild(label);

                const status = document.createElement('div');
                status.className = 'time-slot-status';

                if (bookedTimes.includes(time)) {
                    timeSlot.classList.add('booked');
                    status.textContent = "Indisponível";
                    timeSlot.title = "Horário já reservado";
                } else {
                    timeSlot.classList.add('available');
                    status.textContent = "Disponível";
                    timeSlot.addEventListener('click', () => {
                        this.selectTime(timeSlot);
                    });
                }

                timeSlot.appendChild(status);
                timeSlots.appendChild(timeSlot);
            }
        }
    }

    selectTime(timeSlot) {
        // Update UI
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        timeSlot.classList.add('selected');

        this.selectedTime = timeSlot.dataset.time;

        // Show confirmation section
        document.getElementById('confirmation-section').style.display = 'block';
        this.renderReservationDetails();
    }

    renderReservationDetails() {
        const details = document.getElementById('reservation-details');
        if (!this.selectedService || !this.selectedDate || !this.selectedTime) {
            details.innerHTML = '';
            return;
        }

        const service = this.selectedService;
        const date = new Date(this.selectedDate);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        details.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Serviço:</span>
                <span class="detail-value">${service.name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Data:</span>
                <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Horário:</span>
                <span class="detail-value">${this.selectedTime}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Duração:</span>
                <span class="detail-value">${service.duration} minutos</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Valor:</span>
                <span class="detail-value">${service.price}</span>
            </div>
        `;
    }

    confirmReservation() {
        if (!this.selectedService || !this.selectedDate || !this.selectedTime) {
            alert("Por favor, selecione um serviço, data e horário antes de confirmar.");
            return;
        }

        // In a real app, we would collect patient information here
        // For now, we'll use placeholder data
        const newReservation = {
            id: this.reservations.length > 0 ? Math.max(...this.reservations.map(r => r.id)) + 1 : 1,
            serviceId: this.selectedService.id,
            date: this.selectedDate,
            time: this.selectedTime,
            patientName: "Paciente Exemplo",
            contact: "(11) 99999-9999"
        };

        this.reservations.push(newReservation);
        this.saveReservations();
        this.processReservations();

        // Show success message
        alert("Reserva confirmada com sucesso!");

        // Reset form
        this.resetForm();
    }

    resetForm() {
        this.selectedService = null;
        this.selectedDate = null;
        this.selectedTime = null;

        // Reset UI
        document.querySelectorAll('.service-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });

        document.getElementById('service-list').querySelector('.service-item.selected')?.classList.remove('selected');
        document.getElementById('calendar-section').style.display = 'none';
        document.getElementById('time-section').style.display = 'none';
        document.getElementById('confirmation-section').style.display = 'none';

        document.getElementById('reservation-details').innerHTML = '';
        document.getElementById('time-slots').innerHTML = '';

        this.renderMyReservations();
    }

    renderMyReservations() {
        const myReservations = document.getElementById('my-reservations');
        myReservations.innerHTML = '';

        // Show last 5 reservations
        const recentReservations = [...this.reservations].sort((a, b) =>
            new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time)
        ).slice(0, 5);

        if (recentReservations.length === 0) {
            myReservations.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
            return;
        }

        recentReservations.forEach(reservation => {
            const service = this.services.find(s => s.id == reservation.serviceId);
            const date = new Date(reservation.date);
            const formattedDate = date.toLocaleDateString('pt-BR');

            const reservationItem = document.createElement('div');
            reservationItem.className = 'reservation-item';
            reservationItem.innerHTML = `
                <div class="reservation-date">${formattedDate}</div>
                <div class="reservation-time">${reservation.time}</div>
                <div class="reservation-service">${service ? service.name : 'Serviço desconhecido'}</div>
                <div class="reservation-patient">${reservation.patientName}</div>
            `;

            myReservations.appendChild(reservationItem);
        });
    }
}

// Initialize the reservation app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReservationApp();
});