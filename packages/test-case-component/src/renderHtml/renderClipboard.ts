/**
 * Renders the clipboard HTML if clipboard content exists.
 *
 * @param {string | undefined} clipboard - The clipboard string or undefined.
 * @returns {string} The HTML string for the clipboard, or an empty string if clipboard is undefined.
 */
export function renderClipboard(clipboard: string | undefined): string {
    if (!clipboard) {
        return "";
    }
    return `<pre><code>clipboard: ${clipboard}</pre></code>`;
}
