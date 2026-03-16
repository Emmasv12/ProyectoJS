class Menu {

    constructor() {
        this.iniciarEventos();
    }

    iniciarEventos() {

        // NUEVA PARTIDA
        document.getElementById("btnNueva").addEventListener("click", () => {

            document.getElementById("menu-inicio").style.display = "none";
            document.getElementById("juego").style.display = "block";

            new Juego();

        });


        // CONTINUAR PARTIDA
        document.getElementById("btnContinuar").addEventListener("click", () => {

            const partida = localStorage.getItem("partidaGranja");

            if (partida) {

                document.getElementById("menu-inicio").style.display = "none";
                document.getElementById("juego").style.display = "block";

                new Juego(JSON.parse(partida));

            } else {

                alert("No hay partida guardada.");

            }

        });


        // ELIMINAR PARTIDA
        document.getElementById("btnEliminar").addEventListener("click", () => {

            localStorage.removeItem("partidaGranja");

            alert("Partida eliminada.");

        });

    }

}