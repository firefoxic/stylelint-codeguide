import declarationColonSpaceChecker from "../declarationColonSpaceChecker.js"
import declarationValueIndex from "../../utils/declarationValueIndex.js"
import ruleMessages from "../../utils/ruleMessages.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `declaration-colon-space-after`

export const messages = ruleMessages(ruleName, {
	expectedAfter: () => `Expected single space after ":"`,
	rejectedAfter: () => `Unexpected whitespace after ":"`,
	expectedAfterSingleLine: () => `Expected single space after ":" with a single-line declaration`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/declaration-colon-space-after/README.md`,
	fixable: true,
}

/** @type {import('stylelint').Rule} */
const rule = (primary, _secondaryOptions, context) => {
	const checker = whitespaceChecker(`space`, primary, messages)

	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: [`always`, `never`, `always-single-line`],
		})

		if (!validOptions) {
			return
		}

		declarationColonSpaceChecker({
			root,
			result,
			locationChecker: checker.after,
			checkedRuleName: ruleName,
			fix: context.fix ? (decl, index) => {
				const colonIndex = index - declarationValueIndex(decl)
				const between = decl.raws.between

				if (between === null) {throw new Error(`\`between\` must be present`)}

				if (primary.startsWith(`always`)) {
					decl.raws.between = between.slice(0, colonIndex) + between.slice(colonIndex).replace(/^:\s*/, `: `)

					return true
				}

				if (primary === `never`) {
					decl.raws.between = between.slice(0, colonIndex) + between.slice(colonIndex).replace(/^:\s*/, `:`)

					return true
				}

				return false
			} : null,
		})
	}
}

rule.ruleName = ruleName
rule.messages = messages
rule.meta = meta
export default rule
