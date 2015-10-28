let RuleBuilder = require('./RuleBuilder')

let acorn = require('acorn')
let _ = require('lodash')

export default class CodeSnippet {
	constructor(code) {
		try {
			this.syntaxTree = acorn.parse(code)
		} catch (err) {
			console.warn("Invalid Javascript, failed to parse syntax tree")
			this.syntaxTree = {}
		}
	}

	validateWhitelist() {
		let features = []
		if (_.isArray(arguments[0])) {
			features = arguments[0]
		} else {
			features = _.toArray(arguments)
		}

		let ruleString = '{'+features.join(',')+'}'

		let rule = RuleBuilder.parse(ruleString)
		return rule.test(this.syntaxTree)
	}

	validateBlacklist() {
		let features = []
		if (_.isArray(arguments[0])) {
			features = arguments[0]
		} else {
			features = _.toArray(arguments)
		}

		for (let feature of features) {
			let rule = RuleBuilder.parse('{'+feature+'}')
			if (rule.test(this.syntaxTree))
				return false
		}
		return true
	}

	validateStructure(ruleString) {
		return RuleBuilder.parse(ruleString).test(this.syntaxTree)
	}
}