import isStandardSyntaxRule from "../../utils/isStandardSyntaxRule.js"
import isStandardSyntaxSelector from "../../utils/isStandardSyntaxSelector.js"
import { levelOneAndTwoPseudoElements } from "../../reference/selectors.js"
import parseSelector from "../../utils/parseSelector.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"

export const ruleName = `selector-pseudo-class-case`

export const messages = ruleMessages(ruleName, {
	expected: (actual, expected) => `Expected "${actual}" to be "${expected}"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/selector-pseudo-class-case/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => (root, result) => {
	const validOptions = validateOptions(result, ruleName, {
		actual: primary,
		possible: [`lower`, `upper`],
	})

	if (!validOptions) {
		return
	}

	root.walkRules((ruleNode) => {
		if (!isStandardSyntaxRule(ruleNode)) {
			return
		}

		const selector = ruleNode.selector

		if (!selector.includes(`:`)) {
			return
		}

		const fixedSelector = parseSelector(
			ruleNode.raws.selector ? ruleNode.raws.selector.raw : ruleNode.selector,
			result,
			ruleNode,
			(selectorTree) => {
				selectorTree.walkPseudos((pseudoNode) => {
					const pseudo = pseudoNode.value

					if (!isStandardSyntaxSelector(pseudo)) {
						return
					}

					if (pseudo.includes(`::`) || levelOneAndTwoPseudoElements.has(pseudo.toLowerCase().slice(1))) {
						return
					}

					const expectedPseudo = primary === `lower` ? pseudo.toLowerCase() : pseudo.toUpperCase()

					if (pseudo === expectedPseudo) {
						return
					}

					if (context.fix) {
						pseudoNode.value = expectedPseudo

						return
					}

					report({
						message: messages.expected(pseudo, expectedPseudo),
						node: ruleNode,
						index: pseudoNode.sourceIndex,
						ruleName,
						result,
					})
				})
			},
		)

		if (context.fix && fixedSelector) {
			if (ruleNode.raws.selector) {
				ruleNode.raws.selector.raw = fixedSelector
			} else {
				ruleNode.selector = fixedSelector
			}
		}
	})
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
