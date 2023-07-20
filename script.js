let currentIndex = -1;
let previousWord = null;

const wordDisplay = document.getElementById('wordDisplay');
const generateButton = document.getElementById('generateButton');
const passButton = document.getElementById('passButton');

async function fetchWords() {
    try {
        const response = await fetch('https://trouve-mot.fr/api/random/5');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

let words = []; // Array to store the fetched words

async function initializeWords() {
    words = await fetchWords();
    currentIndex = -1;
    previousWord = null;
    generateWordList();
}

function displayWord() {
    wordDisplay.innerHTML = "";
    for (var i=0; i<words.length; i++) {
        if (i==0) {
            wordDisplay.innerHTML += "<div class='word current'>" + words[i].name + "</div>"
        } else { 
            wordDisplay.innerHTML += "<div class='word hided'>" + words[i].name + "</div>"
        }
    }
}

function generateWordList() {
    currentIndex++;
    if (currentIndex >= words.length) {
        initializeWords();
        return;
    }
    displayWord();

    
    validateButton.style.display = "flex"
    passButton.style.display = "flex"
    generateButton.style.display = "none"
}

function validateWord() {
    wordDisplay.childNodes[currentIndex].className = "word correct"
    unlockWord()
}

function passWord() {
    wordDisplay.childNodes[currentIndex].className = "word wrong"
    unlockWord()
}

function unlockWord() {
    if (currentIndex < 4) {
        wordDisplay.childNodes[currentIndex+1].className = "word current"
    } else {
        continueGame();
    }
    currentIndex++;
}

function continueGame() {
    validateButton.style.display = "none"
    passButton.style.display = "none"
    generateButton.style.display = "flex"
}

generateButton.addEventListener('click', generateWordList);
validateButton.addEventListener('click', validateWord);
passButton.addEventListener('click', passWord);

// Initialize words on page load
initializeWords();