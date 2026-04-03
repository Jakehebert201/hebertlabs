const toolButtons = document.querySelectorAll("[data-tool-button]");
const toolPanels = document.querySelectorAll("[data-tool-panel]");

function activateTool(toolName) {
  toolButtons.forEach((button) => {
    const isActive = button.dataset.toolButton === toolName;
    button.setAttribute("aria-selected", String(isActive));
  });

  toolPanels.forEach((panel) => {
    panel.hidden = panel.dataset.toolPanel !== toolName;
  });

  if (window.history.replaceState) {
    window.history.replaceState(null, "", `#${toolName}`);
  }
}

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTool(button.dataset.toolButton);
  });
});

const requestedTool = window.location.hash.replace("#", "");
if (requestedTool && document.querySelector(`[data-tool-panel="${requestedTool}"]`)) {
  activateTool(requestedTool);
}

const form = document.getElementById("days-supply-form");

if (form) {
  const output = document.getElementById("days-supply-output");
  const status = document.getElementById("days-supply-status");
  const fillDateResult = document.getElementById("result-fill-date");
  const coveredThroughResult = document.getElementById("result-covered-through");
  const dueDateResult = document.getElementById("result-due-date");
  const fillDateInput = document.getElementById("fill-date");

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatRelativeDueText(dueDate) {
    const today = startOfDay(new Date());
    const dueStart = startOfDay(dueDate);
    const difference = Math.round((dueStart - today) / MS_PER_DAY);

    if (difference === 0) {
      status.className = "status-pill status-today";
      return "Due today";
    }

    if (difference < 0) {
      const overdueDays = Math.abs(difference);
      status.className = "status-pill status-overdue";
      return `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
    }

    status.className = "status-pill";
    return `Due in ${difference} day${difference === 1 ? "" : "s"}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const fillDate = parseLocalDate(fillDateInput.value);
    const daysSupply = Number.parseInt(document.getElementById("days-supply").value, 10);

    if (Number.isNaN(daysSupply) || daysSupply < 1) {
      return;
    }

    const coveredThrough = addDays(fillDate, daysSupply - 1);
    const dueDate = addDays(fillDate, daysSupply);

    fillDateResult.textContent = dateFormatter.format(fillDate);
    coveredThroughResult.textContent = dateFormatter.format(coveredThrough);
    dueDateResult.textContent = dateFormatter.format(dueDate);
    status.textContent = formatRelativeDueText(dueDate);
    output.hidden = false;
  });

  form.addEventListener("reset", () => {
    output.hidden = true;
    status.className = "status-pill";
    status.textContent = "Ready";
  });
}
