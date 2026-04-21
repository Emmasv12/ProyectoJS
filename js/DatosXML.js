class DatosXML {

    constructor() {
        // Documento XML cargado en memoria (lo rellenará cargarXML)
        this.xmlDoc = null;
    }

    // CARGA DEL XML

    /**
     * Carga el archivo datos.xml de forma asíncrona y lo parsea.
     * Debe llamarse una sola vez al inicio, antes de crear el Juego.
     * 
     * @returns {Promise<void>} Resuelve cuando el XML está listo
     */
    async cargarXML() {
        // fetch obtiene el archivo del servidor (funciona en local con Live Server)
        const respuesta = await fetch("datos.xml");

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar datos.xml: ${respuesta.status}`);
        }

        // Convierte la respuesta a texto plano
        const textoXML = await respuesta.text();

        // DOMParser transforma el texto XML en un documento navegable
        const parser = new DOMParser();
        this.xmlDoc  = parser.parseFromString(textoXML, "application/xml");

        // Comprueba que no hubo errores de parseo
        const error = this.xmlDoc.querySelector("parsererror");
        if (error) {
            throw new Error("El XML no es válido: " + error.textContent);
        }
    }

    // EXTRACCIÓN DE SEMILLAS

    /**
     * Lee todos los nodos <semilla> del XML y los convierte
     * en instancias de la clase Semilla lista para usar en el juego.
     * 
     * @returns {Semilla[]} Array con todas las semillas del catálogo
     */
    obtenerTodasLasSemillas() {
        if (!this.xmlDoc) return [];

        // querySelectorAll sobre el xmlDoc funciona igual que en HTML
        const nodosSemilla = this.xmlDoc.querySelectorAll("semilla");
        const semillas     = [];

        nodosSemilla.forEach(nodo => {
            semillas.push(this._nodoASemilla(nodo));
        });

        return semillas;
    }

    /**
     * Filtra semillas del XML usando XPath según un criterio y valor dados.
     * Este método es el núcleo del sistema de filtrado de la tienda.
     *
     * Ejemplos de uso:
     *   filtrarSemillas("tipo",             "hortaliza")  → hortalizas
     *   filtrarSemillas("precioVenta",      "20")         → precio exacto 20
     *   filtrarSemillas("tiempoMaduracion", "3")          → maduración en 3 ciclos
     *
     * @param {string} campo  - Nombre del elemento XML por el que filtrar
     * @param {string} valor  - Valor a buscar en ese elemento
     * @returns {Semilla[]}   - Semillas que cumplen el filtro
     */
    filtrarSemillas(campo, valor) {
        if (!this.xmlDoc) return [];

        // Construye la expresión XPath:
        // Busca <semilla> cuyo hijo <campo> tenga exactamente ese texto
        // Ejemplo: //semilla[tipo='hortaliza']
        const expresionXPath = `//semilla[${campo}='${valor}']`;

        // XPathResult.ORDERED_NODE_ITERATOR_TYPE devuelve nodos en orden de documento
        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,                                     // sin resolver de namespace
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        // Itera el resultado de XPath (no es un array, hay que usar iterateNext)
        const semillas = [];
        let nodo       = resultado.iterateNext();

        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    /**
     * Filtra semillas cuyo precio de venta sea MENOR O IGUAL al máximo dado.
     * Útil para mostrar semillas asequibles al jugador en la tienda.
     *
     * Expresión XPath: //semilla[precioVenta <= maxPrecio]
     *
     * @param {number} maxPrecio - Precio de venta máximo (inclusive)
     * @returns {Semilla[]}
     */
    filtrarSemillasPorPrecioMaximo(maxPrecio) {
        if (!this.xmlDoc) return [];

        // XPath con operador de comparación numérica
        const expresionXPath = `//semilla[precioVenta<=${maxPrecio}]`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        const semillas = [];
        let nodo       = resultado.iterateNext();

        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    /**
     * Filtra semillas cuyo tiempo de maduración sea MENOR O IGUAL al dado.
     * Útil para mostrar semillas que maduran rápido.
     *
     * Expresión XPath: //semilla[tiempoMaduracion <= maxTiempo]
     *
     * @param {number} maxTiempo - Tiempo máximo de maduración (inclusive)
     * @returns {Semilla[]}
     */
    filtrarSemillasPorTiempoMaximo(maxTiempo) {
        if (!this.xmlDoc) return [];

        const expresionXPath = `//semilla[tiempoMaduracion<=${maxTiempo}]`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        const semillas = [];
        let nodo       = resultado.iterateNext();

        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    // ============================================================
    // EXTRACCIÓN DE HERRAMIENTAS
    // ============================================================

    /**
     * Lee todos los nodos <herramienta> del XML y devuelve un objeto
     * con la información completa de cada una, incluyendo sus 3 niveles.
     *
     * @returns {Object} Mapa { id: { nombre, imagen, descripcion, niveles[] } }
     */
    obtenerHerramientas() {
        if (!this.xmlDoc) return {};

        const nodosHerr = this.xmlDoc.querySelectorAll("herramienta");
        const resultado = {};

        nodosHerr.forEach(nodo => {
            const id          = nodo.getAttribute("id");
            const nombre      = this._texto(nodo, "nombre");
            const imagen      = this._texto(nodo, "imagen");
            const descripcion = this._texto(nodo, "descripcion");

            // Lee los 3 niveles de la herramienta
            const niveles = [];
            nodo.querySelectorAll("nivel").forEach(nivelNodo => {
                const numero = parseInt(nivelNodo.getAttribute("numero"));

                // Obtiene el valor del bonus correspondiente a esta herramienta
                // (cada herramienta tiene un elemento de bonus distinto)
                let bonus = {};

                // Azada → bonusPrecioVenta
                const bpv = nivelNodo.querySelector("bonusPrecioVenta");
                if (bpv) bonus.precioVenta = parseFloat(bpv.textContent.trim());

                // Regadera → bonusReduccionTiempo
                const brt = nivelNodo.querySelector("bonusReduccionTiempo");
                if (brt) bonus.reduccionTiempo = parseInt(brt.textContent.trim());

                // Hoz → bonusFrutosExtra
                const bfe = nivelNodo.querySelector("bonusFrutosExtra");
                if (bfe) bonus.frutosExtra = parseInt(bfe.textContent.trim());

                niveles.push({
                    numero,
                    nombre:      this._texto(nivelNodo, "nombre"),
                    bonus,
                    costeMejora: parseInt(this._texto(nivelNodo, "costeMejora"))
                });
            });

            resultado[id] = { nombre, imagen, descripcion, niveles };
        });

        return resultado;
    }

    /**
     * Obtiene el coste de mejora para subir una herramienta al nivel indicado.
     * Usa XPath para localizar directamente el nodo <nivel> correcto.
     *
     * Expresión XPath: //herramienta[@id='azada']/niveles/nivel[@numero='2']/costeMejora
     *
     * @param {string} idHerramienta - "azada" | "regadera" | "hoz"
     * @param {number} nivel         - Nivel destino (2 o 3)
     * @returns {number}             - Coste en monedas, o Infinity si no existe
     */
    obtenerCosteMejora(idHerramienta, nivel) {
        if (!this.xmlDoc) return Infinity;

        const expresionXPath =
            `//herramienta[@id='${idHerramienta}']/niveles/nivel[@numero='${nivel}']/costeMejora`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,   // Solo necesitamos el primer resultado
            null
        );

        const nodo = resultado.singleNodeValue;
        return nodo ? parseInt(nodo.textContent.trim()) : Infinity;
    }

    // ============================================================
    // MÉTODOS PRIVADOS DE AYUDA
    // ============================================================

    /**
     * Extrae el texto de un elemento hijo directo de un nodo dado.
     * @param {Element} nodo         - Nodo padre
     * @param {string}  nombreHijo   - Tag del hijo cuyo texto se quiere
     * @returns {string}
     */
    _texto(nodo, nombreHijo) {
        const hijo = nodo.querySelector(nombreHijo);
        return hijo ? hijo.textContent.trim() : "";
    }

    /**
     * Convierte un nodo XML <semilla> en una instancia de la clase Semilla.
     * @param {Element} nodo - Nodo <semilla> del XML
     * @returns {Semilla}
     */
    _nodoASemilla(nodo) {
        return new Semilla(
            this._texto(nodo, "nombre"),
            parseInt(this._texto(nodo, "tiempoMaduracion")),
            parseInt(this._texto(nodo, "precioVenta")),
            this._texto(nodo, "semilla"),       // imgSemilla (dentro de <imagenes>)
            this._texto(nodo, "creciendo"),     // imgCreciendo
            this._texto(nodo, "maduro"),         // imgMaduro
            parseInt(this._texto(nodo, "precioCompra")),
            this._texto(nodo, "tipo")
        );
    }
}