
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const remainingCount = document.getElementById("remaining-count");

const clearCompletedButton =
  document.getElementById("clear-completed");

const filterButtons = document.querySelectorAll(".filter");

let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("my-todo-tasks") || "[]"
  );

  if (
    Array.isArray(savedTasks) &&
    savedTasks.every(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
    )
  ) {
    tasks = savedTasks;
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

// Display today's date
document.getElementById("today").textContent =
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date());

// Save tasks in the browser
function saveTasks() {
  localStorage.setItem("my-todo-tasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text: text,
    completed: false
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
});

// Show the correct tasks and update the counters
function renderTasks() {
  taskList.replaceChildren();

  const completed = tasks.filter(task => task.completed).length;
  const remaining = tasks.length - completed;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = remaining;

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyState.querySelector("h3").textContent = "No tasks yet";
    emptyState.querySelector("p").textContent =
      "Add your first task and make today count.";
  } else if (visibleTasks.length === 0) {
    emptyState.querySelector("h3").textContent = "Nothing to show";
    emptyState.querySelector("p").textContent =
      "Try another filter to see your tasks.";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
      item.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      "Mark task as completed"
    );

    checkbox.addEventListener("change", function () {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + task.text);

    deleteButton.addEventListener("click", function () {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });
}

// Filter tasks
filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(filterButton => {
      const isActive = filterButton === button;

      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

// Remove every completed task
clearCompletedButton.addEventListener("click", function () {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

// Display saved tasks when the app opens
renderTasks();