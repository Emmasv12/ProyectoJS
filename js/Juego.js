// ============================================================
// Juego.js
// Clase principal que orquesta toda la lógica del juego.
// Se instancia desde Main.js una vez que el DOM está listo.
// ============================================================
class Juego {

    /**
     * Inicializa el juego con los parámetros de configuración elegidos
     * en la pantalla de configuración de partida.
     *
     * @param {Object}   config                    - Objeto con la configuración inicial
     * @param {string}   config.nombre             - Nombre del granjero
     * @param {string}   config.granja             - Nombre de la granja
     * @param {string}   config.dificultad         - "facil" | "normal" | "dificil"
     * @param {number}   config.tamanoTerreno      - Número de parcelas (4, 8 o 12)
     * @param {string}   config.cultivoFav         - Cultivo favorito
     * @param {number}   config.nivelHerram        - Nivel inicial de herramientas (1-3)
     * @param {Semilla[]} [config.semillasIniciales] - Catálogo de semillas del XML
     *                                               (se lo pasa Main.js tras cargar el XML)
     */
    constructor(config) {
        // ---- Parámetros que dependen de la dificultad ----
        const statsInicio = Juego.calcularStatsPorDificultad(config.dificultad);

        // Crea al granjero con los parámetros iniciales
        this.granjero = new Granjero(
            config.nombre,
            statsInicio.dinero,
            statsInicio.energia,
            config.nivelHerram
        );

        // Guarda el nombre de la granja, cultivo favorito y dificultad
        this.nombreGranja = config.granja;
        this.cultivoFav   = config.cultivoFav;
        this.dificultad   = config.dificultad;

        // Crea el terreno con el número de parcelas elegido
        this.terreno = new Terreno(config.tamanoTerreno);

        // -------------------------------------------------------
        // CAMBIO FASE 2: el catálogo de semillas viene del XML.
        // Si por alguna razón no se pasa (ej: partida muy antigua
        // cargada sin XML), se usa un array vacío y se avisa.
        // Main.js siempre lo pasará correctamente tras cargarXML().
        // -------------------------------------------------------
        this.semillasDisponibles = config.semillasIniciales || [];

        if (this.semillasDisponibles.length === 0) {
            console.warn("Juego: semillasDisponibles vacío. ¿Se cargó el XML?");
        }

        // Referencia al intervalo de crecimiento para poder detenerlo si hace falta
        this.intervaloId = null;

        this.iniciarEventos();
        this.render();
        this.iniciarCrecimiento();
    }

    // ============================================================
    // MÉTODOS ESTÁTICOS
    // ============================================================

    /**
     * Devuelve los valores de dinero y energía según la dificultad elegida.
     * @param {string} dificultad
     * @returns {{ dinero: number, energia: number }}
     */
    static calcularStatsPorDificultad(dificultad) {
        switch (dificultad) {
            case "facil":   return { dinero: 200, energia: 150 };
            case "dificil": return { dinero: 50,  energia: 75  };
            default:        return { dinero: 100, energia: 100 }; // normal
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    /**
     * Registra los eventos de los botones de la interfaz del juego.
     */
    iniciarEventos() {
        // Botón "Recargar Semillas": añade 2 semillas aleatorias al inventario
        document.getElementById("btnRecargar").addEventListener("click", () => {
            for (let i = 0; i < 2; i++) {
                const random  = Math.floor(Math.random() * this.semillasDisponibles.length);
                const semilla = this.semillasDisponibles[random];
                this.granjero.agregarSemilla(semilla);
            }
            this.render();
        });

        // Botón "Guardar Partida"
        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.guardar();
        });

        // Botón "Tienda": abre la pantalla de tienda
        // Se crea una nueva instancia de Tienda pasándole this (el juego) y datosXML
        // datosXML está disponible globalmente porque Main.js lo expone en window
        document.getElementById("btnTienda").addEventListener("click", () => {
            Menu.mostrarPantalla("pantalla-tienda");
            new Tienda(this, window._datosXML);
        });

        // Botón "Menú Principal": vuelve al menú sin perder la partida en curso
        document.getElementById("btnMenuPrincipal").addEventListener("click", () => {
            // Detiene el bucle de crecimiento para no consumir recursos
            if (this.intervaloId) {
                clearInterval(this.intervaloId);
                this.intervaloId = null;
            }
            Menu.mostrarPantalla("pantalla-menu");
        });
    }

    // ============================================================
    // BUCLE DE JUEGO
    // ============================================================

    /**
     * Bucle de juego: cada 5 segundos avanza el crecimiento de todos los cultivos.
     */
    iniciarCrecimiento() {
        this.intervaloId = setInterval(() => {
            this.terreno.parcelas.forEach(parcela => {
                if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
                    parcela.cultivo.crecer();
                }
            });
            this.render();
        }, 5000); // 5000ms = 5 segundos por ciclo
    }

    // ============================================================
    // RENDER (ACTUALIZACIÓN DE LA INTERFAZ)
    // ============================================================

    /**
     * Redibuja toda la interfaz: info del granjero, inventario,
     * herramientas y terreno.
     */
    render() {
        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarHerramientas();
        this.mostrarTerreno();
    }

    /**
     * Actualiza el bloque de información del granjero en el HTML.
     */
    mostrarInfo() {
        const info = document.getElementById("info-granjero");
        info.innerHTML = `
            <h5>Granjero — ${this.nombreGranja}</h5>
            <p>Nombre: <strong>${this.granjero.nombre}</strong></p>
            <p>Dinero: <strong>${this.granjero.dinero}</strong></p>
            <p>Energía: <strong>${this.granjero.energia}</strong></p>
            <p>Dificultad: <strong>${this.dificultad}</strong></p>
        `;
    }

    /**
     * Actualiza el bloque de inventario mostrando las semillas agrupadas por tipo.
     */
    mostrarInventario() {
        const inventario = document.getElementById("inventario");

        // Agrupa las semillas del inventario por nombre para mostrar cantidades
        const conteo = {};
        this.granjero.inventario.forEach(semilla => {
            conteo[semilla.nombre] = (conteo[semilla.nombre] || 0) + 1;
        });

        let itemsHTML = "";

        if (Object.keys(conteo).length === 0) {
            itemsHTML = `<span style="color:#aaa;">Sin semillas en el inventario.</span>`;
        } else {
            Object.entries(conteo).forEach(([nombre, cantidad]) => {
                itemsHTML += `
                    <div class="semilla-item">
                        <span class="semilla-item-nombre">${nombre}</span>
                        <span class="semilla-item-cantidad">x${cantidad}</span>
                    </div>
                `;
            });
        }

        inventario.innerHTML = `
            <h5>Inventario</h5>
            <div class="inventario-lista">${itemsHTML}</div>
        `;
    }

    /**
     * Actualiza el bloque de herramientas mostrando nombre, imagen y nivel.
     */
    mostrarHerramientas() {
        const herr  = document.getElementById("herramientas");
        const tools = this.granjero.herramientas;

        let html = `<h5>Herramientas</h5><div class="herramientas-lista">`;

        Object.values(tools).forEach(herramienta => {
            html += `
                <div class="herramienta-item">
                    <img class="herramienta-img" src="${herramienta.imagen}" alt="${herramienta.nombre}">
                    <span class="herramienta-nombre">${herramienta.nombre}</span>
                    <span class="herramienta-nivel">Nv.${herramienta.nivel} — ${herramienta.obtenerDescripcionNivel()}</span>
                </div>
            `;
        });

        html += `</div>`;
        herr.innerHTML = html;
    }

    /**
     * Redibuja el terreno completo: una card por parcela.
     */
    mostrarTerreno() {
        const terrenoDiv = document.getElementById("terreno");
        terrenoDiv.innerHTML = "";

        this.terreno.parcelas.forEach((parcela, index) => {
            const col        = document.createElement("div");
            col.className    = "col-6 col-sm-4 col-md-3";

            const card       = document.createElement("div");
            card.className   = "parcela-card";

            const img        = document.createElement("img");
            img.className    = "parcela-img";

            const nombre     = document.createElement("div");
            nombre.className = "parcela-nombre";

            const progresoWrap  = document.createElement("div");
            progresoWrap.className = "parcela-progreso";

            const progresoBar   = document.createElement("div");
            progresoBar.className = "parcela-progreso-bar";

            if (parcela.cultivo) {
                const fase = parcela.cultivo.obtenerFase();

                // Elige la imagen según la fase del cultivo
                if (fase === "semilla")   img.src = parcela.cultivo.imgSemilla;
                if (fase === "creciendo") img.src = parcela.cultivo.imgCreciendo;
                if (fase === "maduro")    img.src = parcela.cultivo.imgMaduro;

                nombre.textContent       = parcela.cultivo.nombre;
                progresoBar.style.width  = parcela.cultivo.obtenerPorcentaje() + "%";

                // Color de fondo según estado
                if (parcela.cultivo.estaMaduro()) {
                    card.classList.add("parcela-madura");
                } else {
                    card.classList.add("parcela-creciendo");
                }
            } else {
                img.src = "maceta.png";
                card.classList.add("parcela-vacia");
                nombre.textContent      = "Vacía";
                progresoBar.style.width = "0%";
            }

            progresoWrap.appendChild(progresoBar);
            card.appendChild(img);
            card.appendChild(nombre);
            card.appendChild(progresoWrap);

            card.addEventListener("click", () => {
                this.interactuarParcela(index);
            });

            col.appendChild(card);
            terrenoDiv.appendChild(col);
        });
    }

    // ============================================================
    // INTERACCIÓN CON PARCELAS
    // ============================================================

    /**
     * Gestiona el clic del jugador sobre una parcela:
     * - Si está vacía y hay semillas → planta
     * - Si tiene un cultivo maduro   → cosecha y vende
     * - Si tiene un cultivo verde    → muestra info
     * @param {number} index - Índice de la parcela en el array del terreno
     */
    interactuarParcela(index) {
        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo && this.granjero.inventario.length > 0) {
            const semilla = this.granjero.inventario.pop();
            parcela.plantar(semilla);

        } else if (!parcela.cultivo && this.granjero.inventario.length === 0) {
            Swal.fire({
                title: "Sin semillas",
                text: "No tienes semillas en el inventario. Recarga para obtener más.",
                icon: "warning",
                confirmButtonText: "Ok",
                background: "#1a2a10",
                color: "#f5c518"
            });
            return;

        } else if (parcela.cultivo && parcela.cultivo.estaMaduro()) {
            const cultivo = parcela.recolectar();
            this.granjero.vender(cultivo);

            Swal.fire({
                title: `¡${cultivo.nombre} cosechado!`,
                text: `+${cultivo.precioVenta} monedas`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                background: "#1a2a10",
                color: "#f5c518"
            });

        } else if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
            Swal.fire({
                title: `${parcela.cultivo.nombre}`,
                text: `Ciclos restantes: ${parcela.cultivo.tiempoRestante}`,
                icon: "info",
                timer: 1500,
                showConfirmButton: false,
                background: "#1a2a10",
                color: "#f5c518"
            });
            return;
        }

        this.render();
    }

    // ============================================================
    // GUARDADO Y CARGA
    // ============================================================

    /**
     * Guarda el estado completo de la partida en localStorage como JSON.
     * NOTA: los datos de semillas (tiempos, precios, imágenes) siguen
     * guardándose en el JSON para que la partida pueda restaurarse incluso
     * si el XML cambia en el futuro.
     */
    guardar() {
        const parcelasSerializadas = this.terreno.parcelas.map(parcela => {
            if (!parcela.cultivo) return null;

            return {
                nombre:         parcela.cultivo.nombre,
                tiempoTotal:    parcela.cultivo.tiempoTotal,
                tiempoRestante: parcela.cultivo.tiempoRestante,
                precioVenta:    parcela.cultivo.precioVenta,
                imgSemilla:     parcela.cultivo.imgSemilla,
                imgCreciendo:   parcela.cultivo.imgCreciendo,
                imgMaduro:      parcela.cultivo.imgMaduro
            };
        });

        const datos = {
            nombre:        this.granjero.nombre,
            granja:        this.nombreGranja,
            dificultad:    this.dificultad,
            cultivoFav:    this.cultivoFav,
            dinero:        this.granjero.dinero,
            energia:       this.granjero.energia,
            tamanoTerreno: this.terreno.parcelas.length,
            nivelHerram:   this.granjero.herramientas.azada.nivel,

            inventario: this.granjero.inventario.map(s => ({
                nombre:           s.nombre,
                tiempoMaduracion: s.tiempoMaduracion,
                precioVenta:      s.precioVenta,
                imgSemilla:       s.imgSemilla,
                imgCreciendo:     s.imgCreciendo,
                imgMaduro:        s.imgMaduro,
                // NUEVO: guardar también precioCompra y tipo del XML
                precioCompra:     s.precioCompra,
                tipo:             s.tipo
            })),

            parcelas: parcelasSerializadas
        };

        localStorage.setItem("partidaGranja", JSON.stringify(datos));

        Swal.fire({
            title: "¡Partida guardada!",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
            background: "#1a2a10",
            color: "#f5c518"
        });
    }

    /**
     * Carga una partida guardada desde localStorage.
     * Reconstruye el estado completo del juego.
     *
     * CAMBIO FASE 2: recibe el catálogo de semillas del XML como segundo
     * parámetro para que el juego restaurado también lo tenga disponible.
     *
     * @param {Semilla[]} semillasDelXML - Catálogo cargado por DatosXML
     * @returns {Juego|null}
     */
    static cargar(semillasDelXML = []) {
        const raw = localStorage.getItem("partidaGranja");
        if (!raw) return null;

        const datos = JSON.parse(raw);

        // Reconstruye la instancia con la config guardada + semillas del XML
        const juego = new Juego({
            nombre:            datos.nombre,
            granja:            datos.granja        || "Mi Granja",
            dificultad:        datos.dificultad    || "normal",
            cultivoFav:        datos.cultivoFav    || "Tomate",
            tamanoTerreno:     datos.tamanoTerreno || 8,
            nivelHerram:       datos.nivelHerram   || 1,
            semillasIniciales: semillasDelXML        // catálogo del XML
        });

        // Restaura dinero y energía reales
        juego.granjero.dinero  = datos.dinero;
        juego.granjero.energia = datos.energia;

        // Restaura inventario (con precioCompra y tipo si existen en el save)
        juego.granjero.inventario = (datos.inventario || []).map(s =>
            new Semilla(
                s.nombre, s.tiempoMaduracion, s.precioVenta,
                s.imgSemilla, s.imgCreciendo, s.imgMaduro,
                s.precioCompra || 0,  // NUEVO
                s.tipo         || ""  // NUEVO
            )
        );

        // Restaura el estado de cada parcela
        (datos.parcelas || []).forEach((parcelaDatos, i) => {
            if (parcelaDatos && juego.terreno.parcelas[i]) {
                const semillaTmp = new Semilla(
                    parcelaDatos.nombre,
                    parcelaDatos.tiempoTotal,
                    parcelaDatos.precioVenta,
                    parcelaDatos.imgSemilla,
                    parcelaDatos.imgCreciendo,
                    parcelaDatos.imgMaduro
                );
                const cultivo          = new Cultivo(semillaTmp);
                cultivo.tiempoRestante = parcelaDatos.tiempoRestante;
                juego.terreno.parcelas[i].cultivo = cultivo;
            }
        });

        juego.render();
        return juego;
    }
}