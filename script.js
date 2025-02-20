// Flatpickr Initialization
document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#birthdate", {
        dateFormat: "Y-m-d",
        maxDate: "today",
        locale: {
            firstDayOfWeek: 1
        }
    });
});

// Event listener untuk input tanggal lahir
document.getElementById("birthdate").addEventListener("change", function () {
    const selectedDate = luxon.DateTime.fromISO(this.value);
    convertToHijri(selectedDate).then(hijriDate => {
        document.getElementById("birthHijri").value = hijriDate;
    });
});

// Dark Mode Management
let isDarkMode = false;

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    
    const elementsToToggle = document.querySelectorAll(
        '.calculator-container, h2, label, .flatpickr-input, ' +
        '.theme-toggle, #result, .error, .zodiac-card, ' +
        '.flatpickr-calendar, .flatpickr-months, .flatpickr-weekdays, ' +
        '.flatpickr-day, #birthHijri, label[for="birthHijri"], #footer'
    );
    
    elementsToToggle.forEach(element => {
        if (element) element.classList.toggle('dark-mode');
    });
    
    localStorage.setItem('darkMode', isDarkMode);
}

document.addEventListener('DOMContentLoaded', function() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) toggleDarkMode();
});

// Confetti Animation
function showConfetti() {
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#feca57', '#74ebd5'],
        startVelocity: 30,
        gravity: 0.8,
        scalar: 0.9
    });
}

// Click Sound Effect
function playClickSound() {
    const audio = new Audio('https://www.myinstants.com/media/sounds/button-16.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed:", e));
}

// Convert to Hijriah
async function convertToHijri(gregorianDate) {
    const year = gregorianDate.year;
    const month = gregorianDate.month;
    const day = gregorianDate.day;

    try {
        const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`);
        const data = await response.json();
        const hijri = data.data.hijri;
        return `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
    } catch (error) {
        console.error("Error fetching Hijri date:", error);
        return "Periksa koneksi internet Anda.";
    }
}

// Age Calculation
function calculateAge() {
    const birthdateInput = document.getElementById("birthdate").value;
    const errorDiv = document.getElementById("error");
    const resultDiv = document.getElementById("result");
    const loadingSpinner = document.getElementById("loading");

    errorDiv.textContent = "";
    resultDiv.style.display = "none";
    loadingSpinner.style.display = "block";

    setTimeout(() => {
        try {
            if (!birthdateInput) throw new Error("Silakan pilih tanggal lahir Anda.");

            const birthDate = luxon.DateTime.fromISO(birthdateInput);
            const now = luxon.DateTime.now();

            if (!birthDate.isValid) throw new Error("Format tanggal lahir tidak valid.");
            if (birthDate > now) throw new Error("Tanggal lahir tidak boleh di masa depan.");

            const ageInYears = now.diff(birthDate, 'years').years;
            if (ageInYears < 0) throw new Error("Usia minimal harus 1 tahun.");

            const diff = now.diff(birthDate, ["years", "months", "days"]);
            const years = Math.floor(diff.years);
            const months = Math.floor(diff.months);
            const days = Math.floor(diff.days);
            const totalMonths = Math.floor(now.diff(birthDate, 'months').months);
            const totalDays = Math.floor(now.diff(birthDate, 'days').days);

            const zodiacInfo = getZodiacSign(birthDate.month, birthDate.day);
            const zodiacCharacteristics = getZodiacCharacteristics(zodiacInfo[0]);
            const elementColor = getZodiacColor(zodiacInfo[3]);
            const birthYear = birthDate.year;
            const chineseZodiacInfo = getChineseZodiac(birthYear);
            const chineseElementColor = getChineseElementColor(chineseZodiacInfo[3]);
            const timeToNextBirthday = calculateTimeToNextBirthday(birthDate);

            resultDiv.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <h3 style="font-size: 1.05em; line-height: 1.6; color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}">
                        <strong>Selamat!</strong><br>
                    </h3>
                    <div style="font-size: 0.85em; line-height: 1.38;">
                        <strong>Sekarang usia kamu:</strong><br>
                        <div style="display: flex; flex-direction: column; margin-top: 10px;">
                            <div class="result-item">
                                <span id="years" style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">-</span> Tahun
                            </div>
                            <div class="result-item">
                                <span id="months" style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">-</span> Bulan
                            </div>
                            <div class="result-item">
                                <span id="days" style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">-</span> Hari
                            </div>
                            <div class="result-item">
                                <span id="totalMonths" style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">${totalMonths}</span> Total Bulan 
                            </div>
                            <div class="result-item">
                                <span id="totalDays" style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">${totalDays}</span> Total Hari
                            </div>
                        </div>
                        <div style="font-size: 1.1em; margin-top: 10px;">
                            <strong>Tanggal Lahir (Hijriah):</strong><br>
                            <span style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}">
                                ${document.getElementById("birthHijri").value}
                            </span>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; padding: 10px; margin-top: 20px;">
                    <div style="font-size: 0.85em; line-height: 1.38;">
                        <strong>Ulang Tahun Berikutnya:</strong><br>
                        <div style="display: flex; flex-direction: column; margin-top: 10px;">
                            <div class="result-item">
                                <span style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">${timeToNextBirthday.months}</span> Bulan
                            </div>
                            <div class="result-item">
                                <span style="color: ${isDarkMode ? '#ff9f9f' : '#ff6b6b'}; margin-right: 0.5rem;">${timeToNextBirthday.days}</span> Hari
                            </div>
                        </div>
                    </div>
                </div>

                <div class="zodiac-card ${isDarkMode ? 'dark-mode' : ''}">
                    <div class="zodiac-symbol" style="color: ${elementColor}">${zodiacInfo[1]}</div>
                    <div class="zodiac-info">
                        <h4>Zodiak: ${zodiacInfo[0]}</h4>
                        <p><strong>Tanggal:</strong> ${zodiacInfo[2]}</p>
                        <p><strong>Elemen:</strong> ${zodiacInfo[3]}</p>
                        <p><strong>Kepribadian:</strong> ${zodiacCharacteristics.personality}</p>
                        <p><strong>Kekuatan:</strong> ${zodiacCharacteristics.strengths}</p>
                        <p><strong>Kelemahan:</strong> ${zodiacCharacteristics.weaknesses}</p>
                        <p><strong>Kecocokan:</strong> ${zodiacCharacteristics.compatibility}</p>
                    </div>
                    <div class="zodiac-element" style="background-color: ${elementColor}">
                        ${zodiacInfo[3]}
                    </div>
                </div>

                <div class="zodiac-card ${isDarkMode ? 'dark-mode' : ''}" style="margin-top: 20px;">
                    <div class="zodiac-symbol" style="color: ${chineseElementColor}; font-size: 3em;">
                        ${chineseZodiacInfo[1]}
                    </div>
                    <div class="zodiac-info">
                        <h4>Shio: ${chineseZodiacInfo[0]}</h4>
                        <p><strong>Karakteristik:</strong> ${chineseZodiacInfo[2]}</p>
                        <p><strong>Elemen:</strong> ${chineseZodiacInfo[3]}</p>
                        <p><strong>Kepribadian:</strong> ${chineseZodiacInfo[4].personality}</p>
                        <p><strong>Kekuatan:</strong> ${chineseZodiacInfo[4].strengths}</p>
                        <p><strong>Kelemahan:</strong> ${chineseZodiacInfo[4].weaknesses}</p>
                        <p><strong>Angka Keberuntungan:</strong> ${chineseZodiacInfo[4].luckyNumbers}</p>
                        <p><strong>Warna Keberuntungan:</strong> ${chineseZodiacInfo[4].luckyColors}</p>
                        <p><strong>Arah Keberuntungan:</strong> ${chineseZodiacInfo[4].luckyDirections}</p>
                    </div>
                    <div class="zodiac-element" style="background-color: ${chineseElementColor}">
                        ${chineseZodiacInfo[3]}
                    </div>
                </div>

                <div class="result-actions">
                    <button onclick="shareResult()" class="share-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                    </button>
                    
            `;

            resultDiv.style.display = "block";
            loadingSpinner.style.display = "none";

            updateResultWithAnimation('years', years);
            updateResultWithAnimation('months', months);
            updateResultWithAnimation('days', days);
            updateResultWithAnimation('totalMonths', totalMonths);
            updateResultWithAnimation('totalDays', totalDays);

            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            errorDiv.textContent = error.message;
            loadingSpinner.style.display = "none";
        }
    }, 580);
}

function updateResultWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const startValue = 0;
    const increment = value / steps;

    const animation = setInterval(() => {
        currentStep++;
        const currentValue = Math.floor(startValue + (increment * currentStep));
        element.textContent = currentValue.toLocaleString();

        if (currentStep >= steps) {
            clearInterval(animation);
            element.textContent = value.toLocaleString();
        }
    }, stepDuration);
}

// Zodiac Functions
function getZodiacSign(month, day) {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ["Aries", "♈", "21 Maret - 19 April", "Api"];
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ["Taurus", "♉", "20 April - 20 Mei", "Tanah"];
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ["Gemini", "♊", "21 Mei - 20 Juni", "Udara"];
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ["Cancer", "♋", "21 Juni - 22 Juli", "Air"];
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ["Leo", "♌", "23 Juli - 22 Agustus", "Api"];
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ["Virgo", "♍", "23 Agustus - 22 September", "Tanah"];
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ["Libra", "♎", "23 September - 22 Oktober", "Udara"];
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ["Scorpio", "♏", "23 Oktober - 21 November", "Air"];
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ["Sagittarius", "♐", "22 November - 21 Desember", "Api"];
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ["Capricorn", "♑", "22 Desember - 19 Januari", "Tanah"];
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ["Aquarius", "♒", "20 Januari - 18 Februari", "Udara"];
    return ["Pisces", "♓", "19 Februari - 20 Maret", "Air"];
}

function getZodiacCharacteristics(zodiacSign) {
    const characteristics = {
        "Aries": { personality: "Berani, energetik, dan optimis", strengths: "Kepemimpinan, semangat tinggi, percaya diri", weaknesses: "Tidak sabaran, impulsif, temperamental", compatibility: "Leo, Sagittarius, Gemini" },
        "Taurus": { personality: "Setia, sabar, dan praktis", strengths: "Dapat diandalkan, tekun, bertanggung jawab", weaknesses: "Keras kepala, posesif, materialistis", compatibility: "Virgo, Capricorn, Cancer" },
        "Gemini": { personality: "Adaptif, komunikatif, dan cerdas", strengths: "Versatile, cepat belajar, ramah", weaknesses: "Tidak konsisten, gugup, tidak dapat diprediksi", compatibility: "Libra, Aquarius, Aries" },
        "Cancer": { personality: "Intuitif, emosional, dan protektif", strengths: "Imajinatif, loyal, simpatik", weaknesses: "Moody, pesimistis, manipulatif", compatibility: "Scorpio, Pisces, Taurus" },
        "Leo": { personality: "Kreatif, ramah, dan murah hati", strengths: "Karismatik, hangat, humoris", weaknesses: "Arogan, keras kepala, malas", compatibility: "Aries, Sagittarius, Gemini" },
        "Virgo": { personality: "Analitis, pekerja keras, dan perfeksionis", strengths: "Teliti, dapat diandalkan, cerdas", weaknesses: "Terlalu kritis, khawatir berlebihan, sulit puas", compatibility: "Taurus, Capricorn, Cancer" },
        "Libra": { personality: "Diplomatis, artistik, dan seimbang", strengths: "Kooperatif, adil, sosial", weaknesses: "Ragu-ragu, menghindari konfrontasi, membawa dendam", compatibility: "Gemini, Aquarius, Leo" },
        "Scorpio": { personality: "Penuh gairah, teguh, dan berani", strengths: "Tekad kuat, intuitif, pemberani", weaknesses: "Cemburu, obsesif, manipulatif", compatibility: "Cancer, Pisces, Virgo" },
        "Sagittarius": { personality: "Optimis, petualang, dan antusias", strengths: "Jujur, idealis, humoris", weaknesses: "Tidak taktikal, tidak sabaran, membuat janji berlebihan", compatibility: "Aries, Leo, Libra" },
        "Capricorn": { personality: "Bertanggung jawab, disiplin, dan kontrol diri", strengths: "Tanggung jawab, manajemen yang baik, tekun", weaknesses: "Tahu segalanya, tidak mengampuni, mengharapkan yang terburuk", compatibility: "Taurus, Virgo, Pisces" },
        "Aquarius": { personality: "Progresif, orisinal, dan independen", strengths: "Progresif, orisinal, humanis", weaknesses: "Berlawanan, temperamental, tidak berkompromi", compatibility: "Gemini, Libra, Sagittarius" },
        "Pisces": { personality: "Intuitif, artistik, dan bijaksana", strengths: "Kompasif, artistik, intuitif", weaknesses: "Ingin melarikan diri dari realitas, terlalu sensitif, pesimis", compatibility: "Cancer, Scorpio, Capricorn" }
    };
    return characteristics[zodiacSign];
}

function getZodiacColor(element) {
    const elementColors = { "Api": "#FF5733", "Tanah": "#8B4513", "Udara": "#87CEEB", "Air": "#1E90FF" };
    return elementColors[element];
}

function getChineseZodiac(year) {
    const heavenlyStems = { 0: "Logam", 1: "Logam", 2: "Air", 3: "Air", 4: "Kayu", 5: "Kayu", 6: "Api", 7: "Api", 8: "Tanah", 9: "Tanah" };
    const stemCycle = (year - 1 + 1) % 10;
    const element = heavenlyStems[stemCycle];

    const zodiacAnimals = {
        0: ["Monyet", "🐒", "Cerdik, lincah, dan penuh kreativitas"],
        1: ["Ayam", "🐔", "Pekerja keras, jujur, dan berani"],
        2: ["Anjing", "🐕", "Setia, jujur, dan dapat diandalkan"],
        3: ["Babi", "🐷", "Jujur, toleran, dan pekerja keras"],
        4: ["Tikus", "🐀", "Cerdik, adaptif, dan gesit"],
        5: ["Kerbau", "🐂", "Jujur, sabar, dan inspiratif"],
        6: ["Macan", "🐅", "Berani, kompetitif, dan percaya diri"],
        7: ["Kelinci", "🐇", "Anggun, baik hati, dan bijaksana"],
        8: ["Naga", "🐲", "Kuat, beruntung, dan berpengaruh"],
        9: ["Ular", "🐍", "Bijaksana, misterius, dan menawan"],
        10: ["Kuda", "🐎", "Energik, independen, dan bersemangat"],
        11: ["Kambing", "🐐", "Lembut, artistik, dan kreatif"]
    };

    const zodiacYear = (year - 1 + 1) % 12;
    const animalInfo = zodiacAnimals[zodiacYear];

    const characteristics = {
        personality: `${element} ${animalInfo[0]}: ${getElementalPersonality(element, animalInfo[0])}`,
        strengths: getElementalStrengths(element, animalInfo[0]),
        weaknesses: getElementalWeaknesses(element, animalInfo[0]),
        luckyNumbers: getLuckyNumbers(element),
        luckyColors: getElementColors(element),
        luckyDirections: getLuckyDirections(element)
    };

    return [animalInfo[0], animalInfo[1], animalInfo[2], element, characteristics];
}

function getElementalPersonality(element, animal) {
    const elementTraits = { "Logam": "tegas, mandiri, dan perfeksionis", "Air": "adaptif, fleksibel, dan bijaksana", "Kayu": "kreatif, idealis, dan pekerja keras", "Api": "dinamis, passionate, dan berani", "Tanah": "stabil, dapat diandalkan, dan praktis" };
    return `${elementTraits[element]} dengan sifat dasar ${animal}`;
}

function getElementalStrengths(element, animal) {
    const elementStrengths = { "Logam": "Disiplin tinggi, tekad kuat, kepemimpinan", "Air": "Adaptabilitas, kebijaksanaan, intuisi", "Kayu": "Kreativitas, pertumbuhan, kemandirian", "Api": "Antusiasme, karisma, semangat", "Tanah": "Stabilitas, keandalan, kesabaran" };
    return elementStrengths[element];
}

function getElementalWeaknesses(element, animal) {
    const elementWeaknesses = { "Logam": "Kaku, terlalu perfeksionis, sulit berkompromi", "Air": "Terlalu mengalir, kurang fokus, mudah terpengaruh", "Kayu": "Keras kepala, idealis berlebihan, sulit realistis", "Api": "Mudah terbakar emosi, tidak sabaran, dominan", "Tanah": "Lambat berubah, konservatif, keras kepala" };
    return elementWeaknesses[element];
}

function getLuckyNumbers(element) {
    const elementNumbers = { "Logam": "6, 7, 8", "Air": "1, 6, 7", "Kayu": "3, 4, 9", "Api": "2, 7, 9", "Tanah": "2, 5, 8" };
    return elementNumbers[element];
}

function getElementColors(element) {
    const elementColors = { "Logam": "Putih, perak, emas", "Air": "Biru, hitam, abu-abu", "Kayu": "Hijau, coklat", "Api": "Merah, ungu, pink", "Tanah": "Kuning, coklat tanah" };
    return elementColors[element];
}

function getLuckyDirections(element) {
    const elementDirections = { "Logam": "Barat, Barat Laut", "Air": "Utara, Timur", "Kayu": "Timur, Tenggara", "Api": "Selatan, Timur", "Tanah": "Timur Laut, Barat Daya" };
    return elementDirections[element];
}

function getChineseElementColor(element) {
    const elementColors = { "Kayu": "#4CAF50", "Api": "#FF5722", "Tanah": "#795548", "Logam": "#9E9E9E", "Air": "#2196F3" };
    return elementColors[element];
}

function calculateTimeToNextBirthday(birthDate) {
    const now = luxon.DateTime.now();
    let nextBirthday = luxon.DateTime.fromObject({ year: now.year, month: birthDate.month, day: birthDate.day });

    if (now > nextBirthday) nextBirthday = nextBirthday.plus({ years: 1 });

    const diff = nextBirthday.diff(now, ['months', 'days']);
    return { months: Math.floor(diff.months), days: Math.floor(diff.days) };
}

// Sharing Function
async function shareResult() {
    const resultDiv = document.getElementById("result");
    if (!resultDiv || resultDiv.style.display === "none") return;

    showLoadingOverlay('Menyiapkan hasil...');

    try {
        const years = document.getElementById("years").textContent;
        const months = document.getElementById("months").textContent;
        const days = document.getElementById("days").textContent;
        const birthDate = luxon.DateTime.fromISO(document.getElementById("birthdate").value);
        const timeToNextBirthdayShare = calculateTimeToNextBirthday(birthDate);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400 * window.devicePixelRatio;
        canvas.height = 400 * window.devicePixelRatio;
        canvas.style.width = "400px";
        canvas.style.height = "400px";
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, isDarkMode ? '#000000' : '#ffffff');
        gradient.addColorStop(1, isDarkMode ? '#000000' : '#f0f0f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        drawLineArt(ctx, isDarkMode);

        ctx.fillStyle = isDarkMode ? '#ff6b6b' : '#d00000';
        ctx.font = '700 24px "Poppins", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("agecalc", 200, 28);

        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 16px "Poppins", sans-serif';
        ctx.fillText("Sekarang usia kamu:", 200, 60);

        const boxWidth = 240;
        const boxHeight = 40;
        const boxX = (400 - boxWidth) / 2;
        const boxYStart = 80;
        const boxSpacing = 45;

        ctx.shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxYStart, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.fillStyle = isDarkMode ? '#ff6b6b' : '#d00000';
        ctx.font = 'bold 20px "Poppins", sans-serif';
        ctx.fillText(`${years}`, boxX + 40, boxYStart + boxHeight / 2);
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 18px "Poppins", sans-serif';
        ctx.fillText("Tahun", boxX + 120, boxYStart + boxHeight / 2);

        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxYStart + boxSpacing, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.fillStyle = isDarkMode ? '#ff6b6b' : '#d00000';
        ctx.font = 'bold 20px "Poppins", sans-serif';
        ctx.fillText(`${months}`, boxX + 40, boxYStart + boxSpacing + boxHeight / 2);
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 18px "Poppins", sans-serif';
        ctx.fillText("Bulan", boxX + 120, boxYStart + boxSpacing + boxHeight / 2);

        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxYStart + 2 * boxSpacing, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.fillStyle = isDarkMode ? '#ff6b6b' : '#d00000';
        ctx.font = 'bold 20px "Poppins", sans-serif';
        ctx.fillText(`${days}`, boxX + 40, boxYStart + 2 * boxSpacing + boxHeight / 2);
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 18px "Poppins", sans-serif';
        ctx.fillText("Hari", boxX + 120, boxYStart + 2 * boxSpacing + boxHeight / 2);

        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 16px "Poppins", sans-serif';
        ctx.fillText("Ulang Tahun Berikutnya:", 200, boxYStart + 3 * boxSpacing + 10);

        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxYStart + 3 * boxSpacing + 30, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.fillStyle = isDarkMode ? '#ff6b6b' : '#d00000';
        ctx.font = 'bold 20px "Poppins", sans-serif';
        ctx.fillText(`${timeToNextBirthdayShare.months}`, boxX + 40, boxYStart + 3 * boxSpacing + 30 + boxHeight / 2);
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 18px "Poppins", sans-serif';
        ctx.fillText("Bulan", boxX + 120, boxYStart + 3 * boxSpacing + 30 + boxHeight / 2);

        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxYStart + 4 * boxSpacing + 30, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.fillStyle = isDarkMode ? '#ff6b6b' : '#d00000';
        ctx.font = 'bold 20px "Poppins", sans-serif';
        ctx.fillText(`${timeToNextBirthdayShare.days}`, boxX + 40, boxYStart + 4 * boxSpacing + 30 + boxHeight / 2);
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = '600 18px "Poppins", sans-serif';
        ctx.fillText("Hari", boxX + 120, boxYStart + 4 * boxSpacing + 30 + boxHeight / 2);

        const randomQuote = getRandomSeriousMotivationalQuote();
        ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
        ctx.font = 'italic 10px "Courier New", sans-serif';
        ctx.fillText(`"${randomQuote}"`, 200, 366);

        ctx.shadowColor = 'transparent';

        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const resultText = `${years} tahun, ${months} bulan, ${days} hari\nUlang Tahun Berikutnya: ${timeToNextBirthdayShare.months} bulan, ${timeToNextBirthdayShare.days} hari`;
        const files = [new File([imageBlob], 'usia.png', { type: 'image/png' })];

        if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
            await navigator.share({ title: 'Hasil Kalkulasi Usia', text: resultText, files: files, url: window.location.href });
            showToast('Berhasil membagikan hasil!');
            showConfetti();
        } else if (navigator.share) {
            await navigator.share({ title: 'Hasil Kalkulasi Usia', text: resultText, url: window.location.href });
            showToast('Berhasil membagikan hasil!');
            showConfetti();
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(imageBlob);
            link.download = 'usia.png';
            link.click();
            await navigator.clipboard.writeText(resultText);
            showToast('Hasil telah disimpan dan disalin ke clipboard!');
            showConfetti();
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showToast('Gagal membagikan hasil. Silakan coba lagi.');
    } finally {
        hideLoadingOverlay();
    }
}

function drawLineArt(ctx, isDarkMode) {
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(150, 100);
    ctx.lineTo(125, 150);
    ctx.lineTo(100, 100);
    ctx.moveTo(125, 125);
    ctx.lineTo(175, 100);
    ctx.moveTo(125, 125);
    ctx.lineTo(75, 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(250, 125, 25, 0, Math.PI * 2);
    ctx.moveTo(235, 125);
    ctx.lineTo(265, 125);
    ctx.moveTo(250, 110);
    ctx.lineTo(250, 140);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(350, 125, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, 250);
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(50 + 20 * Math.cos(2 * Math.PI * i / 5), 250 + 20 * Math.sin(2 * Math.PI * i / 5));
        ctx.lineTo(50 + 10 * Math.cos(2 * Math.PI * (i + 0.5) / 5), 250 + 10 * Math.sin(2 * Math.PI * (i + 0.5) / 5));
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, 100);
    ctx.lineTo(40, 110);
    ctx.lineTo(60, 110);
    ctx.lineTo(50, 100);
    ctx.moveTo(50, 50);
    ctx.lineTo(40, 40);
    ctx.lineTo(60, 40);
    ctx.lineTo(50, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(300, 200);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(300, 300, 20, 0, Math.PI * 2);
    ctx.moveTo(300, 280);
    ctx.lineTo(300, 320);
    ctx.moveTo(280, 300);
    ctx.lineTo(320, 300);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(150, 300, 20, 0, Math.PI * 2);
    ctx.moveTo(130, 300);
    ctx.lineTo(170, 300);
    ctx.moveTo(150, 280);
    ctx.lineTo(150, 320);
    ctx.moveTo(150, 300);
    ctx.lineTo(150 - 30, 300 - 30);
    ctx.moveTo(150, 300);
    ctx.lineTo(150 + 30, 300 - 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(250, 300, 25, 0, Math.PI * 2);
    ctx.moveTo(235, 300);
    ctx.bezierCurveTo(230, 290, 240, 280, 250, 280);
    ctx.bezierCurveTo(260, 280, 270, 290, 265, 300);
    ctx.stroke();

    for (let i = 0; i < 50; i++) {
        let x = Math.random() * 400;
        let y = Math.random() * 400;
        let size = Math.random() * 5 + 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function getRandomSeriousMotivationalQuote() {
    const quotes = [
        "Konsistensi adalah kunci menuju kesuksesan.",
        "Fokus pada tujuan, bukan hambatan.",
        "Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras.",
        "Kesuksesan adalah hasil dari persiapan dan kerja keras.",
        "Jangan menyerah, setiap langkah membawa Anda lebih dekat ke tujuan.",
        "Keberhasilan membutuhkan disiplin dan ketekunan.",
        "Hanya mereka yang berani gagal yang bisa mencapai keberhasilan besar.",
        "Waktu adalah aset berharga, gunakan dengan bijak.",
        "Kesabaran dan ketekunan adalah fondasi keberhasilan.",
        "Tetap fokus, hasil akan mengikuti usaha.",
        "Setiap hari adalah kesempatan untuk menjadi lebih baik.",
        "Keberhasilan dimulai dari langkah kecil.",
        "Percaya pada dirimu, kamu bisa mencapai apa saja!",
        "Jangan takut gagal, itu bagian dari proses.",
        "Kamu lebih kuat dari yang kamu pikirkan.",
        "Lakukan yang terbaik, dan biarkan sisanya mengalir.",
        "Hidup adalah petualangan, nikmati setiap langkahnya!",
        "Kamu adalah inspirasi bagi dirimu sendiri."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function showLoadingOverlay(message) {
    const overlay = document.createElement('div');
    overlay.className = 'sharing-overlay';
    overlay.innerHTML = `
        <div class="sharing-loader">
            <div class="sharing-spinner"></div>
            <div class="sharing-message">${message}</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.querySelector('.sharing-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast animated';
    const icon = message.includes('Berhasil') ? '✅' : message.includes('Gagal') ? '❌' : 'ℹ️';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    });
}
// ... (Kode sebelumnya seperti flatpickr initialization, toggleDarkMode, dll tetap sama) ...

// Fungsi untuk menampilkan modal berdasarkan tipe
function showPolicy(e, type) {
    e.preventDefault();

    let content;
    switch (type) {
        case 'privacy':
            content = `
                <h3>Kebijakan Privasi</h3>
                <p><strong>Tanggal Efektif:</strong> 20 Februari 2025</p>
                <p><strong>Informasi yang Kami Kumpulkan:</strong> Kami hanya mengumpulkan tanggal lahir yang Anda masukkan untuk menghitung usia. Data ini tidak disimpan di server kami setelah perhitungan selesai.</p>
                <p><strong>Penggunaan Informasi:</strong> Tanggal lahir digunakan untuk menghitung usia Anda, menentukan zodiak, shio, dan waktu menuju ulang tahun berikutnya.</p>
                <p><strong>Berbagi Informasi:</strong> Kami tidak membagikan informasi Anda dengan pihak ketiga.</p>
                <p><strong>Hak Anda:</strong> Anda berhak untuk tidak memasukkan data apa pun jika tidak ingin menggunakannya.</p>
                <p><strong>Kontak:</strong> Jika Anda tertarik untuk berkontribusi atau menyarankan ide, email kami di <a href="mailto:moehamadhkl@gmail.com">moehamadhkl@gmail.com</a>.</p>
            `;
            break;
        case 'cookie':
            content = `
                <h3>Kebijakan Cookie</h3>
                <p><strong>Tanggal Efektif:</strong> 20 Februari 2025</p>
                <p><strong>Penggunaan Cookie:</strong> Kami menggunakan cookie untuk menyimpan preferensi tema (light/dark mode) di browser Anda melalui localStorage.</p>
                <p><strong>Jenis Cookie:</strong> Cookie ini bersifat teknis dan tidak digunakan untuk pelacakan atau iklan.</p>
                <p><strong>Pengaturan Cookie:</strong> Anda dapat mengelola cookie melalui pengaturan browser Anda. Menonaktifkan cookie mungkin memengaruhi fungsi tema.</p>
                <p><strong>Persetujuan:</strong> Dengan menggunakan situs ini, Anda menyetujui penggunaan cookie seperti yang dijelaskan.</p>
                <p><strong>Kontak:</strong> Untuk kolaborasi atau umpan balik, hubungi kami di <a href="mailto:moehamadhkl@gmail.com">moehamadhkl@gmail.com</a>.</p>
            `;
            break;
        case 'about':
            content = `
                <h3>Tentang AgeCalc</h3>
                <p><strong>Deskripsi:</strong> AgeCalc adalah aplikasi web sederhana untuk menghitung usia Anda berdasarkan tanggal lahir, lengkap dengan informasi zodiak dan shio.</p>
                <p><strong>Tujuan:</strong> Dibuat untuk memberikan pengalaman yang menyenangkan dan informatif tentang usia Anda dalam format yang modern dan interaktif.</p>
                <p><strong>Pengembang:</strong> Dibuat oleh <a href="https://www.instagram.com/mhaekalll_" target="_blank">mhaekalll</a>.</p>
                <p><strong>Kontak:</strong> Untuk saran atau pertanyaan, email kami di <a href="mailto:moehamadhkl@gmail.com">moehamadhkl@gmail.com</a>.</p>
            `;
            break;
        case 'services':
            content = `
                <h3>Fitur AgeCalc</h3>
                <p><strong>Perhitungan Usia:</strong> Hitung usia Anda dalam tahun, bulan, dan hari berdasarkan tanggal lahir.</p>
                <p><strong>Konversi Hijriah:</strong> Lihat tanggal lahir Anda dalam kalender Hijriah menggunakan API Aladhan.</p>
                <p><strong>Zodiak & Shio:</strong> Dapatkan informasi tentang zodiak dan shio Anda berdasarkan tanggal dan tahun lahir.</p>
                <p><strong>Berbagi Hasil:</strong> Bagikan hasil perhitungan Anda dalam bentuk gambar atau teks melalui Web Share API.</p>
                <p><strong>Tema Gelap:</strong> Nikmati pengalaman visual dengan opsi tema terang atau gelap.</p>
            `;
            break;
        default:
            content = `<p>Informasi tidak tersedia.</p>`;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${isDarkMode ? '#1a1a1a' : 'white'};
        color: ${isDarkMode ? '#ecf0f1' : '#333333'};
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1001;
    `;
    modal.innerHTML = content + '<button onclick="this.parentElement.remove();" style="margin-top: 15px; padding: 5px 10px; background-color: ' + (isDarkMode ? '#333' : '#f0f0f0') + '; color: ' + (!isDarkMode ? '#333' : '#f0f0f0') + ';">Tutup</button>';

    document.body.appendChild(modal);
}