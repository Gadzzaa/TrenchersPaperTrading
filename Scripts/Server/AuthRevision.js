/**
 * Checks whether a value is a valid shared worker revision.
 *
 * @param {unknown} revision
 * @returns {boolean}
 */
export function isValidWorkerRevision(revision) {
    return (
        Number.isSafeInteger(revision) &&
        revision >= 0
    );
}