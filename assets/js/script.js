let pressedBtn = false;
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
    message : '${!}Bonjour je suis ${red}Tektiv${/}, je recherche une alternance!',
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
    message : "<strong>Quoi!? ${!}C'est impossible!</strong>",
    voice : audios.female,
}, {
    character : 'maya',
    name : 'Maya',
    expression : 'worried',
    message : "Tu mérites d'en avoir au moins ${?} 100.",
    voice : audios.female,
}, {
    character : 'maya',
    name : 'Wright',
    expression : 'sad',
    message : "${blue}( Il n'a pas l'air d'avoir la pêche le pauvre...)",
    voice : audios.female,
}]

const numberOfEffects = {
    alert : 0,
    shake : 0
};

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

const setCharacter = (character, expression, isTalking = 0) => {
    const mode = isTalking? 'talking' : 'silent';
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

        if (ui.wName.classList.contains('d-none') && scene[messageIndex]?.name)
            ui.wName.classList.remove('d-none');
        else if (!(ui.wName.classList.contains('d-none')) && scene[messageIndex]?.name == null)
            ui.wName.classList.add('d-none');
        ;
        // ?. => seulement s'il existe l'indice en question dans 'scene'

        ui.characterName.innerHTML = scene[messageIndex]?.name;

        if (messageIndex >= 0) {
            numberOfEffects.alert = scene[messageIndex].message.split ('${?}').length - 1;
            numberOfEffects.shake = scene[messageIndex].message.split ('${!}').length - 1;
        }

        typeWriter(scene[messageIndex]);
        }
}

const nextCharactersAreEffects = (str, index) => {
    return str.substring(index, index + 4) === '${!}' 
        || str.substring(index, index + 4) === '${?}';
};

const getEffect = (str, index) => {
    const substring = str.substring(index, index + 4);
    if (substring === '${!}') return 'shake';
    if (substring === '${?}') return 'alert';
    return null;
}

const handleEffect = (effect) => {
    if (numberOfEffects[effect] <= 0) return;
    numberOfEffects[effect]--;

    audios[effect].currentTime = 0;
    audios[effect].volume = 0.05;
    audios[effect].play();

    const element = effect === 'alert' ? ui.characterbox : ui.bg;
    element.classList.add(effect);
    setTimeout(() => {
        element.classList.remove(effect) 
    }, 500);
}

const typeWriter = (currentScene) => {
    let index = 0;
    let printedMessage = '';

    if (typeWriterInterval)
        clearInterval(typeWriterInterval);
    ;
    isTyping = true;
    
    const isTalking = currentScene.name.toLowerCase() === currentScene.character;
    setCharacter(currentScene.character, currentScene.expression, isTalking);

    currentScene.message = currentScene.message
        .replace(/\$\{(red|green|blue)\}/g, '<span class="$1">')
        .replace(/\$\{\/\}/g, '</span>');

    const message = currentScene.message?.trim();

    typeWriterInterval = setInterval(() => {
        if (index < message.length) {

            if (nextCharactersAreEffects(message, index)) {
                const effect = getEffect(message, index);
                handleEffect(effect);
                index = index + 4;
            }

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
            setCharacter(currentScene.character, currentScene.expression, 0);
            isTyping = false;
        }
    }, 40);
}

const dispalyFullMessage = () => {
    const currentScene = scene[messageIndex];
    const message = currentScene.message?.trim()?.replace(/\$\{[?!]\}/g, ''); // [!?]=> ! ou ?

    if (currentScene.message.includes('${?}')) {
        handleEffect('alert');
    }else if (currentScene.message.includes('${!}')) {
        handleEffect('shake');
    }


    ui.dialog.innerHTML = message;
    setCharacter(currentScene.character, currentScene.expression, 0);
}

ui.nextbox.addEventListener('click', () => {

    //si le bouton est activé, alors on ne fait rien (anti-spam)
    if (pressedBtn) return;
    
    if (audios.bgm.paused) {
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