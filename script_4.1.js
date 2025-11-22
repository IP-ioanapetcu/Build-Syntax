document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("center-panel");
  const topPanel = document.getElementById("top-panel");
  const toolsButton = document.getElementById("tools-button");
  const actionsButton = document.getElementById("actions-button");
  const resetButton = document.getElementById("reset-button");
  const infoButton = document.getElementById("info-button");
const infoBox = document.getElementById("info-box");
  const buildButton = document.getElementById("build-btn");
  const translateButton = document.getElementById("translate-btn");
  const saveButton = document.getElementById("save-btn");
  const topDropTarget = document.getElementById("top-drop-target");
  const savePanel = document.getElementById("save-panel");
  const overlay = document.getElementById("saved-content");4

  const toolWords = {
    Subject: ['mirror', 'friend', 'artist', 'robot', 'life', 'day', 'fire', 'place', 'worry'],
    Verb: ['run', 'eat', 'jump', 'play', 'cook', 'drive', 'hide', 'talk', 'work'],
    Object: ['apples', 'soon', 'cake', 'phone', 'yesterday', 'long', 'table', 'broccoli', 'never']
  };

  const savedSentences = [];
  let isSaveVisible = false;

  toolsButton.addEventListener("click", () => {
    toolsButton.classList.toggle("expanded");
  });

  actionsButton.addEventListener("click", (e) => {
    if (e.target === actionsButton) {
      actionsButton.classList.toggle("expanded");
    }
  });

  document.querySelectorAll(".tool-button").forEach(btn => {
    const toolId = btn.dataset.tool;
    const grid = document.getElementById(`${toolId}-grid`);
    let isVisible = false;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      isVisible = !isVisible;
      grid.classList.toggle("hidden", !isVisible);

      if (isVisible && grid.children.length === 0) {
        toolWords[toolId].forEach((_, i) => {
          const b = document.createElement("button");
          b.textContent = i;
          b.setAttribute("draggable", true);
          b.dataset.tool = toolId;

          b.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", i);
            e.dataTransfer.setData("tool", toolId);
          });

          grid.appendChild(b);
        });
      }
    });
  });

  panel.addEventListener("dragover", e => e.preventDefault());
  infoButton.addEventListener("click", () => {
    infoBox.classList.toggle("hidden");
  });
  panel.addEventListener("drop", e => {
    e.preventDefault();
    const num = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const tool = e.dataTransfer.getData("tool");
    if (isNaN(num) || !toolWords[tool]?.[num]) return;

    const btn = document.createElement("button");
    btn.className = "dropped";
    btn.textContent = num;
    btn.dataset.original = num;
    btn.dataset.tool = tool;

    const panelRect = panel.getBoundingClientRect();
    const x = e.clientX - panelRect.left;
    const y = e.clientY - panelRect.top;

    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.position = "absolute";
    btn.addEventListener("dblclick", () => btn.remove());

    panel.appendChild(btn);
  });

  buildButton.addEventListener("click", (e) => {
    e.stopPropagation();
    actionsButton.classList.add("expanded");

    const dropped = Array.from(panel.querySelectorAll(".dropped"));
    const ordered = [
      ...dropped.filter(b => b.dataset.tool === "Subject"),
      ...dropped.filter(b => b.dataset.tool === "Verb"),
      ...dropped.filter(b => b.dataset.tool === "Object")
    ];

    topDropTarget.innerHTML = "";

    const startX = 50;
    const gap = 120;
    const y = 80;

    ordered.forEach((btn, i) => {
      const clone = btn.cloneNode(true);
      clone.textContent = btn.textContent;
      clone.className = "dropped";
      clone.dataset.original = btn.dataset.original;
      clone.dataset.tool = btn.dataset.tool;
      clone.style.left = `${startX + i * gap}px`;
      clone.style.top = `${y}px`;
      clone.style.position = "absolute";

      topDropTarget.appendChild(clone);
      btn.remove();
    });
  });

  translateButton.addEventListener("click", (e) => {
    e.stopPropagation();
    actionsButton.classList.add("expanded");

    topDropTarget.querySelectorAll(".dropped").forEach(btn => {
      const tool = btn.dataset.tool;
      const num = parseInt(btn.dataset.original);
      btn.textContent = toolWords[tool][num];
    });
  });

  resetButton.addEventListener("click", () => {
    panel.querySelectorAll(".dropped").forEach(b => b.remove());
  });

  saveButton.addEventListener("click", (e) => {
    e.stopPropagation();
    actionsButton.classList.add("expanded");

    const sentence = Array.from(topDropTarget.querySelectorAll(".dropped"))
      .map(btn => {
        const tool = btn.dataset.tool;
        const num = parseInt(btn.dataset.original);
        return toolWords[tool]?.[num] || btn.textContent;
      })
      .join(" ");

    if (!isSaveVisible && sentence.trim()) {
      savedSentences.push(sentence);
    }

    if (overlay) {
      overlay.innerHTML = "";
      savedSentences.forEach(s => {
        const p = document.createElement("p");
        p.textContent = s;
        overlay.appendChild(p);
      });
    }

    isSaveVisible = !isSaveVisible;
    topPanel.classList.toggle("hidden", isSaveVisible);
    panel.classList.toggle("hidden", isSaveVisible);
    savePanel.style.display = isSaveVisible ? "block" : "none";
  });
});
