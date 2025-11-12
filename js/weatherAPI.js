// 大阪市天王寺区（概ね天王寺駅付近）の座標
const TENNOJI_LAT = 34.6534;
const TENNOJI_LON = 135.5112;

// Open-Meteo weather code → 日本語説明
const WEATHER_CODE_JA = {
  0: '快晴',
  1: '晴れ',
  2: '薄曇り',
  3: '曇り',
  45: '靄',
  48: '霧氷の霧',
  51: '霧雨（弱）',
  53: '霧雨（中）',
  55: '霧雨（強）',
  56: '着氷性の霧雨（弱）',
  57: '着氷性の霧雨（強）',
  61: '雨（弱）',
  63: '雨（中）',
  65: '雨（強）',
  66: '着氷性の雨（弱）',
  67: '着氷性の雨（強）',
  71: '雪（弱）',
  73: '雪（中）',
  75: '雪（強）',
  77: '霧雪',
  80: 'にわか雨（弱）',
  81: 'にわか雨（中）',
  82: 'にわか雨（強）',
  85: 'にわか雪（弱）',
  86: 'にわか雪（強）',
  95: '雷雨（弱〜中）',
  96: '雷雨（雹: 弱）',
  99: '雷雨（雹: 強）'
};

function formatDateLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function fetchTennojiWeather() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${TENNOJI_LAT}&longitude=${TENNOJI_LON}` +
              `&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode` +
              `&timezone=Asia%2FTokyo&start_date=${today}&end_date=${today}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('天気情報の取得に失敗しました');
    const data = await res.json();

    const current = data.current_weather || {};
    const daily = data.daily || {};
    const code = Number(current.weathercode ?? (daily.weathercode ? daily.weathercode[0] : NaN));
    return {
      currentTemp: typeof current.temperature === 'number' ? current.temperature : null,
      weatherCode: isFinite(code) ? code : null,
      weatherDesc: isFinite(code) ? (WEATHER_CODE_JA[code] || '不明') : '不明',
      maxTemp: daily.temperature_2m_max ? daily.temperature_2m_max[0] : null,
      minTemp: daily.temperature_2m_min ? daily.temperature_2m_min[0] : null
    };
  } catch (e) {
    console.error('Weather API Error:', e);
    return null;
  }
}

export function weatherCodeToEmoji(code) {
  // 簡易的なアイコン表現
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if ([51,53,55,56,57].includes(code)) return '🌦️';
  if ([61,63,65,66,67,80,81,82].includes(code)) return '🌧️';
  if ([71,73,75,77,85,86].includes(code)) return '🌨️';
  if ([95,96,99].includes(code)) return '⛈️';
  if ([45,48].includes(code)) return '🌫️';
  return '🌀';
}

export async function fetchTennojiWeeklyForecast(days = 7) {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + Math.max(1, days) - 1);
  const startStr = formatDateLocal(start);
  const endStr = formatDateLocal(end);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${TENNOJI_LAT}&longitude=${TENNOJI_LON}` +
              `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
              `&timezone=Asia%2FTokyo&start_date=${startStr}&end_date=${endStr}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('週間天気の取得に失敗しました');
    const data = await res.json();
    const out = [];
    const dates = data.daily?.time || [];
    const codes = data.daily?.weathercode || [];
    const maxs = data.daily?.temperature_2m_max || [];
    const mins = data.daily?.temperature_2m_min || [];
    const pops = data.daily?.precipitation_probability_max || [];

    for (let i = 0; i < dates.length; i++) {
      const code = Number(codes[i]);
      out.push({
        date: dates[i],
        code,
        desc: WEATHER_CODE_JA[code] || '不明',
        max: typeof maxs[i] === 'number' ? maxs[i] : null,
        min: typeof mins[i] === 'number' ? mins[i] : null,
        pop: typeof pops[i] === 'number' ? pops[i] : null
      });
    }
    return out;
  } catch (e) {
    console.error('Weekly Weather API Error:', e);
    return null;
  }
}
