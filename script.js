document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAccordion();
    initSearchFunctionality();
    initNotificationSystem();
    initThemeToggle();
    initAuthSystem();
});

// ========================================
// ===== AVATAR =====
// ========================================
function getRandomAvatar() {
    const randomId = Math.floor(Math.random() * 70) + 1;
    return `https://i.pravatar.cc/150?img=${randomId}`;
}

// ========================================
// ===== AUTH SİSTEMİ (ÇOKLU KULLANICI) =====
// ========================================
let currentUser = null;

function getUsers() {
    const users = localStorage.getItem('kapsulUsers');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('kapsulUsers', JSON.stringify(users));
}

function initAuthSystem() {
    const savedUser = localStorage.getItem('kapsulCurrentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
        } catch (e) {
            localStorage.removeItem('kapsulCurrentUser');
        }
    }
}

function updateUIForLoggedInUser() {
    if (!currentUser) return;

    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userButtons').style.display = 'flex';

    document.getElementById('userNameDisplay').textContent = currentUser.name || 'Kullanıcı';
    document.getElementById('userRoleDisplay').textContent = `ID: ${currentUser.userId || 'K-0000'}`;
   

    const welcomeEl = document.getElementById('welcomeUser');
    if (welcomeEl) welcomeEl.textContent = currentUser.name || 'Kapsüllü!';

    const attendanceStat = document.getElementById('attendanceStat');
    const attendanceMsg = document.getElementById('attendanceMessage');
    if (attendanceStat) {
        const randomAttendance = Math.floor(Math.random() * 30) + 65;
        attendanceStat.textContent = `%${randomAttendance}`;
        if (attendanceMsg) {
            if (randomAttendance >= 80) {
                attendanceMsg.textContent = '✅ Sertifika için yeterli seviyedesiniz!';
            } else {
                attendanceMsg.textContent = `⚠️ Sertifika için %${80 - randomAttendance} daha katılım gerekli.`;
            }
        }
    }

    showToast(`Hoş geldin ${currentUser.name}!`, 'success');
}

function showLoginModal() {
    document.getElementById('authModalTitle').textContent = 'Giriş Yap';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('authModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function showRegisterModal() {
    document.getElementById('authModalTitle').textContent = 'Kayıt Ol';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function switchAuthForm(form) {
    if (form === 'login') {
        document.getElementById('authModalTitle').textContent = 'Giriş Yap';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('authModalTitle').textContent = 'Kayıt Ol';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
}

// ===== KAYIT OL (ÇOKLU KULLANICI) =====
function registerUser() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!name || !email || !password) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalı!', 'error');
        return;
    }

    // Kullanıcı listesini al
    let users = getUsers();
    
    // Aynı e-posta ile kayıtlı kullanıcı var mı kontrol et
    if (users.some(u => u.email === email)) {
        showToast('❌ Bu e-posta ile zaten kayıt yapılmış!', 'error');
        return;
    }

    const userId = 'K-' + String(Math.floor(Math.random() * 9000) + 1000);
    const newUser = {
        userId: userId,
        name: name,
        email: email,
        password: password,
        avatar: getRandomAvatar(),
        registeredAt: new Date().toISOString()
    };

    // Kullanıcıyı listeye ekle
    users.push(newUser);
    saveUsers(users);
    
    // Oturum aç
    currentUser = newUser;
    localStorage.setItem('kapsulCurrentUser', JSON.stringify(newUser));
    
    closeAuthModal();
    updateUIForLoggedInUser();
    showToast(`✅ Hesabınız başarıyla oluşturuldu! Kullanıcı ID: ${userId}`, 'success');
}

// ===== GİRİŞ YAP (ÇOKLU KULLANICI) =====
function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        showToast('Lütfen e-posta ve şifrenizi girin!', 'error');
        return;
    }

    const users = getUsers();
    if (users.length === 0) {
        showToast('❌ Kayıtlı hesap bulunamadı. Lütfen önce kayıt olun.', 'error');
        return;
    }

    // Kullanıcıyı bul
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('kapsulCurrentUser', JSON.stringify(foundUser));
        closeAuthModal();
        updateUIForLoggedInUser();
        showToast(`✅ Giriş başarılı! Hoş geldin ${foundUser.name}`, 'success');
    } else {
        showToast('❌ E-posta veya şifre hatalı!', 'error');
    }
}

// ===== ÇIKIŞ YAP =====
function logoutUser() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        currentUser = null;
        localStorage.removeItem('kapsulCurrentUser');
        
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userButtons').style.display = 'none';
        
        document.getElementById('userNameDisplay').textContent = 'Misafir';
        document.getElementById('userRoleDisplay').textContent = 'Giriş Yapmadınız';
        document.getElementById('userAvatar').src = 'https://i.pravatar.cc/150?img=11';
        
        document.getElementById('welcomeUser').textContent = 'Kapsüllü!';
        
        showToast('👋 Çıkış yapıldı.', 'info');
    }
}

function checkAuthRequired() {
    if (!currentUser) {
        document.getElementById('authRequiredModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        return false;
    }
    return true;
}

function closeAuthRequiredModal() {
    document.getElementById('authRequiredModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ========================================
// ===== NAVIGASYON =====
// ========================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.auth === 'required') {
                if (!checkAuthRequired()) {
                    return;
                }
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
                setTimeout(() => {
                    targetView.classList.add('active');
                }, 10);
            }
        });
    });

    viewSections.forEach(view => {
        if (view.id !== 'dashboard') {
            view.classList.add('hidden');
        }
    });
}

// ========================================
// ===== ACCORDION =====
// ========================================
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });
}

// ========================================
// ===== SEARCH =====
// ========================================
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) return;

            const programCards = document.querySelectorAll('.program-card');
            programCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'flex';
                    card.classList.add('highlight-animation');
                    setTimeout(() => card.classList.remove('highlight-animation'), 2000);
                } else {
                    card.style.display = 'none';
                }
            });

            const faqItems = document.querySelectorAll('.accordion-item');
            faqItems.forEach(item => {
                const header = item.querySelector('.accordion-header')?.textContent.toLowerCase() || '';
                const content = item.querySelector('.accordion-content p')?.textContent.toLowerCase() || '';
                if (header.includes(query) || content.includes(query)) {
                    item.style.display = 'block';
                    item.classList.add('highlight-animation');
                    setTimeout(() => item.classList.remove('highlight-animation'), 2000);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// ========================================
// ===== BİLDİRİMLER =====
// ========================================
function initNotificationSystem() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const existingDropdown = document.querySelector('.notification-dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
                return;
            }
            const dropdown = document.createElement('div');
            dropdown.className = 'notification-dropdown glass-panel';
            dropdown.innerHTML = `
                <div class="notification-header">
                    <h4>Bildirimler</h4>
                    <span class="notification-count">3 Yeni</span>
                </div>
                <div class="notification-list">
                    <div class="notification-item unread">
                        <div class="notification-icon"><i class="fa-solid fa-calendar-check"></i></div>
                        <div class="notification-content">
                            <p><strong>Yeni Eğitim:</strong> Yapay Zeka ve Veri Bilimi</p>
                            <span class="notification-time">Bugün, 14:00</span>
                        </div>
                    </div>
                    <div class="notification-item unread">
                        <div class="notification-icon"><i class="fa-solid fa-certificate"></i></div>
                        <div class="notification-content">
                            <p><strong>Sertifika Hatırlatması:</strong> Devamsızlık sınırına yaklaşıyorsun</p>
                            <span class="notification-time">2 saat önce</span>
                        </div>
                    </div>
                    <div class="notification-item unread">
                        <div class="notification-icon"><i class="fa-solid fa-trophy"></i></div>
                        <div class="notification-content">
                            <p><strong>TEKNOFEST:</strong> Başvurular başladı!</p>
                            <span class="notification-time">1 gün önce</span>
                        </div>
                    </div>
                </div>
                <div class="notification-footer">
                    <button onclick="markAllNotificationsRead()">Tümünü Okundu İşaretle</button>
                </div>
            `;
            document.body.appendChild(dropdown);
            const badge = notificationBtn.querySelector('.badge');
            if (badge) badge.style.display = 'none';
        });
        document.addEventListener('click', (e) => {
            if (!notificationBtn.contains(e.target)) {
                const dropdown = document.querySelector('.notification-dropdown');
                if (dropdown) dropdown.remove();
            }
        });
    }
}
function markAllNotificationsRead() {
    const items = document.querySelectorAll('.notification-item');
    items.forEach(item => {
        item.classList.remove('unread');
        item.classList.add('read');
    });
    showToast('Tüm bildirimler okundu olarak işaretlendi', 'success');
    setTimeout(() => {
        const dropdown = document.querySelector('.notification-dropdown');
        if (dropdown) dropdown.remove();
    }, 500);
}

// ========================================
// ===== TEMA =====
// ========================================
function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeBtn?.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            if (themeIcon) {
                if (isLight) {
                    themeIcon.className = 'fa-solid fa-moon';
                    showToast('🌙 Koyu temaya geçildi');
                } else {
                    themeIcon.className = 'fa-solid fa-sun';
                    showToast('☀️ Aydınlık temaya geçildi');
                }
            }
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
}

// ========================================
// ===== KATILIM =====
// ========================================
function checkAttendance() {
    if (!checkAuthRequired()) return;
    const input = document.getElementById('studentIdInput').value.trim().toUpperCase();
    const resultDiv = document.getElementById('attendanceResult');
    if (input === '') {
        showToast('Lütfen geçerli bir Kapsül / Öğrenci numarası girin');
        return;
    }
    resultDiv.classList.remove('hidden');
    const percentageEl = document.getElementById('attendancePercentage');
    const circle = document.getElementById('progressCircle');
    let percentage = 0;
    if (input === 'K-1024') percentage = 85;
    else if (input === 'K-2048') percentage = 95;
    else percentage = Math.floor(Math.random() * 40) + 60;

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
    showToast(`Katılım oranınız: %${percentage}`);
}

// ========================================
// ===== SERTİFİKA =====
// ========================================
function generateCertificate() {
    if (!checkAuthRequired()) return;
    const name = document.getElementById('certNameInput').value.trim();
    const program = document.getElementById('certProgramSelect').value;
    if (name === '') {
        showToast('Lütfen sertifika üzerinde yazacak adınızı girin');
        return;
    }
    const preview = document.getElementById('certificatePreview');
    document.getElementById('certNameDisplay').textContent = name;
    document.getElementById('certProgramDisplay').textContent = program;
    preview.classList.remove('hidden');
    preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Sertifikanız başarıyla oluşturuldu!', 'success');
}

// ========================================
// ===== PROGRAM DETAY =====
// ========================================
const programData = {
    1: {
        id: 1,
        baslik: "Kapsül Rota Gelişim",
        aciklama: "Yazılım, algoritma ve teknoloji okuryazarlığı temel eğitimleri.",
        tarih: "15 Kasım 2026",
        saat: "19:00 - 21:00",
        egitmen: "Dr. Ahmet Yılmaz",
        kontenjan: "30 / 30",
        durum: "active"
    },
    2: {
        id: 2,
        baslik: "Akıllı Şehirler Lab",
        aciklama: "IoT, gömülü sistemler ve sensör ağları üzerine uygulamalı çalışmalar.",
        tarih: "20 Kasım 2026",
        saat: "18:00 - 20:00",
        egitmen: "Merve Demir",
        kontenjan: "25 / 30",
        durum: "active"
    },
    3: {
        id: 3,
        baslik: "BİSTLAB (Fintek)",
        aciklama: "Finansal teknolojiler, blockchain ve veri analizi laboratuvarı.",
        tarih: "25 Kasım 2026",
        saat: "20:00 - 22:00",
        egitmen: "Ali Kaya",
        kontenjan: "40 / 40",
        durum: "full"
    },
    4: {
        id: 4,
        baslik: "Tasarım Lab",
        aciklama: "UI/UX, endüstriyel tasarım ve yaratıcı süreçler laboratuvarı.",
        tarih: "30 Kasım 2026",
        saat: "19:00 - 21:00",
        egitmen: "Zeynep Şahin",
        kontenjan: "20 / 25",
        durum: "upcoming"
    }
};

function showProgramDetails(programId) {
    const program = programData[programId];
    if (!program) {
        showToast('Program bilgisi bulunamadı!', 'error');
        return;
    }
    document.getElementById('modalTitle').textContent = program.baslik;
    document.getElementById('modalDescription').textContent = program.aciklama;
    document.getElementById('modalDateTime').textContent = `${program.tarih} | ${program.saat}`;
    document.getElementById('modalInstructor').textContent = program.egitmen;
    document.getElementById('modalCapacity').textContent = program.kontenjan;

    const statusBadge = document.querySelector('#modalStatus .status-badge');
    if (statusBadge) {
        if (program.durum === 'active') {
            statusBadge.textContent = '✅ Aktif';
            statusBadge.className = 'status-badge status-active';
        } else if (program.durum === 'upcoming') {
            statusBadge.textContent = '⏳ Yakında';
            statusBadge.className = 'status-badge status-upcoming';
        } else if (program.durum === 'full') {
            statusBadge.textContent = '🔴 Dolu';
            statusBadge.className = 'status-badge status-full';
        }
    }
    document.getElementById('programModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('programModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}
document.addEventListener('click', (e) => {
    const modal = document.getElementById('programModal');
    if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

function applyToProgram() {
    const programTitle = document.getElementById('modalTitle').textContent;
    showToast(`✅ "${programTitle}" programına başvurunuz alındı!`, 'success');
    closeModal();
}

// ========================================
// ===== CHATBOT =====
// ========================================
function toggleChat() {
    const chatWindow = document.getElementById('chatbotWindow');
    const isClosing = !chatWindow.classList.contains('hidden');
    chatWindow.classList.toggle('hidden');
    if (isClosing) {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="message bot-message">
                <p>Merhaba! Ben Kapsül Dijital Asistanı. Eğitimler, takvim, devamsızlık durumu veya sertifikalar hakkında sana nasıl yardımcı olabilirim?</p>
            </div>
            <div class="chat-chips">
                <span class="chip" onclick="sendChipMessage('Devamsızlığımı nasıl öğrenirim?')">Devamsızlığımı öğren</span>
                <span class="chip" onclick="sendChipMessage('Sertifika şartları nelerdir?')">Sertifika şartları</span>
                <span class="chip" onclick="sendChipMessage('Eğitim takvimi')">Eğitim takvimi</span>
            </div>
        `;
    } else {
        document.getElementById('chatInput').focus();
    }
}
function handleChatKeyPress(event) {
    if (event.key === 'Enter') sendChatMessage();
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
    if (chips) messagesContainer.insertBefore(messageDiv, chips);
    else messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
async function processBotResponse(userText) {
    showTypingIndicator();
    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        const data = await response.json();
        removeTypingIndicator();
        if (response.ok && data.reply) {
            appendMessage(data.reply, 'bot');
        } else {
            appendMessage(getFallbackResponse(userText), 'bot');
            showToast('AI servisi şu anda yoğun, temel yanıtlar veriliyor.');
        }
    } catch (error) {
        console.error('Chat hatası:', error);
        removeTypingIndicator();
        appendMessage(getFallbackResponse(userText), 'bot');
        showToast('Bağlantı hatası! Temel yanıtlar veriliyor.');
    }
}
function getFallbackResponse(userText) {
    const text = userText.toLowerCase();
    if (text.includes('merhaba') || text.includes('selam')) return 'Merhaba! 👋 Kapsül Asistan\'a hoş geldin. Sana nasıl yardımcı olabilirim?';
    else if (text.includes('devamsızlık') || text.includes('katılım')) return '📊 Katılım durumunu sorgulamak için sol menüden "Katılım Durumu" sekmesine gidebilirsin.';
    else if (text.includes('sertifika')) return '📜 Sertifika alabilmek için %80 devam zorunluluğu var.';
    else if (text.includes('takvim') || text.includes('eğitim ne zaman')) return '📅 Tüm eğitimleri "Eğitim Takvimi" sekmesinden görebilirsin.';
    else if (text.includes('program') || text.includes('eğitim')) return '🎓 Kapsül Rota Gelişim, BİSTLAB, Akıllı Şehirler Lab ve Tasarım Lab programlarımız var.';
    else if (text.includes('teknofest')) return '🏆 TEKNOFEST takımlarına katılmak için Terminal Çağrı Programı\'na başvurabilirsin.';
    else if (text.includes('iletişim') || text.includes('randevu')) return '📞 Bize iletisim@kapsul.org.tr adresinden ulaşabilirsin.';
    else if (text.includes('teşekkür') || text.includes('sağol')) return 'Rica ederim! 😊 Başka bir konuda yardımcı olabilir miyim?';
    else return 'ℹ️ Bu konuda detaylı bilgi için iletisim@kapsul.org.tr adresine mail atabilirsin.';
}
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    const chips = messagesContainer.querySelector('.chat-chips');
    if (chips) messagesContainer.insertBefore(typingDiv, chips);
    else messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
}
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = document.createElement('i');
    if (type === 'success') icon.className = 'fa-solid fa-check-circle';
    else if (type === 'error') icon.className = 'fa-solid fa-exclamation-circle';
    else icon.className = 'fa-solid fa-info-circle';
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(message));
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// ===== ÇIKIŞ BUTONU =====
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
});