import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import { isNumber } from "../../utils/validateTypes.js"

export const ruleName = `selector-max-empty-lines`

export const messages = ruleMessages(ruleName, {
	expected: (max) => `Expected no more than ${max} empty ${max === 1 ? `line` : `lines`}`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/selector-max-empty-lines/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => {
	const maxAdjacentNewlines = primary + 1

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: isNumber,
		})

		if (!validOptions) {
			return
		}

		const violatedCRLFNewLinesRegex = new RegExp(`(?:\r\n){${maxAdjacentNewlines + 1},}`)
		const violatedLFNewLinesRegex = new RegExp(`\n{${maxAdjacentNewlines + 1},}`)
		const allowedLFNewLinesString = context.fix ? `\n`.repeat(maxAdjacentNewlines) : ``
		const allowedCRLFNewLinesString = context.fix ? `\r\n`.repeat(maxAdjacentNewlines) : ``

		root.walkRules((ruleNode) => {
			const selector = ruleNode.raws.selector ? ruleNode.raws.selector.raw : ruleNode.selector

			if (context.fix) {
				const newSelectorString = selector
					.replace(new RegExp(violatedLFNewLinesRegex, `gm`), allowedLFNewLinesString)
					.replace(new RegExp(violatedCRLFNewLinesRegex, `gm`), allowedCRLFNewLinesString)

				if (ruleNode.raws.selector) {
					ruleNode.raws.selector.raw = newSelectorString
				} else {
					ruleNode.selector = newSelectorString
				}
			} else if (
				violatedLFNewLinesRegex.test(selector) || violatedCRLFNewLinesRegex.test(selector)
			) {
				report({
					message: messages.expected(primary),
					node: ruleNode,
					index: 0,
					result,
					ruleName,
				})
			}
		})
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
