function checkFolderForUpdates() {
  // 通知するフォルダのIDをここに設定する
  var folderIds = ['folder1-2_ID', 'folder2-2_ID'];

  // 通知するLINE Notify APIトークンをここに設定する
  var LINE_TOKEN = "TOKEN";
  
  // 通知済みファイルの情報を取得する
  var properties = PropertiesService.getScriptProperties();
  var notifiedFiles = properties.getProperty("notifiedFiles");
  if (notifiedFiles) {
    notifiedFiles = JSON.parse(notifiedFiles);
  } else {
    notifiedFiles = {};
  }
  
  // 通知するメッセージの初期化
  var message = "";

  // 現在の日付を取得
  var today = new Date();
  // メッセージの先頭に日付を追加
  message = today.toLocaleDateString() + message;

  
  for (var i = 0; i < folderIds.length; i++) {
    var folder = DriveApp.getFolderById(folderIds[i]);
    var files = folder.getFiles();
    var fileList = [];
    while (files.hasNext()) {
      var file = files.next();
      var fileId = file.getId();
      var fileName = file.getName();
      
      // 2つ前の親フォルダを取得する
      var grandParent = folder.getParents().next().getParents().next();
      var folderName = grandParent.getName();
      
      // 通知済みファイルの情報に含まれていない場合にファイル名をファイルリストに追加する
      if (!notifiedFiles[fileId]) {
        fileList.push(fileName);
        notifiedFiles[fileId] = true;
      }
    }
    
    // ファイル名を文字列順にソートする
    fileList.sort(function(a, b) {
      return a.localeCompare(b);
    });
    

    // ファイルリストが空でなければ、フォルダ名とファイルリストをメッセージに追加する
    // ファイルリストが空ならば、「今日の更新はありません」と通知する
    if (fileList.length > 0) {
      message += "\n" + "\n" + "[" + folderName + "]" + "\n";
      for (var j = 0; j < fileList.length; j++) {
        message += "  " + fileList[j] + "\n";
      }
    }
    
     if (fileList.length = 0){
     message = today.toLocaleDateString() + "\n" + "\n" + "今日の更新はありません" + "\n";
    }
  }
  
  // 通知済みファイルの情報を保存する
  properties.setProperty("notifiedFiles", JSON.stringify(notifiedFiles));
  
  // メッセージが空でなければ、LINEに通知する
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
