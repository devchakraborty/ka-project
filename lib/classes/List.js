let Statement = require('./Statement')
let Nester = require('./Nester')

let _ = require('lodash')

export default class List {
	constructor(items, ordered) {
		if (!_.isArray(items))
			items = [items]
		items = _.compact(items)
		for (let item of items) {
			if (!(item instanceof Statement) && !(item instanceof Nester)) {
				throw new Error("Invalid item", item)
			}
		}
		this.items = items
		this.ordered = ordered ? true : false
	}

	test(nodes) {
		if (!_.isArray(nodes))
			nodes = [nodes]

		nodes = _.compact(nodes)

		if (nodes.length == 0)
			return false
		if (this.items.length == 0)
			return true

		// Tests items against nodes in DFS pre-order for nodes
		// Shallow clone (by reference for each item) is ok here because we don't modify

		let nodesStack = _.clone(nodes)
		let itemsQueue = _.clone(this.items)

		while (nodesStack.length > 0) {
			let node = nodesStack.shift()

			// If ordered list, check against only the first remaining item
			// Otherwise, check against all

			if (this.ordered) {
				if (itemsQueue[0].test(node))
					itemsQueue.shift()
			} else {
				let matchingItem = _.find(itemsQueue, (item) => item.test(node))
				if (matchingItem != null)
					itemsQueue = _.without(itemsQueue, matchingItem)
			}

			// Done

			if (itemsQueue.length == 0)
				return true

			// Add current node's children to top of stack to process next
			// Ensure order of the children stays the same to continue pre-order traversal

			let childProperties = ['body', 'alternate', 'consequent', 'cases']
			for (let childProperty of childProperties) {
				if (node[childProperty] != null) {
					let child = node[childProperty]
					if (_.isArray(child)) {
						nodesStack = child.concat(nodesStack)
					} else {
						nodesStack.unshift(child)
					}
				}
			}
		}
		return false
	}

	toString() {
		let openingBracket = this.ordered ? '[' : '{'
		let closingBracket = this.ordered ? ']' : '}'
		return openingBracket + _.map(this.items, (item) => item.toString()).join(',') + closingBracket
	}
}