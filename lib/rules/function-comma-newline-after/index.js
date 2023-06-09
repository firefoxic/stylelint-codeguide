import fixer from "../functionCommaSpaceFix.js"
import functionCommaSpaceChecker from "../functionCommaSpaceChecker.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `function-comma-newline-after`

export const messages = ruleMessages(ruleName, {
	expectedAfter: () => `Expected newline after ","`,
	expectedAfterMultiLine: () => `Expected newline after "," in a multi-line function`,
	rejectedAfterMultiLine: () => `Unexpected whitespace after "," in a multi-line function`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/function-comma-newline-after/README.md`,
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
			locationChecker: checker.afterOneOnly,
			checkedRuleName: ruleName,
			fix: context.fix ? (div, index, nodes) =>
				fixer({
					div,
					index,
					nodes,
					expectation: primary,
					position: `after`,
					symb: context.newline || ``,
				}) : null,
		})
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
