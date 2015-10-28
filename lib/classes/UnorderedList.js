let List = require('./List')

let Statement = require('./Statement')
let Nester = require('./Nester')

let _ = require('lodash')

export default class UnorderedList extends List {
	constructor(items) {
		super(items)
	}

	test(nodes) {
		// nodes = _.compact(nodes)
		// if (!_.isArray(nodes))
		// 	nodes = [nodes]
		// if (nodes.length == 0)
		// 	return false
		// if (this.items.length == 0)
		// 	return true
		// return _.all(this.items, (item) => _.any(nodes, (node) => {
		// 	let childProperties = ['body', 'consequent', 'alternate', 'cases']
		// 	if (item.test(node))
		// 		return true
		// 	for (let childProperty of childProperties)
		// 		if (node[childProperty] != null && (new UnorderedList(item)).test(node[childProperty]))
		// 			return true
		// 	return false
		// }))
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
			let matchingItem = _.find(itemsQueue, (item) => item.test(node))
			if (matchingItem != null) {
				itemsQueue = _.without(itemsQueue, matchingItem)
				if (itemsQueue.length == 0)
					return true
			}
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
		return false
	}
}