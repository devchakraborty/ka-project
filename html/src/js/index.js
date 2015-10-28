require('../scss/index.scss')
require('babel/polyfill')

// IE compat
require('es5-shim-sham')
require('console-polyfill')
require('html5shiv')
// require('es6-shim')

let React = require('react'), ReactDOM = require('react-dom'), brace = require('brace'), AceEditor = require('react-ace')
let _ = require('lodash')
let uuid = require('uuid')

let CodeSnippet = require('../../../lib/classes/CodeSnippet')

require('brace/mode/javascript')
require('brace/theme/github')

let rules = _.map(require('../data/rules.json'), (rule) => {
	if (rule.type == "whitelist") {
		let whitelistFunc = (code) => (new CodeSnippet(code)).validateWhitelist(rule.values)
		rule.evaluate = whitelistFunc
		rule.id = uuid.v4()
	} else if (rule.type == "blacklist") {
		let blacklistFunc = (code) => (new CodeSnippet(code)).validateBlacklist(rule.values)
		rule.evaluate = blacklistFunc
		rule.id = uuid.v4()
	} else if (rule.type == "structure") {
		let structureFunc = (code) => (new CodeSnippet(code)).validateStructure(rule.structure)
		rule.evaluate = structureFunc
		rule.id = uuid.v4()
	}
	return rule
})

class RuleView extends React.Component {
	constructor() {
		super()
	}
	render() {
		return <li className={"rule rule-" + this.props.type + (this.props.valid ? " valid" : "")}><span className="rule-label">{_.capitalize(this.props.type)}: {this.props.label || (this.props.values ? this.props.values.join(", ") : null)}</span></li>
	}
}

class RuleChecker extends React.Component {
	constructor() {
		super()
		this.state = {rules: _.map(rules, (rule) => rule.type == "blacklist"), code:""}
	}
	render() {
		let ruleViews = []
		for (let r in rules) {
			let ruleView = <RuleView valid={this.state.rules[r]} {...rules[r]} key={rules[r].id} />
			ruleViews.push(ruleView)
		}
		return (
			<div id="rule-checker">
				<AceEditor mode="javascript" theme="github" onChange={_.debounce(this.onChange.bind(this), 400)} name="ace-editor" id="ace-editor" height="100%" width="50%" value={this.state.code} editorProps={{$blockScrolling: true}} />
				<ul id="rules-results">
					<li><h2>Rules from /html/src/data/rules.json</h2></li>
					{ruleViews}
				</ul>
			</div>
		)
	}
	onChange(code) {
		this.setState({rules: _.map(rules, (rule) => rule.evaluate(code)), code:code})
	}
}

window.onload = () => {
	ReactDOM.render(
		<RuleChecker />,
		document.getElementById("app")
	)
}