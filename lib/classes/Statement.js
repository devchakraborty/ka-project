let acorn = require('acorn')

let InterfaceAliases = require('../constants/InterfaceAliases')

export default class Statement {
	constructor(statement) {
		let alias = InterfaceAliases[statement] 
		this.statement = (alias == null ? statement : alias)
		this.alias = statement
	}
	test(node) {
		return node.type == this.statement
	}
	toString() {
		return this.alias
	}
}