
const apiKey = 'AIzaSyDtkYBY4OHNPuk0JRyOi4fDzHtXQgPhPVw';

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

listModels();
