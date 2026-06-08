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

        // Índice de la semilla seleccionada en el inventario (null = ninguna)
        this.semillaSeleccionada = null;

        // Logro: dinero total acumulado vendiendo cultivos
        this.totalGanado   = config.totalGanado   || 0;
        this.logroMostrado = config.logroMostrado || false;

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
        document.getElementById("btnRecargar").addEventListener("click", () => {
            if (this.semillasDisponibles.length === 0) {
                Swal.fire({
                    title: "Sin catálogo",
                    text: "No se cargaron semillas del XML.",
                    icon: "error",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }
            for (let i = 0; i < 2; i++) {
                const random  = Math.floor(Math.random() * this.semillasDisponibles.length);
                this.granjero.agregarSemilla(this.semillasDisponibles[random]);
            }
            this.render();
        });

        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.guardar();
        });

        document.getElementById("btnTienda").addEventListener("click", () => {
            Menu.mostrarPantalla("pantalla-tienda");
            new Tienda(this, window._datosXML);
        });

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
        this.comprobarLogro();
        this.comprobarLogro2;
    }

    mostrarInfo() {
        const info = document.getElementById("info-granjero");
        info.innerHTML = `
            <h5>Granjero — ${this.nombreGranja}</h5>
            <p>Nombre: <strong>${this.granjero.nombre}</strong></p>
            <p>Dinero: <strong>${this.granjero.dinero} monedas</strong></p>
            <p>Energía: <strong>${this.granjero.energia}</strong></p>
            <p>Dificultad: <strong>${this.dificultad}</strong></p>
        `;
    }

    mostrarInventario() {
        const contenedor = document.getElementById("inventario");

        if (this.granjero.inventario.length === 0) {
            this.semillaSeleccionada = null;
            contenedor.innerHTML = `
                <h5>Inventario</h5>
                <span style="color:#aaa; font-family:var(--font-retro); font-size:1.1rem;">
                    Sin semillas. Pulsa "Recargar Semillas" o ve a la Tienda.
                </span>
            `;
            return;
        }

        const instruccion = this.semillaSeleccionada !== null
            ? `<span class="inventario-instruccion seleccionando">
                   "${this.granjero.inventario[this.semillaSeleccionada].nombre}" seleccionada
                   — haz clic en un macetero vacío para plantarla
               </span>`
            : `<span class="inventario-instruccion">
                   Haz clic en una semilla para seleccionarla y luego en un macetero
               </span>`;

        const itemsHTML = this.granjero.inventario.map((semilla, index) => {
            const claseSelec = index === this.semillaSeleccionada
                ? "semilla-item semilla-seleccionada"
                : "semilla-item";
            return `
                <div class="${claseSelec}" data-index="${index}" title="Seleccionar ${semilla.nombre}">
                    <img src="${semilla.imgSemilla}" class="semilla-item-img"
                         alt="${semilla.nombre}" onerror="this.style.display='none'">
                    <span class="semilla-item-nombre">${semilla.nombre}</span>
                    <span class="semilla-item-tipo">${semilla.tipo || ""}</span>
                </div>
            `;
        }).join("");

        contenedor.innerHTML = `
            <h5>Inventario <span style="color:#aaa;font-size:0.5rem;">(${this.granjero.inventario.length} semillas)</span></h5>
            ${instruccion}
            <div class="inventario-lista mt-2">${itemsHTML}</div>
        `;

        contenedor.querySelectorAll(".semilla-item").forEach(item => {
            item.addEventListener("click", () => {
                this.seleccionarSemilla(parseInt(item.dataset.index));
            });
        });
    }

    seleccionarSemilla(index) {
        this.semillaSeleccionada = (this.semillaSeleccionada === index) ? null : index;
        this.mostrarInventario();
    }

    mostrarHerramientas() {
        const herr  = document.getElementById("herramientas");
        const tools = this.granjero.herramientas;
        let html = `<h5>Herramientas</h5><div class="herramientas-lista">`;
        Object.values(tools).forEach(h => {
            const estadoHTML = h.rota
                ? `<span class="herramienta-rota">ROTA — Repara en la Tienda</span>`
                : `<span class="herramienta-nivel">Nv.${h.nivel} — ${h.obtenerDescripcionNivel()}</span>`;
            html += `
                <div class="herramienta-item${h.rota ? " herramienta-item-rota" : ""}">
                    <img class="herramienta-img" src="${h.imagen}" alt="${h.nombre}"
                         onerror="this.style.display='none'">
                    <span class="herramienta-nombre">${h.nombre}</span>
                    ${estadoHTML}
                </div>`;
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

            if (!parcela.cultivo && this.semillaSeleccionada !== null) {
                card.classList.add("parcela-disponible");
            }

            let innerHTML = "";

            if (parcela.cultivo) {
                const c    = parcela.cultivo;
                const fase = c.obtenerFase();
                const pct  = c.obtenerPorcentaje();

                const emojiFase = {
                    semilla:   "[S]",
                    creciendo: "[C]",
                    maduro:    "[M]"
                }[fase] || "[S]";

                const textoEstado = c.estaMaduro()
                    ? `<span class="parcela-estado-texto maduro">¡Lista para cosechar!</span>`
                    : `<span class="parcela-estado-texto">${c.tiempoRestante} ciclo${c.tiempoRestante !== 1 ? "s" : ""} restante${c.tiempoRestante !== 1 ? "s" : ""}</span>`;

                const imgSrc = fase === "semilla"   ? c.imgSemilla
                             : fase === "creciendo" ? c.imgCreciendo
                             : c.imgMaduro;

                const claseCard = c.estaMaduro() ? "parcela-madura" : "parcela-creciendo";
                card.classList.add(claseCard);

                innerHTML = `
                    <div class="parcela-emoji">${emojiFase}</div>
                    <img class="parcela-img" src="${imgSrc}" alt="${c.nombre}"
                         onerror="this.style.display='none'">
                    <div class="parcela-nombre">${c.nombre}</div>
                    ${textoEstado}
                    <div class="parcela-progreso">
                        <div class="parcela-progreso-bar" style="width:${pct}%"></div>
                    </div>
                    <span class="parcela-pct">${pct}%</span>
                `;

            } else {
                card.classList.add("parcela-vacia");
                const hint = this.semillaSeleccionada !== null
                    ? `<span class="parcela-hint">Plantar aqui</span>`
                    : `<span class="parcela-hint">Vacía</span>`;

                innerHTML = `
                    <img class="parcela-img" src="maceta.png" alt="Maceta"
                         onerror="this.style.display='none'">
                    ${hint}
                    <div class="parcela-progreso">
                        <div class="parcela-progreso-bar" style="width:0%"></div>
                    </div>
                    <span class="parcela-pct">0%</span>
                `;
            }

            card.innerHTML = innerHTML;

            // Click izquierdo: interactuar (plantar / cosechar)
            card.addEventListener("click", () => this.interactuarParcela(index));

            // ============================================================
            // CLICK DERECHO: reinicia la parcela (borra el cultivo)
            // ============================================================
            card.addEventListener("contextmenu", (event) => {
                event.preventDefault(); // evita el menú del navegador
                if (parcela.cultivo) {
                    parcela.cultivo = null;
                    this.render();
                    Swal.fire({
                        title: "Parcela reiniciada",
                        text: "El cultivo ha sido eliminado.",
                        icon: "info",
                        timer: 1200,
                        showConfirmButton: false,
                        background: "#1a2a10", color: "#f5c518"
                    });
                }
            });

            col.appendChild(card);
            terrenoDiv.appendChild(col);
        });
    }

    // ============================================================
    // INTERACCIÓN CON PARCELAS
    // ============================================================

    interactuarParcela(index) {
        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo) {
            if (this.granjero.inventario.length === 0) {
                Swal.fire({
                    title: "Sin semillas",
                    text: "No tienes semillas. Pulsa 'Recargar Semillas' o ve a la Tienda.",
                    icon: "warning", confirmButtonText: "Ok",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }

            if (this.semillaSeleccionada === null) {
                Swal.fire({
                    title: "Selecciona una semilla",
                    text: "Haz clic en una semilla del inventario antes de plantar.",
                    icon: "info", confirmButtonText: "Ok",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }

            // Extrae la semilla elegida del inventario
            const semilla = this.granjero.inventario.splice(this.semillaSeleccionada, 1)[0];
            this.semillaSeleccionada = null;

            // ============================================================
            // PROBABILIDAD DE FALLO AL PLANTAR (20%)
            // Math.random() devuelve un número en [0, 1)
            // Si es menor que 0.20 la semilla falla y se pierde
            // ============================================================
            if (Math.random() < 0.20) {
                Swal.fire({
                    title: "¡Vaya! La semilla no ha prendido",
                    text: `La semilla de ${semilla.nombre} se ha malogrado al plantarla. ¡Mala suerte!`,
                    icon: "error",
                    timer: 2500,
                    showConfirmButton: false,
                    background: "#1a2a10", color: "#f5c518"
                });
                this.render();
                return; // semilla perdida, parcela sigue vacía
            }

            parcela.plantar(semilla);

        } else if (parcela.cultivo.estaMaduro()) {
            // La hoz se usa al recolectar — verificar si está rota
            const hoz = this.granjero.herramientas.hoz;
            if (hoz && hoz.rota) {
                Swal.fire({
                    title: "Hoz rota",
                    text: "No puedes recolectar: la hoz está rota. Repárala en la Tienda.",
                    icon: "error", confirmButtonText: "Ok",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }

            const cultivo = parcela.recolectar();
            this.granjero.vender(cultivo);

            // Acumula dinero ganado para el logro
            this.totalGanado += cultivo.precioVenta;

            // Intento de rotura de la hoz tras usarla
            let mensajeExtra = "";
            if (hoz && hoz.intentarRomper()) {
                mensajeExtra = "\nLa hoz se ha roto. Ve a la Tienda para repararla.";
            }

            Swal.fire({
                title: `¡${cultivo.nombre} cosechado!`,
                text: `+${cultivo.precioVenta} monedas${mensajeExtra}`,
                icon: mensajeExtra ? "warning" : "success",
                timer: mensajeExtra ? 3000 : 1500,
                showConfirmButton: false,
                background: "#1a2a10", color: "#f5c518"
            });

        } else {
            const c = parcela.cultivo;
            Swal.fire({
                title: `${c.nombre} — ${c.obtenerPorcentaje()}%`,
                text: `Todavía necesita ${c.tiempoRestante} ciclo${c.tiempoRestante !== 1 ? "s" : ""} más.`,
                icon: "info", timer: 2000, showConfirmButton: false,
                background: "#1a2a10", color: "#f5c518"
            });
            return;
        }

        this.render();
    }

    // ============================================================
    // LOGRO: ganar 500 monedas vendiendo cultivos
    // ============================================================

    comprobarLogro() {
        if (this.logroMostrado) return;
        if (this.totalGanado >= 500) {
            this.logroMostrado = true;
            this._mostrarLogro();
        }
    }

    comprobarLogro2() {
        if (this.logroMostrado) return;
        if (this.vender >= 10) {
            this.logroMostrado = true;
            this._mostrarLogro2();
        }
    }

    _mostrarLogro() {
        // Crea el banner de logro si no existe ya
        let banner = document.getElementById("logro-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "logro-banner";
            banner.innerHTML = `
                <div class="logro-icono">🏆</div>
                <div class="logro-texto">
                    <div class="logro-titulo">LOGRO DESBLOQUEADO!</div>
                    <div class="logro-desc">Granjero Próspero — Ganaste 500 monedas vendiendo cultivos</div>
                </div>
            `;
            document.getElementById("pantalla-juego").appendChild(banner);

            // Animación de entrada
            requestAnimationFrame(() => {
                banner.classList.add("logro-visible");
            });

            // Se queda fijo en pantalla (no desaparece)
        }
    }

    _mostrarLogro2() {
        // Crea el banner de logro si no existe ya
        let banner = document.getElementById("logro-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "logro-banner";
            banner.innerHTML = `
                <div class="logro-icono">🏆</div>
                <div class="logro-texto">
                    <div class="logro-titulo">LOGRO DESBLOQUEADO!</div>
                    <div class="logro-desc">Granjero aprendiz — Ganaste 500 monedas vendiendo cultivos</div>
                </div>
            `;
            document.getElementById("pantalla-juego").appendChild(banner);

            // Animación de entrada
            requestAnimationFrame(() => {
                banner.classList.add("logro-visible");
            });

            // Se queda fijo en pantalla (no desaparece)
        }
    }

    // ============================================================
    // GUARDADO Y CARGA
    // ============================================================

    guardar() {
        const datos = {
            nombre:        this.granjero.nombre,
            granja:        this.nombreGranja,
            dificultad:    this.dificultad,
            cultivoFav:    this.cultivoFav,
            dinero:        this.granjero.dinero,
            energia:       this.granjero.energia,
            tamanoTerreno: this.terreno.parcelas.length,
            nivelHerram:   this.granjero.herramientas.azada.nivel,
            totalGanado:   this.totalGanado,
            logroMostrado: this.logroMostrado,
            vender:        this.vender,

            // Guarda estado de rotura de herramientas
            herramientasRotas: {
                azada:    this.granjero.herramientas.azada.rota,
                regadera: this.granjero.herramientas.regadera.rota,
                hoz:      this.granjero.herramientas.hoz.rota
            },

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

            parcelas: this.terreno.parcelas.map(parcela => {
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
            })
        };

        localStorage.setItem("partidaGranja", JSON.stringify(datos));

        Swal.fire({
            title: "¡Partida guardada!",
            icon: "success", timer: 1200, showConfirmButton: false,
            background: "#1a2a10", color: "#f5c518"
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
            semillasIniciales: semillasDelXML,
            totalGanado:       datos.totalGanado   || 0,
            logroMostrado:     datos.logroMostrado || false
        });

        juego.granjero.dinero  = datos.dinero;
        juego.granjero.energia = datos.energia;

        // Restaura estado de rotura de herramientas
        if (datos.herramientasRotas) {
            juego.granjero.herramientas.azada.rota    = datos.herramientasRotas.azada    || false;
            juego.granjero.herramientas.regadera.rota = datos.herramientasRotas.regadera || false;
            juego.granjero.herramientas.hoz.rota      = datos.herramientasRotas.hoz      || false;
        }

        juego.granjero.inventario = (datos.inventario || []).map(s =>
            new Semilla(
                s.nombre, s.tiempoMaduracion, s.precioVenta,
                s.imgSemilla, s.imgCreciendo, s.imgMaduro,
                s.precioCompra || 0,
                s.tipo         || ""
            )
        );

        (datos.parcelas || []).forEach((pd, i) => {
            if (pd && juego.terreno.parcelas[i]) {
                const semillaTmp = new Semilla(
                    pd.nombre, pd.tiempoTotal, pd.precioVenta,
                    pd.imgSemilla, pd.imgCreciendo, pd.imgMaduro
                );
                const cultivo          = new Cultivo(semillaTmp);
                cultivo.tiempoRestante = pd.tiempoRestante;
                juego.terreno.parcelas[i].cultivo = cultivo;
            }
        });

        juego.render();
        return juego;
    }
}