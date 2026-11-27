(() => {
  "use strict";

  const cardSelector = ".project-card";
  const dateSelector = '[id="Date"], .date, time[datetime]';
  const search = document.querySelector("#searchInput");
  const sections = [...document.querySelectorAll("main section")];
  const cards = sections.flatMap(section =>
    [...section.querySelectorAll(cardSelector)].map(card => ({ card, section }))
  );
  if (!cards.length) return;

  const parseDate = value => {
    const text = (value || "").trim();
    let match = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (match) {
      const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date.getTime() : null;
    }
    match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date.getTime();
    }
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const getDate = card => {
    const node = card.querySelector(dateSelector);
    return parseDate(node?.getAttribute("datetime") || node?.textContent);
  };
  const getText = card => card.textContent.toLocaleLowerCase();
  const controls = document.createElement("div");
  controls.className = "filter-controls";
  controls.innerHTML = `
    <label>Sort by date
      <select id="dateSort" aria-label="Sort projects by date">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="default">Original order</option>
      </select>
    </label>
    <label>From date (DD/MM/YYYY)
      <input id="dateFrom" inputmode="numeric" placeholder="e.g. 01/01/2026">
    </label>
    <label>To date (DD/MM/YYYY)
      <input id="dateTo" inputmode="numeric" placeholder="e.g. 21/11/2026">
    </label>`;
  const main = document.querySelector("main");
  if (main) main.insertBefore(controls, main.firstChild);
  const sort = controls.querySelector("#dateSort");
  const from = controls.querySelector("#dateFrom");
  const to = controls.querySelector("#dateTo");

  const originalOrder = new Map(cards.map((item, index) => [item.card, index]));

  function update() {
    const query = (search?.value || "").trim().toLocaleLowerCase();
    const minDate = from.value.trim() ? parseDate(from.value) : null;
    const maxDate = to.value.trim() ? parseDate(to.value) : null;

    cards.forEach(({ card }) => {
      const timestamp = getDate(card);
      const dateText = card.querySelector(dateSelector)?.textContent.trim() || "";
      const validRange = (!from.value.trim() || minDate !== null) &&
                         (!to.value.trim() || maxDate !== null);
      const matchesQuery = !query || getText(card).includes(query);
      const matchesFrom = !from.value.trim() || (timestamp !== null && minDate !== null && timestamp >= minDate);
      const matchesTo = !to.value.trim() || (timestamp !== null && maxDate !== null && timestamp <= maxDate);
      card.hidden = !(validRange && matchesQuery && matchesFrom && matchesTo);
      card.dataset.sortDate = timestamp === null ? "" : String(timestamp);
    });

    sections.forEach(section => {
      const sectionCards = cards.filter(item => item.section === section);
      sectionCards.sort((a, b) => {
        const av = getDate(a.card), bv = getDate(b.card);
        if (sort.value === "default") return originalOrder.get(a.card) - originalOrder.get(b.card);
        if (av === null && bv === null) return originalOrder.get(a.card) - originalOrder.get(b.card);
        if (av === null) return 1;
        if (bv === null) return -1;
        return sort.value === "oldest" ? av - bv : bv - av;
      });
      sectionCards.forEach(({ card }) => section.appendChild(card));
    });
  }

  search?.addEventListener("input", update);
  sort.addEventListener("change", update);
  from.addEventListener("input", update);
  to.addEventListener("input", update);
  [from, to].forEach(input => input.addEventListener("change", () => {
    if (input.value.trim() && parseDate(input.value) === null) {
      input.setCustomValidity("Use DD/MM/YYYY, for example 21/11/2026.");
      input.reportValidity();
    } else input.setCustomValidity("");
  }));
  update();
})();
