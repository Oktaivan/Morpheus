// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog } = require('electron')
const path = require('node:path')
const { exec } = require('child_process');



let ollamaProcess = null; // Variable to store the Ollama process

// Define the runOllamaCommand function
function runOllamaCommand() {
  // Define the PATH for the child process
  const env = { ...process.env, PATH: '/path/to/ollama:' + process.env.PATH };

  // Check if ollama is installed
  exec('ollama --version', { env }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ollama is not installed: ${error}`);
      dialog.showErrorBox('Error', `Ollama is not installed: ${error}`);
      return;
    }

    // If ollama is installed, run ollama serve
    ollamaProcess = exec('ollama serve', { env, shell: '/bin/bash', maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Ollama: ${error}`);
        dialog.showErrorBox('Error', `Error executing Ollama: ${error}`);
        return;
      }

      // Output verbose logging
      console.log(`Ollama Output: ${stdout}`);
      if (stderr) {
        console.error(`Ollama Errors: ${stderr}`);
      }
    });
  });
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 800,
    // height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //  load the index.html of the app.
  mainWindow.loadFile('ui/index.html')

  // Open the DevTools.
   mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  runOllamaCommand(); // Serve Ollama
  createWindow();


  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// Quit when all windows are closed, and kill Ollama process
app.on('window-all-closed', function() {
  if (ollamaProcess !== null) {
      ollamaProcess.kill(); // Kill Ollama process
  }
  if (process.platform !== 'darwin') app.quit();
});

/* app.on('activate', function () {
  // On macOS, re-create a window when the dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); */

app.on('before-quit', function () {
  // This will handle the Cmd + Q case on macOS
  // You can do any cleanup here before your application quits
  ollamaProcess.kill(); // Kill Ollama process
});

app.on('will-quit', function () {
  // This will handle the Cmd + Q case on macOS
  // You can do any cleanup here before your application quits
  ollamaProcess.kill(); // Kill Ollama process
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
