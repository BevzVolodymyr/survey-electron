const questions = [
  { text: "1. Як вас звати?", type: "Text" },
  { text: "2. Скільки вам років?", type: "Number" },
  { text: "3. Ваша стать:", type: "SingleChoice", options: ["Чоловіча", "Жіноча", "Інше"] },
  { text: "4. Які ваші улюблені фрукти? (перелічіть через кому)", type: "Text" },
  { text: "5. Як часто ви їсте овочі?", type: "SingleChoice", options: ["Щодня", "Кілька разів на тиждень", "Рідко"] },
  { text: "6. Які види молочних продуктів ви споживаєте?", type: "MultipleChoice", options: ["Молоко", "Сир", "Йогурт", "Кефір", "Не споживаю молочні продукти"] },
  { text: "7. Як часто ви вживаєте фастфуд?", type: "SingleChoice", options: ["Раз на тиждень або частіше", "1-3 рази на місяць", "Рідше, ніж раз на місяць", "Не вживаю"] },
  { text: "8. Чи дотримуєтесь ви певного режиму харчування?", type: "SingleChoice", options: ["Так, строго", "Намагаюсь, але не завжди виходить", "Ні, не дотримуюсь"] },
  { text: "9. Як ви оцінюєте свої знання про здорове харчування?", type: "SingleChoice", options: ["Дуже хороші", "Середні", "Погано обізнаний(а)"] },
  { text: "10. Ваші коментарі або побажання:", type: "Text" }
];

let currentQuestionIndex = 0;
let answers = [];
const surveyTitle = "Опитування про звички харчування";

document.addEventListener('DOMContentLoaded', () => {
  showQuestion();
  updateProgress();

  document.getElementById('btnNext').addEventListener('click', () => {
    saveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
      updateProgress();
    } else {
      completeSurvey();
    }
  });

  document.getElementById('btnPrevious').addEventListener('click', () => {
    saveAnswer();
    currentQuestionIndex--;
    showQuestion();
    updateProgress();
  });

  document.getElementById('btnExit').addEventListener('click', async () => {
    const result = await window.electronAPI.showConfirmBox({
      message: 'Ви дійсно бажаєте вийти? Всі незбережені відповіді будуть втрачені.',
      title: 'Підтвердження виходу',
      buttons: ['Так', 'Ні']
    });
    if (result === 0) {
      window.electronAPI.quitApp();
    }
  });
});

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    completeSurvey();
    return;
  }

  const question = questions[currentQuestionIndex];
  document.getElementById('questionText').textContent = question.text;
  document.getElementById('btnNext').textContent = currentQuestionIndex === questions.length - 1 ? 'Завершити' : 'Далі';
  document.getElementById('btnPrevious').disabled = currentQuestionIndex === 0;

  const answerControls = document.getElementById('answerControls');
  answerControls.innerHTML = '';

  switch (question.type) {
    case 'Text':
      const textArea = document.createElement('textarea');
      textArea.className = 'w-full p-2 border rounded';
      textArea.rows = 4;
      if (answers[currentQuestionIndex]) textArea.value = answers[currentQuestionIndex];
      answerControls.appendChild(textArea);
      break;

    case 'Number':
      const numberInput = document.createElement('input');
      numberInput.type = 'number';
      numberInput.min = 0;
      numberInput.max = 120;
      numberInput.className = 'w-full p-2 border rounded';
      if (answers[currentQuestionIndex]) numberInput.value = answers[currentQuestionIndex];
      answerControls.appendChild(numberInput);
      break;

    case 'SingleChoice':
      question.options.forEach((option, idx) => {
        const div = document.createElement('div');
        div.className = 'mb-2 w-full';
        const radioId = `singleChoice_${currentQuestionIndex}_${idx}`;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'singleChoice';
        radio.value = option;
        radio.id = radioId;
        radio.className = 'mr-2';
        if (answers[currentQuestionIndex] === option) radio.checked = true;
        const label = document.createElement('label');
        label.textContent = option;
        label.setAttribute('for', radioId);
        div.appendChild(radio);
        div.appendChild(label);
        answerControls.appendChild(div);
      });
      break;

    case 'MultipleChoice':
      question.options.forEach((option, idx) => {
        const div = document.createElement('div');
        div.className = 'mb-2 w-full';
        const checkboxId = `multipleChoice_${currentQuestionIndex}_${idx}`;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option;
        checkbox.id = checkboxId;
        checkbox.className = 'mr-2';
        if (answers[currentQuestionIndex]?.includes(option)) checkbox.checked = true;
        const label = document.createElement('label');
        label.textContent = option;
        label.setAttribute('for', checkboxId);
        div.appendChild(checkbox);
        div.appendChild(label);
        answerControls.appendChild(div);
      });
      break;
  }
}

function saveAnswer() {
  const question = questions[currentQuestionIndex];
  const answerControls = document.getElementById('answerControls');
  let answer = '';

  switch (question.type) {
    case 'Text':
      answer = answerControls.querySelector('textarea').value;
      break;
    case 'Number':
      answer = answerControls.querySelector('input[type="number"]').value;
      break;
    case 'SingleChoice':
      const selectedRadio = answerControls.querySelector('input[type="radio"]:checked');
      answer = selectedRadio ? selectedRadio.value : '';
      break;
    case 'MultipleChoice':
      const checkedBoxes = answerControls.querySelectorAll('input[type="checkbox"]:checked');
      answer = Array.from(checkedBoxes).map(cb => cb.value).join(', ');
      break;
  }

  answers[currentQuestionIndex] = answer;
}

function updateProgress() {
  const percent = ((currentQuestionIndex + 1) / questions.length) * 100;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressText').textContent = `Питання ${currentQuestionIndex + 1} з ${questions.length}`;
}

async function completeSurvey() {
  const content = `Опитування: ${surveyTitle}\nДата: ${new Date().toLocaleString()}\n=================================\n\n` +
    questions.map((q, i) => `Питання ${i + 1}: ${q.text}\nВідповідь: ${answers[i] || ''}`).join('\n\n');
  const fileName = `Survey_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}.txt`;

  try {
    const fullPath = await window.electronAPI.saveFile(content, fileName);
    await window.electronAPI.showMessageBox({
      message: `Результати збережено у файл:\n${fullPath}`,
      title: 'Збережено'
    });
  } catch (error) {
    await window.electronAPI.showMessageBox({
      message: `Помилка при збереженні файлу: ${error.message}`,
      title: 'Помилка'
    });
    return;
  }

  const result = `Дякуємо за участь в опитуванні!\n\nРезультати:\n` +
    questions.map((q, i) => `\n${q.text}\n→ ${answers[i] || ''}\n`).join('');

  await window.electronAPI.showMessageBox({
    message: result,
    title: 'Результати опитування'
  });

  const restart = await window.electronAPI.showConfirmBox({
    message: 'Бажаєте пройти опитування ще раз?',
    title: 'Опитування завершено',
    buttons: ['Так', 'Ні']
  });

  if (restart === 0) {
    currentQuestionIndex = 0;
    answers = [];
    showQuestion();
    updateProgress();
  } else {
    window.electronAPI.quitApp();
  }
}