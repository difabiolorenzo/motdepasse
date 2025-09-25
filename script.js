function init() {
    defaultVariables();
    initPassword();
}

function defaultVariables() {
    game = {
        words: [],
        index: 0,
        passes_left: -1
    };
    global = {
        version: [0, 2, 0],
        debug: false,
        modal_recap: new bootstrap.Modal(document.getElementById('modal_recap')),
        modal_settings: new bootstrap.Modal(document.getElementById('modal_settings')),
        globalTimerInterval: null,
        wordTimerInterval: null,
        automatic_timed_word_change_delay: 1000
    },
    settings = {
            word_amount: 5,
            use_timer_global: false,
            timer_global: 30,
            use_timer_word: false,
            timer_word: 5,
            automatic_timed_word_change: false,
            passes: -1,
            show_hints: false,
            style: "2016"
    };

    document.getElementById("version").innerHTML = global.version;
    
    //Nombre de mot
    document.getElementById("slider_word_amount").value = settings.word_amount;
    document.getElementById("slider_word_amount_value").innerHTML = settings.word_amount;

    //Activer le chronomètre global
    document.getElementById("input_timer_global").checked = settings.use_timer_global;

    //Durée totale
    document.getElementById("slider_timer_global").value = settings.timer_global;
    document.getElementById("slider_timer_global_value").innerHTML = settings.timer_global;

    //Activer le chronomètre par mot
    document.getElementById("input_timer_word").checked = settings.use_timer_word;

    //Durée par mot
    document.getElementById("slider_timer_word").value = settings.timer_word;
    document.getElementById("slider_timer_word_value").innerHTML = settings.timer_word;
    document.getElementById("checkbox_timer_word_automatic_change").innerHTML = settings.automatic_timed_word_change;

    //Nombre de passes
    document.getElementById("slider_max_passes").value = settings.passes;
    document.getElementById("slider_max_passes_value").innerHTML = settings.passes;

    //Activer les indices
    document.getElementById("input_show_hints").checked = settings.show_hints;
}

const button_password_invalidate = document.getElementById("button_password_invalidate");
const button_password_pass = document.getElementById("button_password_pass");
const button_password_validate = document.getElementById("button_password_validate");

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
    game.index = 0;
    game.words = await fetchWordsfromAPI();

    if (game.words.length === 0) {
        alert("Aucun mot trouvé");
        return;
    }

    password_ingame_status.innerHTML = "";
    for (const word of game.words) {
        const span = document.createElement("span");
        span.classList.add("word_indicator");
        span.dataset.id = word.id; // 🔑 lien DOM ↔ mot
        password_ingame_status.appendChild(span);
    }

    startPassword()
}

function initPassword() {
    if (!window.navigator.onLine) {
        alert(global.current_language_strings.password_internet_requierement);
        return;
    }
    game.index = 0;
    game.words = [];
}

function startPassword() {
    document.getElementById("rules").classList.add("d-none");

    document.getElementById("title").classList.add("d-none");
    document.getElementById("credits").classList.add("d-none");
    document.getElementById("button_password_settings").classList.add("d-none");
    document.getElementById("button_password_start").classList.add("d-none");
    document.getElementById("button_password_recap").classList.add("d-none");
    document.getElementById("exit_button").classList.remove("d-none");

    document.getElementById("password_controls").classList.remove("not-started");
    document.getElementById("password_controls").classList.remove("not-started");
    document.getElementById("password_controls").classList.add("started");
    document.getElementById("password_ingame_content").classList.remove("not-started");
    document.getElementById("password_ingame_content").classList.add("started");

    //Action enabled
    disableActionButtons(false);

    passwordDisplayNextWord();

    if (settings.use_timer_global == true) {
        document.getElementById("password_timer").classList.remove("d-none");
        initTimerGlobal();
    }

    if (settings.use_timer_word == true) {
        document.getElementById("password_timer").classList.remove("d-none");
        initTimerWord();
    }
}

function endPassword() {
    document.getElementById("rules").classList.remove("d-none");

    document.getElementById("title").classList.remove("d-none");
    document.getElementById("credits").classList.remove("d-none");
    document.getElementById("button_password_start").classList.remove("d-none");
    document.getElementById("password_timer").classList.add("d-none");
    document.getElementById("button_password_settings").classList.remove("d-none");
    document.getElementById("button_password_recap").classList.remove("d-none");
    document.getElementById("exit_button").classList.add("d-none");

    document.getElementById("password_ingame_content").classList.remove("started");
    document.getElementById("password_ingame_content").classList.add("not-started");
    document.getElementById("password_controls").classList.remove("started");
    document.getElementById("password_controls").classList.add("not-started");

    //Action enabled
    disableActionButtons(false);

    document.getElementById("password_ingame_status").innerHTML = "";
    document.getElementById("password_ingame_display").innerHTML = "...";

    if (settings.use_timer_global == true) {
        clearInterval(global.globalTimerInterval);
    }

    if (settings.use_timer_word == true) {
        clearInterval(global.wordTimerInterval);
    }
}

function disableActionButtons(value) {
    document.getElementById("button_password_invalidate").disabled = value;
    document.getElementById("button_password_pass").disabled = value;
    document.getElementById("button_password_validate").disabled = value;
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
    const index = game.index;

    if (index >= game.words.length) {
        password_displayRecap();
        return;
    }
    disableActionButtons(false);

    if (settings.use_timer_word == true) {
        initTimerWord()
    }

    const word = game.words[index];
    password_ingame_display.classList.remove("password-changing-word");
    setTimeout(() => password_ingame_display.classList.add("password-changing-word"), 1);
    setTimeout(() => {
        password_ingame_display.innerHTML = word.word;
    }, 250);

    highlightWord(word);
}

function passwordValidate() {
    const index = game.index;
    const word = game.words[index];

    updateIndicator(word, ["correct"], ["highlighted", "pass"]);
    word.status = "correct";

    game.index++;
}

function passwordInvalidate() {
    const index = game.index;
    const word = game.words[index];

    updateIndicator(word, ["disabled"], ["highlighted", "pass"]);
    word.status = "disabled";

    game.index++;
}

function passwordPass() {
    const index = game.index;
    const word = game.words[index];

    updateIndicator(word, ["pass"], ["highlighted"]);
    word.status = "pass";

    // 🔄 le "pass" revient en fin de liste
    game.words.push(word);
    game.index++;
}

function initTimerGlobal() {
    clearInterval(global.globalTimerInterval);
    timer_left = settings.timer_global;

    const element = document.getElementById("password_timer");
    element.innerHTML = timer_left;

    global.globalTimerInterval = setInterval(() => {
        timer_left--;
        element.innerHTML = timer_left;

        if (timer_left <= 0) {
            clearInterval(global.globalTimerInterval);
            password_displayRecap(); // fin de partie quand le chrono global est terminé
        }
        console.log(timer_left)
    }, 1000);
}

function passwordDisplayNextWordDelayed() {
    setTimeout(function() {
        initTimerWord()
        passwordDisplayNextWord();
    }, global.automatic_timed_word_change_delay)
}

function initTimerWord() {
    clearInterval(global.wordTimerInterval);
    timer_left = settings.timer_word;

    const element = document.getElementById("password_timer");
    element.innerHTML = timer_left;

    global.wordTimerInterval = setInterval(() => {
        timer_left--;
        element.innerHTML = timer_left;

        if (timer_left <= 0) {
            clearInterval(global.wordTimerInterval);
            console.log("next word"); // fin de partie quand le chrono global est terminé
            disableActionButtons(true);
            passwordInvalidate()
            passwordDisplayNextWordDelayed()
        }
        console.log(timer_left)
    }, 1000);
}

function password_displayRecap() {
    endPassword();

    const data = game.words;

    // supprimer les doublons par "id"
    const reduced = Object.values(
    data.reduce((acc, item) => {
        acc[item.id] = item; // garde le dernier trouvé pour chaque id
        return acc;
    }, {})
    );

    // trier par id croissant
    const sorted = reduced.sort((a, b) => a.id - b.id);

    password_recap_placeholder.innerHTML = "";
    for (const word of sorted) {
        password_recap_placeholder.innerHTML += 
            `<div class='centered recap_word password-shield ${word.status}'>
                <div><span>${word.word}</span></div>
            </div>`;
    }
    global.modal_recap.show();
}
