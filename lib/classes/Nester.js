export default class Nester {
	constructor(statement, list) {
		this.statement = statement
		this.list = list
	}

	test(node) {
		if (!this.statement.test(node))
			return false
		let childProperties = ['body', 'consequent', 'alternate', 'cases']
		for (let childProperty of childProperties)
			if (node[childProperty] != null && this.list.test(node[childProperty]))
				return true
		return false
	}

	toString() {
		return this.statement.toString() + ">" + this.list.toString()
	}
}