const gallery = document.getElementById("gallery");
const button = document.getElementById("getImageBtn");
const API_KEY = "QkpMDGFch7ddLwfg7Jp9MfJzRkCwDrmrwbnnCKLM";

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

  if (startDate > endDate) {
    alert("The start date must be before the end date.");
    return;
  }

  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;

  try {
    // Send the selected dates to NASA's Astronomy Picture of the Day API.
    const apiUrl =
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}` +
      `&start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `NASA request failed (${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.msg || errorMessage;
      } catch {
        // NASA may return plain text during a temporary service failure.
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const usableData = data.filter(item => {
      return item.media_type !== "image" || !isNasaPlaceholder(item);
    });

    // NASA sent entries, but every one was a placeholder logo
    if (data.length > 0 && usableData.length === 0) {
      showApiProblem(data[0].url);
      return;
    }

    displayGallery(usableData);

  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>${error.message}</p>
        <p>Please try again in a moment.</p>
      </div>
    `;

    console.error(error);
  }
}

function showApiProblem(logoUrl) {
  gallery.innerHTML = `
    <div class="placeholder">
      <img src="${logoUrl}" alt="NASA logo" style="width: 120px; margin-bottom: 16px;">
      <p>NASA API not currently providing images.</p>
    </div>
  `;
}

function displayGallery(images) {
  gallery.innerHTML = "";

  if (images.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>NASA returned no usable images for these dates.</p>
        <p>Try a different date range.</p>
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

      const image = card.querySelector("img");

      image.addEventListener("error", () => {
        if (image.src !== item.url) {
          image.src = item.url;
        } else {
          image.replaceWith(createUnavailableImage(item));
        }
      });

    } else {

      card.innerHTML = `
        ${item.thumbnail_url
          ? `<img src="${item.thumbnail_url}" alt="${item.title}">`
          : `<div class="placeholder-icon">🎥</div>`}
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
    modalImage.onerror = () => {
      if (modalImage.src !== item.url) {
        modalImage.src = item.url;
      } else {
        modalImage.style.display = "none";
        modalExplanation.insertAdjacentHTML(
          "afterbegin",
          `<p class="image-unavailable">Image unavailable. <a href="${item.url}" target="_blank" rel="noopener">Open source link</a></p>`
        );
      }
    };

    modalExplanation.innerHTML = item.explanation;

  } else {

    modalImage.style.display = "none";
    modalImage.onerror = null;

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

function createUnavailableImage(item) {
  const message = document.createElement("p");
  message.classList.add("image-unavailable");
  message.textContent = "Image unavailable";
  message.title = item.url;
  return message;
}

function isNasaPlaceholder(item) {
  const imageUrl = (item.hdurl || item.url || "").toLowerCase();
  return imageUrl.includes("nasa-logo") || item.title === "NASA Science";
}

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", event => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});