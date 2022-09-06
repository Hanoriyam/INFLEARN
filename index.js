'use strict';

const { app, BrowserWindow, Menu, Tray, nativeTheme, ipcMain, dialog, shell, screen, session, Notification, systemPreferences, crashReporter } = require("electron");
const path = require('path');

let g_mainWindow = null;
let g_tray = null;
let g_bClosing = false;
let g_strTitle = 'inflearn';

nativeTheme.themeSource = 'dark';
crashReporter.start({ uploadToServer: false });
app.setAppUserModelId(g_strTitle);

const createWindow = () => {
    g_mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
        center: true,
        width: 1366,
        height: 768
    });
    g_mainWindow.on('page-title-updated', (e) => { e.preventDefault(); });
    g_mainWindow.on('close', (e) => {
        if (!g_bClosing) {
            e.preventDefault();
            g_mainWindow.hide();
        }
    });
    g_mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type !== 'keyDown') {
            return;
        }
        switch (input.key.toLocaleLowerCase()) {
            case 'w':
            case 'f4':
                if (input.control || input.alt) {
                    g_mainWindow.close();
                }
                break;
            case 'escape':
                g_mainWindow.close();
                break;
            case 'f12':
                if (input.control && input.alt && input.shift) {
                    g_mainWindow.webContents.toggleDevTools();
                }
                break;
            case 'f5':
                g_mainWindow.webContents.reload();
                break;
            case 'r':
                if (input.control) {
                    g_mainWindow.webContents.reload();
                }
                break;
            default:
                break;
        }
    });
    SetTrayIcon();
    g_mainWindow.removeMenu();
    g_mainWindow.loadURL('https://inflearn.com');
    setInterval(() => {
        try {
            g_mainWindow.webContents.executeJavaScript("document.getElementsByClassName('css-1e2s581')[0]?.click();")
                .then((result => {
                }));
            g_mainWindow.webContents.executeJavaScript("document.getElementsByClassName('css-10nrq8n')[0]?.click();")
                .then((result => {
                }));
        }
        catch {
        }
    }, 100);
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows() == 0) {
            createWindow();
        }
    });
    app.accessibilitySupportEnabled = false;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

let g_nextButtonInterval = null;
const SetTrayIcon = () => {
    g_tray = new Tray(path.join(__dirname, 'src/asset/img/icon.png'));
    g_tray.setToolTip(g_strTitle);
    let contextMenu = Menu.buildFromTemplate([
        {
            label: 'START',
            type: 'normal',
            click: () => {
                if (g_nextButtonInterval === null) {
                    g_nextButtonInterval = setInterval(() => {
                        g_mainWindow.webContents.executeJavaScript(
                            "var btnWatched=document.querySelector('.css-1u4rtln button');var btnNext=document.querySelectorAll('.css-1iqyy5y button')[document.querySelectorAll('.css-1iqyy5y button').length-1];if(btnWatched!==null){btnWatched.click();setTimeout(()=>{btnNext.click();},1000);}else{btnNext.click();}").then(result => {
                                console.log(result);
                            });
                    }, 2000);
                    dialog.showMessageBox(g_mainWindow, {
                        title: g_strTitle,
                        type: 'info',
                        message: 'START!'
                    });
                }
            }
        },
        {
            label: 'STOP',
            type: 'normal',
            click: () => {
                if (g_nextButtonInterval) {
                    clearInterval(g_nextButtonInterval);
                    g_nextButtonInterval = null;
                    dialog.showMessageBox(g_mainWindow, {
                        title: g_strTitle,
                        type: 'info',
                        message: 'STOP!'
                    });
                }
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Close',
            type: 'normal',
            click: () => {
                g_bClosing = true;
                g_mainWindow.close();
            }
        }
    ]);
    g_tray.setContextMenu(contextMenu);
    g_tray.on('double-click', () => {
        g_mainWindow.show();
    });
    g_tray.on('click', () => {
        g_mainWindow.show();
    });
}