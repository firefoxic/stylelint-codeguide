import ruleMessages from "../../utils/ruleMessages.js"
import selectorListCommaWhitespaceChecker from "../selectorListCommaWhitespaceChecker.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `selector-list-comma-space-before`

export const messages = ruleMessages(ruleName, {
	expectedBefore: () => `Expected single space before ","`,
	rejectedBefore: () => `Unexpected whitespace before ","`,
	expectedBeforeSingleLine: () => `Expected single space before "," in a single-line list`,
	rejectedBeforeSingleLine: () => `Unexpected whitespace before "," in a single-line list`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/selector-list-comma-space-before/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => {
	const checker = whitespaceChecker(`space`, primary, messages)

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: [`always`, `never`, `always-single-line`, `never-single-line`],
		})

		if (!validOptions) {
			return
		}

		/** @type {Map<import('postcss').Rule, number[]> | undefined} */
		let fixData

		selectorListCommaWhitespaceChecker({
			root,
			result,
			locationChecker: checker.before,
			checkedRuleName: ruleName,
			fix: context.fix ? (ruleNode, index) => {
				fixData = fixData || new Map()
				const commaIndices = fixData.get(ruleNode) || []

				commaIndices.push(index)
				fixData.set(ruleNode, commaIndices)

				return true
			} : null,
		})

		if (fixData) {
			for (const [ruleNode, commaIndices] of fixData.entries()) {
				let selector = ruleNode.raws.selector ? ruleNode.raws.selector.raw : ruleNode.selector

				for (const index of commaIndices.sort((a, b) => b - a)) {
					let beforeSelector = selector.slice(0, index)
					const afterSelector = selector.slice(index)

					if (primary.includes(`always`)) {
						beforeSelector = beforeSelector.replace(/\s*$/, ` `)
					} else if (primary.includes(`never`)) {
						beforeSelector = beforeSelector.replace(/\s*$/, ``)
					}

					selector = beforeSelector + afterSelector
				}

				if (ruleNode.raws.selector) {
					ruleNode.raws.selector.raw = selector
				} else {
					ruleNode.selector = selector
				}
			}
		}
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
