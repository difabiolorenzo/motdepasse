var currentIndex = -1;
var word_to_find_left = undefined;
var word_status = [];
var word_to_find_amount = 5;
var words = []; // Array to store the fetched words

const wordDisplay = document.getElementById('wordDisplay');
const wordsStatus = document.getElementById('wordsStatus');
const restartButton = document.getElementById('restartButton');
const passButton = document.getElementById('passButton');

const indexesOf = (arr, item) => arr.reduce((acc, v, i) => (v === item && acc.push(i), acc),[]);

async function fetchWords() {
    try {
        const response = await fetch('https://trouve-mot.fr/api/random/' + word_to_find_amount);
        const data = await response.json();
        var word_arr = [];
        for (var i=0; i<data.length; i++) {
            word_arr.push(data[i].name.toUpperCase())
        }
        return word_arr;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function initializeWords() {
    words = await fetchWords();
    currentIndex = -1;
    word_to_find_left = words.length;

    generateWordList();

    wordsStatus.innerHTML = "";
    word_status = [];
    for (var i=0; i<words.length; i++) {
        word_status.push(0)
        wordsStatus.innerHTML += "<span class='word_indicator'></span>"
    }
}

function displayRecap() {
    wordDisplay.style.display = "none";
    wordsStatus.style.display = "none";
    chronoDisplay.style.display = "none";
    recapDisplay.style.display = "block";

    validateButton.style.display = "none";
    passButton.style.display = "none";
    invalidateButton.style.display = "none";
    restartButton.style.display = "inline-block";

    recapDisplay.innerHTML = "";
    for (var i=0; i<words.length; i++) {
        if (word_status[i] == 1) {
            recapDisplay.innerHTML += "<div class='recap_word'><span class='word_indicator correct'></span> " + words[i] + "</div>"
        } else if (word_status[i] == 2){
            recapDisplay.innerHTML += "<div class='recap_word'><span class='word_indicator disabled'></span> " + words[i] + "</div>"
        } else {
            recapDisplay.innerHTML += "<div class='recap_word'><span class='word_indicator'></span> " + words[i] + "</div>"
        }
        
    }
}

function startGame() {
    menu.style.display = "none";
    game.style.display = "block";
}

function generateWordList() {
    currentIndex++;
    if (currentIndex == 0) {
        validateButton.style.display = "inline-block";
        passButton.style.display = "inline-block";
        invalidateButton.style.display = "inline-block";
        restartButton.style.display = "none";
        
        wordDisplay.style.display = "flex";
        wordsStatus.style.display = "flex";
        chronoDisplay.style.display = "block";
        recapDisplay.style.display = "none";
    }
    if (currentIndex > words.length) {
        wordDisplay.innerHTML = "..."
        initializeWords();
        return;
    }
    wordDisplay.innerHTML = words[currentIndex];
}

function validateWord() {
    wordsStatus.childNodes[currentIndex].classList.add("correct")
    word_status[currentIndex] = 1;
    word_to_find_left--;
    unlockWord()
}

function passWord() {
    wordsStatus.childNodes[currentIndex].classList.add("pass")
    unlockWord()
}

function invalidateWord() {
    wordsStatus.childNodes[currentIndex].classList.add("disabled")
    word_status[currentIndex] = 2;
    word_to_find_left--;
    unlockWord()
}

function unlockWord() {
    wordDisplay.innerHTML = words[currentIndex+1];
    wordDisplay.classList.add("word_changed");
    setTimeout(function() {wordDisplay.classList.remove("word_changed")}, 250); //A CHANGER
    
    if (words.length == currentIndex+1) {
        if (word_to_find_left == 0) {
            displayRecap();
        } else {
            console.log("display word passed", word_status, words)
            displayRecap();
        }
    }
    currentIndex++;
}

function changeStyle() {

    var body_class = document.body.classList

    if (body_class[0] == "style_2009") {
        body_class.add("style_2016")
        body_class.remove("style_2009")
    } else {
        body_class.add("style_2009")
        body_class.remove("style_2016")
    }
}

startButton.addEventListener('click', startGame);
changeStyleButton.addEventListener('click', changeStyle);
restartButton.addEventListener('click', generateWordList);
validateButton.addEventListener('click', validateWord);
invalidateButton.addEventListener('click', invalidateWord);
passButton.addEventListener('click', passWord);

// Initialize words on page load
initializeWords();