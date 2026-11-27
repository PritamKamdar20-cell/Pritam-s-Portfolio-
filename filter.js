/**
 * filter.js
 * 1. Automatically sorts .project-card elements inside each section by date (newest first).
 * 2. Provides live search filtering across titles, descriptions, and dates.
 */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const sections = document.querySelectorAll("main section");

  /**
   * Extracts a valid timestamp from a project card.
   * Supports `data-date="YYYY-MM-DD"` attribute or text inside `#Date` / `.date`.
   */
  function getCardTimestamp(card) {
    // 1. Check optional data-date attribute first (most reliable)
    if (card.dataset.date) {
      const parsedAttr = Date.parse(card.dataset.date);
      if (!isNaN(parsedAttr)) return parsedAttr;
    }

    // 2. Fallback to #Date or .date element text
    const dateEl = card.querySelector("#Date, .date");
    if (!dateEl) return 0;

    let rawText = dateEl.textContent.trim();
    if (!rawText) return 0;

    // Remove common prefixes like "Date:" or "Published:"
    rawText = rawText.replace(/^(date|published|uploaded)\s*:\s*/i, "").trim();

    // Handle DD/MM/YYYY or DD-MM-YYYY formats (e.g., 25/11/2026 or 25-11-2026)
    const dmyMatch = rawText.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch;
      return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`).getTime();
    }

    // Remove ordinal suffixes (1st, 2nd, 3rd, 4th) so Date.parse handles "8th Nov 2026"
    const cleanedDate = rawText.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
    const parsedText = Date.parse(cleanedDate);

    return isNaN(parsedText) ? 0 : parsedText;
  }

  /**
   * Sorts all .project-card elements within each section from newest to oldest.
   */
  function sortCardsByDate() {
    sections.forEach((section) => {
      const cards = Array.from(section.querySelectorAll(".project-card"));
      if (cards.length <= 1) return;

      cards.sort((a, b) => {
        const timeA = getCardTimestamp(a);
        const timeB = getCardTimestamp(b);
        return timeB - timeA; // Descending (newest first). Swap to (timeA - timeB) for oldest first.
      });

      // Re-append cards in sorted order
      cards.forEach((card) => section.appendChild(card));
    });
  }

  /**
   * Filters project cards based on search input text and hides empty sections.
   */
  function filterCards(query) {
    const normalizedQuery = query.toLowerCase().trim();

    sections.forEach((section) => {
      const cards = Array.from(section.querySelectorAll(".project-card"));
      let visibleCount = 0;

      cards.forEach((card) => {
        const titleEl = card.querySelector("#titel, .title");
        const descEl = card.querySelector("#description, .description");
        const dateEl = card.querySelector("#Date, .date");

        const searchableText = [
          titleEl ? titleEl.textContent : "",
          descEl ? descEl.textContent : "",
          dateEl ? dateEl.textContent : "",
          card.dataset.tags || ""
        ]
          .join(" ")
          .toLowerCase();

        const isMatch = searchableText.includes(normalizedQuery);
        card.style.display = isMatch ? "" : "none";

        if (isMatch) visibleCount++;
      });

      // Hide the entire section if no cards match the query (when searching)
      if (cards.length > 0) {
        section.style.display = visibleCount === 0 && normalizedQuery !== "" ? "none" : "";
      }
    });
  }

  // Run date sorting immediately on load
  sortCardsByDate();

  // Attach live search listener
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      filterCards(event.target.value);
    });
  }
});
