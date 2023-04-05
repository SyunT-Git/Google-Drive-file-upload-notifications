function checkFolderForUpdates() {
  // Set the ID of the folder to be notified here
  var folderIds = ['folder1-2_ID', 'folder2-2_ID'];
  
  // Set the LINE Notify API token to be notified here
  var LINE_TOKEN = "TOKEN";
  
  // Retrieve information on notified files
  var properties = PropertiesService.getScriptProperties();
  var notifiedFiles = properties.getProperty("notifiedFiles");
  if (notifiedFiles) {
    notifiedFiles = JSON.parse(notifiedFiles);
  } else {
    notifiedFiles = {};
  }
  
  // Initialize messages to be notified
  var message = "";

  // Get current date
  var today = new Date();
  // Add the date to the beginning of the message
  message = today.toLocaleDateString() + message;

  
  for (var i = 0; i < folderIds.length; i++) {
    var folder = DriveApp.getFolderById(folderIds[i]);
    var files = folder.getFiles();
    var fileList = [];
    while (files.hasNext()) {
      var file = files.next();
      var fileId = file.getId();
      var fileName = file.getName();
      
      // Get the two previous parent folders
      var grandParent = folder.getParents().next().getParents().next();
      var folderName = grandParent.getName();
      
      // Add a file name to the file list if it is not included in the notified file information
      if (!notifiedFiles[fileId]) {
        fileList.push(fileName);
        notifiedFiles[fileId] = true;
      }
    }
    
    // Sort filenames by string order
    fileList.sort(function(a, b) {
      return a.localeCompare(b);
    });
    

    // If the file list is not empty, add the folder name and file list to the message
    // If the file list is empty, it notifies "No updates today".
    if (fileList.length > 0) {
      message += "\n" + "\n" + "[" + folderName + "]" + "\n";
      for (var j = 0; j < fileList.length; j++) {
        message += "  " + fileList[j] + "\n";
      }
    }else{
      message = today.toLocaleDateString() + "\n" + "\n" + "No updates today" + "\n";
    }
  }
  
  // Save notified file information
  properties.setProperty("notifiedFiles", JSON.stringify(notifiedFiles));
  
  // Notify LINE if message is not empty.
  if (message !== "") {
    var payload = {
      "message": message
    };
    var options = {
      "method": "post",
      "headers": {"Authorization": "Bearer " + LINE_TOKEN},
      "payload": payload
    };
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
  }
}
