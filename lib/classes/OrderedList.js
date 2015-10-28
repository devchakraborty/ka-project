let _ = require('lodash')

let List = require('./List')

let UnorderedList = require('./UnorderedList')
let Nester = require('./Nester')

export default class OrderedList extends List {
	constructor(items) {
		super(items)
	}

	test(nodes) {
		nodes = _.compact(nodes)
		if (!_.isArray(nodes))
			nodes = [nodes]
		if (nodes.length == 0)
			return false
		if (this.items.length == 0)
			return true
		// Tests items against nodes in DFS order for nodes
		// Shallow clone (by reference for each item) is ok here because we don't modify
		let nodesStack = _.clone(nodes)
		let itemsQueue = _.clone(this.items)

		while (nodesStack.length > 0) {
			let node = nodesStack.shift()
			if (itemsQueue[0].test(node)) {
				itemsQueue.shift()
				if (itemsQueue.length == 0)
					return true
			} else {
				let childProperties = ['body', 'consequent', 'alternate', 'cases']
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
		}
		return false
	}
}