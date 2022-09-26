// this is a basic connection schema to the corresponding data for the table provided.
// this API KEY will expire after January 2022
// Written by GSoosalu & ndr3svt
const API_KEY = 'AIzaSyCfuQLHd0Aha7KuNvHK0p6V6R_0kKmsRX4'
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly"
const MAX_NUMBER_OF_BUTTONS = 5
const EVALUATE_BUTTON = "evaluate"
const QUESTION_TEXT= "question_text"
const OPTION_BUTTON= "option_"
const CORRECT_ANSWER= "correct"
const CORRECT_ANSWER_POINTS = "points_correct"
const WRONG_ANSWER= "wrong"
const WRONG_ANSWER_POINTS = "points_wrong"
const NEXT_BUTTON= "next"
const ARROW_PREVIOUS = "slide-arrow-prev"
const ARROW_NEXT = "slide-arrow-next"
const HIGH_POINTS = "correct"
const MEDIUM_POINTS = "medium"
const LOW_POINTS = "wrong"
const QUESTIONS = "questions"
const HIGH_POINTS_TEXT = "Good job!" + "</br>"
const MEDIUM_POINTS_TEXT = "Keep practising!" + "</br>"
const LOW_POINTS_TEXT = "Keep practising!" + "</br>"
const FINAL = "final"
const FINAL_CONTAINER = "final_container"
const prevButton = document.getElementById(ARROW_PREVIOUS)
const nextButton = document.getElementById(ARROW_NEXT)
const evaluationNextButton = document.getElementById(NEXT_BUTTON)
let exerciseData
let options
let states = []
let topicsCorrect = {};
let topicsMax = {}
let correctAnswerIndex
let chosenAnswerIndex
let table = []
let questions = []
let score = 0
let maxScore = 0
let activeQuestion = 0
let solved = []
let solvedCounter = 0

/**
 * Goes to the next unsolved question. 
 * Once it reaches the end of the list the counter is set to 0.
 */
 function getNext(){
	activeQuestion = (activeQuestion + 1) % questions.length
	while (solved[activeQuestion]){
		activeQuestion = (activeQuestion + 1) % questions.length
	}
	setUpQuestion(activeQuestion)
}


evaluationNextButton.addEventListener("click", () => {
	getNext()
})

nextButton.addEventListener("click", () => {
	getNext()
})

/**
 * Goes to the previous unsolved question. 
 * Once it reaches the beginning of the list the counter is set to the end.
 */
prevButton.addEventListener("click", () => {
	if (activeQuestion == 0){
		activeQuestion = questions.length - 1
	} else {
		activeQuestion--
	}
	while (solved[activeQuestion]){
		if (activeQuestion == 0){
			activeQuestion = questions.length - 1
		} else {
			activeQuestion--
		}
	}
	setUpQuestion(activeQuestion)
})


/**
 * Displays active question on the webpage. 
 * 
 * @param {number} activeQuestion 
 */
function setUpQuestion(activeQuestion){
	let question =  document.getElementById(QUESTION_TEXT)
	chosenAnswerIndex = null
	question.innerHTML = questions[activeQuestion].question
	correctAnswerIndex = questions[activeQuestion].answerIndex
	for (let i = 0; i<MAX_NUMBER_OF_BUTTONS; i++){
		let answerButton = document.getElementById(OPTION_BUTTON+i)
		answerButton.classList.remove('active')
		answerButton.disabled = false
		if (i<questions[activeQuestion].answerOptions.length){
			setUpOption(answerButton, i)
		} else {
			answerButton.setAttribute('style', 'display:none')
		}
	}
	document.getElementById(EVALUATE_BUTTON).disabled = false
	document.getElementById(CORRECT_ANSWER).setAttribute("style", "display: none")
	document.getElementById(WRONG_ANSWER).setAttribute("style", "display: none")
	document.getElementById(NEXT_BUTTON).setAttribute("style", "display: none")
}

/**
 * Adds text to html and an event listener to the option button.
 *  
 * @param {Element} answerButton 
 * @param {number} currentOptionIndex
 */

function setUpOption(answerButton, currentOptionIndex){
	answerButton.setAttribute('style', 'display:block')
	answerButton.innerHTML = questions[activeQuestion].answerOptions[currentOptionIndex]
	answerButton.onclick = () => {

		if (chosenAnswerIndex != null){
			document.getElementById(OPTION_BUTTON+chosenAnswerIndex).classList.remove('active')
		}
		answerButton.classList.toggle('active')
		chosenAnswerIndex = currentOptionIndex
	}
}

function handleClientLoad() {
	gapi.load('client', initClient)
}

function initClient() {
	gapi.client.init({
	  apiKey: API_KEY,
	  discoveryDocs: DISCOVERY_DOCS
	}).then(function () {
	  getExerciseData()
	}, function(error) {
	  console.log('Init error', JSON.stringify(error, null, 2))
	})
}

/**
 * Connects with the google API and gets the data from the sheet.
 * Sets up the questions list that contains all of the questions from the sheet in form of objects with keys taken from first row in the sheet.
 * The order of questions is then randomized.
 */
function getExerciseData() {
	gapi.client.sheets.spreadsheets.values.get({
	  spreadsheetId: '1hzA42BEzt2lPvOAePP6RLLRZKggbg0RWuxSaEwd5xLc',
	  range: 'Learning!A1:F10',
	}).then(function(response) {
		table = response["result"]["values"][0]
		for (let i = 1; i<response["result"]["values"].length; i++){
			questions[i-1] = {}
			for (let j = 0; j < table.length; j++){
				if (table[j] == "answerOptions"){
					questions[i-1][table[j]] = response["result"]["values"][i][j].split(';')
				} else {
					questions[i-1][table[j]] = response["result"]["values"][i][j]
				}
				if (table[j] == "topic"){
					if (!(response["result"]["values"][i][j] in topicsCorrect)){
						topicsCorrect[response["result"]["values"][i][j]] = 0;
						topicsMax[response["result"]["values"][i][j]] = 1;
					} else {
						topicsMax[response["result"]["values"][i][j]]++;
					}
				}
			}
		}
		questions = questions.sort((a, b) => 0.5 - Math.random()); //Shuffles array
		solved = Array(questions.length).fill(false)
		activeQuestion = 0
		setUpQuestion(activeQuestion)

	}, function(response) {
		console.log('Error: ' + response.result.error.message)
	})
}


/**
 * Checks if the given answer is correct and displays the corresponding text.
 * 
 * @param {boolean} isCorrectAnswer 
 */
function showEvaluation(isCorrectAnswer){	
	score = isCorrectAnswer ? parseInt(questions[activeQuestion].score) + score : score
	maxScore = maxScore + parseInt(questions[activeQuestion].score)
	solved[activeQuestion] = true
	solvedCounter++
	document.getElementById(isCorrectAnswer ? CORRECT_ANSWER : WRONG_ANSWER).setAttribute("style", "display: block")
	document.getElementById(isCorrectAnswer ? CORRECT_ANSWER_POINTS : WRONG_ANSWER_POINTS).innerHTML = score
	topicsCorrect[questions[activeQuestion].topic ]+= isCorrectAnswer ? 1 : 0
}

/**
 * Checks if the given answer is correct and displays the corresponding text.
 * 
 * @param {boolean} isCorrectAnswer 
 */
function showEvaluation(isCorrectAnswer){	
	score = isCorrectAnswer ? parseInt(questions[activeQuestion].score) + score : score
	maxScore = maxScore + parseInt(questions[activeQuestion].score)
	solved[activeQuestion] = true
	solvedCounter++
	document.getElementById(isCorrectAnswer ? CORRECT_ANSWER : WRONG_ANSWER).setAttribute("style", "display: block")
	document.getElementById(isCorrectAnswer ? CORRECT_ANSWER_POINTS : WRONG_ANSWER_POINTS).innerHTML = score
	topicsCorrect[questions[activeQuestion].topic ]+= isCorrectAnswer ? 1 : 0
}

/**
 * Triggers when the evaluate button is clicked.
 * If no answer is chosen, it triggers an Alert.
 * If an answer is chosen, then all the option buttons and the evalute button are disabled. 
 * Evaluates the answer and displays a text and the button for next question after evaluation.
 * If all questions are answered, the function questionsAnswered is triggered.
 */
function myEvaluation(){

	if (chosenAnswerIndex == null){
		alert('Please choose an answer')
	} else {
		for (let i=0; i<MAX_NUMBER_OF_BUTTONS; i++){
			document.getElementById(OPTION_BUTTON+i).disabled = true
		}
		document.getElementById(EVALUATE_BUTTON).disabled = true
		showEvaluation(chosenAnswerIndex == correctAnswerIndex)
		if (solvedCounter == questions.length){
			questionsAnswered()
		} else {
			document.getElementById(NEXT_BUTTON).setAttribute("style", "display: block")
		}
	}
}

/**
 * Hides all elements of the current webpage and shows how many points have been scored.
 * Shows a different message based on the number of scored points.
 */
function questionsAnswered(){
	document.getElementById(QUESTIONS).setAttribute("style", "display : none")
	document.getElementById(FINAL_CONTAINER).setAttribute("style", "display: flex")
	let evaluation = document.getElementById(FINAL)
	evaluation.setAttribute("style", "display:block")
	if (score > maxScore * 3/4){
		evaluation.classList.toggle(HIGH_POINTS)
		evaluation.innerHTML += HIGH_POINTS_TEXT
	} else if (score > maxScore/2){
		evaluation.classList.toggle(MEDIUM_POINTS)	
		evaluation.innerHTML += MEDIUM_POINTS_TEXT
	} else {
		evaluation.classList.toggle(LOW_POINTS)
		evaluation.innerHTML += LOW_POINTS_TEXT
	}
	evaluation.innerHTML += "Score:" + score + "/" + maxScore + "</br>"
	for (const [key, value] of Object.entries(topicsCorrect)) {
		evaluation.innerHTML += "</br>" + key + ":" + value + "/" + topicsMax[key]
	  }
}

/**
 * Hides all elements of the current webpage and shows how many points have been scored.
 * Shows a different message based on the number of scored points.
 */
function questionsAnswered(){
	document.getElementById(QUESTIONS).setAttribute("style", "display : none")
	document.getElementById(FINAL_CONTAINER).setAttribute("style", "display: flex")
	let evaluation = document.getElementById(FINAL)
	evaluation.setAttribute("style", "display:block")
	if (score > maxScore * 3/4){
		evaluation.classList.toggle(HIGH_POINTS)
		evaluation.innerHTML += HIGH_POINTS_TEXT
	} else if (score > maxScore/2){
		evaluation.classList.toggle(MEDIUM_POINTS)	
		evaluation.innerHTML += MEDIUM_POINTS_TEXT
	} else {
		evaluation.classList.toggle(LOW_POINTS)
		evaluation.innerHTML += LOW_POINTS_TEXT
	}
	evaluation.innerHTML += "Score:" + score + "/" + maxScore + "</br>"
	for (const [key, value] of Object.entries(topicsCorrect)) {
		evaluation.innerHTML += "</br>" + key + ":" + value + "/" + topicsMax[key]
	  }
}

/**
 * Resets the webpage and starts the exam again
 */
function tryAgain(){
	questions = questions.sort((a, b) => 0.5 - Math.random()); //Shuffles array
	solved = Array(questions.length).fill(false)
	activeQuestion = 0
	score = 0
	maxScore = 0
	for (const key of Object.keys(topicsCorrect)){
		topicsCorrect[key] = 0;
	}
	solvedCounter = 0
	document.getElementById(FINAL).innerHTML = ""
	document.getElementById(QUESTIONS).setAttribute("style", "display : block")
	document.getElementById(FINAL_CONTAINER).setAttribute("style", "display: none")
	setUpQuestion(activeQuestion)
}
