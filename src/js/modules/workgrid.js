// Repeats the screenshots in the "What I have built" wall until it fills the whole section, at any screen size.
// The repeats are hidden from screen readers, so each screenshot is only announced once.
export function initWorkGrid() {
  const wall = document.querySelector('[data-work-wall]');
  if (!wall) return;

  const originals = [...wall.children];
  if (!originals.length) return;

  let next = 0;

  const columns = () => getComputedStyle(wall).gridTemplateColumns.split(' ').length;

  const addCopy = () => {
    const copy = originals[next % originals.length].cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('img').forEach((img) => {
      img.alt = '';
      img.loading = 'lazy';
    });
    wall.append(copy);
    next++;
  };

  // Keep adding copies (in the same order, round and round) until the tiles run past the bottom of the section,
  // then finish off the last row so there are no gaps along the bottom.
  const fill = () => {
    let guard = 0;
    while (wall.scrollHeight <= wall.clientHeight && guard++ < 200) addCopy();
    while (wall.children.length % columns() !== 0 && guard++ < 200) addCopy();
  };

  fill();
  window.addEventListener('resize', fill);
}
