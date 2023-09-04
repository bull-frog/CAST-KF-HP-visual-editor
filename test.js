import { mdToHTML } from "./modules/md-to-html";

const md = "---\nlang: \"ja\"\nname: \"ページのタイトル\"\ntype: \"booth\"\ntime: \"always\"\nplace: \"104\"\nimage: \"./cover.png\"\nalt: \"cover\"\nimage: \"./asdfz.jpg\"\nalt: \"asdfz\"\n---\n\nこの[企画|きかく]はこんな[感|かん]じです。こんなことを[発表|はっぴょう]します。\n\n## コラム\n\nコラムを[書|か]く[場合|ばあい]、ここに[書|か]いてください。\n\n### コラムの[話題|わだい]1\n\n[必要|ひつよう]なら、[小見出|こみだ]しも使えます。\n\n### コラムの[話題|わだい]2\n\n[小見出|こみだ]しはなくてもいいです。\n\n![[画像|がぞう]の解説](画像のURL)\n\n[リンク[先|さき]のタイトル](URL)\n\n<URL>は受け付けない";

window.onload = function() {

	let result = mdToHTML(md);

	document.title = result.title;
	document.querySelector("article").innerHTML = result.article;
	document.querySelector("#code").innerText = result.article;

};