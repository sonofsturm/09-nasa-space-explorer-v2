const apodData =
  "https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json";

const gallery = document.getElementById("gallery");
const button = document.getElementById("getImageBtn");

const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");
const closeBtn = document.querySelector(".close");
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin more than 600 times per second.",
  "One million Earths could fit inside the Sun.",
  "The footprints left on the Moon will likely remain for millions of years.",
  "Olympus Mons on Mars is the tallest volcano in the Solar System.",
  "Saturn could float in water because it is less dense than water.",
  "A teaspoon of neutron star material would weigh billions of tons on Earth.",
  "There are more stars in the universe than grains of sand on Earth's beaches.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Jupiter's Great Red Spot is a giant storm that has lasted for centuries."
];

button.addEventListener("click", loadImages);

displayRandomFact();

function displayRandomFact() {
  const factBox = document.getElementById("spaceFact");

  const randomIndex = Math.floor(
    Math.random() * spaceFacts.length
  );

  factBox.innerHTML = `
    <strong>🚀 Did You Know?</strong><br>
    ${spaceFacts[randomIndex]}
  `;
}

async function loadImages() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    alert("Please select both dates.");
    return;
  }

  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;

  try {
    const response = await fetch(apodData);
    const data = await response.json();

    const filteredData = data.filter(item => {
      return item.date >= startDate &&
             item.date <= endDate;
    });

    displayGallery(filteredData);

  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Error loading data.</p>
      </div>
    `;

    console.error(error);
  }
}

function displayGallery(images) {
  gallery.innerHTML = "";

  if (images.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>No images found for selected dates.</p>
      </div>
    `;
    return;
  }

  images.forEach(item => {
    const card = document.createElement("div");

    card.classList.add("gallery-item");

    if (item.media_type === "image") {

      card.innerHTML = `
        <img src="${item.hdurl || item.url}" alt="${item.title}">
        <p><strong>${item.title}</strong></p>
        <p>${item.date}</p>
      `;

    } else {

      card.innerHTML = `
        <div class="placeholder-icon">🎥</div>
        <p><strong>${item.title}</strong></p>
        <p>${item.date}</p>
        <a href="${item.url}" target="_blank">
          Watch NASA Video
        </a>
      `;

    }

    card.addEventListener("click", () => {
      openModal(item);
    });
    gallery.appendChild(card);
  });
}

function openModal(item) {

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;

  if (item.media_type === "image") {

    modalImage.style.display = "block";
    modalImage.src = item.hdurl || item.url;

    modalExplanation.innerHTML = item.explanation;

  } else {

    modalImage.style.display = "none";

    modalExplanation.innerHTML = `
      ${item.explanation}
      <br><br>
      <a href="${item.url}" target="_blank">
        Watch NASA Video
      </a>
    `;

  }

  modal.style.display = "block";
}

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", event => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});