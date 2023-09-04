export { mdToHTML };

/**
 * 企画の種類
 */
const typeTemplates = Object.freeze({
	booth: Object.freeze({
		ja: "ブース発表",
		en: "Booth Exhibit"
	}),
	show: Object.freeze({
		ja: "サイエンスショー",
		en: "Science Show"
	}),
	atelier: Object.freeze({
		ja: "科学工作（アトリエ）",
		en: "Craft Workshop"
	}),
	article:Object.freeze({
		// 企画紹介ではない記事
		ja: "",
		en: ""
	})
});

/**
 * 開催時間の種類
 */
const timeTemplates = Object.freeze({
	always: Object.freeze({
		ja: "常時開催",
		en: "Always Open"
	}),
	scheduled: Object.freeze({
		ja: "タイムテーブル",
		en: "See Timetable"
	})
});

/**
 * 会場の呼び方
 */
const placeTemplate = Object.freeze({
	ja: place => place + "教室",
	en: place => "Room " + place
});

const linkTemplates = Object.freeze({
	top: "/",
	timetable: "",
	room1: "",
	room2: ""
});

/**
 * MDテキストをHTMLに変換
 * @param {string} md MDフォーマットの文字列
 * @returns {{title: string, article: string}} articleは、articleのinnerHTMLにそのまま設定できる文字列。
 */
const mdToHTML = function(md) {

	const attrs = {
		lang: "ja",
		title: "",
		type: "",
		time: "",
		place: ""
	};

	/**
	 * ページトップのスライドショーに表示する画像の {url, alt} のリスト
	 * @type {Array<{url: string, alt: string}>}
	 */
	const slideShow = [];

	/**
	 * 最終的に生成されるHTMLファイル（articleのinnerHTMLに相当）
	 */
	let generatedHTML = "";


	// まずFormatter部分を解読する。
	const formatterLines = md.split("---")[1].split("\n");

	for (let line of formatterLines) {
		if (line == "---") {
			break;
		} else if (line.startsWith("lang: ")) {
			attrs.lang = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
		} else if (line.startsWith("name: ")) {
			attrs.title = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
		} else if (line.startsWith("type: ")) {
			attrs.type = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
		} else if (line.startsWith("time: ")) {
			attrs.time = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
		} else if (line.startsWith("place: ")) {
			attrs.place = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
		} else if (line.startsWith("image")) {
			slideShow.push({
				url: line.substring(line.indexOf('"') + 1, line.lastIndexOf('"')),
				alt: ""
			});
		} else if (line.startsWith("alt")) {
			if (slideShow.length > 0) {
				slideShow[slideShow.length - 1].alt = line.substring(line.indexOf('"') + 1, line.lastIndexOf('"'));
			}
		}
	}


	// 記事のタイトルを追加する
	generatedHTML = '<div class="page-heading">';
	if (attrs.type != "article") {
		generatedHTML += `<p>${typeTemplates[attrs.type][attrs.lang]}</p>`;
	}
	generatedHTML += `<h1>${putRuby(removeUnintendedHTMLTags(attrs.title))}</h1></div>`;

	// チップを追加する
	if (attrs.type != "article") {
		generatedHTML += `<div class="chip-container"><div class="chip">${timeTemplates[attrs.time][attrs.lang]}</div><div class="chip">${placeTemplate[attrs.lang](attrs.place)}</div></div>`;
	}

	// スライドショーを追加する
	if (slideShow.length > 0) {
		generatedHTML += '<div class="slide-show">';
		slideShow.forEach(image => {
			generatedHTML += `<img src="${image.url}" alt="${image.alt}">`;
		});
		generatedHTML += '</div>';
	}

	// 次に本文を解読する。１つだけの改行記号はスペースに変換する。
	const articleLines = md.split("---")[2].split(/\n{2,}/).map(line => line.replaceAll("\n", " "));
	articleLines.shift(); // 配列の最初に "" が入ってしまうのを防ぐ

	// 箇条書き、数字リストのフラグ
	let ulFlag, olFlag;

	for (let line of articleLines) {

		if (line.startsWith("* ")) {
			// ul
			if (!ulFlag) {
				generatedHTML += "<ul>"
				ulFlag = true;
			}
			generatedHTML += `<li>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(line.indexOf(" ")))))}</li>`;
			continue;
		} else {
			if (ulFlag) {
				generatedHTML += "</ul>";
				ulFlag = false;
			}
		}

		if (line.startsWith("1. ")) {
			// ol
			if (!olFlag) {
				generatedHTML += "<ol>"
				olFlag = true;
			}
			generatedHTML += `<li>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(line.indexOf(" ")))))}</li>`;
			continue;
		} else {
			if (olFlag) {
				generatedHTML += "</ol>";
				olFlag = false;
			}
		}

		if (line.startsWith("## ")) {
			// H2
			generatedHTML += `<h2>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(line.indexOf(" ")))))}</h2>`;
		} else if (line.startsWith("### ")) {
			// H3
			generatedHTML += `<h3>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(line.indexOf(" ")))))}</h3>`;
		} else if (line.startsWith("#### ")) {
			// H4
			generatedHTML += `<h4>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(line.indexOf(" ")))))}</h4>`;
		} else if (/!\[.+?\]\(.+?\)/.test(line)) {
			// 画像
			let imageTitle = line.substring(line.indexOf("![") + 2, line.lastIndexOf("]("));
			let imageSrc = line.substring(line.lastIndexOf("](") + 2, line.lastIndexOf(")"));
			generatedHTML += `<div class="image-with-title"><img src="${imageSrc}"><p>${insertHyperlink(putRuby(removeUnintendedHTMLTags(imageTitle)))}</p></div>`;
		} else {
			// 本文
			generatedHTML += `<p>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line)))}</p>`;
		}
	}

	return {
		title: removeRuby(attrs.title),
		article: generatedHTML
	};

};

/**
 * 入力された文字列の <br> タグだけを残し、他の < を &lt; に、 > を &gt; に置換することで、生成されるHTMLに意図しないタグが挿入されることを防ぐ。
 * @param {*} str 
 * @returns {string}
 */
const removeUnintendedHTMLTags = function(str) {
	return str.split("<br>").map(line => line.replaceAll("<", "&lt;").replaceAll(">", "&gt;")).join("<br>");
};

/**
 * 振り仮名を表記したMDをHTML記法に変換する
 * @param {string} inputText [漢字|ふりがな]が含まれるテキスト
 * @returns {string} <span data-ruby="ふりがな">漢字</span>が含まれるテキスト
 */
const putRuby = function(inputText) {

	// ["["を除く任意の文字列|任意の文字列]の最短一致
	const rubySearch = /\[[^\[]+?\|.+?\]/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(rubySearch, -1);
	// 正規表現にMatchした文字列
	let rubyTextArray = inputText.match(rubySearch);

	if (!rubyTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i < rubyTextArray.length; i++) {
		let rubyText = rubyTextArray[i];
		let splitIndex = rubyText.lastIndexOf("|");
		let ruby_kanji = rubyText.substring(1, splitIndex);
		let ruby_kana = rubyText.substring(splitIndex + 1, rubyText.length - 1);
		output += `${baseTextArray[i]}<span data-ruby="${ruby_kana}">${ruby_kanji}</span>`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	return output;

};

/**
 * [リンクタイトル](URL)を含むMDを、 <a> タグに変換する。
 * リンクタイトルに振り仮名を含む可能性があるため、 putRuby よりも後に呼び出す。
 * その際、URL部分に linkTemplate が含まれていたら置換する。
 * @param {string} md [リンクタイトル](URL)を含む文字列
 * @returns {string} <a href="URL">リンクタイトル</a>を含む文字列
 */
const insertHyperlink = function(inputText) {

	// [任意の文字列](任意の文字列)の最短一致
	const linkSearch = /\[.+?\]\(.+?\)/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(linkSearch, -1);
	// 正規表現にMatchした文字列
	let linkTextArray = inputText.match(linkSearch);

	if (!linkTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i <  linkTextArray.length; i++) {
		let linkText = linkTextArray[i];
		let splitIndex = linkText.lastIndexOf("](");
		let linkTitle = linkText.substring(1, splitIndex);
		let linkURL = linkText.substring(splitIndex + 2, linkText.length - 1);
		let templateURL = linkTemplates[linkURL];
		output += `${baseTextArray[i]}<a href="${templateURL || linkURL}">${linkTitle}</a>`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	return output;

}

/**
 * 振り仮名を取り除く
 * @param {string} inputText [漢字|ふりがな]が含まれるテキスト
 * @returns {string} 漢字が含まれるテキスト
 */
const removeRuby = function(inputText) {

	// ["["を除く任意の文字列|任意の文字列]の最短一致
	const rubySearch = /\[[^\[]+?\|.+?\]/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(rubySearch, -1);
	// 正規表現にMatchした文字列
	let rubyTextArray = inputText.match(rubySearch);

	if (!rubyTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i < rubyTextArray.length; i++) {
		let rubyText = rubyTextArray[i];
		let splitIndex = rubyText.lastIndexOf("|");
		let ruby_kanji = rubyText.substring(1, splitIndex);
		output += `${baseTextArray[i]}${ruby_kanji}`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	return output;

}