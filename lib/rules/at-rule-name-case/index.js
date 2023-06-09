import isStandardSyntaxAtRule from "../../utils/isStandardSyntaxAtRule.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"

export const ruleName = `at-rule-name-case`

export const messages = ruleMessages(ruleName, {
	expected: (actual, expected) => `Expected "${actual}" to be "${expected}"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/at-rule-name-case/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondary, context) => (root, result) => {
	const validOptions = validateOptions(result, ruleName, {
		actual: primary,
		possible: [`lower`, `upper`],
	})

	if (!validOptions) {
		return
	}

	/** @type {'lower' | 'upper'} */
	const expectation = primary

	root.walkAtRules((atRule) => {
		if (!isStandardSyntaxAtRule(atRule)) {
			return
		}

		const name = atRule.name

		const expectedName = expectation === `lower` ? name.toLowerCase() : name.toUpperCase()

		if (name === expectedName) {
			return
		}

		if (context.fix) {
			atRule.name = expectedName

			return
		}

		report({
			message: messages.expected(name, expectedName),
			node: atRule,
			ruleName,
			result,
		})
	})
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
