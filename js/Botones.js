// clase encargada de registrar los eventos de los botones de la interfaz
// nota: esta clase nunca se instancia desde ningun archivo, es codigo sin uso
class Botones {

    // recibe la instancia del juego para poder llamar a sus metodos
    constructor(juego) {
        this.juego = juego;
        this.iniciarEventos();
    }

    iniciarEventos() {
        // al pulsar recargar se anaden 2 semillas aleatorias al inventario del granjero
        document.getElementById("btnRecargar").addEventListener("click", () => {
            for (let i = 0; i < 2; i++) {
                const random = Math.floor(Math.random() * this.juego.semillasDisponibles.length);
                const semilla = this.juego.semillasDisponibles[random];

                this.juego.granjero.agregarSemilla(semilla);
            }
            // actualiza la interfaz tras modificar el inventario
            this.juego.render();
        });
        // al pulsar guardar se serializa la partida en localStorage
        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.juego.guardar();
        });
    }
}