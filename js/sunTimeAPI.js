export async function fetchSunTime(latitude = 34.6937, longitude = 135.5023) {
    const today = new Date().toISOString().split('T')[0];
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=Asia%2FTokyo&start_date=${today}&end_date=${today}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('日の出・日の入り情報の取得に失敗しました。');
        }
        const data = await response.json();
        return {
            sunrise: new Date(data.daily.sunrise[0]),
            sunset: new Date(data.daily.sunset[0])
        };
    } catch (error) {
        console.error('Sun Time API Error:', error);
        return null;
    }
}