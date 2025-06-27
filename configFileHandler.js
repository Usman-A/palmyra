var alreadyReadConfigFiles = [];
var defaultConfigFiles = [];

// helper function to populate the config file selector with file names, given an array of file objects
function populateConfigFileSelectorHelper(files) {
  let option;
  let selectList = document.getElementById("configFileSelector");
  // Clear existing options
  while (selectList.firstChild) {
    selectList.removeChild(selectList.firstChild);
  }
  
  // Add only the conllu_config option
  option = document.createElement("option");
  option.text = "conllu_config.cfg";
  selectList.appendChild(option);
  
  // set the default value to the first option
  selectList.selectedIndex = 0;
}

// populate the selector with only the conllu_config.cfg file
function populateConfigFileSelector() {
  let selectList = document.getElementById("configFileSelector");
  // Hide file input since we're using fixed config
  document.getElementById("configFile").style.display = "none";
  
  // Create a File object from the conllu_config.cfg content
  fetch('palmyra/conllu_config.cfg')
    .then(response => response.text())
    .then(data => {
      let fileObject = new File([data], "conllu_config.cfg", { type: "text/plain" });
      defaultConfigFiles = [fileObject];
      populateConfigFileSelectorHelper([fileObject]);
      // Auto-load the config file
      readConfigFile();
    })
    .catch((err) => {
      console.log(err);
    });
}

function createButton(buttonText, editPOSByButton) {
  let btn = document.createElement("BUTTON");
  let text = document.createTextNode(buttonText);
  btn.appendChild(text);
  btn.tabindex = -1;
  btn.value = buttonText;
  btn.onclick = editPOSByButton;

  return btn
}

function addButtonToDivGroup(divs, group, btn) {
  if (!(group in divs)) {
    divs[group] = document.createElement("div");
  }
  divs[group].classList.add('editTagsAndLabels');
  divs[group].appendChild(btn);
}

var parseConfig = function (content) {
  var configs = JSON.parse(content);
  orientation = configs.orientation;
  listingKey = configs.display_text;
  if (configs.lemma === "true") editLemma = true;
  else editLemma = false;

  var posContainer = document.getElementById("postags");
  var divs = {};

  for (let i = 0; i < configs.pos.values.length; i++) {
    if (!(configs.pos.values[i].key in posTags)) {
      posTags[configs.pos.values[i].key] = [];
    }
    
    posTags[configs.pos.values[i].key].push(configs.pos.values[i].label);
    let btn = createButton(configs.pos.values[i].label, editPOSByButton);
    
    group = configs.pos.values[i].group;
    addButtonToDivGroup(divs, group, btn);
  }

  for (var div in divs) {
    var hzRule = document.createElement("hr");
    posContainer.appendChild(hzRule);
    posContainer.appendChild(divs[div]);
  }

  var labelContainer = document.getElementById("labels");
  var divs = {};

  for (var i = 0; i < configs.relation.values.length; i++) {
    if (configs.relation.values[i].key in relLabels) {
      relLabels[configs.relation.values[i].key].push(
        configs.relation.values[i].label
      );
      var btn = document.createElement("BUTTON");
      var text = document.createTextNode(configs.relation.values[i].label);
      btn.appendChild(text);
      btn.setAttribute("id", configs.relation.values[i].label);
      btn.value = configs.relation.values[i].label;
      btn.onclick = editLabelByButton;

      group = configs.relation.values[i].group;
      addButtonToDivGroup(divs, group, btn)
    } else {
      relLabels[configs.relation.values[i].key] = [];
      relLabels[configs.relation.values[i].key].push(
        configs.relation.values[i].label
      );
      var btn = document.createElement("BUTTON");
      var text = document.createTextNode(configs.relation.values[i].label);
      btn.appendChild(text);
      btn.setAttribute("id", configs.relation.values[i].label);
      btn.value = configs.relation.values[i].label;
      btn.onclick = editLabelByButton;

      group = configs.relation.values[i].group;
      if (group in divs) {
        divs[group].appendChild(btn);
      } else {
        divs[group] = document.createElement("div");
        divs[group].appendChild(btn);
      }
    }
  }

  for (var div in divs) {
    var hzRule = document.createElement("hr");
    labelContainer.appendChild(hzRule);
    labelContainer.appendChild(divs[div]);
  }

  if (configs.hasOwnProperty("features") == false) {
    var morphoLabel = document.getElementById("labelspMorphoFeats");
    morphoLabel.style.visibility = "hidden";
  } else {
    var morphoLabel = document.getElementById("labelspMorphoFeats");
    morphoLabel.style.visibility = "visible";

    var item = document.getElementById("morphoFeats");
    var lexicalFeats = document.getElementById("lexicalFeats");

    for (var i = 0; i < configs.features.length; i++) {
      var div = document.createElement("div");
      div.setAttribute("id", configs.features[i].name);
      div.setAttribute("class", "morphoFeat");

      var fieldName = document.createElement("div");
      fieldName.style.width = "100px";
      fieldName.style.right = "0px";
      fieldName.style.display = "inline-block";

      var displayName = document.createTextNode(configs.features[i].display);
      fieldName.appendChild(displayName);

      var menu = document.createElement("select");
      menu.setAttribute("id", configs.features[i].name + "Array");
      menu.setAttribute("class", "inputArray");
      menu.style.width = "100px";
      menu.style.left = "0px";
      menu.style.display = "inline-block";

      if (configs.features[i].type === "list") {
        featureValues[configs.features[i].name] = configs.features[i].values;

        for (var j = 0; j < configs.features[i].values.length; j++) {
          var opt = document.createElement("option");
          var name = document.createTextNode(
            configs.features[i].values[j].display
          );
          opt.setAttribute("value", configs.features[i].values[j].display);
          opt.setAttribute("id", configs.features[i].values[j].value);
          opt.appendChild(name);
          menu.appendChild(opt);
        }

        div.appendChild(fieldName);
        div.appendChild(menu);

        item.appendChild(div);
      } else {
        lexicalFeatsList.push(configs.features[i].name);

        var titleParagraph = document.createElement("P");
        titleParagraph.setAttribute("class", "labelsp");
        titleParagraph.innerHTML = configs.features[i].display + ":";

        var field = document.createElement("INPUT");
        field.setAttribute("type", "text");
        field.setAttribute("id", configs.features[i].name);

        var lexDiv = document.createElement("div");
        lexDiv.appendChild(field);

        lexicalFeats.append(titleParagraph);
        lexicalFeats.appendChild(lexDiv);
      }
    }

    for (var i = 0; i < configs.defaultFeatures.length; i++) {
      var posTag = configs.defaultFeatures[i].pos;

      var defaultFeatValuePairs = {};
      for (var j = 0; j < configs.defaultFeatures[i].features.length; j++) {
        var featName = configs.defaultFeatures[i].features[j].name;
        var featValue = configs.defaultFeatures[i].features[j].value;
        defaultFeatValuePairs[featName] = featValue;
      }

      defaultFeatValues[posTag] = defaultFeatValuePairs;
    }
  }

  if (editLemma === true) {
    var lemmaField = document.getElementById("lemmaField");

    var titleParagraph = document.createElement("P");
    titleParagraph.setAttribute("class", "labelsp");
    titleParagraph.innerHTML = "Lemma:";

    var field = document.createElement("INPUT");
    field.setAttribute("type", "text");
    field.setAttribute("id", "lemma");

    var lexDiv = document.createElement("div");
    lexDiv.appendChild(field);

    lemmaField.append(titleParagraph);
    lemmaField.appendChild(lexDiv);
  }

  newPOSTag = configs.newNodeDefaults.pos;
  newLinkLabel = configs.newNodeDefaults.relation;
  newNodeName = configs.newNodeDefaults.name;

  return;
};

function loadFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function () {
      parseConfig(reader.result);
      configRead = true;
      resolve();
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsText(file);
  });
}

//Read the config file
var readConfigFile = async function () {
  // Always use the first file in defaultConfigFiles (conllu_config.cfg)
  if (defaultConfigFiles.length > 0) {
    let file = defaultConfigFiles[0];
    if (!alreadyReadConfigFiles.includes(file)) {
      alreadyReadConfigFiles.push(file);
      await loadFile(file);
    }
  }
  return;
};

window.populateConfigFileSelector = populateConfigFileSelector;
window.readConfigFile = readConfigFile;
