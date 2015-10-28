let acorn = require('acorn')

export default class Rule {
	constructor(list) {
		this.list = list
	}
	test(node) {
		return this.list.test(node)
	}
}