const moods = {
  5: "😄",
  4: "🙂",
  3: "😐",
  2: "😔",
  1: "😣"
};

const moodNames = {
  5: "Excellent",
  4: "Good",
  3: "Okay",
  2: "Sad",
  1: "Difficult"
};

let viewDate = new Date();
let selectedKey = null;

const data = JSON.parse(
  localStorage.getItem("moodCalendar") || "{}"
);

const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const selectedDate = document.getElementById("selectedDate");
const note = document.getElementById("note");
const saveNote = document.getElementById("saveNote");
const monthAverage = document.getElementById("monthAverage");

const pad = n => String(n).padStart(2, "0");

const keyOf = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;


function saveData() {
  localStorage.setItem("moodCalendar", JSON.stringify(data));
}


function render() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthTitle.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(viewDate);

  calendar.innerHTML = "";

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startOffset = (first.getDay() + 6) % 7;
  const totalCells =
    Math.ceil((startOffset + last.getDate()) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const date = new Date(
      year,
      month,
      i - startOffset + 1
    );

    const key = keyOf(date);

    const cell = document.createElement("div");
    cell.className = "day";

    if (date.getMonth() !== month) {
      cell.classList.add("other");
    }

    const today = new Date();

    if (key === keyOf(today)) {
      cell.classList.add("today");
    }

    if (key === selectedKey) {
      cell.classList.add("selected");
    }

    const record = data[key];

    cell.innerHTML = `
      <div class="day-number">${date.getDate()}</div>
      ${
        record?.mood
          ? `
            <div class="mood">${moods[record.mood]}</div>
            <span class="mood-dot"></span>
          `
          : ""
      }
    `;

    cell.addEventListener("click", () => selectDay(date));

    calendar.appendChild(cell);
  }

  updateAverage(year, month);
}


function updateAverage(year, month) {
  const values = Object.entries(data)
    .filter(([key, value]) => {
      const d = new Date(key);

      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        value.mood
      );
    })
    .map(([, value]) => Number(value.mood));

  monthAverage.textContent = values.length
    ? (
        values.reduce((a, b) => a + b, 0) /
        values.length
      ).toFixed(1)
    : "—";
}


function selectDay(date) {
  selectedKey = keyOf(date);

  const record = data[selectedKey] || {};

  selectedDate.textContent = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);

  note.disabled = false;
  saveNote.disabled = false;

  note.value = record.note || "";

  document
    .querySelectorAll(".legend button")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.mood) === Number(record.mood)
      );
    });

  render();
}


document
  .querySelectorAll(".legend button")
  .forEach(button => {

    button.addEventListener("click", () => {
      if (!selectedKey) return;

      const mood = Number(button.dataset.mood);

      data[selectedKey] = {
        ...(data[selectedKey] || {}),
        mood
      };

      saveData();

      selectDay(
        new Date(selectedKey + "T12:00:00")
      );
    });

  });


saveNote.addEventListener("click", () => {
  if (!selectedKey) return;

  data[selectedKey] = {
    ...(data[selectedKey] || {}),
    note: note.value.trim()
  };

  saveData();

  saveNote.textContent = "Saved ✓";

  setTimeout(() => {
    saveNote.textContent = "Save Entry";
  }, 1200);
});


document
  .getElementById("prevMonth")
  .addEventListener("click", () => {

    viewDate.setMonth(
      viewDate.getMonth() - 1
    );

    render();
  });


document
  .getElementById("nextMonth")
  .addEventListener("click", () => {

    viewDate.setMonth(
      viewDate.getMonth() + 1
    );

    render();
  });


document
  .getElementById("todayBtn")
  .addEventListener("click", () => {

    viewDate = new Date();

    selectDay(new Date());
  });


render();