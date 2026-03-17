// clase principal que orquesta toda la logica del juego
class Juego {

    constructor() {

        // crea al granjero con nombre fijo y un terreno de 8 parcelas
        this.granjero = new Granjero("Emma");
        this.terreno = new Terreno(8);

        // catalogo de semillas que pueden aparecer al recargar el inventario
        this.semillasDisponibles = [

            new Semilla(
                "Tomate",
                3,              // tarda 3 ciclos en madurar
                20,             // se vende por 20 de dinero
                "semilla.png",
                "tomate_creciendo.png",
                "tomate_maduro.png"
            ),

            new Semilla(
                "Zanahoria",
                2,              // tarda 2 ciclos en madurar
                15,             // se vende por 15 de dinero
                "semilla.png",
                "zanahoria_creciendo.png",
                "zanahoria_madura.png"
            ),

            new Semilla(
                "Maiz",
                4,              // tarda 4 ciclos en madurar
                30,             // se vende por 30 de dinero
                "semilla.png",
                "maiz_creciendo.png",
                "maiz_maduro.png"
            )

        ];

        this.iniciarEventos();
        this.render();
        this.iniciarCrecimiento();

    }

    // registra los eventos de los botones de la interfaz
    // esta logica es identica a la de Botones.js, que nunca se instancia
    iniciarEventos() {

        // al pulsar recargar se anaden 2 semillas aleatorias al inventario
        document.getElementById("btnRecargar").addEventListener("click", () => {

            for (let i = 0; i < 2; i++) {

                const random = Math.floor(Math.random() * this.semillasDisponibles.length);
                const semilla = this.semillasDisponibles[random];

                this.granjero.agregarSemilla(semilla);
            }

            this.render();
        });

        // al pulsar guardar se llama al metodo de persistencia
        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.guardar();
        });

    }

    // redibuja toda la interfaz: informacion del granjero, inventario y terreno
    render() {

        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarTerreno();

    }

    // bucle de juego: cada 5 segundos avanza el crecimiento de todos los cultivos
    iniciarCrecimiento() {

        setInterval(() => {

            // recorre todas las parcelas y hace crecer los cultivos que no estan maduros
            this.terreno.parcelas.forEach(parcela => {

                if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
                    parcela.cultivo.crecer();
                }

            });

            // actualiza la interfaz para reflejar el nuevo estado
            this.render();

        }, 5000); // intervalo de 5000ms = 5 segundos por ciclo

    }

    // actualiza el bloque de informacion del granjero en el html
    mostrarInfo() {

        const info = document.getElementById("info-granjero");

        info.innerHTML = `
            <h5>Granjero</h5>
            <p>Nombre: ${this.granjero.nombre}</p>
            <p>Dinero: ${this.granjero.dinero}</p>
            <p>Energia: ${this.granjero.energia}</p>
        `;
    }

    // actualiza el bloque de inventario mostrando cuantas semillas quedan
    mostrarInventario() {

        const inventario = document.getElementById("inventario");

        inventario.innerHTML = `
            <h5>Inventario</h5>
            <p>Semillas: ${this.granjero.inventario.length}</p>
        `;
    }

    // reconstruye visualmente todas las parcelas del terreno en el html
    mostrarTerreno() {

        const terrenoDiv = document.getElementById("terreno");
        terrenoDiv.innerHTML = ""; // limpia el contenido anterior antes de redibujar

        this.terreno.parcelas.forEach((parcela, index) => {

            // contenedor de columna de bootstrap para distribuir las parcelas
            const col = document.createElement("div");
            col.classList.add("col-3");

            const card = document.createElement("div");
            card.classList.add("card", "text-center", "p-2");

            const img = document.createElement("img");
            img.style.width = "100%";

            // elige la imagen segun la fase del cultivo, o muestra maceta si esta vacia
            if (parcela.cultivo) {

                const fase = parcela.cultivo.obtenerFase();

                if (fase === "semilla") {
                    img.src = parcela.cultivo.imgSemilla;
                }
                else if (fase === "creciendo") {
                    img.src = parcela.cultivo.imgCreciendo;
                }
                else {
                    img.src = parcela.cultivo.imgMaduro;
                }

            } else {

                // parcela vacia: muestra la imagen de maceta
                img.src = "maceta.png";

            }

            card.appendChild(img);
            card.style.cursor = "pointer"; // indica que la parcela es clicable

            // al hacer clic en una parcela se gestiona la interaccion (plantar o cosechar)
            card.addEventListener("click", () => {
                this.interactuarParcela(index);
            });

            col.appendChild(card);
            terrenoDiv.appendChild(col);

        });

    }

    // gestiona el clic del jugador sobre una parcela
    // si esta vacia y hay semillas: planta
    // si tiene un cultivo maduro: cosecha y vende
    interactuarParcela(index) {

        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo && this.granjero.inventario.length > 0) {

            // saca la ultima semilla del inventario y la planta en la parcela
            const semilla = this.granjero.inventario.pop();
            parcela.plantar(semilla);

        }

        else if (parcela.cultivo && parcela.cultivo.estaMaduro()) {

            // recoge el cultivo maduro y suma su valor al dinero del granjero
            const cultivo = parcela.recolectar();
            this.granjero.vender(cultivo);

        }

        this.render();

    }

    // guarda el estado del granjero e inventario en localStorage como json
    // nota: no guarda el estado de las parcelas, por lo que al recargar se pierden los cultivos
    guardar() {

        const datos = {

            dinero: this.granjero.dinero,
            energia: this.granjero.energia,

            // serializa solo los datos necesarios de cada semilla del inventario
            inventario: this.granjero.inventario.map(s => ({
                nombre: s.nombre,
                tiempoMaduracion: s.tiempoMaduracion,
                precioVenta: s.precioVenta
            }))

        };

        localStorage.setItem("partidaGranja", JSON.stringify(datos));

    }

}
