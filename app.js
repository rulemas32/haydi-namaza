// Konum alma ve API ile ezan vakti çekme
const locationEl = document.getElementById("location");
const timesEl = document.getElementById("times");
const nextEl = document.getElementById("next-prayer");

async function getPrayerTimes(lat, lon) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const url = `https://api.aladhan.com/v1/timings/${Math.floor(today.getTime()/1000)}?latitude=${lat}&longitude=${lon}&method=13`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const timings = data.data.timings;
    displayTimes(timings);
    startCountdown(timings);
  } catch (e) {
    timesEl.innerHTML = "Namaz vakitleri alınamadı.";
  }
}

function displayTimes(timings) {
  timesEl.innerHTML = "";
  for (let key of ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"]) {
    const div = document.createElement("div");
    div.textContent = `${key}: ${timings[key]}`;
    timesEl.appendChild(div);
  }
}

function startCountdown(timings) {
  function updateCountdown() {
    const now = new Date();
    let nextTime, nextName;
    for (let key of ["Fajr","Dhuhr","Asr","Maghrib","Isha"]) {
      const [h,m] = timings[key].split(":").map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      if (t > now) {
        nextTime = t;
        nextName = key;
        break;
      }
    }
    if (nextTime) {
      const diff = nextTime - now;
      const min = Math.floor(diff/60000);
      const sec = Math.floor((diff%60000)/1000);
      nextEl.textContent = `Sonraki vakit: ${nextName} (${min} dk ${sec} sn kaldı)`;
    } else {
      nextEl.textContent = "Bugünkü vakitler geçti";
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// GPS ile konum al
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      locationEl.textContent = `Konumunuz: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      getPrayerTimes(lat, lon);
    },
    err => {
      locationEl.textContent = "Konum alınamadı. Varsayılan Burdur.";
      getPrayerTimes(37.7226, 30.2886); // Burdur koordinatları
    }
  );
} else {
  locationEl.textContent = "Tarayıcı konum desteklemiyor. Varsayılan Burdur.";
  getPrayerTimes(37.7226, 30.2886);
}
