# Instructions

### Before you do anything, install dependencies:

```
npm install
```

### To start a web server on port 8080 (or env var PORT):

```
npm run start
```

(Does not minify JS to speed up build time)

### To build the output to /html/build:

```
npm run build
```

(Minifies JS to speed up download time)

### To run tests:

First, make sure you have Mocha installed:

```
npm install -g mocha
```

Then, test with:

```
npm test
```

in the root directory. (Running with `mocha` won't work because the tests require babel.)

# Caveats

- I started to add cross-browser polyfills, but I didn't have the time to do much browser debugging. In particular, this doesn't appear to work in XP IE8. I would recommend testing in Chrome 46+, Safari 9+, Firefox 35+, or IE 11+.
- The language isn't complete for all Javascript - with more time, and if the requirements included this, I would add more precision, e.g. for matching expressions and specific values within the currently matched statements.

# Validation API

The relevant user-facing class that does validation is `CodeSnippet`. Relevant methods:

## Constructor(code<String>)

Creates a CodeSnippet.

### Example

```javascript
let snippet = new CodeSnippet("var i = 7;")
```

## .validateWhitelist(whitelist\<Array\<String\>\>) \<Boolean\>

Returns true if **every** syntax item in the whitelist is found in the code. Otherwise returns false.

### Example

```javascript
snippet.validateWhitelist(["var"]) // true
snippet.validateWhitelist(["var", "for"]) // false
```

## .validateBlacklist(blacklist\<Array\<String\>\>) \<Boolean\>

Returns false if **any** syntax item in the blacklist is found in the code. Otherwise returns true.

### Example

```javascript
snippet.validateBlacklist(["var"]) // false
snippet.validateBlacklist(["while", "for"]) // true
```

## .validateStructure(rule\<String\>) \<Boolean\>

Returns true if the code matches the rule. See below for language definition for this rule. Note that validateWhitelist and validateBlacklist call validateStructure internally.

### Example

```javascript
snippet.validateStructure("{var}") // true
snippet.validateStructure("{for > {var}}") // false
```

# Syntax Tree API Choice

I chose to use Acorn over Esprima.

My initial feeling was to favour Esprima over Acorn because Esprima is supported by jQuery, whereas Acorn is by a private author -- in my experience, institutional support leads to more frequent updates/bugfixes for a package (e.g. React).

Digging deeper gave me reasons to favour Acorn instead:

- With all dependencies installed, Acorn uses only 172M of disk space as compared to Esprima's 348M. This is a substantial difference that would probably still be visible even after minification.
- Acorn appears to have more tests, 1888 compared to Esprima's 1258. This is obviously not a complete picture of stability without looking at the tests, but certainly a heuristic.
- Despite Esprima's "institutional support," Acorn actually has more balanced commit counts amongst its contributors, with two lead contributors, whereas Esprima appears to rely largely on a single contributor.
- Most importantly, Acorn returns character ranges for each statement. This is crucial if we want to highlight the incorrect portion in the input field.

I could spend a lot more time on this decision, but based on these heuristics, Acorn appears to be slightly more performant and slightly more stable, and provides the highly desirable feature of character range outputs.

Of course, since both libraries conform to the ESTree spec, it wouldn't be too difficult to switch from Acorn to Esprima if Acorn were to become unstable.

# Problem Approach

The three API methods listed seemed to me to be restatements of a single problem: how do we create rules that we can run against code the same way we run regex against strings?

I wanted to build something that not only achieved the provided goals, but could be modified in the future to meet more complicated requirements for matching code. I also wanted this to be accessible to the end developer.

The easiest way to achieve all of this seemed to be to define a mini-language that describes possible code.

# Language Definition

- **Statement**: [Any ESTree interface name](https://github.com/estree/estree/blob/master/spec.md). For example, IfStatement. Can also be one of the aliases for these, see [Aliases](#aliases).
- **Ordered List**: A comma-separated list of statements and/or nesters. Ordered lists are surrounded with square brackets. For example, [IfStatement, WhileStatement]
- **Unordered List**: A comma-separated list of statements and/or nesters. Unordered lists are surrounded with curly brackets. For example, {IfStatement, WhileStatement}
- **Nester**: A statement, followed by the character ">", followed by an ordered list or unordered list. For example, ForStatement > {IfStatement > [IfStatement, WhileStatement]}
- **Rule**: An ordered list or unordered list.

The language always ignores whitespace.

# Matching Behaviour

- A **statement** matches any single ESTree node whose type is the same as the statement.
- An **ordered list** matches an array of ESTree nodes whose descendants contain a match for each item in the list, occurring in the same order as in the list when traversed in DFS order.
- An **unordered list** matches an array of ESTree nodes whose descendants contain a match for each item in the list, occurring in any order.
- A **nester** matches any single ESTree node whose type matches the nester's left-hand statement, and whose child nodes match the nester's right-hand list.

# Aliases

Some aliases for common ESTree interface names have been defined in order to make rules less verbose. For example, `for` for `ForStatement`. These are defined in `/lib/constants/InterfaceAliases.js`.

# Language Use Example

For the following code snippet:

```javascript
for (var i = 0; i < 50; i++) {
	if (i % 2 == 0) {
		console.log('divisible by 2');
	}
	if (i % 3 == 0) {
		console.log('divisible by 3');
		if (i % 6 == 0) {
			console.log('divisible by 6');
		}
	}
}
```

The following rules match:

- ```{for}```
- ```{for, if}```
- ```{for > {if}}```
- ```{for > {if > {if}}}```
- ```{for > [if, if > {if}]}```
- ```{for > [if, if]}```
- ```[for, if]```
- ```[for, if, if]```
- ```[for, if, if, if]```

The following rules do not:

- ```{for, for}```
- ```[for, for]```
- ```{for > {if > {if > {if}}}}```
- ```{for > [if > {if}, if > {if}]}```

# Rule Matching Performance

In order to ensure rule matching did not block UI, I did the following:

- Wrapped the onChange call in Lodash's debounce function in order to stop processing until user input pauses.
- Used asynchronous calls frequently so that calls don't clog the call stack