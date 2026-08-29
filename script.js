// Anonymous Avatars by Gender
const AVATARS = {
    default: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2327272a'/><circle cx='50' cy='40' r='18' fill='%23a1a1aa'/><path d='M24 84 C24 65 36 58 50 58 C64 58 76 65 76 84 Z' fill='%23a1a1aa'/></svg>",
    erkek: "erkek_avatar.png",
    kadin: "kadin_avatar.png",
    diger: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2327272a'/><circle cx='50' cy='40' r='18' fill='%23a1a1aa'/><path d='M24 84 C24 65 36 58 50 58 C64 58 76 65 76 84 Z' fill='%23a1a1aa'/></svg>"
};

let isLoggedIn = false;
let currentUser = {
    name: 'Misafir',
    email: '',
    gender: 'default',
    role: 'Giriş Yapmadınız'
};
let isLightTheme = false;

const programsData = {
    1: {
        title: "Kapsül Rota Gelişim",
        description: "Katılımcıların teknoloji okuryazarlığı, algoritmik düşünme, yapay zeka ve temel yazılım gelişim süreçlerini destekleyen bütüncül bir eğitim modelidir.",
        dateTime: "Pazartesi & Çarşamba, 18:30 - 21:30",
        instructor: "Dr. Ahmet Yılmaz & Mentör Kadrosu",
        capacity: "120 Kişi (Kalan Kontenjan: 12)",
        status: "Aktif"
    },
    2: {
        title: "Akıllı Şehirler Lab",
        description: "IoT, gömülü sistemler, mikrodenetleyiciler ve sensör ağları üzerine odaklanan uygulamalı laboratuvar çalışmasıdır.",
        dateTime: "Salı & Perşembe, 14:00 - 17:00",
        instructor: "Müh. Mehmet Demir",
        capacity: "30 Kişi (Kalan Kontenjan: Dolu)",
        status: "Dolu"
    },
    3: {
        title: "BİSTLAB (Fintek)",
        description: "Borsa İstanbul iş birliğiyle finansal okuryazarlık, finansal teknolojiler, blockchain, algoritmik ticaret ve veri analitiği üzerine kurgulanmış ileri seviye laboratuvardır.",
        dateTime: "Cuma, 10:00 - 16:00",
        instructor: "Doç. Dr. Elif Kaya",
        capacity: "50 Kişi (Kalan Kontenjan: 8)",
        status: "Aktif"
    },
    4: {
        title: "Tasarım Lab",
        description: "UI/UX tasarımı, endüstriyel tasarım, tasarım odaklı düşünme ve yaratıcı süreçlerin ele alındığı programdır.",
        dateTime: "Cumartesi, 11:00 - 15:00",
        instructor: "Tasarımcı Sibel Can",
        capacity: "40 Kişi (Kalan Kontenjan: 15)",
        status: "Gelecek Program"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAccordion();
    initThemeToggle();
    initNotificationToggle();
    initSearch();
});

function showToast(message, icon = "fa-info-circle") {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const requiresAuth = item.getAttribute('data-auth') === 'required';
            
            if (requiresAuth && !isLoggedIn) {
                showAuthRequiredModal();
                return;
            }
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            viewSections.forEach(view => {
                view.classList.remove('active');
                view.classList.add('hidden');
            });
            const targetId = item.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.remove('hidden');
                setTimeout(() => targetView.classList.add('active'), 10);
            }
        });
    });

    viewSections.forEach(view => {
        if(view.id !== 'dashboard') {
            view.classList.add('hidden');
            view.classList.remove('active');
        }
    });
}

function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('active');
        });
    });
}

function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            isLightTheme = !isLightTheme;
            if (isLightTheme) {
                document.body.classList.add('light-theme');
                themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
                showToast("Açık tema aktif edildi.", "fa-sun");
            } else {
                document.body.classList.remove('light-theme');
                themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                showToast("Koyu tema aktif edildi.", "fa-moon");
            }
        });
    }
}

function initNotificationToggle() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let dropdown = document.querySelector('.notification-dropdown');
            if (dropdown) {
                dropdown.remove();
                return;
            }
            dropdown = document.createElement('div');
            dropdown.className = 'notification-dropdown glass-panel';
            dropdown.innerHTML = `
                <div class="notification-header">
                    <h4>Bildirimler</h4>
                    <span class="notification-count">3 Yeni</span>
                </div>
                <div class="notification-list">
                    <div class="notification-item unread">
                        <div class="notification-icon"><i class="fa-solid fa-bullhorn"></i></div>
                        <div class="notification-content">
                            <p><strong>TEKNOFEST 2026</strong> başvuruları başladı!</p>
                            <span class="notification-time">2 saat önce</span>
                        </div>
                    </div>
                    <div class="notification-item unread">
                        <div class="notification-icon"><i class="fa-solid fa-award"></i></div>
                        <div class="notification-content">
                            <p><strong>Rota Gelişim Programı</strong> devam durumu güncellendi.</p>
                            <span class="notification-time">1 gün önce</span>
                        </div>
                    </div>
                    <div class="notification-item">
                        <div class="notification-icon"><i class="fa-solid fa-calendar-check"></i></div>
                        <div class="notification-content">
                            <p>Yapay Zeka ve Veri Bilimi eğitimi bugün saat 14:00'te.</p>
                            <span class="notification-time">3 gün önce</span>
                        </div>
                    </div>
                </div>
                <div class="notification-footer">
                    <button onclick="markAllNotificationsRead()">Tümünü Okundu İşaretle</button>
                </div>
            `;
            document.body.appendChild(dropdown);
            document.addEventListener('click', closeDropdownOutside);
        });
    }
}

function closeDropdownOutside(e) {
    const dropdown = document.querySelector('.notification-dropdown');
    const notificationBtn = document.getElementById('notificationBtn');
    if (dropdown && !dropdown.contains(e.target) && e.target !== notificationBtn) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdownOutside);
    }
}

function markAllNotificationsRead() {
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
        item.classList.add('read');
    });
    const badge = document.querySelector('#notificationBtn .badge');
    if (badge) badge.remove();
    showToast("Tüm bildirimler okundu işaretlendi.", "fa-check");
}

function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            console.log("Aranan:", e.target.value);
        });
    }
}

// ============ AUTH MODAL ============

function showLoginModal() {
    document.getElementById('authModal').classList.remove('hidden');
    switchAuthForm('login');
}

function showRegisterModal() {
    document.getElementById('authModal').classList.remove('hidden');
    switchAuthForm('register');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function switchAuthForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('authModalTitle');
    
    if (formType === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        title.textContent = 'Giriş Yap';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        title.textContent = 'Kayıt Ol';
    }
}

function showAuthRequiredModal() {
    document.getElementById('authRequiredModal').classList.remove('hidden');
}

function closeAuthRequiredModal() {
    document.getElementById('authRequiredModal').classList.add('hidden');
}

function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    
    isLoggedIn = true;
    currentUser.name = email.split('@')[0];
    currentUser.role = "Kapsül Akademisyeni";
    
    updateUIForAuth();
    closeAuthModal();
    showToast(`Hoş geldin, ${currentUser.name}!`, "fa-right-to-bracket");
}

function registerUser() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    
    if (password.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır.');
        return;
    }
    
    isLoggedIn = true;
    currentUser.name = name;
    currentUser.role = "Kapsül Öğrencisi";
    
    updateUIForAuth();
    closeAuthModal();
    showToast(`Kayıt tamamlandı. Hoş geldiniz, ${name}!`, "fa-user-plus");
}

function updateUIForAuth() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userButtons').style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userRoleDisplay').textContent = currentUser.role;
    document.getElementById('welcomeUser').textContent = currentUser.name;
    document.getElementById('attendanceStat').textContent = '%85';
    document.getElementById('attendanceMessage').textContent = 'Sertifika için yeterli seviyedesiniz.';
}

function logoutUser() {
    isLoggedIn = false;
    currentUser = { name: 'Misafir', email: '', gender: 'default', role: 'Giriş Yapmadınız' };
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userButtons').style.display = 'none';
    document.getElementById('userNameDisplay').textContent = 'Misafir';
    document.getElementById('userRoleDisplay').textContent = 'Giriş Yapmadınız';
    document.getElementById('welcomeUser').textContent = 'Kapsüllü!';
    document.getElementById('attendanceStat').textContent = '%0';
    document.getElementById('attendanceMessage').textContent = 'Sertifika için giriş yapın.';
    showToast("Çıkış yapıldı.", "fa-right-from-bracket");
}

// ============ PROGRAM MODAL ============

function showProgramDetails(programId) {
    const data = programsData[programId];
    if (!data) return;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalDescription').textContent = data.description;
    document.getElementById('modalDateTime').textContent = data.dateTime;
    document.getElementById('modalInstructor').textContent = data.instructor;
    document.getElementById('modalCapacity').textContent = data.capacity;
    document.getElementById('programModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('programModal').classList.add('hidden');
}

function applyToProgram() {
    const title = document.getElementById('modalTitle').textContent;
    closeModal();
    showToast(`"${title}" programına başvurunuz alındı!`, "fa-paper-plane");
}

// ============ ATTENDANCE ============

function checkAttendance() {
    const input = document.getElementById('studentIdInput').value.trim().toUpperCase();
    const resultDiv = document.getElementById('attendanceResult');
    if (input === '') {
        alert('Lütfen geçerli bir numara girin. Örn: K-1024');
        return;
    }
    resultDiv.classList.remove('hidden');
    const percentageEl = document.getElementById('attendancePercentage');
    const circle = document.getElementById('progressCircle');
    let percentage = input === 'K-1024' ? 85 : input === 'K-2048' ? 95 : Math.floor(Math.random() * 40) + 60;
    let current = 0;
    const interval = setInterval(() => {
        if (current >= percentage) {
            clearInterval(interval);
        } else {
            current++;
            percentageEl.textContent = `%${current}`;
        }
    }, 15);
    const circumference = 314;
    const offset = circumference - (percentage / 100) * circumference;
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
}

// ============ CERTIFICATE ============

function generateCertificate() {
    const name = document.getElementById('certNameInput').value.trim();
    const program = document.getElementById('certProgramSelect').value;
    if (name === '') {
        alert('Lütfen adınızı girin.');
        return;
    }
    document.getElementById('certNameDisplay').textContent = name;
    document.getElementById('certProgramDisplay').textContent = program;
    document.getElementById('certificatePreview').classList.remove('hidden');
}

// ============ CHATBOT ============

function toggleChat() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        document.getElementById('chatInput').focus();
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChipMessage(text) {
    appendMessage(text, 'user');
    processBotResponse(text);
}

function sendChatMessage() {
    const inputField = document.getElementById('chatInput');
    const text = inputField.value.trim();
    if (text === '') return;
    appendMessage(text, 'user');
    inputField.value = '';
    processBotResponse(text);
}

function appendMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);
    const chips = messagesContainer.querySelector('.chat-chips');
    if (chips) {
        messagesContainer.insertBefore(messageDiv, chips);
    } else {
        messagesContainer.appendChild(messageDiv);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    const chips = messagesContainer.querySelector('.chat-chips');
    if (chips) {
        messagesContainer.insertBefore(typingDiv, chips);
    } else {
        messagesContainer.appendChild(typingDiv);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
}

function getFallbackResponse(userText) {
    const text = userText.toLowerCase();
    if (text.includes('merhaba') || text.includes('selam')) {
        return 'Merhaba! Size nasıl yardımcı olabilirim?';
    } else if (text.includes('devamsızlık') || text.includes('katılım')) {
        return 'Katılım durumunuzu sol menüden sorgulayabilirsiniz.';
    } else if (text.includes('sertifika')) {
        return 'Sertifika için %80 devam zorunluluğu var.';
    } else {
        return 'Detaylı bilgi için iletisim@kapsul.org.tr adresine mail atabilirsiniz.';
    }
}

async function processBotResponse(userText) {
    console.log('Mesaj gönderiliyor:', userText);
    showTypingIndicator();
    
    try {
        const response = await fetch('https://kapsul-site.onrender.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userText
            })
        });

        const data = await response.json();
        console.log('Backend cevabı:', data);
        
        removeTypingIndicator();
        
        if (data.reply) {
            appendMessage(data.reply, 'bot');
        } else {
            appendMessage(getFallbackResponse(userText), 'bot');
        }

    } catch (error) {
        console.error('Hata:', error);
        removeTypingIndicator();
        appendMessage(getFallbackResponse(userText), 'bot');
    }
}