import fixer from "../functionCommaSpaceFix.js"
import functionCommaSpaceChecker from "../functionCommaSpaceChecker.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `function-comma-newline-before`

export const messages = ruleMessages(ruleName, {
	expectedBefore: () => `Expected newline before ","`,
	expectedBeforeMultiLine: () => `Expected newline before "," in a multi-line function`,
	rejectedBeforeMultiLine: () => `Unexpected whitespace before "," in a multi-line function`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/function-comma-newline-before/README.md`,
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

		functionCommaSpaceChecker({
			root,
			result,
			locationChecker: checker.beforeAllowingIndentation,
			checkedRuleName: ruleName,
			fix: context.fix ? (div, index, nodes) =>
				fixer({
					div,
					index,
					nodes,
					expectation: primary,
					position: `before`,
					symb: context.newline || ``,
				}) : null,
		})
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
