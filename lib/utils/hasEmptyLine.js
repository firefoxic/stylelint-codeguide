/**
 * Check if a string contains at least one empty line
 *
 * @param {string | undefined} string
 * @returns {boolean}
 */
export default function hasEmptyLine (string) {
	if (string === `` || string === undefined) {return false}

	return /\n[\r\t ]*\n/.test(string)
}
