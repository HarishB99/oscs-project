function clearLogs() {
  if(confirm("Are you sure? There is no way to recover the logs")) {
    //send html request
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "/clearlogs",false);
    xmlHttp.send(null);
    if(xmlHttp.responseText == "success") {
      alert("Logs cleared!");
      location.reload(true);
    } else {
      alert("Something went wrong...Logs not cleared");
    }
  };
}

window.onload = function () {
  domainsVisited();
  securityEvents();
  //no timeline implementation because it's the Saturday before the final presentation
  //and I am so done with everything related to this project already
}

function securityEvents() {
  if(logs.length <= 0) {
    document.getElementById("visited-domains-container").innerHTML = "<div style='margin:auto;width:50%;padding:10px;'>No logs found!</div>";
    return;
  }
  for(var i = 0; i < logs.length; i++) {
    var ip = logs[i]["_id"];
    //add a tab for this ip
    a = document.createElement("a");
    a.className = "mdl-tabs__tab";
    a["data-toggle"] = "tab";
    a.href = "#security-" + i;
    a.appendChild(document.createTextNode(ip));
    document.getElementById("security-events-tab-hosts").appendChild(a);

    //element containing the tab content for said ip
    d = document.createElement("div");
    d.id = "security-" + i;
    d.innerHTML = '\
      <div class="mdl-card" id="blockedDomains">\
        <div class="mdl-card__title">\
            <p class="mdl-card__title-text">Visited Blocked Domains</h2>\
        </div>\
        <div class="mdl-card__supporting-text" id="security-bd-text-' + i + '"></div>\
        </div>\
      <div class="mdl-card" id="suspiciousDomains">\
          <div class="mdl-card__title">\
              <p class="mdl-card__title-text">Domains deemed suspicious by our checks</h2>\
          </div>\
          <div class="mdl-card__supporting-text" id="security-sd-text-' + i + '"></div>\
      </div>\
      <div class="mdl-card" id="childUnsafe">\
          <div class="mdl-card__title">\
              <p class="mdl-card__title-text">Child unfriendly sites</h2>\
          </div>\
          <div class="mdl-card__supporting-text" id="security-cud-text-' + i +'"></div>\
      </div>\
      <div class="mdl-card" id="downloadedFile">\
          <div class="mdl-card__title">\
              <p class="mdl-card__title-text">Files downloaded</h2>\
          </div>\
          <div id="security-download-file-' + i + '"\
      </div>\
      <hr>\
    ';
    //add it to the webpage
    document.getElementById("security-events-tab").appendChild(d);

    //populate tab with some content
    var e = logs[i]["events"];

    //blocked domains
    var bdt  = document.getElementById("security-bd-text-" + i);
    var bdt2 = ""
    for(var domain in e["blockedDomains"]) {
      if (e["blockedDomains"].hasOwnProperty(domain)) {
        bdt2 += " (Visited " + e["blockedDomains"][domain] + ' time(s))<br>';
      }
    }
    if(!bdt2) {
      bdt2 = "(None so far!)"
    }
    bdt.innerHTML = bdt2;

    //suspicious domains (roughly the same as blocked domains)
    var sdt = document.getElementById("security-sd-text-" + i);
    var sdt2 = "";
    for(var domain in e["suspiciousDomain"]) {
      if (e["suspiciousDomain"].hasOwnProperty(domain)) {
        sdt2 += domain + " (Visited " + e["suspiciousDomain"][domain] + ' time(s))<br>';
      }
    }
    if(!sdt2) {
      sdt2 = "(None so far!)"
    }
    sdt.innerHTML = sdt2;

    //child unsafe (again roughly the same)
    var cudt = document.getElementById("security-cud-text-" + i);
    var cudt2 = ""
    for(var domain in e["childUnsafe"]) {
      if (e["childUnsafe"].hasOwnProperty(domain)) {
        cudt2 += domain + " (Visited " + e["childUnsafe"][domain] + ' time(s))<br>';
      }
    }
    if(!cudt2) {
      cudt2 = "(None so far!)";
    }
    cudt.innerHTML = cudt2;

    //downloaded files. different from the rest
    //combine downloadedFile and maliciousFile because I can't be assed any more
    var adf = [];
    adf  = adf.concat(e.downloadedFile).concat(e.maliciousFile).sort((a, b) => {
      return a.time - b.time
    });

    for(de in adf) {
      deo = adf[de];
      //create a new card for each download
      var dec = document.createElement("div");
      //adding data as text display
      var datetime = new Date(deo.time);
      display = ""
      display += "Time: " + datetime + "<br>";
      display += "URL: " + deo.url + "<br>";
      display += "Domain: " + deo.domain + "<br>";
      display += "Safe: " + ((deo.safe)? "Yes" : "No") + "<br>";
      dec.innerHTML = display;
      dec.id = "security-download-file-div";
      dec.style["background-color"] = deo.safe? "#d1ffc1": "#ffc1cc";
      dec.style.padding = "10px";
      dec.style.margin = "10px";
      dec.style.width = "80%";

      var safeImg = document.createElement("img");
      safeImg.style.width = "50px";
      safeImg.style.height = "50px";
      safeImg.style.float = "right";
      if(deo.safe) {
        safeImg.src = "/images/safe.png";
      } else {
        safeImg.src = "/images/unsafe.png"
      }
      dec.prepend(safeImg);

      //add to DOM
      document.getElementById("security-download-file-" + i).appendChild(dec);
    }
  }
}

function domainsVisited() {
  if(logs.length <= 0) {
    document.getElementById("visited-domains-container").innerHTML = "<div style='margin:auto;width:50%;padding:10px;'>No logs found!</div>";
    return;
  }
  for (var i = 0; i < logs.length; i++) {
    //set values
    var ip = logs[i]["_id"];
    //new div as a container for the chart
    var chartContainer = document.createElement("canvas");
    chartContainer.id = "domain-container-" + i;
    chartContainer.height = 30 * Object.keys(logs[i].domains).length;
    var ctx = chartContainer.getContext('2d')
    vdcontainer = document.getElementById("visited-domains-container");
    vdcontainer.appendChild(chartContainer);

    //create a new chart for each ip
    var domains = logs[i]["domains"];
    //format data
    //get labels
    var labels = [];
    var values = [];
    for (domain in domains) {
      if (domains.hasOwnProperty(domain)) {
        labels.push(domain);
        values.push(domains[domain]);
      }
    }

    //sort both arrays
    //1) combine the arrays:
    var list = [];
    for (var j = 0; j < labels.length; j++)
        list.push({'label': labels[j], 'value': values[j]});
    //2) sort:
    list.sort(function(a, b) {
        return -((a.value < b.value) ? -1 : ((a.value == b.value) ? 0 : 1));
        //Sort could be modified to, for example, sort on the age
        // if the name is the same.
    });
    //3) separate them back out:
    for (var k = 0; k < list.length; k++) {
        labels[k] = list[k].label;
        values[k] = list[k].value;
    }

    //create chart
    var color = Chart.helpers.color
    var horizontalBarChartData = {
      "labels" : labels,
      "datasets" : [{
        "label": "Requests",
        "data" : values
      }]
    }
    chartContainer.style = "height: " + 7 * logs[i]["domains"].length + "px"
    var chart = new Chart(ctx, {
      "type" : "horizontalBar",
      "data" : horizontalBarChartData,
      "options" : {
        "maintainAspectRatio" : false,
        "elements" : {
          "rectangle" : {
            "borderWidth" : 2
          }
        },
        "responsive" : true,
        "legend" : {
          "position" : "right"
        },
        "title" : {
          "display" : true,
          "text": "Domains Visited by " + ip
        },
        "scales" : {
          "xAxes" : [{
            "ticks": {
              "beginAtZero" : true
            }
          }]
        }
      }
    });
  }
}
