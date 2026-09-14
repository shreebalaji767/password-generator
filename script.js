"use strict";


/* =========================================
   CHARACTER SETS
========================================= */

const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"
};

const AMBIGUOUS = "O0Il1";


/* =========================================
   DOM ELEMENTS
========================================= */

const passwordOutput =
    document.getElementById("passwordOutput");

const lengthInput =
    document.getElementById("length");

const lengthValue =
    document.getElementById("lengthValue");

const uppercaseInput =
    document.getElementById("uppercase");

const lowercaseInput =
    document.getElementById("lowercase");

const numbersInput =
    document.getElementById("numbers");

const symbolsInput =
    document.getElementById("symbols");

const ambiguousInput =
    document.getElementById("ambiguous");

const noRepeatsInput =
    document.getElementById("noRepeats");

const generateButton =
    document.getElementById("generateButton");

const copyPassword =
    document.getElementById("copyPassword");

const togglePassword =
    document.getElementById("togglePassword");

const strengthText =
    document.getElementById("strengthText");

const strengthFill =
    document.getElementById("strengthFill");

const infoLength =
    document.getElementById("infoLength");

const infoCharset =
    document.getElementById("infoCharset");

const infoEntropy =
    document.getElementById("infoEntropy");

const multipleCount =
    document.getElementById("multipleCount");

const generateMultiple =
    document.getElementById("generateMultiple");

const multipleResults =
    document.getElementById("multipleResults");

const historyList =
    document.getElementById("historyList");

const clearHistory =
    document.getElementById("clearHistory");

const toast =
    document.getElementById("toast");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================
   SESSION HISTORY
========================================= */

let passwordHistory = [];

try {
    const savedHistory =
        sessionStorage.getItem("passwordHistory");

    if (savedHistory) {
        passwordHistory = JSON.parse(savedHistory);
    }
} catch {
    passwordHistory = [];
}


/* =========================================
   SECURE RANDOM NUMBER
========================================= */

/*
    crypto.getRandomValues() is used instead of
    Math.random() because passwords should use
    cryptographically strong randomness.
*/

function secureRandomInt(max) {

    if (max <= 0) {
        throw new Error("Maximum must be greater than zero.");
    }

    const randomArray =
        new Uint32Array(1);

    const maxUint32 =
        0x100000000;

    const limit =
        maxUint32 - (maxUint32 % max);

    let randomNumber;

    do {

        crypto.getRandomValues(randomArray);

        randomNumber =
            randomArray[0];

    } while (randomNumber >= limit);

    return randomNumber % max;
}


/* =========================================
   GET CHARACTER SET
========================================= */

function getCharacterSet() {

    let characters = "";

    if (uppercaseInput.checked) {
        characters += CHARSETS.uppercase;
    }

    if (lowercaseInput.checked) {
        characters += CHARSETS.lowercase;
    }

    if (numbersInput.checked) {
        characters += CHARSETS.numbers;
    }

    if (symbolsInput.checked) {
        characters += CHARSETS.symbols;
    }

    if (ambiguousInput.checked) {

        characters =
            [...characters]
                .filter(char => !AMBIGUOUS.includes(char))
                .join("");
    }

    return characters;
}


/* =========================================
   GET SELECTED GROUPS
========================================= */

function getSelectedGroups() {

    const groups = [];

    if (uppercaseInput.checked) {
        groups.push(
            getCleanGroup(CHARSETS.uppercase)
        );
    }

    if (lowercaseInput.checked) {
        groups.push(
            getCleanGroup(CHARSETS.lowercase)
        );
    }

    if (numbersInput.checked) {
        groups.push(
            getCleanGroup(CHARSETS.numbers)
        );
    }

    if (symbolsInput.checked) {
        groups.push(
            getCleanGroup(CHARSETS.symbols)
        );
    }

    return groups;
}


function getCleanGroup(group) {

    if (!ambiguousInput.checked) {
        return group;
    }

    return [...group]
        .filter(char => !AMBIGUOUS.includes(char))
        .join("");
}


/* =========================================
   SHUFFLE
========================================= */

function secureShuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            secureRandomInt(i + 1);

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


/* =========================================
   PASSWORD GENERATION
========================================= */

function generatePassword() {

    const length =
        Number(lengthInput.value);

    const groups =
        getSelectedGroups();

    const characterSet =
        getCharacterSet();

    if (characterSet.length === 0) {

        showToast(
            "Select at least one character type."
        );

        return "";
    }

    if (groups.length > length) {

        showToast(
            "Password length is too short for all selected types."
        );

        return "";
    }

    const passwordCharacters = [];


    /*
        Guarantee at least one character from
        every selected character group.
    */

    for (const group of groups) {

        if (group.length === 0) {
            continue;
        }

        const index =
            secureRandomInt(group.length);

        passwordCharacters.push(
            group[index]
        );
    }


    /*
        Fill the remaining characters.
    */

    let attempts = 0;

    while (
        passwordCharacters.length < length &&
        attempts < 5000
    ) {

        const index =
            secureRandomInt(characterSet.length);

        const character =
            characterSet[index];

        if (
            noRepeatsInput.checked &&
            passwordCharacters.length > 0 &&
            passwordCharacters[
                passwordCharacters.length - 1
            ] === character
        ) {

            attempts++;
            continue;
        }

        passwordCharacters.push(character);

        attempts++;
    }


    /*
        If the strict no-repeat condition
        becomes impossible, continue normally.
    */

    while (
        passwordCharacters.length < length
    ) {

        const index =
            secureRandomInt(characterSet.length);

        passwordCharacters.push(
            characterSet[index]
        );
    }


    secureShuffle(passwordCharacters);

    return passwordCharacters.join("");
}


/* =========================================
   STRENGTH CALCULATION
========================================= */

function calculateStrength(password) {

    if (!password) {
        return {
            score: 0,
            label: "—"
        };
    }

    const length =
        password.length;

    let charsetSize =
        getCharacterSet().length;

    if (charsetSize === 0) {
        charsetSize = 1;
    }

    const entropy =
        length *
        Math.log2(charsetSize);


    let score = 0;

    if (length >= 8) {
        score++;
    }

    if (length >= 12) {
        score++;
    }

    if (length >= 16) {
        score++;
    }

    if (length >= 24) {
        score++;
    }

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[a-z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }


    if (entropy < 40) {

        return {
            score: 1,
            label: "Very Weak",
            entropy
        };

    } else if (entropy < 60) {

        return {
            score: 2,
            label: "Weak",
            entropy
        };

    } else if (entropy < 80) {

        return {
            score: 3,
            label: "Good",
            entropy
        };

    } else if (entropy < 110) {

        return {
            score: 4,
            label: "Strong",
            entropy
        };

    } else {

        return {
            score: 5,
            label: "Excellent",
            entropy
        };
    }
}


/* =========================================
   UPDATE UI
========================================= */

function updatePasswordUI(password) {

    passwordOutput.value =
        password;

    const strength =
        calculateStrength(password);

    strengthText.textContent =
        strength.label;

    const percentage =
        Math.min(
            100,
            strength.score * 20
        );

    strengthFill.style.width =
        `${percentage}%`;

    /*
        Use CSS classes rather than inline colors.
    */

    strengthFill.className =
        "strength-fill";

    if (strength.score <= 2) {

        strengthFill.classList.add(
            "strength-weak"
        );

    } else if (strength.score === 3) {

        strengthFill.classList.add(
            "strength-good"
        );

    } else {

        strengthFill.classList.add(
            "strength-strong"
        );
    }


    infoLength.textContent =
        password.length;

    infoCharset.textContent =
        getCharacterSet().length;

    infoEntropy.textContent =
        `${strength.entropy.toFixed(1)} bits`;
}


/* =========================================
   GENERATE MAIN PASSWORD
========================================= */

function generateMainPassword() {

    const password =
        generatePassword();

    if (!password) {
        return;
    }

    updatePasswordUI(password);

    addToHistory(password);
}


/* =========================================
   COPY
========================================= */

async function copyText(text) {

    if (!text) {
        return;
    }

    try {

        await navigator.clipboard.writeText(text);

        showToast("Password copied to clipboard.");

    } catch {

        /*
            Fallback for browsers where the Clipboard API
            is unavailable.
        */

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        showToast("Password copied.");
    }
}


/* =========================================
   TOAST
========================================= */

let toastTimer;

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2200);
}


/* =========================================
   MULTIPLE PASSWORDS
========================================= */

function generateMultiplePasswords() {

    multipleResults.innerHTML = "";

    const count =
        Number(multipleCount.value);

    const generated = [];

    for (let i = 0; i < count; i++) {

        const password =
            generatePassword();

        if (password) {
            generated.push(password);
        }
    }

    generated.forEach(password => {

        const item =
            document.createElement("div");

        item.className =
            "multiple-item";


        const code =
            document.createElement("code");

        code.textContent =
            password;


        const button =
            document.createElement("button");

        button.className =
            "copy-multiple";

        button.type =
            "button";

        button.textContent =
            "Copy";

        button.addEventListener(
            "click",
            () => copyText(password)
        );


        item.appendChild(code);
        item.appendChild(button);

        multipleResults.appendChild(item);
    });


    showToast(
        `${generated.length} passwords generated.`
    );
}


/* =========================================
   HISTORY
========================================= */

function addToHistory(password) {

    const item = {
        password,
        time: new Date().toLocaleTimeString()
    };

    passwordHistory.unshift(item);

    /*
        Keep only the last 20.
    */

    passwordHistory =
        passwordHistory.slice(0, 20);

    saveHistory();

    renderHistory();
}


function saveHistory() {

    try {

        sessionStorage.setItem(
            "passwordHistory",
            JSON.stringify(passwordHistory)
        );

    } catch {
        // Ignore storage errors.
    }
}


function renderHistory() {

    historyList.innerHTML = "";

    if (passwordHistory.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.textContent =
            "No generated passwords yet.";

        historyList.appendChild(empty);

        return;
    }


    passwordHistory.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "history-item";


        const password =
            document.createElement("div");

        password.className =
            "history-password";

        password.textContent =
            item.password;


        const time =
            document.createElement("div");

        time.className =
            "history-time";

        time.textContent =
            item.time;


        const copy =
            document.createElement("button");

        copy.className =
            "history-copy";

        copy.type =
            "button";

        copy.textContent =
            "Copy";

        copy.addEventListener(
            "click",
            () => copyText(item.password)
        );


        row.appendChild(password);
        row.appendChild(time);
        row.appendChild(copy);

        historyList.appendChild(row);
    });
}


function clearPasswordHistory() {

    passwordHistory = [];

    saveHistory();

    renderHistory();

    showToast("History cleared.");
}


/* =========================================
   PASSWORD VISIBILITY
========================================= */

function togglePasswordVisibility() {

    if (
        passwordOutput.type === "password"
    ) {

        passwordOutput.type =
            "text";

        togglePassword.textContent =
            "🙈";

    } else {

        passwordOutput.type =
            "text";

        /*
            The generated password is already text,
            so we use CSS masking instead.
        */

        passwordOutput.style.webkitTextSecurity =
            passwordOutput.style.webkitTextSecurity === "disc"
                ? "none"
                : "disc";

        togglePassword.textContent =
            passwordOutput.style.webkitTextSecurity === "disc"
                ? "👁"
                : "🙈";
    }
}


/* =========================================
   THEME
========================================= */

function loadTheme() {

    try {

        const theme =
            localStorage.getItem("passwordTheme");

        if (theme === "dark") {

            document.body.classList.add("dark");

            themeToggle.textContent =
                "☀️";

        }

    } catch {
        // Ignore storage errors.
    }
}


function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    themeToggle.textContent =
        isDark ? "☀️" : "🌙";

    try {

        localStorage.setItem(
            "passwordTheme",
            isDark ? "dark" : "light"
        );

    } catch {
        // Ignore storage errors.
    }
}


/* =========================================
   EVENT LISTENERS
========================================= */

lengthInput.addEventListener(
    "input",
    () => {

        lengthValue.textContent =
            lengthInput.value;

        updateCharsetInfo();
    }
);


[
    uppercaseInput,
    lowercaseInput,
    numbersInput,
    symbolsInput,
    ambiguousInput,
    noRepeatsInput
].forEach(input => {

    input.addEventListener(
        "change",
        updateCharsetInfo
    );

});


generateButton.addEventListener(
    "click",
    generateMainPassword
);


copyPassword.addEventListener(
    "click",
    () => {

        copyText(
            passwordOutput.value
        );

    }
);


togglePassword.addEventListener(
    "click",
    togglePasswordVisibility
);


generateMultiple.addEventListener(
    "click",
    generateMultiplePasswords
);


clearHistory.addEventListener(
    "click",
    clearPasswordHistory
);


themeToggle.addEventListener(
    "click",
    toggleTheme
);


/* =========================================
   CHARACTER SET INFORMATION
========================================= */

function updateCharsetInfo() {

    const charset =
        getCharacterSet();

    infoCharset.textContent =
        charset.length;

    /*
        Refresh password strength estimation
        without changing the current password.
    */

    if (passwordOutput.value) {

        const strength =
            calculateStrength(
                passwordOutput.value
            );

        infoEntropy.textContent =
            `${strength.entropy.toFixed(1)} bits`;
    }
}


/* =========================================
   INITIALIZE
========================================= */

loadTheme();

renderHistory();

updateCharsetInfo();

generateMainPassword();
