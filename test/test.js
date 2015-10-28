let assert = require('assert')

let CodeSnippet = require('../lib/classes/CodeSnippet')
let RuleBuilder = require('../lib/classes/RuleBuilder')
let List = require('../lib/classes/List')
let Nester = require('../lib/classes/Nester')
let Statement = require('../lib/classes/Statement')

describe('RuleBuilder', () => {
	describe('#parse', () => {
		it("should return the correct unordered list for {for}", () => {
			let rule = RuleBuilder.parse("{for}")
			let valid = (rule.list instanceof List) && !rule.list.ordered && rule.list.items.length == 1 && (rule.list.items[0] instanceof Statement) && rule.list.items[0].statement == "ForStatement"
			assert(valid)
		})
		it("should return the correct unordered list for {for, while}", () => {
			let rule = RuleBuilder.parse("{for, while}")
			let valid = (rule.list instanceof List) && !rule.list.ordered && rule.list.items.length == 2 && (rule.list.items[0] instanceof Statement) && rule.list.items[0].statement == "ForStatement" && (rule.list.items[1] instanceof Statement) && rule.list.items[1].statement == "WhileStatement"
			assert(valid)
		})
		it("should return the correct ordered list for [for]", () => {
			let rule = RuleBuilder.parse("[for]")
			let valid = (rule.list instanceof List) && rule.list.ordered && rule.list.items.length == 1 && (rule.list.items[0] instanceof Statement) && rule.list.items[0].statement == "ForStatement"
			assert(valid)
		})
		it("should return the correct ordered list for [for, while]", () => {
			let rule = RuleBuilder.parse("[for, while]")
			let valid = (rule.list instanceof List) && rule.list.ordered && rule.list.items.length == 2 && (rule.list.items[0] instanceof Statement) && rule.list.items[0].statement == "ForStatement" && (rule.list.items[1] instanceof Statement) && rule.list.items[1].statement == "WhileStatement"
			assert(valid)
		})
		it("should return the correct nester for {for > {for}}", () => {
			let rule = RuleBuilder.parse("{for > {for}}")
			let valid = (rule.list instanceof List)
			&& !rule.list.ordered
			&& rule.list.items.length == 1
			&& (rule.list.items[0] instanceof Nester)
			&& (rule.list.items[0].statement instanceof Statement)
			&& (rule.list.items[0].statement.statement == "ForStatement")
			&& (rule.list.items[0].list instanceof List)
			&& (!rule.list.items[0].list.ordered)
			&& (rule.list.items[0].list.items[0] instanceof Statement)
			&& (rule.list.items[0].list.items[0].statement == "ForStatement")
			assert(valid)
		})
	})
})

describe('CodeSnippet', () => {

	let snippet = new CodeSnippet(`for (var i = 0; i < 50; i++) {
		if (i % 2 == 0) {
			console.log('divisible by 2');
		}
		if (i % 3 == 0) {
			console.log('divisible by 3');
			if (i % 6 == 0) {
				console.log('divisible by 6');
			}
		}
	}`)

	describe('#validateStructure', () => {
		let passRules = ["{for}", "{for, if}", "{for > {if}}", "{for > {if > {if}}}", "{for > [if, if > {if}]}", "{for > [if, if]}", "[for, if]", "[for, if, if]", "[for, if, if, if]"]
		let failRules = ["{for, for}", "[for, for]", "{for > {if > {if > {if}}}}", "{for > [if > {if}, if > {if}]}"]

		for (let rule of passRules) {
			it("should pass rule " + rule, () => { 
				assert(snippet.validateStructure(rule))
			})
		}

		for (let rule of failRules) {
			it("should fail rule " + rule, () => {
				assert(!snippet.validateStructure(rule))
			})
		}
	})

	describe("#validateWhitelist", () => {
		let passWhitelists = [["for"], ["if"], ["for", "if"], ["for", "if", "if"], ["for", "if", "if", "if"]]
		let failWhitelists = [["while"], ["for", "while"], ["for", "if", "if", "if", "if"]]

		for (let whitelist of passWhitelists) {
			it("should pass whitelist " + whitelist.join(', '), () => {
				assert(snippet.validateWhitelist(whitelist))
			})
		}

		for (let whitelist of failWhitelists) {
			it("should fail whitelist " + whitelist.join(', '), () => {
				assert(!snippet.validateWhitelist(whitelist))
			})
		}
	})

	describe("#validateBlacklist", () => {
		let passBlacklists = [["while"], ["switch"], ["while", "switch"]]
		let failBlacklists = [["for"], ["for", "while"], ["if"], ["if", "for"], ["if", "while"], ["if", "for", "while"]]

		for (let blacklist of passBlacklists) {
			it("should pass blacklist " + blacklist.join(', '), () => {
				assert(snippet.validateBlacklist(blacklist))
			})
		}

		for (let blacklist of failBlacklists) {
			it("should fail blacklist " + blacklist.join(', '), () => {
				assert(!snippet.validateBlacklist(blacklist))
			})
		}
	})
})