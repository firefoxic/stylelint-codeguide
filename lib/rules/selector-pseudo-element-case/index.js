import isStandardSyntaxRule from "../../utils/isStandardSyntaxRule.js"
import isStandardSyntaxSelector from "../../utils/isStandardSyntaxSelector.js"
import { levelOneAndTwoPseudoElements } from "../../reference/selectors.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import transformSelector from "../../utils/transformSelector.js"
import validateOptions from "../../utils/validateOptions.js"

export const ruleName = `selector-pseudo-element-case`

export const messages = ruleMessages(ruleName, {
	expected: (actual, expected) => `Expected "${actual}" to be "${expected}"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/selector-pseudo-element-case/README.md`,
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

		transformSelector(result, ruleNode, (selectorTree) => {
			selectorTree.walkPseudos((pseudoNode) => {
				const pseudoElement = pseudoNode.value

				if (!isStandardSyntaxSelector(pseudoElement)) {
					return
				}

				if (!pseudoElement.includes(`::`) && !levelOneAndTwoPseudoElements.has(pseudoElement.toLowerCase().slice(1))) {
					return
				}

				const expectedPseudoElement = primary === `lower` ? pseudoElement.toLowerCase() : pseudoElement.toUpperCase()

				if (pseudoElement === expectedPseudoElement) {
					return
				}

				if (context.fix) {
					pseudoNode.value = expectedPseudoElement

					return
				}

				report({
					message: messages.expected(pseudoElement, expectedPseudoElement),
					node: ruleNode,
					index: pseudoNode.sourceIndex,
					ruleName,
					result,
				})
			})
		})
	})
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
