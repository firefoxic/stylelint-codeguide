import valueParser from "postcss-value-parser"

import declarationValueIndex from "../../utils/declarationValueIndex.js"
import getDeclarationValue from "../../utils/getDeclarationValue.js"
import report from "../../utils/report.js"
import ruleMessages from "../../utils/ruleMessages.js"
import setDeclarationValue from "../../utils/setDeclarationValue.js"
import validateOptions from "../../utils/validateOptions.js"

export const ruleName = `color-hex-case`

export const messages = ruleMessages(ruleName, {
	expected: (actual, expected) => `Expected "${actual}" to be "${expected}"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/color-hex-case/README.md`,
	fixable: true,
}

const HEX = /^#[0-9A-Za-z]+/
const IGNORED_FUNCTIONS = new Set([`url`])

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => (root, result) => {
	const validOptions = validateOptions(result, ruleName, {
		actual: primary,
		possible: [`lower`, `upper`],
	})

	if (!validOptions) {
		return
	}

	root.walkDecls((decl) => {
		const parsedValue = valueParser(getDeclarationValue(decl))
		let needsFix = false

		parsedValue.walk((node) => {
			const { value } = node

			if (isIgnoredFunction(node)) {return false}

			if (!isHexColor(node)) {return}

			const expected = primary === `lower` ? value.toLowerCase() : value.toUpperCase()

			if (value === expected) {return}

			if (context.fix) {
				node.value = expected
				needsFix = true

				return
			}

			report({
				message: messages.expected(value, expected),
				node: decl,
				index: declarationValueIndex(decl) + node.sourceIndex,
				result,
				ruleName,
			})
		})

		if (needsFix) {
			setDeclarationValue(decl, parsedValue.toString())
		}
	})
}

/**
 * @param {import('postcss-value-parser').Node} node
 */
function isIgnoredFunction ({ type, value }) {
	return type === `function` && IGNORED_FUNCTIONS.has(value.toLowerCase())
}

/**
 * @param {import('postcss-value-parser').Node} node
 */
function isHexColor ({ type, value }) {
	return type === `word` && HEX.test(value)
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
