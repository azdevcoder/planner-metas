const habitForm = document.getElementById("habitForm");
const habitList = document.getElementById("habitList");
const calendarDays = document.getElementById("calendarDays");
const monthYear = document.getElementById("monthYear");
const selectedDateText = document.getElementById("selectedDate");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const doneCountText = document.getElementById("doneCount");
const categoryStats = document.getElementById("categoryStats");

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let records = JSON.parse(localStorage.getItem("records")) || {};

let currentDate = new Date();
let selectedDate = formatDate(new Date());

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}


/* ---------------- HABITS ---------------- */

habitForm.addEventListener("submit", e => {
    e.preventDefault();
    habits.push({
        name: habitName.value,
        category: habitCategory.value
    });
    habitName.value = "";
    save();
    renderHabits();
});

/* ---------------- CALENDAR ---------------- */

function renderCalendar() {
    calendarDays.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.innerText = currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = formatDate(new Date(year, month, d));
        const div = document.createElement("div");
        div.className = "day";
        if (dateKey === selectedDate) div.classList.add("active");

        div.innerText = d;
        div.onclick = () => {
            selectedDate = dateKey;
            renderCalendar();
            renderHabits();
        };

        calendarDays.appendChild(div);
    }

    updateDashboard();
}

document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

/* ---------------- DAILY ---------------- */

function renderHabits() {
    habitList.innerHTML = "";
    selectedDateText.innerText = "Hábitos de " + selectedDate;

    if (!records[selectedDate]) {
        records[selectedDate] = {};
        habits.forEach(h => records[selectedDate][h.name] = false);
    }

    habits.forEach(habit => {
        const done = records[selectedDate][habit.name];
        const li = document.createElement("li");
        if (done) li.classList.add("done");

        li.innerHTML = `
            <span>${habit.name} <small>(${habit.category})</small></span>
            <input type="checkbox" ${done ? "checked" : ""}>
        `;

        li.querySelector("input").onchange = e => {
            records[selectedDate][habit.name] = e.target.checked;
            save();
            renderHabits();
        };

        habitList.appendChild(li);
    });

    save();
    updateDashboard();
}

/* ---------------- DASHBOARD MENSAL ---------------- */

function updateDashboard() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalExpected = habits.length * daysInMonth;
    let totalDone = 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = formatDate(new Date(year, month, d));
        if (!records[dateKey]) continue;

        habits.forEach(h => {
            if (records[dateKey][h.name]) totalDone++;
        });
    }

    const percent = totalExpected === 0
        ? 0
        : Math.round((totalDone / totalExpected) * 100);

    progressFill.style.width = percent + "%";
    progressText.innerText = percent + "%";
    doneCountText.innerText = `${totalDone} / ${totalExpected}`;

    categoryStats.innerHTML = "";
    const categories = {};

    habits.forEach(h => {
        categories[h.category] = { total: 0, done: 0 };
    });

    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = formatDate(new Date(year, month, d));
        if (!records[dateKey]) continue;

        habits.forEach(h => {
            categories[h.category].total++;
            if (records[dateKey][h.name]) {
                categories[h.category].done++;
            }
        });
    }

    for (let cat in categories) {
        const li = document.createElement("li");
        li.innerText = `${cat}: ${categories[cat].done}/${categories[cat].total}`;
        categoryStats.appendChild(li);
    }
}

/* ---------------- STORAGE ---------------- */

function save() {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("records", JSON.stringify(records));
}

/* ---------------- INIT ---------------- */

renderCalendar();
renderHabits();
updateDashboard();
