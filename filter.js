/*
 * Portfolio card filter + newest-first sorting.
 * Date format: DD/MM/YYYY (example: 02/11/2026 = 2 November 2026).
 *
 * Add a date to a card using data-date="02/11/2026", or place it in
 * the .card-date element. Cards without a valid date are placed last.
 */
(() => {
  "use strict";

  const DATE_FORMAT = "DD/MM/YYYY";
  const searchInput = document.querySelector("#searchInput");
  const sections = [...document.querySelectorAll("main section")];

  function parseDate(value) {
    if (!value) return null;
    const text = String(value).trim();

    // ISO date: YYYY-MM-DD
    let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (match) {
      const [, year, month, day] = match;
      return validDate(Number(year), Number(month), Number(day));
    }

    // Indian-style date: DD/MM/YYYY
    match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return validDate(Number(year), Number(month), Number(day));
    }

    // Date text such as "2 November 2026"
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime())
      ? null
      : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  function validDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) return null;
    return date;
  }

  function formatDate(date) {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function cardDate(card) {
    const dateElement = card.querySelector(".card-date, [id='Date'], [id='date']");
    return parseDate(card.dataset.date || dateElement?.textContent);
  }

  function prepareCard(card) {
    const dateElement = card.querySelector(".card-date, [id='Date'], [id='date']");
    const date = cardDate(card);
    if (date && dateElement) dateElement.textContent = formatDate(date);
    card.dataset.sortTimestamp = date ? String(date.getTime()) : "";
  }

  function sortCards(section) {
    const cards = [...section.querySelectorAll(".project-card")];
    cards.forEach(prepareCard);

    cards.sort((a, b) => {
      const aTime = Number(a.dataset.sortTimestamp || 0);
      const bTime = Number(b.dataset.sortTimestamp || 0);
      // Valid/newer dates first; cards without dates stay at the bottom.
      if (!aTime && !bTime) return 0;
      if (!aTime) return 1;
      if (!bTime) return -1;
      return bTime - aTime;
    });

    cards.forEach(card => section.appendChild(card));
  }

  function filterCards() {
    const query = (searchInput?.value || "").trim().toLocaleLowerCase();
    document.querySelectorAll(".project-card").forEach(card => {
      const searchableText = [
        card.querySelector(".card-title, [id='titel'], [id='title']")?.textContent,
        card.querySelector(".card-description, [id='description']")?.textContent
      ].filter(Boolean).join(" ").toLocaleLowerCase();

      // Leave blank starter/template cards visible when search is empty.
      card.hidden = Boolean(query) && !searchableText.includes(query);
    });
  }

  sections.forEach(sortCards);
  searchInput?.addEventListener("input", filterCards);

  // Expose a small helper for cards added later by other scripts.
  window.portfolioCards = {
    sort: () => sections.forEach(sortCards),
    filter: filterCards,
    dateFormat: DATE_FORMAT
  };
})();

