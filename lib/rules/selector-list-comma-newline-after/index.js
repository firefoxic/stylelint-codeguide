import styleSearch from "style-search"

import isStandardSyntaxRule from "../../utils/isStandardSyntaxRule.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `selector-list-comma-newline-after`

export const messages = ruleMessages(ruleName, {
	expectedAfter: () => `Expected newline after ","`,
	expectedAfterMultiLine: () => `Expected newline after "," in a multi-line list`,
	rejectedAfterMultiLine: () => `Unexpected whitespace after "," in a multi-line list`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/selector-list-comma-newline-after/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => {
	const checker = whitespaceChecker(`newline`, primary, messages)

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: [`always`, `always-multi-line`, `never-multi-line`],
		})

		if (!validOptions) {
			return
		}

		root.walkRules((ruleNode) => {
			if (!isStandardSyntaxRule(ruleNode)) {
				return
			}

			// Get raw selector so we can allow end-of-line comments, e.g.
			// a, /* comment */
			// b {}
			const selector = ruleNode.raws.selector ? ruleNode.raws.selector.raw : ruleNode.selector

			/** @type {number[]} */
			const fixIndices = []

			styleSearch(
				{
					source: selector,
					target: `,`,
					functionArguments: `skip`,
				},
				(match) => {
					const nextChars = selector.slice(match.endIndex)

					// If there's a // comment, that means there has to be a newline
					// ending the comment so we're fine
					if (/^\s+\/\//.test(nextChars)) {
						return
					}

					// If there are spaces and then a comment begins, look for the newline
					const indextoCheckAfter = /^\s+\/\*/.test(nextChars) ? selector.indexOf(`*/`, match.endIndex) + 1 : match.startIndex

					checker.afterOneOnly({
						source: selector,
						index: indextoCheckAfter,
						err: (m) => {
							if (context.fix) {
								fixIndices.push(indextoCheckAfter + 1)

								return
							}

							report({
								message: m,
								node: ruleNode,
								index: match.startIndex,
								result,
								ruleName,
							})
						},
					})
				},
			)

			if (fixIndices.length) {
				let fixedSelector = selector

				for (const index of fixIndices.sort((a, b) => b - a)) {
					const beforeSelector = fixedSelector.slice(0, index)
					let afterSelector = fixedSelector.slice(index)

					if (primary.startsWith(`always`)) {
						afterSelector = context.newline + afterSelector
					} else if (primary.startsWith(`never-multi-line`)) {
						afterSelector = afterSelector.replace(/^\s*/, ``)
					}

					fixedSelector = beforeSelector + afterSelector
				}

				if (ruleNode.raws.selector) {
					ruleNode.raws.selector.raw = fixedSelector
				} else {
					ruleNode.selector = fixedSelector
				}
			}
		})
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
