import isCustomProperty from "../../utils/isCustomProperty.js"
import isStandardSyntaxProperty from "../../utils/isStandardSyntaxProperty.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import optionsMatches from "../../utils/optionsMatches.js"
import { isRegExp, isString } from "../../utils/validateTypes.js"
import { isRule } from "../../utils/typeGuards.js"

export const ruleName = `property-case`

export const messages = ruleMessages(ruleName, {
	expected: (actual, expected) => `Expected "${actual}" to be "${expected}"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/property-case/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, secondaryOptions, context) => (root, result) => {
	const validOptions = validateOptions(
		result,
		ruleName,
		{
			actual: primary,
			possible: [`lower`, `upper`],
		},
		{
			actual: secondaryOptions,
			possible: {
				ignoreSelectors: [isString, isRegExp],
			},
			optional: true,
		},
	)

	if (!validOptions) {
		return
	}

	root.walkDecls((decl) => {
		const prop = decl.prop

		if (!isStandardSyntaxProperty(prop)) {
			return
		}

		if (isCustomProperty(prop)) {
			return
		}

		const { parent } = decl

		if (!parent) {
			throw new Error(`A parent node must be present`)
		}

		if (isRule(parent)) {
			const { selector } = parent

			if (selector && optionsMatches(secondaryOptions, `ignoreSelectors`, selector)) {
				return
			}
		}

		const expectedProp = primary === `lower` ? prop.toLowerCase() : prop.toUpperCase()

		if (prop === expectedProp) {
			return
		}

		if (context.fix) {
			decl.prop = expectedProp

			return
		}

		report({
			message: messages.expected(prop, expectedProp),
			word: prop,
			node: decl,
			ruleName,
			result,
		})
	})
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
