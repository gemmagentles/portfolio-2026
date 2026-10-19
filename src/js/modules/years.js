// Keeps "years of experience" up to date: fills each [data-years-since="2012"] with the years from then to now,
// so the number goes up by one every January without editing the page.
export function initYears() {
  const thisYear = new Date().getFullYear();

  document.querySelectorAll('[data-years-since]').forEach((element) => {
    const since = Number(element.dataset.yearsSince);
    if (since) element.textContent = thisYear - since;
  });
}
