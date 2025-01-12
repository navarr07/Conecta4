/* ------VARIABLES GLOBALES------ */

const filas = 6;
const columnas = 7;
let tablero = [];
let colorJugador;
let colorIA;
let dificultad;
let turnoJugador = true;
let juegoActivo = true;

/* ------CONFIGURACIÓN INICIAL------ */

// Iniciar juego
document.getElementById('iniciarJuego').addEventListener('click', iniciarJuego);

// Alternar música
const musicaFondo = document.getElementById('musicaFondo');
const toggleMusica = document.getElementById('toggleMusica');
toggleMusica.addEventListener('click', () => {
    if (musicaFondo.paused) {
        musicaFondo.play();
        toggleMusica.textContent = '🔊 Desactivar Música';
    } else {
        musicaFondo.pause();
        toggleMusica.textContent = '🔈 Activar Música';
    }
});

// Mostrar guía completa
document.getElementById('verGuiaCompleta').addEventListener('click', () => {
    const pdfUrl = 'Conecta4_GuiaDeUsuario.pdf';
    fetch(pdfUrl)
        .then(response => {
            if (response.ok) {
                window.open(pdfUrl, '_blank');
            } else {
                alert('La guía no está disponible.');
            }
        })
        .catch(() => {
            alert('La guía no está disponible.');
        });
});

// Agregar sonido a los botones
const botones = document.querySelectorAll('button');
botones.forEach(boton => {
    boton.addEventListener('click', reproducirSonidoClick);
});

// Eventos de Electron
const { ipcRenderer } = require('electron');
ipcRenderer.on('reiniciar-juego', reiniciarJuego);
ipcRenderer.on('mostrar-controles', () => {
    alert('Instrucciones:\n1. Elige tu color y la dificultad.\n2. Haz clic en una columna para colocar tu ficha.\n3. Alinea 4 fichas antes que la máquina.');
});
ipcRenderer.on('mostrar-acerca-de', () => {
    alert('Conecta 4\nDesarrollado por Marcos Navarro.\nVersión 1.1.0');
});

/* ------FUNCIONES PRINCIPALES------ */

// Función para iniciar el juego
function iniciarJuego() {
    document.getElementById('menuInicio')?.classList.add('oculto');
    document.getElementById('configuracion')?.classList.add('oculto');
    document.getElementById('contenedorJuego')?.classList.remove('oculto');
    document.getElementById('controlMusica').style.display = 'block';

    dificultad = document.getElementById('dificultad').value;
    colorJugador = document.getElementById('colorFicha').value;
    colorIA = colorJugador === 'rojo' ? 'azul' : 'rojo';
    tablero = Array.from({ length: filas }, () => Array(columnas).fill(null));
    juegoActivo = true;
    turnoJugador = true;
    dibujarTablero();
}

// Dibujar el tablero
function dibujarTablero() {
    const tableroJuego = document.getElementById('tableroJuego');
    tableroJuego.innerHTML = '';
    tableroJuego.classList.remove('oculto');

    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            const celda = document.createElement('div');
            celda.classList.add('celda');
            if (tablero[fila][columna]) {
                celda.classList.add(tablero[fila][columna] === 'rojo' ? 'roja' : 'azul');
            }
            celda.addEventListener('click', () => colocarFicha(columna));
            tableroJuego.appendChild(celda);
        }
    }
}

// Colocar ficha
function colocarFicha(columna) {
    if (!juegoActivo || !turnoJugador) return;

    for (let fila = filas - 1; fila >= 0; fila--) {
        if (!tablero[fila][columna]) {
            tablero[fila][columna] = colorJugador;
            turnoJugador = false;
            dibujarTablero();
            reproducirSonidoFicha();

            const fichasGanadoras = comprobarGanador(colorJugador);
            if (fichasGanadoras) {
                juegoActivo = false;
                reproducirSonidoVictoria();
                setTimeout(() => {
                    alert('¡Has ganado!');
                    reiniciarJuego();
                }, 500);
                return;
            }

            setTimeout(movimientoIA, 1000);
            return;
        }
    }
}

// Movimiento IA
function movimientoIA() {
    if (!juegoActivo) return;

    let columna;
    switch (dificultad) {
        case 'facil':
            columna = Math.floor(Math.random() * columnas);
            break;
        case 'dificil':
            columna = buscarMejorMovimiento();
            break;
    }

    for (let fila = filas - 1; fila >= 0; fila--) {
        if (!tablero[fila][columna]) {
            tablero[fila][columna] = colorIA;
            dibujarTablero();
            reproducirSonidoFicha();

            const fichasGanadoras = comprobarGanador(colorIA);
            if (fichasGanadoras) {
                juegoActivo = false;
                reproducirSonidoDerrota();
                setTimeout(() => {
                    alert('¡La máquina ha ganado!');
                    reiniciarJuego();
                }, 500);
                return;
            }

            turnoJugador = true;
            return;
        }
    }

    setTimeout(movimientoIA, 500);
}

// Reiniciar juego
function reiniciarJuego() {
    juegoActivo = false;
    turnoJugador = false;
    document.getElementById('configuracion').classList.remove('oculto');
}

/* ------FUNCIONES AUXILIARES------ */

// Reproducir sonidos
function reproducirSonidoFicha() {
    const sonidoFicha = document.getElementById('sonidoFicha');
    sonidoFicha.currentTime = 0;
    sonidoFicha.play();
}

function reproducirSonidoVictoria() {
    const sonidoVictoria = document.getElementById('sonidoVictoria');
    sonidoVictoria.currentTime = 0;
    sonidoVictoria.play();
}

function reproducirSonidoDerrota() {
    const sonidoDerrota = document.getElementById('sonidoDerrota');
    sonidoDerrota.currentTime = 0;
    sonidoDerrota.play();
}

function reproducirSonidoClick() {
    const sonidoClick = document.getElementById('sonidoClick');
    sonidoClick.currentTime = 0;
    sonidoClick.play();
}

// Comprobar ganador
function comprobarGanador(color) {
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            const direcciones = [
                { dirFila: 0, dirColumna: 1 },
                { dirFila: 1, dirColumna: 0 },
                { dirFila: 1, dirColumna: 1 },
                { dirFila: 1, dirColumna: -1 },
            ];
            for (const { dirFila, dirColumna } of direcciones) {
                const fichasGanadoras = comprobarDireccion(fila, columna, dirFila, dirColumna, color);
                if (fichasGanadoras) return fichasGanadoras;
            }
        }
    }
    return null;
}

function comprobarDireccion(fila, columna, dirFila, dirColumna, color) {
    let contador = 0;
    const fichasGanadoras = [];
    for (let i = 0; i < 4; i++) {
        const nuevaFila = fila + i * dirFila;
        const nuevaColumna = columna + i * dirColumna;
        if (
            nuevaFila >= 0 &&
            nuevaFila < filas &&
            nuevaColumna >= 0 &&
            nuevaColumna < columnas &&
            tablero[nuevaFila][nuevaColumna] === color
        ) {
            contador++;
            fichasGanadoras.push({ fila: nuevaFila, columna: nuevaColumna });
        } else break;
    }
    if (contador === 4) return fichasGanadoras;
    return null;
}

// Evaluar el tablero
function evaluarTablero() {
    let puntaje = 0;
    const direcciones = [
        { dirFila: 0, dirColumna: 1 },
        { dirFila: 1, dirColumna: 0 },
        { dirFila: 1, dirColumna: 1 },
        { dirFila: 1, dirColumna: -1 },
    ];

    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            for (const { dirFila, dirColumna } of direcciones) {
                const [puntosIA, puntosJugador] = evaluarLinea(fila, columna, dirFila, dirColumna);
                puntaje += puntosIA - puntosJugador;
            }
        }
    }
    return puntaje;
}

function evaluarLinea(fila, columna, dirFila, dirColumna) {
    let puntosIA = 0;
    let puntosJugador = 0;

    for (let i = 0; i < 4; i++) {
        const nuevaFila = fila + i * dirFila;
        const nuevaColumna = columna + i * dirColumna;

        if (
            nuevaFila >= 0 &&
            nuevaFila < filas &&
            nuevaColumna >= 0 &&
            nuevaColumna < columnas
        ) {
            if (tablero[nuevaFila][nuevaColumna] === colorIA) {
                puntosIA++;
            } else if (tablero[nuevaFila][nuevaColumna] === colorJugador) {
                puntosJugador++;
            }
        }
    }
    return [puntosIA, puntosJugador];
}

/* ------FUNCIONES DE IA------ */
function buscarMejorMovimiento() {
    for (let columna = 0; columna < columnas; columna++) {
        for (let fila = filas - 1; fila >= 0; fila--) {
            if (!tablero[fila][columna]) {
                tablero[fila][columna] = colorIA;
                const ganador = comprobarGanador(colorIA);
                tablero[fila][columna] = null;
                if (ganador) return columna;
                break;
            }
        }
    }

    for (let columna = 0; columna < columnas; columna++) {
        for (let fila = filas - 1; fila >= 0; fila--) {
            if (!tablero[fila][columna]) {
                tablero[fila][columna] = colorJugador;
                const ganador = comprobarGanador(colorJugador);
                tablero[fila][columna] = null;
                if (ganador) return columna;
                break;
            }
        }
    }

    let mejorColumna = null;
    let maxValor = -Infinity;

    for (let columna = 0; columna < columnas; columna++) {
        for (let fila = filas - 1; fila >= 0; fila--) {
            if (!tablero[fila][columna]) {
                tablero[fila][columna] = colorIA;
                const valor = evaluarTablero();
                tablero[fila][columna] = null;

                if (valor > maxValor) {
                    maxValor = valor;
                    mejorColumna = columna;
                }
                break;
            }
        }
    }

    return mejorColumna !== null ? mejorColumna : Math.floor(Math.random() * columnas);
}
