import { mdToHTML } from "./modules/md-to-html.js";

const notSavedMessage = function(e) {
	return true;
}

document.addEventListener("DOMContentLoaded", function() {

	document.querySelector("#input").addEventListener("input", function(e) {

		let result = mdToHTML(e.target.value);

		document.title = result.title;
		document.querySelector("article").innerHTML = result.article;
		document.querySelector("#code").innerText = result.article;

		window.onbeforeunload = notSavedMessage;

	});

});