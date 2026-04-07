/**
 * 신구대조 diff 하이라이팅 유틸리티
 */

/**
 * 단어 단위로 oldText/newText를 비교하여 변경 부분에 HTML 태그를 씌운다.
 */
export function highlightDiff(
  oldText: string,
  newText: string,
): { oldHtml: string; newHtml: string } {
  if (!oldText)
    return {
      oldHtml: "",
      newHtml: `<span class="bg-green-200 dark:bg-green-800/60 underline">${escapeHtml(newText)}</span>`,
    };
  if (!newText)
    return {
      oldHtml: `<span class="bg-red-200 dark:bg-red-800/60 line-through">${escapeHtml(oldText)}</span>`,
      newHtml: "",
    };

  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  let oldHtml = "";
  let newHtml = "";

  const maxLen = Math.max(oldWords.length, newWords.length);
  for (let i = 0; i < maxLen; i++) {
    const ow = oldWords[i] || "";
    const nw = newWords[i] || "";

    if (ow === nw) {
      oldHtml += escapeHtml(ow);
      newHtml += escapeHtml(nw);
    } else {
      if (ow)
        oldHtml += `<span class="bg-red-200 dark:bg-red-800/60 line-through rounded px-0.5">${escapeHtml(ow)}</span>`;
      if (nw)
        newHtml += `<span class="bg-green-200 dark:bg-green-800/60 underline rounded px-0.5">${escapeHtml(nw)}</span>`;
    }
  }

  return { oldHtml, newHtml };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
