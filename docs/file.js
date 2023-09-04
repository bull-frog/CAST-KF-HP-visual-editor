const fileKey = "cast_hp_visual_editor_text";

window.addEventListener("load", function() {
	let text = this.localStorage.getItem(fileKey);
	if (text) {
		let input = this.document.querySelector("#input");
		input.value = text;
		input.dispatchEvent(new Event("input"));
	}
});

const autoSaveIntervalID = setInterval(() => {
	if (this.document.querySelector("#input").value) {
		this.localStorage.setItem(fileKey, this.document.querySelector("#input").value);
	}
	window.onbeforeunload = null;
}, 5000);

