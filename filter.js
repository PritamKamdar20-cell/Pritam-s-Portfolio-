document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchStatus = document.getElementById("searchStatus");
  const groups = Array.from(document.querySelectorAll(".project-section"), (section) => {
    const grid = section.querySelector(".project-grid");
    const cards = Array.from(grid?.querySelectorAll(":scope > .project-card") ?? [], readCard);
    return { section, grid, cards };
  });

  function normalize(text) {
    return text.toLowerCase().trim().replace(/\s+/g, " ");
  }

  function parseDate(value = "") {
    const cleaned = value.trim()
      .replace(/^(date|published|uploaded)\s*:\s*/i, "")
      .replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
    const dayFirst = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    const iso = dayFirst
      ? `${dayFirst[3]}-${dayFirst[2].padStart(2, "0")}-${dayFirst[1].padStart(2, "0")}`
      : cleaned;
    const timestamp = Date.parse(iso);

    if (!Number.isFinite(timestamp)) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso) && new Date(timestamp).toISOString().slice(0, 10) !== iso) {
      return null;
    }
    return timestamp;
  }

  function readCard(card) {
    const title = card.querySelector(".title, #titel")?.textContent;
    const description = card.querySelector(".description, #description")?.textContent;
    const date = card.querySelector(".date, #Date");
    const timestamp = parseDate(card.dataset.date) ?? parseDate(date?.getAttribute("datetime")) ?? parseDate(date?.textContent);
    const searchable = normalize([title, description, date?.textContent, date?.getAttribute("datetime"), card.dataset.date, card.dataset.tags].join(" "));

    return { card, timestamp, searchable };
  }

  const total = groups.reduce((count, group) => count + group.cards.length, 0);
  if (!total) return;

  groups.forEach(({ grid, cards }) => {
    if (cards.length < 2) return;
    cards.sort((first, second) => {
      if (first.timestamp === second.timestamp) return 0;
      if (first.timestamp === null) return 1;
      if (second.timestamp === null) return -1;
      return second.timestamp - first.timestamp;
    });
    grid.append(...cards.map(({ card }) => card));
  });

  if (!searchInput) return;
  const label = searchInput.closest("label");
  if (label) label.hidden = false;

  function filterCards() {
    const query = normalize(searchInput.value);
    const terms = query ? query.split(" ") : [];
    let matches = 0;

    groups.forEach(({ section, cards }) => {
      let visible = 0;

      cards.forEach(({ card, searchable }) => {
        card.hidden = !terms.every((term) => searchable.includes(term));
        if (!card.hidden) visible++;
      });

      section.hidden = Boolean(query) && visible === 0;
      matches += visible;
    });

    if (searchStatus) {
      searchStatus.textContent = !query ? "" : matches
        ? `${matches} ${matches === 1 ? "project" : "projects"} found.`
        : "No matching projects. Try a different search.";
    }
  }

  searchInput.addEventListener("input", filterCards);
  document.querySelectorAll(".category-nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target?.hidden) return;
      searchInput.value = "";
      filterCards();
    });
  });
  filterCards();
});
