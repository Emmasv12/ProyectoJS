// ============================================================
// Juego.js
// Clase principal que orquesta toda la lógica del juego.
// ============================================================
class Juego {

    constructor(config) {
        const statsInicio = Juego.calcularStatsPorDificultad(config.dificultad);

        this.granjero = new Granjero(
            config.nombre,
            statsInicio.dinero,
            statsInicio.energia,
            config.nivelHerram
        );

        this.nombreGranja = config.granja;
        this.cultivoFav   = config.cultivoFav;
        this.dificultad   = config.dificultad;
        this.terreno      = new Terreno(config.tamanoTerreno);

        this.semillasDisponibles = config.semillasIniciales || [];

        if (this.semillasDisponibles.length === 0) {
            console.warn("Juego: semillasDisponibles vacío. ¿Se cargó el XML?");
        }
        
        this.semillaSeleccionada = null;

        this.intervaloId = null;

        this.iniciarEventos();
        this.render();
        this.iniciarCrecimiento();
    }

    // ============================================================
    // MÉTODOS ESTÁTICOS
    // ============================================================

    static calcularStatsPorDificultad(dificultad) {
        switch (dificultad) {
            case "facil":   return { dinero: 200, energia: 150 };
            case "dificil": return { dinero: 50,  energia: 75  };
            default:        return { dinero: 100, energia: 100 };
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    iniciarEventos() {
        // Botón "Recargar Semillas"
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

        // Botón "Tienda"
        document.getElementById("btnTienda").addEventListener("click", () => {
            Menu.mostrarPantalla("pantalla-tienda");
            new Tienda(this, window._datosXML);
        });

        // Botón "Menú Principal"
        document.getElementById("btnMenuPrincipal").addEventListener("click", () => {
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

    iniciarCrecimiento() {
        this.intervaloId = setInterval(() => {
            this.terreno.parcelas.forEach(parcela => {
                if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
                    parcela.cultivo.crecer();
                }
            });
            this.render();
        }, 5000);
    }

    // ============================================================
    // RENDER
    // ============================================================

    render() {
        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarHerramientas();
        this.mostrarTerreno();
    }

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
     * Muestra el inventario con semillas clicables.
     *
     * NUEVO — SELECCIÓN:
     *   Cada semilla es un botón individual (no agrupado por nombre).
     *   Al hacer clic en una se marca como seleccionada (resaltado dorado)
     *   y se guarda su índice en this.semillaSeleccionada.
     *   Clicar en la misma semilla seleccionada la deselecciona.
     *   El mensaje de instrucción cambia según si hay selección o no.
     */
    mostrarInventario() {
        const contenedor = document.getElementById("inventario");

        if (this.granjero.inventario.length === 0) {
            // Si no hay semillas, limpia la selección por si quedó algo
            this.semillaSeleccionada = null;

            contenedor.innerHTML = `
                <h5>Inventario</h5>
                <span style="color:#aaa; font-family: var(--font-retro); font-size:1.1rem;">
                    Sin semillas. Pulsa "Recargar Semillas" o ve a la Tienda.
                </span>
            `;
            return;
        }

        // Mensaje de instrucción dinámico
        const instruccion = this.semillaSeleccionada !== null
            ? `<span class="inventario-instruccion seleccionando">
                   ✅ "${this.granjero.inventario[this.semillaSeleccionada].nombre}" seleccionada
                   — ahora haz clic en un macetero vacío para plantarla
               </span>`
            : `<span class="inventario-instruccion">
                   👆 Haz clic en una semilla para seleccionarla y luego en un macetero para plantarla
               </span>`;

        // Una tarjeta por semilla individual (no agrupadas)
        // para que el jugador pueda elegir cuál plantar
        const itemsHTML = this.granjero.inventario.map((semilla, index) => {
            // Clase extra si este índice es el seleccionado
            const claseSelec = (index === this.semillaSeleccionada)
                ? "semilla-item semilla-seleccionada"
                : "semilla-item";

            return `
                <div class="${claseSelec}"
                     data-index="${index}"
                     title="Clic para seleccionar esta semilla">
                    <img src="${semilla.imgSemilla}"
                         class="semilla-item-img"
                         alt="${semilla.nombre}"
                         onerror="this.style.display='none'">
                    <span class="semilla-item-nombre">${semilla.nombre}</span>
                    <span class="semilla-item-tipo">${semilla.tipo || ""}</span>
                </div>
            `;
        }).join("");

        contenedor.innerHTML = `
            <h5>Inventario <span style="color:#aaa; font-size:0.5rem;">(${this.granjero.inventario.length} semillas)</span></h5>
            ${instruccion}
            <div class="inventario-lista mt-2">${itemsHTML}</div>
        `;

        // Registra el evento de clic en cada tarjeta de semilla
        contenedor.querySelectorAll(".semilla-item").forEach(item => {
            item.addEventListener("click", () => {
                const index = parseInt(item.dataset.index);
                this.seleccionarSemilla(index);
            });
        });
    }

    /**
     * Gestiona la selección/deselección de una semilla del inventario.
     *
     * @param {number} index - Índice de la semilla en this.granjero.inventario
     */
    seleccionarSemilla(index) {
        if (this.semillaSeleccionada === index) {
            // Clic en la misma semilla → deselecciona
            this.semillaSeleccionada = null;
        } else {
            // Clic en otra semilla → selecciona la nueva
            this.semillaSeleccionada = index;
        }
        // Solo redibuja el inventario para no interrumpir el juego
        this.mostrarInventario();
    }

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

    mostrarTerreno() {
        const terrenoDiv = document.getElementById("terreno");
        terrenoDiv.innerHTML = "";

        this.terreno.parcelas.forEach((parcela, index) => {
            const col  = document.createElement("div");
            col.className = "col-6 col-sm-4 col-md-3";

            const card = document.createElement("div");
            card.className = "parcela-card";

            // NUEVO: si hay semilla seleccionada y la parcela está vacía,
            // añade clase visual para indicar que se puede plantar aquí
            if (!parcela.cultivo && this.semillaSeleccionada !== null) {
                card.classList.add("parcela-disponible");
            }

            const img = document.createElement("img");
            img.className = "parcela-img";

            const nombre = document.createElement("div");
            nombre.className = "parcela-nombre";

            const progresoWrap = document.createElement("div");
            progresoWrap.className = "parcela-progreso";

            const progresoBar = document.createElement("div");
            progresoBar.className = "parcela-progreso-bar";

            if (parcela.cultivo) {
                const fase = parcela.cultivo.obtenerFase();
                if (fase === "semilla")   img.src = parcela.cultivo.imgSemilla;
                if (fase === "creciendo") img.src = parcela.cultivo.imgCreciendo;
                if (fase === "maduro")    img.src = parcela.cultivo.imgMaduro;

                nombre.textContent      = parcela.cultivo.nombre;
                progresoBar.style.width = parcela.cultivo.obtenerPorcentaje() + "%";

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
     * Gestiona el clic en una parcela.
     *
     * NUEVO — FLUJO CON SELECCIÓN:
     *   - Parcela vacía + semilla seleccionada → planta esa semilla concreta
     *   - Parcela vacía + sin selección        → avisa que hay que seleccionar primero
     *   - Parcela madura                       → cosecha y vende
     *   - Parcela creciendo                    → muestra info de progreso
     *
     * @param {number} index - Índice de la parcela
     */
    interactuarParcela(index) {
        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo) {
            // ---- Parcela vacía ----

            if (this.granjero.inventario.length === 0) {
                Swal.fire({
                    title: "Sin semillas",
                    text: "No tienes semillas en el inventario. Recarga o ve a la Tienda.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                    background: "#1a2a10",
                    color: "#f5c518"
                });
                return;
            }

            if (this.semillaSeleccionada === null) {
                // No hay semilla seleccionada: pide al jugador que elija primero
                Swal.fire({
                    title: "Selecciona una semilla",
                    text: "Haz clic en una semilla del inventario para seleccionarla antes de plantar.",
                    icon: "info",
                    confirmButtonText: "Ok",
                    background: "#1a2a10",
                    color: "#f5c518"
                });
                return;
            }

            // Extrae la semilla seleccionada del inventario por su índice
            const semilla = this.granjero.inventario.splice(this.semillaSeleccionada, 1)[0];

            // Limpia la selección tras plantar
            this.semillaSeleccionada = null;

            parcela.plantar(semilla);

        } else if (parcela.cultivo.estaMaduro()) {
            // ---- Parcela madura: cosechar ----
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

        } else {
            // ---- Parcela creciendo: mostrar progreso ----
            Swal.fire({
                title: `${parcela.cultivo.nombre}`,
                text: `Progreso: ${parcela.cultivo.obtenerPorcentaje()}% — Ciclos restantes: ${parcela.cultivo.tiempoRestante}`,
                icon: "info",
                timer: 1800,
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

    static cargar(semillasDelXML = []) {
        const raw = localStorage.getItem("partidaGranja");
        if (!raw) return null;

        const datos = JSON.parse(raw);

        const juego = new Juego({
            nombre:            datos.nombre,
            granja:            datos.granja        || "Mi Granja",
            dificultad:        datos.dificultad    || "normal",
            cultivoFav:        datos.cultivoFav    || "Tomate",
            tamanoTerreno:     datos.tamanoTerreno || 8,
            nivelHerram:       datos.nivelHerram   || 1,
            semillasIniciales: semillasDelXML
        });

        juego.granjero.dinero  = datos.dinero;
        juego.granjero.energia = datos.energia;

        juego.granjero.inventario = (datos.inventario || []).map(s =>
            new Semilla(
                s.nombre, s.tiempoMaduracion, s.precioVenta,
                s.imgSemilla, s.imgCreciendo, s.imgMaduro,
                s.precioCompra || 0,
                s.tipo         || ""
            )
        );

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