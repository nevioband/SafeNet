const { app, BrowserWindow } = require('electron')
app.whenReady().then(() => {
  new BrowserWindow({ width: 1200, height: 800 })
    .loadURL('https://safenet-security.ch')
})