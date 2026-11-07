
// NASA APOD API
const API_URL = "https://api.nasa.gov/planetary/apod";
const API_KEY = "DEMO_KEY";

// HTML elements
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const getImagesBtn = document.getElementById("getImagesBtn");
const gallery = document.getElementById("gallery");
const statusMessage = document.getElementById("status");

// Modal elements
const modal = document.getElementById("imageModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");
const videoLink = document.getElementById("videoLink");

// Random space facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus!",
  "There are more stars in the universe than grains of sand on Earth.",
  "Jupiter is so large that over 1,300 Earths could fit inside it.",
  "Neutron stars are so dense that a teaspoon of their material would weigh billions of tons.",
  "The Sun makes up about 99.8% of the mass of our solar system.",
  "Saturn would float in water because its average density is lower than water.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "Footprints left on the Moon can last millions of years because there is no wind or rain."
];

// Display a random space fact
function displayRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);

  document.getElementById("spaceFact").textContent =
    spaceFacts[randomIndex];
}

// Get today's date in local time
function getLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Set default date range
function setDefaultDates() {
  const today = getLocalDate();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const year = sevenDaysAgo.getFullYear();
  const month = String(sevenDaysAgo.getMonth() + 1).padStart(2, "0");
  const day = String(sevenDaysAgo.getDate()).padStart(2, "0");

  startDateInput.value = `${year}-${month}-${day}`;
  endDateInput.value = today;

  startDateInput.min = "1995-06-16";
  endDateInput.min = "1995-06-16";

  startDateInput.max = today;
  endDateInput.max = today;
}

// Format dates for display
function formatDate(date) {
  const dateObject = new Date(date + "T00:00:00");

  return dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Fetch NASA images
async function getSpaceImages() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Check that both dates are selected
  if (!startDate || !endDate) {
    statusMessage.textContent = "Please select both dates.";
    return;
  }

  // Check date range
  if (startDate > endDate) {
    statusMessage.textContent =
      "Start date cannot be after the end date.";
    return;
  }

  // Check NASA's earliest APOD date
  if (startDate < "1995-06-16") {
    statusMessage.textContent =
      "NASA APOD images start on June 16, 1995.";
    return;
  }

  if (endDate > getLocalDate()) {
    statusMessage.textContent =
      "Please select a date that is not in the future.";
    return;
  }

  // Display loading message
  statusMessage.textContent = "🔄 Loading space photos...";
  gallery.innerHTML = "";
  getImagesBtn.disabled = true;

  try {
    // Build NASA API URL
    const url =
      `${API_URL}?api_key=${API_KEY}` +
      `&start_date=${startDate}` +
      `&end_date=${endDate}`;

    // Fetch data from NASA
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
    }

    const data = await response.json();

    // NASA returns an array for a date range
    if (!Array.isArray(data)) {
      throw new Error(data.msg || "Unexpected NASA API response.");
    }

    if (data.length === 0) {
      statusMessage.textContent =
        "No space photos were found for these dates.";
      return;
    }

    // Display gallery
    displayGallery(data);

    statusMessage.textContent =
      `🌌 Found ${data.length} space ${data.length === 1 ? "entry" : "entries"}!`;

  } catch (error) {
    console.error("Error fetching NASA data:", error);

    statusMessage.textContent =
      "Something went wrong loading the space photos. Please try again.";

    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Unable to load NASA images. Check your connection and try again.</p>
      </div>
    `;

  } finally {
    getImagesBtn.disabled = false;
  }
}

// Create and display gallery cards
function displayGallery(images) {
  gallery.innerHTML = "";

  // Show newest images first
  images.sort((a, b) => b.date.localeCompare(a.date));

  images.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `View ${item.title}, ${item.date}`
    );

    if (item.media_type === "image") {
      // Create image card
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "card-image-wrapper";

      const image = document.createElement("img");
      image.src = item.hdurl || item.url;
      image.alt = item.title;
      image.loading = "lazy";

      image.onerror = () => {
        image.alt = "NASA image unavailable";
        imageWrapper.textContent = "Image unavailable";
      };

      imageWrapper.appendChild(image);
      card.appendChild(imageWrapper);

    } else if (item.media_type === "video") {
      // Handle NASA video entries
      const videoContainer = document.createElement("div");
      videoContainer.className = "video-card";
      videoContainer.innerHTML = `
        <div style="font-size: 45px;">🎬</div>
        <p>NASA Video Entry</p>
        <p>Click to view video details</p>
      `;

      card.appendChild(videoContainer);

    } else {
      // Handle other media types
      const otherContainer = document.createElement("div");
      otherContainer.className = "video-card";
      otherContainer.textContent = "NASA Media Entry";

      card.appendChild(otherContainer);
    }

    // Add title
    const title = document.createElement("h3");
    title.textContent = item.title;

    // Add date
    const date = document.createElement("p");
    date.className = "card-date";
    date.textContent = formatDate(item.date);

    card.appendChild(title);
    card.appendChild(date);

    // Open modal when card is clicked
    card.addEventListener("click", () => {
      openModal(item);
    });

    // Allow keyboard access
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(item);
      }
    });

    gallery.appendChild(card);
  });
}

// Open image details modal
function openModal(item) {
  modalTitle.textContent = item.title;
  modalDate.textContent = formatDate(item.date);
  modalExplanation.textContent = item.explanation;

  if (item.media_type === "image") {
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalImage.hidden = false;
    videoLink.hidden = true;

  } else {
    modalImage.hidden = true;
    videoLink.hidden = false;
    videoLink.href = item.url;
    videoLink.textContent = "Watch NASA video →";
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeModalBtn.focus();
}

// Close modal
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
  document.body.style.overflow = "";
}

// Event listeners
getImagesBtn.addEventListener("click", getSpaceImages);

closeModalBtn.addEventListener("click", closeModal);

// Close modal by clicking outside it
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("show")) {
    closeModal();
  }
});

// Initialize app
displayRandomFact();
setDefaultDates();
