import declarationBangSpaceChecker from "../declarationBangSpaceChecker.js"
import declarationValueIndex from "../../utils/declarationValueIndex.js"
import getDeclarationValue from "../../utils/getDeclarationValue.js"
import ruleMessages from "../../utils/ruleMessages.js"
import setDeclarationValue from "../../utils/setDeclarationValue.js"
import validateOptions from "../../utils/validateOptions.js"
import whitespaceChecker from "../../utils/whitespaceChecker.js"

export const ruleName = `declaration-bang-space-before`

export const messages = ruleMessages(ruleName, {
	expectedBefore: () => `Expected single space before "!"`,
	rejectedBefore: () => `Unexpected whitespace before "!"`,
})

export const meta = {
	url: `https://github.com/firefoxic/stylelint-codeguide/blob/main/lib/rules/declaration-bang-space-before/README.md`,
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

		declarationBangSpaceChecker({
			root,
			result,
			locationChecker: checker.before,
			checkedRuleName: ruleName,
			fix: context.fix ? (decl, index) => {
				let bangIndex = index - declarationValueIndex(decl)
				const value = getDeclarationValue(decl)
				let target
				/** @type {(val: string) => void} */
				let setFixed

				if (bangIndex < value.length) {
					target = value
					setFixed = (val) => {
						setDeclarationValue(decl, val)
					}
				} else if (decl.important) {
					target = decl.raws.important || ` !important`
					bangIndex -= value.length
					setFixed = (val) => {
						decl.raws.important = val
					}
				} else {
					return false // not standard
				}

				const targetBefore = target.slice(0, bangIndex)
				const targetAfter = target.slice(bangIndex)

				if (primary === `always`) {
					setFixed(`${targetBefore.replace(/\s*$/, ``)} ${targetAfter}`)

					return true
				}

				if (primary === `never`) {
					setFixed(targetBefore.replace(/\s*$/, ``) + targetAfter)

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
