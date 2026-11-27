
/*
  Portfolio filter + newest-first sorting
  Works with existing .project-card markup.
  No HTML changes required.
*/

(() => {
  "use strict";

  const CARD_SELECTOR = ".project-card";

  function getText(element, selector) {
    return (
      element.querySelector(selector)?.textContent?.trim() || ""
    );
  }

  // Collect searchable content from each project card
  function getCardSearchText(card) {
    const title = getText(card, ".title");
    const description = getText(card, ".description");
    const visibleDate = getText(card, ".date");

    const image = card.querySelector("img");

    const imageText = [
      image?.getAttribute("alt") || "",
      image?.getAttribute("title") || "",
      image?.getAttribute("src") || ""
    ].join(" ");

    const mediaText = [
      card.querySelector("video")?.getAttribute("src") || "",
      card.querySelector("video source")?.getAttribute("src") || ""
    ].join(" ");

    return [
      title,
      description,
      visibleDate,
      imageText,
      mediaText
    ]
      .join(" ")
      .toLocaleLowerCase();
  }

  // Read the date from the card or its .date element
  function getCardDate(card) {
    const rawDate =
      card.getAttribute("data-date") ||
      card.getAttribute("date-date") ||
      getText(card, ".date");

    if (!rawDate) {
      return Number.NEGATIVE_INFINITY;
    }

    const parsed = Date.parse(rawDate);

    return Number.isNaN(parsed)
      ? Number.NEGATIVE_INFINITY
      : parsed;
  }

  // Add styling for the search bar and result count
  function addStyles() {
    if (document.getElementById("portfolio-filter-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "portfolio-filter-styles";

    style.textContent = `
      .portfolio-filter-tools {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin: 0 0 24px;
      }

      .portfolio-filter-search {
        flex: 1 1 230px;
        min-width: 0;
        width: 100%;
        padding: 14px 18px;
        border: 1px solid #e5e2ef;
        border-radius: 16px;
        background: #fff;
        color: #17152b;
        font: inherit;
        outline: none;
        box-shadow: 0 4px 18px rgb(32 24 68 / 5%);
        transition: border-color .2s, box-shadow .2s;
      }

      .portfolio-filter-search:focus {
        border-color: #9b78e8;
        box-shadow: 0 0 0 4px rgb(155 120 232 / 16%);
      }

      .portfolio-filter-count {
        color: #77738b;
        font-size: .9rem;
        white-space: nowrap;
      }

      .portfolio-filter-empty {
        padding: 28px 20px;
        border: 1px dashed #d9d4e8;
        border-radius: 18px;
        color: #77738b;
        text-align: center;
      }

      @media (prefers-color-scheme: dark) {
        .portfolio-filter-search {
          background: #191821;
          color: #f5f3fb;
          border-color: #383444;
          box-shadow: none;
        }

        .portfolio-filter-count {
          color: #aaa5bc;
        }

        .portfolio-filter-empty {
          border-color: #40394f;
          color: #aaa5bc;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Add filtering and sorting to each section
  function setupSection(section) {
    const cards = Array.from(
      section.querySelectorAll(CARD_SELECTOR)
    );

    if (!cards.length) {
      return;
    }

    // Sort newest to oldest
    cards.sort((a, b) => getCardDate(b) - getCardDate(a));

    cards.forEach(card => section.appendChild(card));

    // Create search controls
    const tools = document.createElement("div");

    tools.className = "portfolio-filter-tools";

    const search = document.createElement("input");

    search.className = "portfolio-filter-search";
    search.type = "search";
    search.placeholder =
      "Search by title, description, date or image...";
    search.setAttribute("aria-label", "Search projects");
    search.autocomplete = "off";

    const count = document.createElement("span");

    count.className = "portfolio-filter-count";
    count.setAttribute("aria-live", "polite");

    tools.append(search, count);

    section.insertBefore(tools, section.firstChild);

    // Message shown when no cards match
    const empty = document.createElement("p");

    empty.className = "portfolio-filter-empty";
    empty.textContent = "No matching projects found.";
    empty.hidden = true;

    section.appendChild(empty);

    // Filter cards whenever the user types
    function filterCards() {
      const query = search.value
        .trim()
        .toLocaleLowerCase();

      let visible = 0;

      cards.forEach(card => {
        const matches =
          !query || getCardSearchText(card).includes(query);

        card.hidden = !matches;

        if (matches) {
          visible++;
        }
      });

      count.textContent =
        `${visible} ${visible === 1 ? "item" : "items"}`;

      empty.hidden = visible !== 0;
    }

    search.addEventListener("input", filterCards);

    filterCards();
  }

  function init() {
    addStyles();

    document
      .querySelectorAll("main section")
      .forEach(setupSection);
  }

  // Wait until HTML is loaded
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
  
