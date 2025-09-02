const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
//array.from (taking all objects of same name)
const scoreText = document.getElementById('score');
const questionCounterText = document.getElementById('questionCounter');
const progressText = document.getElementById('progress-text');
const loader = document.getElementById('loader');
const game = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];

function decodeHTML(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}

fetch("https://opentdb.com/api.php?amount=50&category=9&difficulty=easy&type=multiple").then(res => {
    return res.json()
}).then(loadedQuestions => {
    questions = loadedQuestions.results.map(loadedQuestion => {
        const formattedQuestion = {
            question: decodeHTML(loadedQuestion.question)
        };

        const answer_choices = [...loadedQuestion.incorrect_answers].map(ans => decodeHTML(ans));
        formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
        answer_choices.splice(formattedQuestion.answer - 1, 0, decodeHTML(loadedQuestion.correct_answer));


        answer_choices.forEach((choice, index) => {
            formattedQuestion['choice' + (index + 1)] = choice;
        });

        return formattedQuestion;
    });
    startGame();

}).catch(err => {
    console.error(err);
})

// Constants
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestions();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
}

getNewQuestions = () => {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        //ADDING SCORE TO LOCAL STORAGE
        localStorage.setItem('mostRecentScore', score);
        return window.location.assign('./end.html');
    }
    questionCounter++;
    questionCounterText.innerText = `${questionCounter}/${MAX_QUESTIONS}`;
    progressText.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset["number"];
        choice.innerText = currentQuestion["choice" + number];
    });

    availableQuestions.splice(questionIndex, 1);
    // splice(indexNo , cutObjNo)
    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';
        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestions();
        }, 1000)
    })
})

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score
}