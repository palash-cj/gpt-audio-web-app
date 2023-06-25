var speechRecognition = window.webkitSpeechRecognition;

var synthesis = window.speechSynthesis;



var recognition = new speechRecognition();
var textbox = $("#textbox");
var instructions = $("#instructions");
var content = "";

var noActivityTimeout; // Variable to store the timeout ID

recognition.continuous = true;

recognition.onstart = function() {
  instructions.text("Voice recognition is on...");
};

recognition.onspeechend = function() {
  instructions.text("No activity");
  $("#start-btn").prop("disabled", false);
};

recognition.onerror = function(event) {
  instructions.text("Please check your mic settings and try again.");
  $("#start-btn").prop("disabled", false);
};
  

recognition.onresult = function(event) {
  if(content!=""){
    content="";
  }
  var current = event.resultIndex;
  var transcript = event.results[current][0].transcript;
  content += transcript;
  textbox.val(content);
  recognition.stop();
  instructions.text("Bringing an answer to your question...")
  makeAjaxCall(content);
}

$("#start-btn").click(function(event) {
  if (content.length) {
    content = "";
  }
  recognition.start();
  $(this).prop("disabled", true); 
});

$("#stop-ask-btn").click(function(event) {
  synthesis.cancel();
  recognition.start();
});

textbox.on("input", function() {
  content = $(this).val();
});

function speakText(content) {
  try {
    var chunkSize = 200;
    var currentIndex = 0;
    var voices = synthesis.getVoices();

    var selectedVoice = voices.find(function (voice) {
      return voice.lang === "en-UK"; 
    });

    function playNextChunk() {
      var punctuationRegex = /[.,]/;
      var chunk = content.substr(currentIndex, chunkSize);
      var punctuationIndex = chunk.search(punctuationRegex);

      if (punctuationIndex !== -1) {
        chunk = chunk.substr(0, punctuationIndex + 1);
        currentIndex += punctuationIndex + 1;
      } else {
        currentIndex += chunk.length;
      }

      var utterance = new SpeechSynthesisUtterance(chunk);
      utterance.voice = selectedVoice;
      utterance.volume = 1;
      utterance.rate = 1; 

      instructions.text("Please listen to the response for your question...")

      var start = currentIndex - chunk.length;
      var end = currentIndex;
      textbox[0].setSelectionRange(start, end);

      synthesis.speak(utterance);

      utterance.onend = function () {
        if (currentIndex >= content.length) {
          recognition.start(); 
          $("#start-btn").prop("disabled", true);

        } else {
          playNextChunk(); 
        }
      };
    }

    playNextChunk();
  } catch (error) {
    console.error(error.message);
  }
}


function makeAjaxCall(content) {
  $.ajax({
    url: "/ask",
    type: "POST",
    data: { content: content },
    success: function(response) {
      content = response; 
      instructions.text("Bringing an answer to your question...");
      textbox.val(content);
      speakText(content);
    },
    error: function(error) {
      console.error(error);
    },
  });
}

  
function refreshPage() {
  location.reload();
}
