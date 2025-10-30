// IMPORTANT: Replace this with your actual Google Apps Script Web App URL
export const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwy6JRELr2_uT5nhRE23nQaI_eQuf6mc7hDClE0f74bCLCsOjmj6qGgYcMmZ1sIMfud/exec';

// Default menu if fetching from Google Sheet fails
export const DEFAULT_MENU: { name: string; price: number; icon: string; }[] = [
    { name: '滷肉飯', price: 35, icon: '🍚' },
    { name: '雞肉飯', price: 40, icon: '🍗' },
    { name: '蚵仔煎', price: 65, icon: '🍳' },
    { name: '大腸麵線', price: 50, icon: '🍜' },
    { name: '珍珠奶茶', price: 45, icon: '🥤' },
    { name: '鹽酥雞', price: 60, icon: '🍖' },
    { name: '甜不辣', price: 40, icon: '🍢' },
    { name: '肉圓', price: 45, icon: '🥟' },
    { name: '臭豆腐', price: 55, icon: '🧆' },
    { name: '牛肉麵', price: 120, icon: '🍲' }
];
