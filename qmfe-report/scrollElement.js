'use strict'

function getParentNodes(node, _parents) {
	_parents =_parents || []
	let parent = node.parentNode
	if (!parent) {
		return _parents
	}
	_parents.push(parent)
    // end when match body
    if (parent === document.body) return _parents

	return getParentNodes(parent, _parents)
}
function isOverflow(node) {
    if (!node) return ''

    let style
    if (window.getComputedStyle) {
        try {
            style = window.getComputedStyle(node)
        } catch(e) {}
    } else if (node.currentStyle) {
        style = node.currentStyle
    }
    if (!style) return ''
    return style["overflow-x"] || style["overflow"]
}
function isScrollElement(node) {
    return /(auto|scroll)/.test(isOverflow(node))
}

export default function (node) {
	let parents = getParentNodes(node)
    let scrollParent = document.body
	for (let i = 0;i < parents.length;i ++) {
		let p = parents[i]
		if (p !== document.body && isScrollElement(p)) {
			scrollParent = p
            break
		}
	}
	return scrollParent
}
