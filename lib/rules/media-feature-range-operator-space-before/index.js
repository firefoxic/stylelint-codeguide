import atRuleParamIndex from "../../utils/atRuleParamIndex.js"
import findMediaOperator from "../findMediaOperator.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `media-feature-range-operator-space-before`

export const messages = ruleMessages(ruleName, {
	expectedBefore: () => `Expected single space before range operator`,
	rejectedBefore: () => `Unexpected whitespace before range operator`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/media-feature-range-operator-space-before/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => {
	const checker = whitespaceChecker(`space`, primary, messages)

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: [`always`, `never`],
		})

		if (!validOptions) {
			return
		}

		root.walkAtRules(/^media$/i, (atRule) => {
			/** @type {number[]} */
			const fixOperatorIndices = []
			/** @type {((index: number) => void) | null} */
			const fix = context.fix ? (index) => fixOperatorIndices.push(index) : null

			findMediaOperator(atRule, (match, params, node) => {
				checkBeforeOperator(match, params, node, fix)
			})

			if (fixOperatorIndices.length) {
				let params = atRule.raws.params ? atRule.raws.params.raw : atRule.params

				for (const index of fixOperatorIndices.sort((a, b) => b - a)) {
					const beforeOperator = params.slice(0, index)
					const afterOperator = params.slice(index)

					if (primary === `always`) {
						params = beforeOperator.replace(/\s*$/, ` `) + afterOperator
					} else if (primary === `never`) {
						params = beforeOperator.replace(/\s*$/, ``) + afterOperator
					}
				}

				if (atRule.raws.params) {
					atRule.raws.params.raw = params
				} else {
					atRule.params = params
				}
			}
		})

		/**
		 * @param {import('style-search').StyleSearchMatch} match
		 * @param {string} params
		 * @param {import('postcss').AtRule} node
		 * @param {((index: number) => void) | null} fix
		 */
		function checkBeforeOperator (match, params, node, fix) {
			// The extra `+ 1` is because the match itself contains
			// the character before the operator
			checker.before({
				source: params,
				index: match.startIndex,
				err: (m) => {
					if (fix) {
						fix(match.startIndex)

						return
					}

					report({
						message: m,
						node,
						index: match.startIndex - 1 + atRuleParamIndex(node),
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
