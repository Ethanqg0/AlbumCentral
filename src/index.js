// ------------------------------------------------------
// LOCALSTORAGE INITIALIZATION
// ------------------------------------------------------
if (!localStorage.getItem("meaningToListen")) {
  localStorage.setItem("meaningToListen", JSON.stringify([]));
}

if (!localStorage.getItem("inProgress")) {
  localStorage.setItem("inProgress", JSON.stringify([]));
}

if (!localStorage.getItem("listenedTo")) {
  localStorage.setItem("listenedTo", JSON.stringify([]));
}

let meaningToListen = JSON.parse(localStorage.getItem("meaningToListen"));
let inProgress = JSON.parse(localStorage.getItem("inProgress"));
let listenedTo = JSON.parse(localStorage.getItem("listenedTo"));

// ------------------------------------------------------
// SAVE FUNCTION
// ------------------------------------------------------
function saveData() {
  localStorage.setItem("meaningToListen", JSON.stringify(meaningToListen));
  localStorage.setItem("inProgress", JSON.stringify(inProgress));
  localStorage.setItem("listenedTo", JSON.stringify(listenedTo));
}

// ------------------------------------------------------
// SIMPLE TOAST
// ------------------------------------------------------
function showToast(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  div.className =
    "fixed bottom-4 right-4 bg-zinc-900 text-white px-4 py-2 rounded-lg shadow";
  document.body.appendChild(div);

  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 1500);
}

// ------------------------------------------------------
// DOM NODES
// ------------------------------------------------------
const meaningList = document.getElementById("meaningList");
const progressList = document.getElementById("progressList");
const listenedList = document.getElementById("listenedList");

const meaningCount = document.getElementById("meaningCount");
const progressCount = document.getElementById("progressCount");
const listenedCount = document.getElementById("listenedCount");

const pickBtn = document.getElementById("pickAlbumBtn");

// ------------------------------------------------------
// RENDER FUNCTION
// ------------------------------------------------------
function render() {
  meaningList.innerHTML = "";
  progressList.innerHTML = "";
  listenedList.innerHTML = "";

  meaningToListen.forEach((album) =>
    meaningList.appendChild(
      createAlbumCard(album, () => moveToInProgress(album), "Start")
    )
  );

  inProgress.forEach((album) =>
    progressList.appendChild(
      createAlbumCard(
        album,
        () => moveToListened(album),
        "Done",
        () => moveBackToMeaning(album),
        "⟲ Back"
      )
    )
  );

  listenedTo.forEach((album) =>
    listenedList.appendChild(
      createAlbumCard(
        album,
        null,
        null,
        () => moveBackToProgress(album),
        "⟲ Undo"
      )
    )
  );

  meaningCount.textContent = meaningToListen.length;
  progressCount.textContent = inProgress.length;
  listenedCount.textContent = listenedTo.length;
}

// ------------------------------------------------------
// CREATE ALBUM CARD
// ------------------------------------------------------
function createAlbumCard(
  album,
  onMoveForward,
  forwardLabel,
  onMoveBack,
  backLabel
) {
  const div = document.createElement("div");
  div.className =
    "border border-zinc-700 p-4 rounded-lg hover:bg-zinc-800 transition relative";

  div.innerHTML = `
    <h3 class="font-semibold">${album.title}</h3>
    <p class="text-sm text-zinc-400">${album.artist}</p>
    ${
      album.year
        ? `<p class="text-xs text-zinc-500 mt-1">${album.year}</p>`
        : ""
    }
    <p class="text-xs text-zinc-500 mt-1">Priority: ${album.priority ?? 1}</p>
  `;

  if (onMoveForward && forwardLabel) {
    const btn = document.createElement("button");
    btn.textContent = forwardLabel;
    btn.className =
      "px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm absolute right-2 top-2";
    btn.onclick = onMoveForward;
    div.appendChild(btn);
  }

  if (onMoveBack && backLabel) {
    const btnBack = document.createElement("button");
    btnBack.textContent = backLabel;
    btnBack.className =
      "px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-sm absolute right-16 top-2";
    btnBack.onclick = onMoveBack;
    div.appendChild(btnBack);
  }

  return div;
}

// ------------------------------------------------------
// MOVE LOGIC
// ------------------------------------------------------
function moveToInProgress(album) {
  meaningToListen = meaningToListen.filter((a) => a.id !== album.id);
  inProgress.push(album);
  saveData();
  render();
}

function moveToListened(album) {
  inProgress = inProgress.filter((a) => a.id !== album.id);
  listenedTo.push(album);
  saveData();
  render();
}

function moveBackToMeaning(album) {
  inProgress = inProgress.filter((a) => a.id !== album.id);
  meaningToListen.push(album);
  saveData();
  render();
}

function moveBackToProgress(album) {
  listenedTo = listenedTo.filter((a) => a.id !== album.id);
  inProgress.push(album);
  saveData();
  render();
}

// ------------------------------------------------------
// WEIGHTED PICK
// ------------------------------------------------------
function weightedPick(list) {
  if (list.length === 0) return null;

  let weights = list.map((a) => Number(a.priority) || 1);
  let total = weights.reduce((x, y) => x + y, 0);

  let r = Math.random() * total;

  for (let i = 0; i < list.length; i++) {
    r -= weights[i];
    if (r <= 0) return list[i];
  }

  return list[list.length - 1];
}

// ------------------------------------------------------
// PICK ALBUM — NOW ONLY SHOW POPUP
// ------------------------------------------------------
pickBtn.addEventListener("click", () => {
  const totalEmpty =
    meaningToListen.length === 0 &&
    inProgress.length === 0 &&
    listenedTo.length === 0;

  if (totalEmpty) {
    showToast("No albums added yet!");
    return;
  }

  let r = Math.random();
  let category;

  if (r < 0.6 && meaningToListen.length > 0) category = meaningToListen;
  else if (r < 0.9 && inProgress.length > 0) category = inProgress;
  else if (listenedTo.length > 0) category = listenedTo;

  if (!category || category.length === 0) {
    if (meaningToListen.length > 0) category = meaningToListen;
    else if (inProgress.length > 0) category = inProgress;
    else category = listenedTo;
  }

  const picked = weightedPick(category);

  if (!picked) {
    showToast("No albums available!");
    return;
  }

  // OPEN POPUP
  const pickedModal = document.getElementById("pickedModal");
  const pickedContent = document.getElementById("pickedContent");

  pickedContent.innerHTML = `
    <h3 class="text-xl font-semibold">${picked.title}</h3>
    <p class="text-zinc-400">${picked.artist}</p>
    ${picked.year ? `<p class="text-zinc-500 text-sm">${picked.year}</p>` : ""}
    <p class="text-zinc-500 text-sm mt-2">Priority: ${picked.priority ?? 1}</p>
  `;

  pickedModal.classList.remove("hidden");
});

// ------------------------------------------------------
// MODAL LOGIC
// ------------------------------------------------------
const modal = document.getElementById("addModal");

document.getElementById("openAddModal").onclick = () =>
  modal.classList.remove("hidden");

document.getElementById("cancelAdd").onclick = () =>
  modal.classList.add("hidden");

// ------------------------------------------------------
// CLOSE PICKED MODAL
// ------------------------------------------------------
document.getElementById("closePicked").onclick = () =>
  document.getElementById("pickedModal").classList.add("hidden");

// ------------------------------------------------------
// ADD NEW ALBUM
// ------------------------------------------------------
document.getElementById("submitAdd").onclick = () => {
  const title = document.getElementById("albumTitle").value.trim();
  const artist = document.getElementById("albumArtist").value.trim();
  const year = document.getElementById("albumYear").value.trim();
  const priorityValue = parseFloat(
    document.getElementById("priority").value.trim()
  );

  if (!title || !artist) return;

  const newAlbum = {
    id: Date.now().toString(),
    title,
    artist,
    year,
    priority: isNaN(priorityValue)
      ? 1
      : Math.max(0, Math.min(priorityValue, 1)),
  };

  meaningToListen.push(newAlbum);

  saveData();

  modal.classList.add("hidden");

  document.getElementById("albumTitle").value = "";
  document.getElementById("albumArtist").value = "";
  document.getElementById("albumYear").value = "";
  document.getElementById("priority").value = "";

  render();
};

// ------------------------------------------------------
// INITIAL RENDER
// ------------------------------------------------------
render();
