
var n_syll = 0;
var wc = 0; 
var sc = 0;
var cwc = 0;

var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/text");

var annotations = [];

function SyllableCount(word) {
  word = word.toLowerCase();                                     //word.downcase!
  if(word.length <= 3) { return 1; }                             //return 1 if word.length <= 3
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');   //word.sub!(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '');                                 //word.sub!(/^y/, '')
  
  if (word.match(/[aeiouy]{1,2}/g) != null)
  {
  	return word.match(/[aeiouy]{1,2}/g).length;                    //word.scan(/[aeiouy]{1,2}/).size
  }
  else
  {
  	return 0;
  }

}

function WordCount(text) { 
	var wc = text.split(" ").length;
	return parseFloat(wc);
}

function SentenceCount(text)
{
	var sc = text.split(".").length;
	return parseFloat(sc);
}

function ComplexWordCount(text)
{
	var words = text.split(" ");
	var complex = []
	var i = 0;
	n_syll = 0;
	for (i = 0; i < words.length; i++)
	{
		var n = SyllableCount(words[i]); 
		n_syll += n;
		if ( n >= 3)
		{
			complex.push(words[i]);
		}
	}
	
	return parseFloat(complex.length);
}

function GunningFog()
{
	
	var gf = 0.0;

	if (wc > 0 && sc > 0)
	{
		gf = 0.4* ( (wc / sc) + 100.0 *(cwc/ wc)  );
	}
	var f = Flesch();
	console.log(gf+","+f);
	$("#wc").text(wc.toFixed(0));
	$("#sc").text(sc.toFixed(0));
	$("#cwc").text(cwc.toFixed(0));
	$("#syl_c").text(n_syll.toFixed(0));
	$("#gf").text(gf.toFixed(2));
	$("#fk").text(f.toFixed(2));

	editor.getSession().setAnnotations([{
  row: 0,
  column: 0,
  text: "Strange error",
  type: "warning" // also warning and information
}, {
  row: 1,
  column: 0,
  text: "information",
  type: "information" // also warning and information
}]);

	return gf;
}

function Flesch()
{
	return 206.835 - 1.015* (wc/sc) - 84.6*(n_syll/wc);
}

function analyse()
{
	var full_text = editor.getValue();
	wc = WordCount(full_text);
	sc = SentenceCount(full_text);
	cwc = ComplexWordCount(full_text);
	GunningFog();
	Flesch();
	annotations = [];
	var line = 0;
	for (line = 0; line < editor.session.getLength(); line++)
	{
		var text = editor.session.getLine(line); // returns " line2 "
		wc = WordCount(text);
		sc = SentenceCount(text);
		cwc = ComplexWordCount(text);
		
		annotations.push(
		{
			row: line,
			column: 0,
			text: "Words: " + wc.toString() + " Complex Words: " + cwc.toString(),
			type: "information"	
		}
			);
		

		if (cwc > 2)
		{
			annotations.push(
			{
			row: line,
			column: 0,
			text: "Consider reducing the number of complex words in this line",
			type: "warning"	
			});
		}
	}
	editor.getSession().setAnnotations(annotations);
	localStorage.setItem('plainText', full_text);

	var abstract = sum({ 'corpus': full_text, 'nSentences': 3 });
	var s = 0;
	for (s=0; s < abstract.sentences.length; s++)
	{
		console.log(abstract.sentences[s]);
	}
}

function export_text()
{
	alert("Export!");
	$("#page-content").text(editor.getValue());
	$("#page-content").wordExport();
	$("#page-content").text("");

}


function download_it() 
{
  var filename = "plainText.txt";
  var text = editor.getValue();
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function main()
{
	var retrievedText = localStorage.getItem('plainText');
	if (retrievedText != null)
	{
		editor.setValue(retrievedText);
	}

	setInterval(analyse, 1000);
}