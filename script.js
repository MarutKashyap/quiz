let totalScore = 0;
let globalTimerInterval;
let quizData = {};

// Load XML data when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadQuizData();
});

// Function to load XML quiz data
function loadQuizData() {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      parseQuizXML(this.responseXML);
    }
  };
  xhr.open("GET", "questions.xml", true);
  xhr.responseType = "document";
  xhr.send();
}

// Parse the XML data
function parseQuizXML(xmlDoc) {
  quizData = {};
  const rounds = xmlDoc.getElementsByTagName("round");
  
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    const roundId = round.getAttribute("id");
    const roundName = round.getAttribute("name");
    const questionsCount = parseInt(round.getAttribute("questionsCount"));
    const marksPerQuestion = parseInt(round.getAttribute("marksPerQuestion"));
    
    quizData[roundId] = {
      name: roundName,
      questionsCount: questionsCount,
      marksPerQuestion: marksPerQuestion,
      questions: []
    };
    
    const questions = round.getElementsByTagName("question");
    for (let j = 0; j < questions.length; j++) {
      const question = questions[j];
      const questionObj = {
        q: question.getElementsByTagName("text")[0].textContent,
        options: [],
        answer: parseInt(question.getElementsByTagName("answer")[0].textContent)
      };
      
      // Check if there's an image
      const images = question.getElementsByTagName("image");
      if (images.length > 0) {
        questionObj.img = images[0].textContent;
      }
      
      // Get options
      const options = question.getElementsByTagName("option");
      for (let k = 0; k < options.length; k++) {
        questionObj.options.push(options[k].textContent);
      }
      
      quizData[roundId].questions.push(questionObj);
    }
  }
  
  // Initialize the quiz with the loaded data
  initializeQuiz();
}

// Initialize the quiz with the loaded data
function initializeQuiz() {
  // Set round names and question counts
  const rounds = ["round1", "round2", "round3"];
  rounds.forEach(roundId => {
    const roundData = quizData[roundId];
    if (roundData) {
      const roundElem = document.getElementById(roundId);
      roundElem.querySelector(".round-name").textContent = roundData.name;
      roundElem.querySelector(".question-count").textContent = roundData.questionsCount;
      roundElem.querySelector(".total-marks").textContent = roundData.questionsCount * roundData.marksPerQuestion;
      
      // Generate the HTML for the questions
      document.getElementById(`${roundId}-form`).innerHTML = generateQuestionsHTML(roundData.questions, roundId);
    }
  });
}

document
  .getElementById("login-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email.endsWith("@vit.ac.in")) {
      document.getElementById("login-error").textContent =
        "Please use a valid VIT mail ID.";
      return;
    }
    document.getElementById("login-error").textContent = "";
    document.getElementById("login-section").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
    startGlobalTimer("global-timer", 15 * 60, timeoutQuiz);
  });

function startGlobalTimer(timerElementId, duration, timeoutCallback) {
  let timer = duration,
    minutes,
    seconds;
  const display = document.getElementById(timerElementId);
  globalTimerInterval = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = "Timer: " + minutes + ":" + seconds;
    if (--timer < 0) {
      clearInterval(globalTimerInterval);
      timeoutCallback();
    }
  }, 1000);
}

function stopGlobalTimer() {
  clearInterval(globalTimerInterval);
}

function timeoutQuiz() {
  if (document.getElementById("round1").style.display !== "none") {
    submitRound1();
  } else if (document.getElementById("round2").style.display !== "none") {
    submitRound2();
  } else if (document.getElementById("round3").style.display !== "none") {
    submitRound3();
  }
}

function generateQuestionsHTML(questionsArray, formId) {
  let html = "";
  questionsArray.forEach((qObj, index) => {
    html += `<div class="question-container">`;
    html += `<p><strong>Q${index + 1}.</strong> ${qObj.q}</p>`;
    if (qObj.img) {
      html += `<img src="${qObj.img}" alt="Logo" class="img-fluid mb-2" style="max-width:150px;">`;
    }
    qObj.options.forEach((option, i) => {
      html += `<div class="form-check">
               <input class="form-check-input" type="radio" name="${formId}-q${index}" id="${formId}-q${index}-option${i}" value="${i}">
               <label class="form-check-label" for="${formId}-q${index}-option${i}">${option}</label>
             </div>`;
    });
    html += `<div id="${formId}-q${index}-feedback" class="result"></div>`;
    html += `</div>`;
  });
  return html;
}

function checkAnswers(questionsArray, formId) {
  let roundScore = 0;
  questionsArray.forEach((qObj, index) => {
    const selected = document.querySelector(
      `input[name="${formId}-q${index}"]:checked`
    );
    const feedbackEl = document.getElementById(
      `${formId}-q${index}-feedback`
    );
    if (selected) {
      if (parseInt(selected.value) === qObj.answer) {
        roundScore++;
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "result correct";
      } else {
        feedbackEl.textContent = "Incorrect!";
        feedbackEl.className = "result incorrect";
      }
    } else {
      feedbackEl.textContent = "No answer selected!";
      feedbackEl.className = "result incorrect";
    }
  });
  return roundScore;
}

function submitRound1() {
  const score = checkAnswers(quizData.round1.questions, "round1");
  totalScore += score * quizData.round1.marksPerQuestion;
  document.getElementById("round1").style.display = "none";
  document.getElementById("round2").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submitRound2() {
  const score = checkAnswers(quizData.round2.questions, "round2");
  totalScore += score * quizData.round2.marksPerQuestion;
  document.getElementById("round2").style.display = "none";
  document.getElementById("round3").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submitRound3() {
  stopGlobalTimer();
  const score = checkAnswers(quizData.round3.questions, "round3");
  totalScore += score * quizData.round3.marksPerQuestion;
  document.getElementById("round3").style.display = "none";
  document.getElementById("result-section").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  showFinalResult();
}

function showFinalResult() {
  // Calculate total possible marks
  const totalPossibleMarks = 
    quizData.round1.questionsCount * quizData.round1.marksPerQuestion +
    quizData.round2.questionsCount * quizData.round2.marksPerQuestion +
    quizData.round3.questionsCount * quizData.round3.marksPerQuestion;
  
  const normalizedScore = (totalScore / totalPossibleMarks) * 10;
  document.getElementById(
    "final-score"
  ).textContent = `Your Score: ${normalizedScore.toFixed(2)} out of 10`;
  let admission;
  if (normalizedScore > 9.5) {
    admission = "Admitted in Vellore Campus";
  } else if (normalizedScore > 7.5 && normalizedScore <= 9.4) {
    admission = "Admitted in Chennai Campus";
  } else if (normalizedScore > 6.5 && normalizedScore <= 7.4) {
    admission = "Admitted in Amravati Campus";
  } else {
    admission = "Not Admitted";
  }
  document.getElementById("admission-info").textContent = admission;
}