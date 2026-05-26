// ============================================================
// Tienda.js
// ============================================================
class Tienda {

    constructor(juego, datosXML) {
        this.juego    = juego;
        this.datosXML = datosXML;
        this.filtroActivo = "todos";

        this.renderTienda();
        this.iniciarEventosTienda();
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================

    renderTienda() {
        const contenedor = document.getElementById("pantalla-tienda");
        if (!contenedor) return;

        contenedor.innerHTML = `
            <div class="container py-4">

                <h1 class="juego-titulo text-center mb-4">Tienda</h1>

                <!-- Dinero disponible -->
                <div class="card p-3 mb-3 text-center">
                    <h5>Tu dinero</h5>
                    <p id="tienda-dinero" style="font-size:1.5rem;">
                        ${this.juego.granjero.dinero} monedas
                    </p>
                </div>

                <!-- ===== SECCIÓN: COMPRAR SEMILLAS ===== -->
                <div class="card p-3 mb-3">
                    <h5>Comprar Semillas</h5>
                    <div class="tienda-filtros mb-3" id="tienda-filtros">
                        <button class="opcion-btn opcion-activa" data-filtro="todos">Todos</button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="hortaliza">Hortalizas</button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="fruta">Frutas</button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="cereal">Cereales</button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="especial">Especiales</button>
                        <button class="opcion-btn" data-filtro="tiempo" data-valor="2">Maduran rápido (≤2)</button>
                        <button class="opcion-btn" data-filtro="precio" data-valor="20">Precio bajo (≤20)</button>
                    </div>
                    <div class="row g-2" id="tienda-semillas"></div>
                </div>

                <!-- ===== SECCIÓN: VENDER CULTIVOS ===== -->
                <div class="card p-3 mb-3">
                    <h5>Inventario actual</h5>
                    <p style="color:#aaa; font-size:1rem;">
                        Los cultivos se venden automáticamente al recolectarlos.
                    </p>
                    <div id="tienda-inventario"></div>
                </div>

                <!-- ===== SECCIÓN: HERRAMIENTAS (mejorar + reparar) ===== -->
                <div class="card p-3 mb-3">
                    <h5>Herramientas</h5>
                    <div class="row g-2" id="tienda-herramientas"></div>
                </div>

                <!-- Botón para volver al juego -->
                <div class="text-center mt-4">
                    <button id="btnCerrarTienda" class="btn-pixel btn-pixel-gris">
                        Volver al Juego
                    </button>
                </div>

            </div>
        `;

        this.renderSemillas("todos");
        this.renderInventario();
        this.renderHerramientas();
    }

    // ============================================================
    // RENDER SEMILLAS
    // ============================================================

    renderSemillas(filtro, valor) {
        const grid = document.getElementById("tienda-semillas");
        if (!grid) return;

        let semillas = [];

        switch (filtro) {
            case "todos":
                semillas = this.datosXML.obtenerTodasLasSemillas();
                break;
            case "tipo":
                semillas = this.datosXML.filtrarSemillas("tipo", valor);
                break;
            case "tiempo":
                semillas = this.datosXML.filtrarSemillasPorTiempoMaximo(parseInt(valor));
                break;
            case "precio":
                semillas = this.datosXML.filtrarSemillasPorPrecioMaximo(parseInt(valor));
                break;
            default:
                semillas = this.datosXML.obtenerTodasLasSemillas();
        }

        if (semillas.length === 0) {
            grid.innerHTML = `<div class="col-12"><p style="color:#aaa;">No hay semillas con ese filtro.</p></div>`;
            return;
        }

        grid.innerHTML = semillas.map(semilla => `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="parcela-card text-center">
                    <img src="${semilla.imgMaduro}" class="parcela-img" alt="${semilla.nombre}"
                         onerror="this.style.display='none'">
                    <div class="parcela-nombre">${semilla.nombre}</div>
                    <div style="font-size:0.85rem; color:#aaa; margin-top:2px;">
                        ${semilla.tiempoMaduracion} ciclos | venta: ${semilla.precioVenta}
                    </div>
                    <div style="font-size:0.85rem; color:#aaa;">
                        Tipo: ${semilla.tipo}
                    </div>
                    <button
                        class="btn-pixel btn-pixel-verde mt-2"
                        style="font-size:0.45rem; padding:8px 12px;"
                        onclick="window._tiendaActual.comprarSemilla('${semilla.nombre}')">
                        Comprar (${semilla.precioCompra})
                    </button>
                </div>
            </div>
        `).join("");
    }

    renderInventario() {
        const contenedor = document.getElementById("tienda-inventario");
        if (!contenedor) return;

        const inv = this.juego.granjero.inventario;

        if (inv.length === 0) {
            contenedor.innerHTML = `<p style="color:#aaa;">El inventario está vacío.</p>`;
            return;
        }

        const conteo = {};
        inv.forEach(s => { conteo[s.nombre] = (conteo[s.nombre] || 0) + 1; });

        contenedor.innerHTML = Object.entries(conteo).map(([nombre, cantidad]) =>
            `<div class="semilla-item d-inline-flex me-2">
                <span class="semilla-item-nombre">${nombre}</span>
                <span class="semilla-item-cantidad ms-1">x${cantidad}</span>
            </div>`
        ).join("");
    }

    /**
     * Renderiza herramientas con botón de mejorar Y botón de reparar si están rotas.
     * El coste de reparación es fijo: 30 monedas.
     */
    renderHerramientas() {
        const grid = document.getElementById("tienda-herramientas");
        if (!grid) return;

        const herramientasJuego = this.juego.granjero.herramientas;
        const ids = ["azada", "regadera", "hoz"];
        const COSTE_REPARACION = 30;

        grid.innerHTML = ids.map(id => {
            const herr        = herramientasJuego[id];
            const nivelActual = herr.nivel;
            const nivelSig    = nivelActual + 1;

            let accionHTML = "";

            if (herr.rota) {
                // ============================================================
                // HERRAMIENTA ROTA: mostrar botón de reparar (coste 30 monedas)
                // ============================================================
                accionHTML = `
                    <div style="color:#ff6b6b; font-size:0.85rem; margin-top:4px;">⚠ ROTA</div>
                    <button
                        class="btn-pixel btn-pixel-rojo mt-2"
                        style="font-size:0.45rem; padding:8px 12px;"
                        onclick="window._tiendaActual.repararHerramienta('${id}')">
                        Reparar (${COSTE_REPARACION} monedas)
                    </button>`;
            } else if (nivelActual < 3) {
                const coste = this.datosXML.obtenerCosteMejora(id, nivelSig);
                accionHTML = `
                    <button
                        class="btn-pixel btn-pixel-azul mt-2"
                        style="font-size:0.45rem; padding:8px 12px;"
                        onclick="window._tiendaActual.mejorarHerramienta('${id}')">
                        Mejorar (${coste})
                    </button>`;
            } else {
                accionHTML = `<span style="color:var(--color-dorado); font-size:0.9rem;">Nivel máximo</span>`;
            }

            return `
                <div class="col-12 col-sm-4">
                    <div class="parcela-card text-center">
                        <img src="${herr.imagen}" class="herramienta-img" alt="${herr.nombre}"
                             onerror="this.style.display='none'">
                        <div class="parcela-nombre">${herr.nombre}</div>
                        <div style="color:var(--color-dorado); font-size:0.9rem;">
                            Nv.${herr.nivel} — ${herr.obtenerDescripcionNivel()}
                        </div>
                        ${accionHTML}
                    </div>
                </div>
            `;
        }).join("");
    }

    // ============================================================
    // ACCIONES DEL JUGADOR
    // ============================================================

    comprarSemilla(nombreSemilla) {
        const semilla = this.datosXML.obtenerTodasLasSemillas()
            .find(s => s.nombre === nombreSemilla);

        if (!semilla) return;

        if (this.juego.granjero.dinero < semilla.precioCompra) {
            Swal.fire({
                title: "Sin dinero suficiente",
                text: `Necesitas ${semilla.precioCompra} monedas.`,
                icon: "warning", confirmButtonText: "Ok",
                background: "#1a2a10", color: "#f5c518"
            });
            return;
        }

        this.juego.granjero.dinero -= semilla.precioCompra;
        this.juego.granjero.agregarSemilla(semilla);

        document.getElementById("tienda-dinero").textContent =
            `${this.juego.granjero.dinero} monedas`;

        this.renderInventario();

        Swal.fire({
            title: `${semilla.nombre} comprada`,
            icon: "success", timer: 900, showConfirmButton: false,
            background: "#1a2a10", color: "#f5c518"
        });
    }

    mejorarHerramienta(idHerramienta) {
        const herr     = this.juego.granjero.herramientas[idHerramienta];
        const nivelSig = herr.nivel + 1;

        if (nivelSig > 3) return;

        const coste = this.datosXML.obtenerCosteMejora(idHerramienta, nivelSig);

        if (this.juego.granjero.dinero < coste) {
            Swal.fire({
                title: "Sin dinero suficiente",
                text: `Necesitas ${coste} monedas para mejorar la ${herr.nombre}.`,
                icon: "warning", confirmButtonText: "Ok",
                background: "#1a2a10", color: "#f5c518"
            });
            return;
        }

        this.juego.granjero.dinero -= coste;
        herr.nivel = nivelSig;

        document.getElementById("tienda-dinero").textContent =
            `${this.juego.granjero.dinero} monedas`;

        this.renderHerramientas();

        Swal.fire({
            title: `${herr.nombre} mejorada a Nv.${nivelSig}`,
            icon: "success", timer: 1000, showConfirmButton: false,
            background: "#1a2a10", color: "#f5c518"
        });
    }

    /**
     * Repara una herramienta rota por 30 monedas.
     * @param {string} idHerramienta - "azada" | "regadera" | "hoz"
     */
    repararHerramienta(idHerramienta) {
        const herr            = this.juego.granjero.herramientas[idHerramienta];
        const COSTE_REPARACION = 30;

        if (!herr.rota) return; // ya está bien

        if (this.juego.granjero.dinero < COSTE_REPARACION) {
            Swal.fire({
                title: "Sin dinero suficiente",
                text: `Necesitas ${COSTE_REPARACION} monedas para reparar la ${herr.nombre}.`,
                icon: "warning", confirmButtonText: "Ok",
                background: "#1a2a10", color: "#f5c518"
            });
            return;
        }

        this.juego.granjero.dinero -= COSTE_REPARACION;
        herr.reparar();

        document.getElementById("tienda-dinero").textContent =
            `${this.juego.granjero.dinero} monedas`;

        this.renderHerramientas();

        Swal.fire({
            title: `${herr.nombre} reparada`,
            text: "¡Ya puedes volver a usarla!",
            icon: "success", timer: 1200, showConfirmButton: false,
            background: "#1a2a10", color: "#f5c518"
        });
    }

    // ============================================================
    // EVENTOS
    // ============================================================

    iniciarEventosTienda() {
        window._tiendaActual = this;

        const filtrosDiv = document.getElementById("tienda-filtros");
        if (!filtrosDiv) return;

        filtrosDiv.querySelectorAll(".opcion-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                filtrosDiv.querySelectorAll(".opcion-btn")
                    .forEach(b => b.classList.remove("opcion-activa"));
                btn.classList.add("opcion-activa");

                const filtro = btn.dataset.filtro;
                const valor  = btn.dataset.valor;
                this.renderSemillas(filtro, valor);
            });
        });

        const btnCerrar = document.getElementById("btnCerrarTienda");
        if (btnCerrar) {
            btnCerrar.addEventListener("click", () => {
                this.juego.render();
                Menu.mostrarPantalla("pantalla-juego");
            });
        }
    }
}