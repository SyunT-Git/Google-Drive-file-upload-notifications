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

  // Initialize flag whether there are new files or not
  var newFiles = false;
  
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
        // Set a flag that there is a new file
        newFiles = true;
      }
    }
    
    // Sort filenames in string order
    fileList.sort(function(a, b) {
      return a.localeCompare(b);
    });
    
    // If the file list is not empty, add the folder name and file list to the message
    if (fileList.length > 0) {
      message += "\n" + "\n" + "[" + folderName + "]" + "\n";
      for (var j = 0; j < fileList.length; j++) {
        message += "  " + fileList[j] + "\n";
      }
    }
  }
  
  // Save notified file information
  properties.setProperty("notifiedFiles", JSON.stringify(notifiedFiles));
  
  // If there are no new files, notify "No updates today"
  if (!newFiles) {
    message += "\n" + "今日の更新はありません";
  }

  // Notify LINE Notify
  var payload = {
    "message": message
  };

  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + LINE_TOKEN
    },
    "payload": payload
  };

  // Send a request to LINE Notify API
  var response = UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);

  // Get response status code
  var responseCode = response.getResponseCode();

  // If the response status code is not 200, log an error
  if (responseCode !== 200) {
    Logger.log("LINE Notify API 通知エラー: ステータスコード " + responseCode);
  }
}

