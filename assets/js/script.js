let pressedBtn = false; // initialement bouton n'est pas appuyé.
let messageIndex = -1;
let isTyping = false;  
let typeWriterInterval;

const ui = {

    textbox : document.querySelector('#textbox'),
    characterName : document.querySelector('#name'),
    dialog : document.querySelector('#dialog'),

    characterbox : document.querySelector('#characterbox'),
    bg : document.querySelector('#bg'),
    character : document.querySelector('#character'),

    dialogbox : document.querySelector('#dialogbox'),
    wName : document.querySelector('#window_name'),
    wMessage : document.querySelector('#window_message'),

    nextbox : document.querySelector('#nextbox'),
    nextButton : document.querySelector('#next_button'),
    arrow : document.querySelector('#arrow'),
}

const audios = {
    bgm : new Audio('assets/sfx/gumshoe.mp3'),
    next : new Audio('assets/sfx/bip.wav'),
    alert : new Audio('assets/sfx/lightbulb.wav'),
    shake : new Audio('assets/sfx/smack.wav'),
    male : new Audio('assets/sfx/male.wav'),
    female : new Audio('assets/sfx/female.wav')
}

const scene = [{
    character : 'tektiv',
    name : 'Tektiv',
    expression : 'pumped',
    message : 'Bonjour je suis ${red}Tektiv${/}, je recherche une alternance!',
    voice : audios.male,
}, {
    character : 'tektiv',
    name : 'Tektiv',
    expression : 'mad',
    message : "Je n'en ai toujours pas trouvé, c'est inadmissible.",
    voice : audios.male,
}, {
    character : 'maya',
    name : 'Maya',
    expression : 'surprised',
    message : "<strong>Quoi!? C'est impossible!</strong>",
    voice : audios.female,
}, {
    character : 'maya',
    name : 'Maya',
    expression : 'worried',
    message : "Tu mérites d'en avoir au moins 100.",
    voice : audios.female,
}]

const pressNextButton = () => {
    ui.nextButton.classList.add('pressBtn');
    ui.nextButton.src = 'assets/img/ui/pressed_button.png';
    ui.arrow.classList.add('d-none');
    audios.next.currentTime = 0;
    audios.next.play();
    pressedBtn = true;
};
    
    // Pour setTimeout bouton
const resetUiButton = () =>{
    ui.nextButton.classList.remove('pressBtn');
    ui.nextButton.src = 'assets/img/ui/default_button.png';
    ui.arrow.classList.remove('d-none');    
    pressedBtn = false;
};

//set character sprite and expression
const setCharacter = (character, expression, mode = 'silent') => {
    ui.character.src = `./assets/img/sprites/${character}/${mode}/${expression}.gif`
};

const showNextDialog = () => {
    if (messageIndex >= scene.length - 1) {
        messageIndex = -1;
        ui.wMessage.classList.add('d-none');
        ui.wName.classList.add('d-none');
        ui.characterName.innerHTML = '';
        ui.dialog.innerHTML = '';

    } else {
        messageIndex++;

        ui.wMessage.classList.remove('d-none');

        // affichage ou non du nom
        if (ui.wName.classList.contains('d-none') && scene[messageIndex]?.name)
            ui.wName.classList.remove('d-none');
        else if (!(ui.wName.classList.contains('d-none')) && scene[messageIndex]?.name == null)
            ui.wName.classList.add('d-none');
        ;
        // ?. => seulement s'il existe l'indice en question dans 'scene'

        ui.characterName.innerHTML = scene[messageIndex]?.name;

        const currentScene = scene[messageIndex];
        typeWriter(currentScene);
        }
}

const typeWriter = (currentScene) => {
    let index = 0;
    let printedMessage = '';

    if (typeWriterInterval)
        clearInterval(typeWriterInterval);
    ;
    isTyping = true;

    setCharacter(currentScene.character, currentScene.expression, 'talking');

    currentScene.message = currentScene.message
        .replace(/\$\{(red|green|blue)\}/g, '<span class="$1">')
        .replace(/\$\{\/\}/g, '</span>');

    const message = currentScene.message?.trim();

    typeWriterInterval = setInterval(() => {
        if (index < message.length) {

            if (message[index] === '<') {
                const closingTagIndex = message.indexOf('>', index);
                if (closingTagIndex !== -1) {
                    printedMessage += message.substring(index, closingTagIndex +1);
                    index = closingTagIndex + 1;
                }else{
                    printedMessage += message[index];
                    index++;
                }
            }else{
                printedMessage += message[index];
                index++;
            }

            ui.dialog.innerHTML = printedMessage;
            if (index % 2 ===0) {
                currentScene.voice.currentTime = 0;
                currentScene.voice.play();
                currentScene.voice.volume = 0.05;
            }
        }else{
            clearInterval(typeWriterInterval);
            setCharacter(currentScene.character, currentScene.expression, 'silent');
            isTyping = false;
        }
    }, 40);
}

const dispalyFullMessage = () => {
    const currentScene = scene[messageIndex];
    ui.dialog.innerHTML = currentScene.message;
    setCharacter(currentScene.character, currentScene.expression, 'silent');
}

ui.nextbox.addEventListener('click', () => {

    //si le bouton est activé, alors on ne fait rien (anti-spam)
    if (pressedBtn) return;
    
    if (audios.bgm.paused) { //audio background
        audios.bgm.loop = true;
        audios.bgm.volume = 0.2;
        audios.bgm.play();
    };

    pressNextButton();

    if (isTyping) {
        clearInterval(typeWriterInterval);
        dispalyFullMessage();
        resetUiButton();
        isTyping = false;

    }else{
        setTimeout( () => {
            showNextDialog();
            resetUiButton();
         }, 100);
    };
});