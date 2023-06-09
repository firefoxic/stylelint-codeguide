import blockString from "../../utils/blockString.js"
import hasBlock from "../../utils/hasBlock.js"
import hasEmptyBlock from "../../utils/hasEmptyBlock.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `block-closing-brace-space-before`

export const messages = ruleMessages(ruleName, {
	expectedBefore: () => `Expected single space before "}"`,
	rejectedBefore: () => `Unexpected whitespace before "}"`,
	expectedBeforeSingleLine: () => `Expected single space before "}" of a single-line block`,
	rejectedBeforeSingleLine: () => `Unexpected whitespace before "}" of a single-line block`,
	expectedBeforeMultiLine: () => `Expected single space before "}" of a multi-line block`,
	rejectedBeforeMultiLine: () => `Unexpected whitespace before "}" of a multi-line block`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/block-closing-brace-space-before/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => {
	const checker = whitespaceChecker(`space`, primary, messages)

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: [
				`always`,
				`never`,
				`always-single-line`,
				`never-single-line`,
				`always-multi-line`,
				`never-multi-line`,
			],
		})

		if (!validOptions) {
			return
		}

		// Check both kinds of statement: rules and at-rules
		root.walkRules(check)
		root.walkAtRules(check)

		/**
		 * @param {import('postcss').Rule | import('postcss').AtRule} statement
		 */
		function check (statement) {
			// Return early if blockless or has empty block
			if (!hasBlock(statement) || hasEmptyBlock(statement)) {
				return
			}

			const source = blockString(statement)
			const statementString = statement.toString()

			let index = statementString.length - 2

			if (statementString[index - 1] === `\r`) {
				index -= 1
			}

			checker.before({
				source,
				index: source.length - 1,
				err: (msg) => {
					if (context.fix) {
						const statementRaws = statement.raws

						if (typeof statementRaws.after !== `string`) {return}

						if (primary.startsWith(`always`)) {
							statementRaws.after = statementRaws.after.replace(/\s*$/, ` `)

							return
						}

						if (primary.startsWith(`never`)) {
							statementRaws.after = statementRaws.after.replace(/\s*$/, ``)

							return
						}
					}

					report({
						message: msg,
						node: statement,
						index,
						result,
						ruleName,
					})
				},
			})
		}
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
