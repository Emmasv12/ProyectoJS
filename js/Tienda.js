// ============================================================
// Tienda.js
// Clase que gestiona la pantalla de tienda del juego.
// Permite comprar semillas, vender cultivos y mejorar herramientas.
//
// INTEGRACIÓN XML + XPATH:
//   · El catálogo de semillas se obtiene de datos.xml vía DatosXML
//   · Los filtros de la tienda usan XPath a través de DatosXML.filtrarSemillas()
//   · Los costes de mejora de herramientas también vienen del XML
//
// PARA USAR ESTA CLASE:
//   1. Añadir <div id="pantalla-tienda" class="pantalla"> al HTML
//   2. Añadir <script src="js/Tienda.js"></script> antes de Main.js
//   3. Llamar a new Tienda(juego, datosXML) cuando se abra la tienda
// ============================================================
class Tienda {

    /**
     * @param {Juego}    juego    - Instancia activa del juego (granjero, dinero, etc.)
     * @param {DatosXML} datosXML - Instancia con el XML ya cargado
     */
    constructor(juego, datosXML) {
        this.juego    = juego;
        this.datosXML = datosXML;

        // Estado actual del filtro seleccionado en la tienda
        this.filtroActivo = "todos";

        this.renderTienda();
        this.iniciarEventosTienda();
    }

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================

    /**
     * Dibuja toda la pantalla de tienda:
     * barra de filtros, catálogo de semillas y sección de herramientas.
     */
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

                    <!-- BARRA DE FILTROS XPath -->
                    <!-- Cada botón aplica un filtro distinto usando XPath en DatosXML -->
                    <div class="tienda-filtros mb-3" id="tienda-filtros">

                        <button class="opcion-btn opcion-activa" data-filtro="todos">
                            Todos
                        </button>

                        <!-- Filtro por tipo (XPath: //semilla[tipo='hortaliza']) -->
                        <button class="opcion-btn" data-filtro="tipo" data-valor="hortaliza">
                            Hortalizas
                        </button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="fruta">
                            Frutas
                        </button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="cereal">
                            Cereales
                        </button>
                        <button class="opcion-btn" data-filtro="tipo" data-valor="especial">
                            Especiales
                        </button>

                        <!-- Filtro por tiempo de maduración (XPath: //semilla[tiempoMaduracion<=N]) -->
                        <button class="opcion-btn" data-filtro="tiempo" data-valor="2">
                            Maduran rápido (≤2)
                        </button>

                        <!-- Filtro por precio de venta (XPath: //semilla[precioVenta<=N]) -->
                        <button class="opcion-btn" data-filtro="precio" data-valor="20">
                            Precio bajo (≤20)
                        </button>
                    </div>

                    <!-- Grid donde se renderizan las tarjetas de semillas -->
                    <div class="row g-2" id="tienda-semillas"></div>
                </div>

                <!-- ===== SECCIÓN: VENDER CULTIVOS ===== -->
                <div class="card p-3 mb-3">
                    <h5>Vender Cultivos Cosechados</h5>
                    <p style="color:#aaa; font-size:1rem;">
                        Los cultivos se venden automáticamente al recolectarlos.
                        Tu inventario actual:
                    </p>
                    <div id="tienda-inventario"></div>
                </div>

                <!-- ===== SECCIÓN: MEJORAR HERRAMIENTAS ===== -->
                <div class="card p-3 mb-3">
                    <h5>Mejorar Herramientas</h5>
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

        // Renderiza las secciones con datos
        this.renderSemillas("todos");
        this.renderInventario();
        this.renderHerramientas();
    }

    // ============================================================
    // RENDER SEMILLAS (con filtros XPath)
    // ============================================================

    /**
     * Renderiza las tarjetas de semillas según el filtro activo.
     * Delega en DatosXML los métodos que usan XPath para filtrar.
     *
     * @param {string} filtro - "todos" | "tipo" | "tiempo" | "precio"
     * @param {string} [valor]  - Valor del filtro (el tipo, número, etc.)
     */
    renderSemillas(filtro, valor) {
        const grid = document.getElementById("tienda-semillas");
        if (!grid) return;

        let semillas = [];

        // Selecciona el método de DatosXML según el filtro
        switch (filtro) {
            case "todos":
                // Sin filtro: devuelve todo el catálogo
                semillas = this.datosXML.obtenerTodasLasSemillas();
                break;

            case "tipo":
                // XPath: //semilla[tipo='valor']
                semillas = this.datosXML.filtrarSemillas("tipo", valor);
                break;

            case "tiempo":
                // XPath: //semilla[tiempoMaduracion<=valor]
                semillas = this.datosXML.filtrarSemillasPorTiempoMaximo(parseInt(valor));
                break;

            case "precio":
                // XPath: //semilla[precioVenta<=valor]
                semillas = this.datosXML.filtrarSemillasPorPrecioMaximo(parseInt(valor));
                break;

            default:
                semillas = this.datosXML.obtenerTodasLasSemillas();
        }

        // Construye las tarjetas
        if (semillas.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <p style="color:#aaa;">No hay semillas con ese filtro.</p>
                </div>`;
            return;
        }

        grid.innerHTML = semillas.map(semilla => `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="parcela-card text-center">
                    <img src="${semilla.imgMaduro}" class="parcela-img" alt="${semilla.nombre}">
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

    /**
     * Renderiza las semillas del inventario del granjero en la sección de venta.
     */
    renderInventario() {
        const contenedor = document.getElementById("tienda-inventario");
        if (!contenedor) return;

        const inv = this.juego.granjero.inventario;

        if (inv.length === 0) {
            contenedor.innerHTML = `<p style="color:#aaa;">El inventario está vacío.</p>`;
            return;
        }

        // Agrupa por nombre para mostrar cantidades
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
     * Renderiza las tarjetas de herramientas con su nivel actual y botón de mejora.
     * El coste de mejora se obtiene del XML vía DatosXML.obtenerCosteMejora().
     */
    renderHerramientas() {
        const grid = document.getElementById("tienda-herramientas");
        if (!grid) return;

        const herramientasJuego = this.juego.granjero.herramientas;

        // Mapa: id del XML → clave en herramientasJuego
        const ids = ["azada", "regadera", "hoz"];

        grid.innerHTML = ids.map(id => {
            const herr       = herramientasJuego[id];
            const nivelActual = herr.nivel;
            const nivelSig   = nivelActual + 1;

            // Coste de mejora desde el XML (Infinity si ya es nivel máximo)
            const coste = nivelActual < 3
                ? this.datosXML.obtenerCosteMejora(id, nivelSig)
                : null;

            const botonHTML = nivelActual < 3
                ? `<button
                       class="btn-pixel btn-pixel-azul mt-2"
                       style="font-size:0.45rem; padding:8px 12px;"
                       onclick="window._tiendaActual.mejorarHerramienta('${id}')">
                       Mejorar (${coste})
                   </button>`
                : `<span style="color:var(--color-dorado); font-size:0.9rem;">Nivel máximo</span>`;

            return `
                <div class="col-12 col-sm-4">
                    <div class="parcela-card text-center">
                        <img src="${herr.imagen}" class="herramienta-img" alt="${herr.nombre}">
                        <div class="parcela-nombre">${herr.nombre}</div>
                        <div style="color:var(--color-dorado); font-size:0.9rem;">
                            Nv.${nivelActual} — ${herr.obtenerDescripcionNivel()}
                        </div>
                        ${botonHTML}
                    </div>
                </div>
            `;
        }).join("");
    }

    // ============================================================
    // ACCIONES DEL JUGADOR
    // ============================================================

    /**
     * Compra una semilla del catálogo si el jugador tiene dinero suficiente.
     * @param {string} nombreSemilla - Nombre de la semilla a comprar
     */
    comprarSemilla(nombreSemilla) {
        // Busca la semilla en el catálogo del XML
        const semilla = this.datosXML.obtenerTodasLasSemillas()
            .find(s => s.nombre === nombreSemilla);

        if (!semilla) return;

        if (this.juego.granjero.dinero < semilla.precioCompra) {
            Swal.fire({
                title: "Sin dinero suficiente",
                text: `Necesitas ${semilla.precioCompra} monedas.`,
                icon: "warning",
                confirmButtonText: "Ok",
                background: "#1a2a10",
                color: "#f5c518"
            });
            return;
        }

        // Descuenta el precio y añade la semilla al inventario
        this.juego.granjero.dinero -= semilla.precioCompra;
        this.juego.granjero.agregarSemilla(semilla);

        // Actualiza el dinero mostrado en la tienda
        document.getElementById("tienda-dinero").textContent =
            `${this.juego.granjero.dinero} monedas`;

        this.renderInventario();

        Swal.fire({
            title: `${semilla.nombre} comprada`,
            icon: "success",
            timer: 900,
            showConfirmButton: false,
            background: "#1a2a10",
            color: "#f5c518"
        });
    }

    /**
     * Mejora una herramienta al siguiente nivel si el jugador tiene dinero.
     * El coste se obtiene del XML vía DatosXML.obtenerCosteMejora().
     * @param {string} idHerramienta - "azada" | "regadera" | "hoz"
     */
    mejorarHerramienta(idHerramienta) {
        const herr       = this.juego.granjero.herramientas[idHerramienta];
        const nivelSig   = herr.nivel + 1;

        if (nivelSig > 3) return; // Ya está al máximo

        // Obtiene el coste desde el XML con XPath
        const coste = this.datosXML.obtenerCosteMejora(idHerramienta, nivelSig);

        if (this.juego.granjero.dinero < coste) {
            Swal.fire({
                title: "Sin dinero suficiente",
                text: `Necesitas ${coste} monedas para mejorar la ${herr.nombre}.`,
                icon: "warning",
                confirmButtonText: "Ok",
                background: "#1a2a10",
                color: "#f5c518"
            });
            return;
        }

        // Aplica la mejora
        this.juego.granjero.dinero -= coste;
        herr.nivel = nivelSig;

        document.getElementById("tienda-dinero").textContent =
            `${this.juego.granjero.dinero} monedas`;

        // Recarga la sección de herramientas para reflejar el nuevo nivel
        this.renderHerramientas();

        Swal.fire({
            title: `${herr.nombre} mejorada a Nv.${nivelSig}`,
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
            background: "#1a2a10",
            color: "#f5c518"
        });
    }

    // ============================================================
    // EVENTOS DE LA TIENDA
    // ============================================================

    /**
     * Registra los eventos de los botones de filtro y del botón de cierre.
     */
    iniciarEventosTienda() {
        // Referencia global para que los onclick inline puedan llamar a este objeto
        window._tiendaActual = this;

        // Botones de filtro: cada uno aplica un filtro distinto con XPath
        const filtrosDiv = document.getElementById("tienda-filtros");
        if (!filtrosDiv) return;

        filtrosDiv.querySelectorAll(".opcion-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                // Actualiza el estado visual del filtro activo
                filtrosDiv.querySelectorAll(".opcion-btn")
                    .forEach(b => b.classList.remove("opcion-activa"));
                btn.classList.add("opcion-activa");

                // Lee el tipo de filtro y su valor del atributo data-*
                const filtro = btn.dataset.filtro;
                const valor  = btn.dataset.valor;

                // Rerenderiza el catálogo con el filtro XPath correspondiente
                this.renderSemillas(filtro, valor);
            });
        });

        // Botón cerrar tienda: vuelve a la pantalla de juego
        const btnCerrar = document.getElementById("btnCerrarTienda");
        if (btnCerrar) {
            btnCerrar.addEventListener("click", () => {
                // Actualiza el juego antes de salir (el dinero puede haber cambiado)
                this.juego.render();
                Menu.mostrarPantalla("pantalla-juego");
            });
        }
    }
}