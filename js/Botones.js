class Botones {

    constructor(juego) {
        this.juego = juego;
        this.iniciarEventos();
    }

    iniciarEventos() {

        document.getElementById("btnRecargar").addEventListener("click", () => {

            for (let i = 0; i < 2; i++) {
                const random = Math.floor(Math.random() * this.juego.semillasDisponibles.length);
                const semilla = this.juego.semillasDisponibles[random];

                this.juego.granjero.agregarSemilla(semilla);
            }

            this.juego.render();

        });

        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.juego.guardar();
        });

    }

}