const people = {
  lucia: "Lucía es alta y delgada. Es pelirroja y tiene el pelo largo y rizado. Lleva un vestido verde y unos pendientes.",
  daniel: "Daniel es bajo y fuerte. Tiene el pelo negro, barba y bigote. Lleva gafas y un jersey de color terracota.",
  elena: "Elena es de estatura media. Tiene el pelo rubio, largo y liso, y los ojos azules. Lleva una camisa blanca y una falda morada.",
  marcos: "Marcos es alto y delgado. Tiene el pelo negro, corto y ondulado, y lleva bigote. Lleva una chaqueta de color terracota.",
  sara: "Sara es baja. Tiene el pelo castaño y rizado, y tiene pecas. Lleva una blusa naranja y una falda oscura.",
  javier: "Javier es mayor y de estatura media. Tiene el pelo canoso, barba y bigote. Lleva gafas y un jersey morado."
};

const order = ["lucia", "daniel", "elena", "marcos", "sara", "javier"];
let clueIndex = 0;
let answered = false;

function spanishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find(v => v.lang.toLowerCase() === "es-es")
    || voices.find(v => v.lang.toLowerCase().startsWith("es-es"))
    || voices.find(v => v.lang.toLowerCase().startsWith("es"));
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("Este navegador no admite la lectura en voz alta.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.88;
  utterance.pitch = 1;
  const voice = spanishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

document.querySelectorAll("[data-speak]").forEach(button => {
  button.addEventListener("click", () => speak(button.dataset.speak));
});

document.querySelectorAll(".person-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".person-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-view]").forEach(b => b.classList.toggle("active", b === button));
    document.querySelectorAll(".gallery-view").forEach(view => {
      const active = view.id === button.dataset.view;
      view.hidden = !active;
      view.classList.toggle("active", active);
    });
  });
});

const playButton = document.querySelector("#play-clue");
const nextButton = document.querySelector("#next-clue");
const feedback = document.querySelector("#game-feedback");
const counter = document.querySelector("#game-counter");
const answerButtons = [...document.querySelectorAll("[data-answer]")];

playButton.addEventListener("click", () => speak(people[order[clueIndex]]));

answerButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (answered) return;
    const correct = order[clueIndex];
    if (button.dataset.answer === correct) {
      answered = true;
      button.classList.add("correct");
      feedback.textContent = "¡Muy bien! Es la persona correcta.";
      feedback.style.color = "#F09A4A";
      nextButton.disabled = false;
      answerButtons.forEach(b => b.disabled = true);
    } else {
      button.classList.add("wrong");
      feedback.textContent = "Todavía no. Escucha otra vez y observa los detalles.";
      feedback.style.color = "#FFB7A3";
      setTimeout(() => button.classList.remove("wrong"), 800);
    }
  });
});

nextButton.addEventListener("click", () => {
  clueIndex += 1;
  if (clueIndex >= order.length) {
    feedback.textContent = "¡Desafío completado! Has escuchado las seis descripciones.";
    counter.textContent = "6 de 6 · COMPLETADO";
    playButton.disabled = true;
    nextButton.disabled = true;
    return;
  }
  answered = false;
  counter.textContent = `Pista ${clueIndex + 1} de ${order.length}`;
  feedback.textContent = "";
  nextButton.disabled = true;
  answerButtons.forEach(b => {
    b.disabled = false;
    b.classList.remove("correct", "wrong");
  });
  speak(people[order[clueIndex]]);
});

function normalize(value) {
  return value.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

document.querySelector("#check-verbs").addEventListener("click", () => {
  const fields = [...document.querySelectorAll("select[data-correct]")];
  let score = 0;
  fields.forEach(field => {
    const correct = field.value === field.dataset.correct;
    field.classList.toggle("correct-field", correct);
    field.classList.toggle("wrong-field", !correct);
    if (correct) score += 1;
  });
  document.querySelector("#verb-feedback").textContent = `${score} de ${fields.length} respuestas correctas.`;
});

document.querySelector("#check-names").addEventListener("click", () => {
  const fields = [...document.querySelectorAll("input[data-name-answer]")];
  let score = 0;
  fields.forEach(field => {
    const correct = normalize(field.value) === normalize(field.dataset.nameAnswer);
    field.classList.toggle("correct-field", correct);
    field.classList.toggle("wrong-field", !correct);
    if (correct) score += 1;
  });
  document.querySelector("#name-feedback").textContent = `${score} de ${fields.length} personas identificadas.`;
});

const dateField = document.querySelector("#date-field");
if (dateField && !dateField.value) {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  dateField.value = localDate.toISOString().slice(0, 10);
}

const form = document.querySelector("#lesson-form");
const status = document.querySelector("#form-status");
form.addEventListener("submit", async event => {
  event.preventDefault();
  const submit = form.querySelector("[type='submit']");
  submit.disabled = true;
  submit.textContent = "Enviando…";
  status.textContent = "";
  try {
    const response = await fetch(form.action, { method: "POST", body: new FormData(form) });
    const data = await response.json();
    if (!data.success) throw new Error("submission failed");
    status.textContent = "¡Actividad enviada correctamente!";
    submit.textContent = "Enviado ✓";
  } catch (error) {
    status.textContent = "No se pudo enviar. Comprueba tu conexión e inténtalo otra vez.";
    submit.disabled = false;
    submit.textContent = "Enviar actividad";
  }
});
