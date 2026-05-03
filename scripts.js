const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const counter = document.getElementById("taskCount");
const clearBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all"; // all, active, completed

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounter() {
  const activeTasks = tasks.filter(task => !task.completed).length;
  counter.textContent = activeTasks;
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  } else if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }
  return tasks;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  list.innerHTML = "";

  if (filteredTasks.length === 0) {
    let message = "";
    if (currentFilter === "active") message = "Нет активных задач!";
    else if (currentFilter === "completed") message = "Нет выполненных задач";
    else message = "Нет задач. Добавьте новую задачу!";

    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = message;
    list.appendChild(emptyMessage);
    updateCounter();

    const hasCompleted = tasks.some(task => task.completed);
    clearBtn.style.display = hasCompleted ? "block" : "none";
    return;
  }

  filteredTasks.forEach((task, filteredIndex) => {
    // Находим реальный индекс задачи в основном массиве
    const realIndex = tasks.findIndex(t => t.id === task.id);

    const li = document.createElement("li");

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      tasks[realIndex].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    taskInfo.appendChild(checkbox);
    taskInfo.appendChild(span);

    const buttons = document.createElement("div");
    buttons.className = "task-buttons";

    const editBtn = document.createElement("button");
    editBtn.textContent = " Редактировать";
    editBtn.className = "edit-btn";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = " Удалить";
    deleteBtn.className = "delete-btn";

    // Редактирование с возможностью отмены
    editBtn.onclick = () => {
      const editMode = document.createElement("div");
      editMode.className = "edit-mode";

      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "edit-input";
      editInput.value = task.text;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Сохранить";
      saveBtn.className = "save-btn";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Отмена";
      cancelBtn.className = "cancel-btn";

      editMode.appendChild(editInput);
      editMode.appendChild(saveBtn);
      editMode.appendChild(cancelBtn);

      li.innerHTML = "";
      li.appendChild(editMode);

      saveBtn.onclick = () => {
        const newText = editInput.value.trim();
        if (newText === "") {
          alert("Пожалуйста, введите текст задачи!");
          return;
        }

        tasks[realIndex].text = newText;
        saveTasks();
        renderTasks();
      };

      cancelBtn.onclick = () => {
        renderTasks();
      };

      editInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveBtn.click();
        } else if (e.key === "Escape") {
          cancelBtn.click();
        }
      });

      editInput.focus();
    };

    deleteBtn.onclick = () => {
      if (confirm(`Удалить задачу "${task.text}"?`)) {
        tasks.splice(realIndex, 1);
        saveTasks();
        renderTasks();
      }
    };

    buttons.appendChild(editBtn);
    buttons.appendChild(deleteBtn);

    li.appendChild(taskInfo);
    li.appendChild(buttons);
    list.appendChild(li);
  });

  updateCounter();

  const hasCompleted = tasks.some(task => task.completed);
  clearBtn.style.display = hasCompleted ? "block" : "none";
}

function addTask() {
  const text = input.value.trim();

  if (text === "") {
    alert("Пожалуйста, введите текст задачи!");
    input.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false
  };

  tasks.push(newTask);
  input.value = "";

  saveTasks();
  renderTasks();
  input.focus();
}

function setFilter(filter) {
  currentFilter = filter;

  filterBtns.forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderTasks();
}

addBtn.addEventListener("click", addTask);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

clearBtn.addEventListener("click", clearCompletedTasks);


filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    setFilter(btn.dataset.filter);
  });
});

renderTasks();