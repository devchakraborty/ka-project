let Rule = require('./Rule')
let Nester = require('./Nester')
let Statement = require('./Statement')
let List = require('./List')

function parseList(ruleString) {
	ruleString = ruleString.trim()

	let firstChar = ruleString[0]
	let lastChar = ruleString[ruleString.length - 1]

	let ordered = false

	if (firstChar == '{') { // unordered list
		if (lastChar == '}') {
			ordered = false
		} else {
			throw new Error("Expected '}'")
		}
	} else if (firstChar == '[') { // ordered list
		if (lastChar == ']') {
			ordered = true
		} else {
			throw new Error("Expected ']'")
		}
	} else {
		return new Statement(ruleString)
	}

	let children = ruleString.substr(1, ruleString.length - 2).split(',') // naive split by comma, correct later

	// Group the children together by their outermost groups

	let groupedChildren = []

	let bracketLevel = 0

	for (let child of children) {
		child = (child+"").trim()
		if (groupedChildren.length == 0 || bracketLevel == 0) {
			groupedChildren.push(child)
		} else {
			groupedChildren[groupedChildren.length-1] += ',' + child
		}
		for (let character of child) {
			if (character == '[' || character == '{')
				bracketLevel++
			else if (character == ']' || character == '}')
				bracketLevel--
		}
	}

	// Recursively solve descendants

	let items = groupedChildren.map(parseList)

	// Solve nesters

	for (var i = 0; i < items.length; i++) {
		let item = items[i]
		if (item instanceof Statement) {
			let gtIdx = item.statement.indexOf('>')
			if (gtIdx > 0) { // Need to correct, statement is actually nester
				let leftSide = item.statement.substr(0, gtIdx).trim()
				// Make sure left side is now actually a statement, or we might loop infinitely
				if (!/^[a-zA-Z]+$/.test(leftSide)) {
					throw new Error("Invalid statement as LHS to nester", leftSide)
				}
				let rightSide = item.statement.substring(gtIdx+1).trim()
				// Make sure right side is a list
				if (!/^\[.*\]$/.test(rightSide) && !/^\{.*\}$/.test(rightSide)) {
					throw new Error("Invalid list as RHS to nester", rightSide)
				}
				items[i] = new Nester(new Statement(leftSide), parseList(rightSide))
			}
		}
	}

	// Return list

	return new List(items, ordered)
}

let RuleBuilder = {
	parse: (ruleString) => {
		return new Rule(parseList(ruleString))
	}
}

export default RuleBuilder