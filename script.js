class Semilla {
    constructor(nombre, tiempoMaduracion, precioVenta) {
        this.nombre = nombre;
        this.tiempoMaduracion = tiempoMaduracion;
        this.precioVenta = precioVenta;
    }
}

class Cultivo {
    constructor(semilla) {
        this.nombre = semilla.nombre;
        this.tiempoRestante = semilla.tiempoMaduracion;
        this.precioVenta = semilla.precioVenta;
    }

    crecer() {
        if (this.tiempoRestante > 0) {
            this.tiempoRestante--;
        }
    }

    estaMaduro() {
        return this.tiempoRestante === 0;
    }
}

class Herramienta {
    constructor(nombre, nivel = 1) {
        this.nombre = nombre;
        this.nivel = nivel;
    }
}

class Granjero {
    constructor(nombre) {
        this.nombre = nombre;
        this.dinero = 100;
        this.energia = 100;
        this.inventario = [];
        this.herramientas = {
            azada: new Herramienta("Azada"),
            regadera: new Herramienta("Regadera"),
            hoz: new Herramienta("Hoz")
        };
    }

    agregarSemilla(semilla) {
        this.inventario.push(semilla);
    }

    vender(cultivo) {
        this.dinero += cultivo.precioVenta;
    }
}

class Parcela {
    constructor() {
        this.cultivo = null;
    }

    plantar(semilla) {
        if (!this.cultivo) {
            this.cultivo = new Cultivo(semilla);
        }
    }

    recolectar() {
        if (this.cultivo && this.cultivo.estaMaduro()) {
            const cultivoRecolectado = this.cultivo;
            this.cultivo = null;
            return cultivoRecolectado;
        }
        return null;
    }
}

class Terreno {
    constructor(tamano) {
        this.parcelas = [];
        for (let i = 0; i < tamano; i++) {
            this.parcelas.push(new Parcela());
        }
    }
}

class Juego {
    constructor() {
        this.granjero = new Granjero("Emma");
        this.terreno = new Terreno(8);
        this.semillasDisponibles = [
            new Semilla("Tomate", 3, 20),
            new Semilla("Zanahoria", 2, 15)
        ];
        this.iniciarEventos();
        this.render();
    }

    iniciarEventos() {
        document.getElementById("btnRecargar").addEventListener("click", () => {
            this.granjero.agregarSemilla(this.semillasDisponibles[0]);
            this.granjero.agregarSemilla(this.semillasDisponibles[1]);
            this.render();
        });

        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.guardar();
        });
    }

    render() {
        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarTerreno();
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
        card.classList.add("card", "text-center", "p-3");

        if (parcela.cultivo) {
            if (parcela.cultivo.estaMaduro()) {
                card.classList.add("parcela-madura");
                card.textContent = parcela.cultivo.nombre;
            } else {
                card.classList.add("parcela-creciendo");
                card.textContent = "Creciendo";
            }
        } else {
            card.classList.add("parcela-vacia");
            card.textContent = "Vacío";
        }

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
        } else if (parcela.cultivo) {
            parcela.cultivo.crecer();

            if (parcela.cultivo.estaMaduro()) {
                const cultivo = parcela.recolectar();
                this.granjero.vender(cultivo);
            }
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

document.addEventListener("DOMContentLoaded", () => {
    new Juego();
});