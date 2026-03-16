class Botones {

    constructor(juego) {
        this.juego = juego;
        this.iniciarEventos();
    }

    iniciarEventos() {

        document.getElementById("btnRecargar").addEventListener("click", () => {

            this.juego.granjero.agregarSemilla(this.juego.semillasDisponibles[0]);
            this.juego.granjero.agregarSemilla(this.juego.semillasDisponibles[1]);

            this.juego.render();

        });

        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.juego.guardar();
        });

    }

}