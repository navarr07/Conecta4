const { app, BrowserWindow, Menu } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');

    // Define el menú personalizado
    const menuTemplate = [
        {
            label: 'Juego',
            submenu: [
                {
                    label: 'Reiniciar partida',
                    click: () => {
                        mainWindow.webContents.send('reiniciar-juego'); // Enviar un evento a la ventana principal
                    },
                },
                {
                    label: 'Pantalla completa',
                    click: () => {
                        const isFullScreen = mainWindow.isFullScreen();
                        mainWindow.setFullScreen(!isFullScreen);
                    },
                },
                { type: 'separator' },
                {
                    label: 'Salir',
                    role: 'quit', // Salir de la aplicación
                },
            ],
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: 'Controles',
                    click: () => {
                        mainWindow.webContents.send('mostrar-controles'); // Mostrar instrucciones
                    },
                },
                {
                    label: 'Acerca de',
                    click: () => {
                        mainWindow.webContents.send('mostrar-acerca-de'); // Mostrar información del juego
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
});
