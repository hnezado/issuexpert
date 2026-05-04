// Format text capitalizing every word
function formatText(text = "") {
  return text
    .trim()
    .split(/\s+/) // One or more spaces
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export { formatText };
