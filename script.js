function init() {
    defaultVariables();

    if (global.debug === true) {
        initPassword();
    }
}

function defaultVariables() {
    game = {
        password: {
            words: [],
            index: 0,
            passes_left: -1,
        }
    };
    global = {
        version: [0, 1, 0],
        debug: false,
        modal_recap: new bootstrap.Modal(document.getElementById('modal_recap')),
        modal_settings: new bootstrap.Modal(document.getElementById('modal_settings'))
    },
    settings = {
            word_amount: 5,
            use_timer_total: false,
            timer_total: 60,
            use_timer_word: false,
            timer_word: 60,
            passes: -1,
            show_hints: false
    }
    
    //Nombre de mot
    document.getElementById("slider_word_amount").value = settings.word_amount
    document.getElementById("slider_word_amount_value").innerHTML = settings.word_amount   
    //Activer le chronomètre global
    document.getElementById("input_timer_global").checked = settings.use_timer_total
    //Durée totale
    document.getElementById("slider_timer_total").value = settings.timer_total
    document.getElementById("slider_timer_total_value").innerHTML = settings.timer_total
    //Activer le chronomètre par mot
    document.getElementById("input_timer_word").checked = settings.use_timer_word 
    //Durée par mot
    document.getElementById("slider_timer_word").value = settings.timer_word
    document.getElementById("slider_timer_word_value").innerHTML = settings.timer_word 
    //Nombre de passes
    document.getElementById("slider_max_passes").value = settings.passes
    document.getElementById("slider_max_passes_value").innerHTML = settings.passes 
    //Activer les indices
    document.getElementById("input_show_hints").checked = settings.show_hints 
}

const button_password_invalidate = document.getElementById("button_password_invalidate");
const button_password_pass = document.getElementById("button_password_pass");
const button_password_validate = document.getElementById("button_password_validate");

function displayPage(id) {
    const pages = ["menu", "game"];

    for (const page of pages) {
        document.getElementById(page).classList.add("d-none");
    }
    document.getElementById(id).classList.remove("d-none");
}

async function fetchWordsfromAPI() {
    const PASSWORD_WEBSITE_API = 'https://trouve-mot.fr/api/random/';
    try {
        const response = await fetch(PASSWORD_WEBSITE_API + settings.word_amount);
        const data = await response.json();
        const word_arr = data.map((item, i) => ({
            id: i, // identifiant fixe
            word: item.name.toUpperCase(),
            status: "waiting"
        }));

        if (word_arr.length > 0) {
            button_password_invalidate.disabled = false;
            button_password_pass.disabled = false;
            button_password_validate.disabled = false;
        }
        return word_arr;
    } catch (error) {
        console.error('Error fetching ' + PASSWORD_WEBSITE_API + ' data:', error);
        return [];
    }
}

async function initializeWords() {
    game.password.index = 0;
    game.password.words = await fetchWordsfromAPI();

    if (game.password.words.length === 0) {
        alert("Aucun mot trouvé");
        return;
    }

    password_ingame_status.innerHTML = "";
    for (const word of game.password.words) {
        const span = document.createElement("span");
        span.classList.add("word_indicator");
        span.dataset.id = word.id; // 🔑 lien DOM ↔ mot
        password_ingame_status.appendChild(span);
    }

    console.log("game.password.words", game.password.words);
    console.log("game.password.index", game.password.index);
}

function initPassword() {
    if (!window.navigator.onLine) {
        alert(global.current_language_strings.password_internet_requierement);
        return;
    }

    game.password.index = 0;
    game.password.words = [];

    button_password_invalidate.disabled = true;
    button_password_pass.disabled = true;
    button_password_validate.disabled = true;

    password_ingame_display.innerHTML = "...";

    document.getElementById("button_password_restart").classList.add("d-none");
    document.getElementById("button_password_quit").classList.add("d-none");
    document.getElementById("button_password_settings").classList.add("d-none");
    document.getElementById("button_password_recap").classList.add("d-none");

    document.getElementById("button_password_start").classList.remove("started");
    document.getElementById("button_password_start").classList.add("not-started");

    initializeWords();
    displayPage("game");
}

function startPassword() {
    //Action enabled
    document.getElementById("button_password_invalidate").disabled = false;
    document.getElementById("button_password_pass").disabled = false;
    document.getElementById("button_password_validate").disabled = false;

    document.getElementById("password_ingame_content").classList.remove("not-started");
    document.getElementById("password_ingame_content").classList.add("started");

    document.getElementById("button_password_start").classList.remove("not-started");
    document.getElementById("button_password_start").classList.add("started");

    document.getElementById("password_controls").classList.remove("not-started");
    document.getElementById("password_controls").classList.add("started");

    if (settings.use_timer_total == true) {
    document.getElementById("password_timer_global").classList.remove("d-none");
    }

    passwordDisplayNextWord();
}

function endPassword() {
    //Action enabled
    document.getElementById("button_password_invalidate").disabled = true;
    document.getElementById("button_password_pass").disabled = true;
    document.getElementById("button_password_validate").disabled = true;

    document.getElementById("password_ingame_content").classList.remove("started");
    document.getElementById("password_ingame_content").classList.add("not-started");

    document.getElementById("password_controls").classList.remove("started");
    document.getElementById("password_controls").classList.add("not-started");

    document.getElementById("password_timer_global").classList.add("d-none");

    document.getElementById("button_password_restart").classList.remove("d-none");
    document.getElementById("button_password_quit").classList.remove("d-none");
    document.getElementById("button_password_settings").classList.remove("d-none");
    document.getElementById("button_password_recap").classList.remove("d-none");

    document.getElementById("password_ingame_status").innerHTML = "";
    document.getElementById("password_ingame_display").innerHTML = "...";
}

function quitPassword() {
    displayPage("menu");
    endPassword();
}

function highlightWord(word) {
    const indicator = password_ingame_status.querySelector(`[data-id="${word.id}"]`);
    if (indicator) {
        indicator.classList.add("highlighted");
    }
}

function updateIndicator(word, classesToAdd = [], classesToRemove = []) {
    const indicator = password_ingame_status.querySelector(`[data-id="${word.id}"]`);
    if (!indicator) return;
    indicator.classList.remove(...classesToRemove);
    indicator.classList.add(...classesToAdd);
}

function passwordDisplayNextWord() {
    const index = game.password.index;

    if (index >= game.password.words.length) {
        password_displayRecap();
        return;
    }

    const word = game.password.words[index];
    password_ingame_display.classList.remove("password-changing-word");
    setTimeout(() => password_ingame_display.classList.add("password-changing-word"), 1);
    setTimeout(() => {
        password_ingame_display.innerHTML = word.word;
    }, 250);

    highlightWord(word);
}

function passwordValidate() {
    const index = game.password.index;
    const word = game.password.words[index];

    updateIndicator(word, ["correct"], ["highlighted", "pass"]);
    word.status = "correct";

    game.password.index++;
    passwordDisplayNextWord();
}

function passwordInvalidate() {
    const index = game.password.index;
    const word = game.password.words[index];

    updateIndicator(word, ["disabled"], ["highlighted", "pass"]);
    word.status = "disabled";

    game.password.index++;
    passwordDisplayNextWord();
}

function passwordPass() {
    const index = game.password.index;
    const word = game.password.words[index];

    updateIndicator(word, ["pass"], ["highlighted"]);
    word.status = "pass";

    // 🔄 le "pass" revient en fin de liste
    game.password.words.push(word);
    game.password.index++;
    passwordDisplayNextWord();
}

function password_displayRecap() {
    endPassword()

    password_recap_placeholder.innerHTML = "";
    for (const word of game.password.words) {
        password_recap_placeholder.innerHTML += 
            `<div class='centered recap_word password-shield ${word.status}'>
                <div><span>${word.word}</span></div>
            </div>`;
    }
    global.modal_recap.show()
}
