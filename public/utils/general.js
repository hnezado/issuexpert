// Format text capitalizing every word
function formatText(text = "") {
  if (!text) return;

  const formatted = text
    .trim()
    .split(/\s+/) // One or more spaces
    .filter((w) => Boolean(w)) // Avoid empty spaces
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return formatted;
}

export { formatText };
