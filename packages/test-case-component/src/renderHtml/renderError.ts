/**
 * Renders the error HTML if an error occurred.
 *
 * @param {number} errorLevel - The error level index.
 * @param {string[]} errorLevels - The array of error level descriptions.
 * @returns {string} The HTML string for the error, or an empty string if no error.
 */
export function renderError(errorLevel: number, errorLevels: string[]): string {
    if (errorLevel === errorLevels.length - 1) {
        return "";
    }
    const error = errorLevels[errorLevel];
    return `<pre><code>Omitted due to errors: ${error}</pre></code>`;
}
