class Juego {

    constructor(datosGuardados = null) {

        this.granjero = new Granjero("Emma");
        this.terreno = new Terreno(8);

        this.semillasDisponibles = [
            new Semilla("Tomate", 3, 20),
            new Semilla("Zanahoria", 2, 15)
        ];

        new Botones(this);

        // CARGAR PARTIDA SI EXISTE
        if (datosGuardados) {

            this.granjero.dinero = datosGuardados.dinero;
            this.granjero.energia = datosGuardados.energia;

            datosGuardados.inventario.forEach(s => {

                this.granjero.inventario.push(
                    new Semilla(s.nombre, s.tiempoMaduracion, s.precioVenta)
                );

            });

        }

        this.render();
        this.iniciarCrecimiento();

    }

    render() {
        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarTerreno();
    }


    iniciarCrecimiento() {

        setInterval(() => {

            this.terreno.parcelas.forEach(parcela => {

                if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
                    parcela.cultivo.crecer();
                }

            });

            this.render();

        }, 5000);

    }


    mostrarInfo() {

        const info = document.getElementById("info-granjero");

        info.innerHTML = `
            <h5>Granjero</h5>
            <p>Nombre: ${this.granjero.nombre}</p>
            <p>Dinero: ${this.granjero.dinero}</p>
            <p>Energía: ${this.granjero.energia}</p>
        `;

    }


    mostrarInventario() {

        const inventario = document.getElementById("inventario");

        inventario.innerHTML = `
            <h5>Inventario</h5>
            <p>Semillas: ${this.granjero.inventario.length}</p>
        `;

    }


    mostrarTerreno() {

        const terrenoDiv = document.getElementById("terreno");
        terrenoDiv.innerHTML = "";

        this.terreno.parcelas.forEach((parcela, index) => {

            const col = document.createElement("div");
            col.classList.add("col-3");

            const card = document.createElement("div");
            card.classList.add("card", "text-center", "p-2");

            const img = document.createElement("img");
            img.style.width = "100%";

            if (parcela.cultivo) {

                if (parcela.cultivo.estaMaduro()) {

                    img.src = "planta inicial.png";

                } else {

                    img.src = "semilla.png";

                }

            } else {

                img.src = "maceta.png";

            }

            card.appendChild(img);

            card.style.cursor = "pointer";

            card.addEventListener("click", () => {
                this.interactuarParcela(index);
            });

            col.appendChild(card);
            terrenoDiv.appendChild(col);

        });

    }


    interactuarParcela(index) {

        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo && this.granjero.inventario.length > 0) {

            const semilla = this.granjero.inventario.pop();
            parcela.plantar(semilla);

        }

        else if (parcela.cultivo && parcela.cultivo.estaMaduro()) {

            const cultivo = parcela.recolectar();
            this.granjero.vender(cultivo);

        }

        this.render();

    }


    guardar() {

        const datos = {

            dinero: this.granjero.dinero,
            energia: this.granjero.energia,

            inventario: this.granjero.inventario.map(s => ({
                nombre: s.nombre,
                tiempoMaduracion: s.tiempoMaduracion,
                precioVenta: s.precioVenta
            }))

        };

        localStorage.setItem("partidaGranja", JSON.stringify(datos));

    }

}