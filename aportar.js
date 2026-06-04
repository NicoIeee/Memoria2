// aportar.js
// Carga la base real desde data/detenidos-desaparecidos.json.
// Guarda cada aporte en Supabase para que aparezca desde cualquier computador o celular.
// Ya no usa localStorage.

const DATASET_URL = "data/detenidos-desaparecidos.json";
const STORAGE_BUCKET = "memoria-files";

let people = [];

const personSearch = document.getElementById("personSearch");
const personSelect = document.getElementById("personSelect");
const selectedPersonInfo = document.getElementById("selectedPersonInfo");
const memoryForm = document.getElementById("memoryForm");
const submitButton = document.getElementById("submitButton");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getPersonLabel(person) {
  const locationParts = [
    person.comuna,
    person.ciudad,
    person.region
  ].filter(Boolean);

  const locationText = locationParts.length
    ? " — " + locationParts.join(", ")
    : "";

  return `${person.nombre}${locationText}`;
}

function renderPersonOptions(filteredPeople) {
  personSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = filteredPeople.length
    ? "Selecciona una persona"
    : "No se encontraron resultados";

  personSelect.appendChild(defaultOption);

  filteredPeople.forEach(person => {
    const option = document.createElement("option");
    option.value = person.id;
    option.textContent = getPersonLabel(person);
    personSelect.appendChild(option);
  });
}

function filterPeople(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return people;
  }

  return people.filter(person => {
    const searchableText = normalizeText([
      person.nombre,
      person.calificacion,
      person.categoria,
      person.militancia,
      person.fecha_detencion_muerte,
      person.region,
      person.ciudad,
      person.comuna,
      person.edad,
      person.ocupacion
    ].join(" "));

    return searchableText.includes(normalizedQuery);
  });
}

function updateSelectedPersonInfo() {
  const selectedPerson = people.find(person => person.id === personSelect.value);

  if (!selectedPerson) {
    selectedPersonInfo.innerHTML = "";
    return;
  }

  selectedPersonInfo.innerHTML = `
    <div class="person-preview">
      <strong>${selectedPerson.nombre}</strong>
      <span>${selectedPerson.calificacion || "Sin calificación registrada"}</span>
      <span>${selectedPerson.fecha_detencion_muerte ? "Fecha: " + selectedPerson.fecha_detencion_muerte : ""}</span>
      <span>${selectedPerson.region ? "Región: " + selectedPerson.region : ""}</span>
      <span>${selectedPerson.comuna ? "Comuna: " + selectedPerson.comuna : ""}</span>
      <span>${selectedPerson.edad ? "Edad: " + selectedPerson.edad : ""}</span>
      <span>${selectedPerson.ocupacion ? "Ocupación: " + selectedPerson.ocupacion : ""}</span>
    </div>
  `;
}

async function loadPeopleDatabase() {
  try {
    const response = await fetch(DATASET_URL);

    if (!response.ok) {
      throw new Error(`No se pudo cargar la base de datos: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("El JSON no tiene el formato esperado.");
    }

    people = data
      .filter(person => person && person.id && person.nombre)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    renderPersonOptions(people);
  } catch (error) {
    console.error(error);

    personSelect.innerHTML = "";

    const errorOption = document.createElement("option");
    errorOption.value = "";
    errorOption.textContent = "No se pudo cargar la base de personas";

    personSelect.appendChild(errorOption);

    alert("No se pudo cargar la base de personas detenidas desaparecidas. Revisa que data/detenidos-desaparecidos.json exista y esté publicado.");
  }
}

function getSimpleFileType(mime) {
  if (!mime) return "document";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}

function getSafeFileName(fileName) {
  return String(fileName || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function createRandomId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

async function uploadFileToSupabase(file, personId) {
  const safeFileName = getSafeFileName(file.name);
  const filePath = `${personId}/${Date.now()}-${createRandomId()}-${safeFileName}`;

  const { error: uploadError } = await window.supabaseClient.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = window.supabaseClient.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    name: file.name,
    type: getSimpleFileType(file.type),
    mime: file.type,
    path: filePath,
    url: data.publicUrl
  };
}

async function saveMemoryToSupabase(memory) {
  const { error } = await window.supabaseClient
    .from("memories")
    .insert({
      person_id: memory.personId,
      name: memory.name,
      message: memory.message,
      type: memory.type,
      relation: memory.relation,
      files: memory.files,
      dedicated_to: memory.dedicatedTo
    });

  if (error) {
    throw error;
  }
}

function setLoadingState(isLoading) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading
    ? "Guardando memoria..."
    : "Construir memoria";
}

personSearch.addEventListener("input", () => {
  const filteredPeople = filterPeople(personSearch.value);
  renderPersonOptions(filteredPeople);
  selectedPersonInfo.innerHTML = "";
});

personSelect.addEventListener("change", () => {
  updateSelectedPersonInfo();
});

memoryForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!window.supabaseClient) {
    alert("No se pudo conectar con Supabase. Revisa supabaseClient.js.");
    return;
  }

  const contributionType = document.getElementById("contributionType");
  const filesInput = document.getElementById("filesInput");
  const messageInput = document.getElementById("messageInput");
  const relationInput = document.getElementById("relationInput");
  const consentInput = document.getElementById("consentInput");

  const selectedPerson = people.find(person => person.id === personSelect.value);

  if (!selectedPerson) {
    alert("Selecciona una persona detenida desaparecida para asociar la memoria.");
    return;
  }

  if (!messageInput.value.trim()) {
    alert("Escribe un mensaje o testimonio.");
    return;
  }

  if (!consentInput.checked) {
    alert("Debes confirmar que el aporte puede formar parte del memorial digital.");
    return;
  }

  const files = Array.from(filesInput.files);

  try {
    setLoadingState(true);

    const uploadedFiles = await Promise.all(
      files.map(file => uploadFileToSupabase(file, selectedPerson.id))
    );

    const newMemory = {
      personId: selectedPerson.id,
      name: selectedPerson.nombre,
      message: messageInput.value.trim(),
      type: contributionType.value,
      relation: relationInput.value,
      files: uploadedFiles,
      createdAt: new Date().toISOString(),

      dedicatedTo: {
        id: selectedPerson.id,
        nombre: selectedPerson.nombre,
        calificacion: selectedPerson.calificacion || "",
        categoria: selectedPerson.categoria || "",
        militancia: selectedPerson.militancia || "",
        fecha_detencion_muerte: selectedPerson.fecha_detencion_muerte || "",
        region: selectedPerson.region || "",
        ciudad: selectedPerson.ciudad || "",
        comuna: selectedPerson.comuna || "",
        edad: selectedPerson.edad || "",
        ocupacion: selectedPerson.ocupacion || "",
        pagina_origen: selectedPerson.pagina_origen || ""
      }
    };

    await saveMemoryToSupabase(newMemory);

    alert("Memoria agregada. Ahora aparecerá en el memorial desde cualquier computador o celular.");

    event.target.reset();
    selectedPersonInfo.innerHTML = "";
    renderPersonOptions(people);
  } catch (error) {
    console.error("Error al guardar memoria:", error);
    alert("No se pudo guardar la memoria en Supabase. Abre la consola con F12 para ver el error exacto.");
  } finally {
    setLoadingState(false);
  }
});

loadPeopleDatabase();