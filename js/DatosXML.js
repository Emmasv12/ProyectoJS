class DatosXML {

    constructor() {
        this.xmlDoc = null;
    }

    // CARGA DEL XML

    async cargarXML() {
        const respuesta = await fetch("datos.xml");

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar datos.xml: ${respuesta.status}`);
        }

        const textoXML = await respuesta.text();
        const parser   = new DOMParser();
        this.xmlDoc    = parser.parseFromString(textoXML, "application/xml");

        const error = this.xmlDoc.querySelector("parsererror");
        if (error) {
            throw new Error("El XML no es válido: " + error.textContent);
        }
    }

    // EXTRACCIÓN DE SEMILLAS

    /**
     * Devuelve SOLO los nodos <semilla> que son hijos directos de <semillas>,
     * ignorando el <semilla> que está dentro de <imagenes>.
     * Usa XPath /juego/semillas/semilla para ser explícito con la ruta.
     * @returns {Semilla[]}
     */
    obtenerTodasLasSemillas() {
        if (!this.xmlDoc) return [];

        // XPath con ruta absoluta: solo <semilla> hijos directos de <semillas>
        // Esto evita seleccionar el <semilla> de dentro de <imagenes>
        const resultado = this.xmlDoc.evaluate(
            "/juego/semillas/semilla",
            this.xmlDoc,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        const semillas = [];
        let nodo = resultado.iterateNext();
        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    /**
     * Filtra semillas usando XPath según campo y valor.
     * Usa ruta desde /juego/semillas/semilla para no mezclar con <imagenes>.
     *
     * @param {string} campo  - Elemento XML por el que filtrar (ej: "tipo")
     * @param {string} valor  - Valor buscado (ej: "hortaliza")
     * @returns {Semilla[]}
     */
    filtrarSemillas(campo, valor) {
        if (!this.xmlDoc) return [];

        // Ruta completa para evitar coger el nodo <semilla> de <imagenes>
        const expresionXPath = `/juego/semillas/semilla[${campo}='${valor}']`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        const semillas = [];
        let nodo = resultado.iterateNext();
        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    /**
     * Filtra semillas cuyo precioVenta sea menor o igual al máximo.
     * XPath: /juego/semillas/semilla[precioVenta<=maxPrecio]
     * @param {number} maxPrecio
     * @returns {Semilla[]}
     */
    filtrarSemillasPorPrecioMaximo(maxPrecio) {
        if (!this.xmlDoc) return [];

        const expresionXPath = `/juego/semillas/semilla[precioVenta<=${maxPrecio}]`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        const semillas = [];
        let nodo = resultado.iterateNext();
        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    /**
     * Filtra semillas cuyo tiempoMaduracion sea menor o igual al máximo.
     * XPath: /juego/semillas/semilla[tiempoMaduracion<=maxTiempo]
     * @param {number} maxTiempo
     * @returns {Semilla[]}
     */
    filtrarSemillasPorTiempoMaximo(maxTiempo) {
        if (!this.xmlDoc) return [];

        const expresionXPath = `/juego/semillas/semilla[tiempoMaduracion<=${maxTiempo}]`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        );

        const semillas = [];
        let nodo = resultado.iterateNext();
        while (nodo) {
            semillas.push(this._nodoASemilla(nodo));
            nodo = resultado.iterateNext();
        }

        return semillas;
    }

    // EXTRACCIÓN DE HERRAMIENTAS

    /**
     * Lee las herramientas del XML y devuelve un mapa { id: datos }.
     * @returns {Object}
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

            const niveles = [];
            nodo.querySelectorAll("nivel").forEach(nivelNodo => {
                const numero = parseInt(nivelNodo.getAttribute("numero"));
                let bonus = {};

                const bpv = nivelNodo.querySelector("bonusPrecioVenta");
                if (bpv) bonus.precioVenta = parseFloat(bpv.textContent.trim());

                const brt = nivelNodo.querySelector("bonusReduccionTiempo");
                if (brt) bonus.reduccionTiempo = parseInt(brt.textContent.trim());

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
     * Obtiene el coste de mejora de una herramienta a un nivel concreto.
     * Usa XPath con ruta completa.
     * @param {string} idHerramienta
     * @param {number} nivel
     * @returns {number}
     */
    obtenerCosteMejora(idHerramienta, nivel) {
        if (!this.xmlDoc) return Infinity;

        const expresionXPath =
            `//herramienta[@id='${idHerramienta}']/niveles/nivel[@numero='${nivel}']/costeMejora`;

        const resultado = this.xmlDoc.evaluate(
            expresionXPath,
            this.xmlDoc,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );

        const nodo = resultado.singleNodeValue;
        return nodo ? parseInt(nodo.textContent.trim()) : Infinity;
    }

    // MÉTODOS PRIVADOS

    /**
     * Extrae el texto de un hijo por querySelector.
     */
    _texto(nodo, nombreHijo) {
        const hijo = nodo.querySelector(nombreHijo);
        return hijo ? hijo.textContent.trim() : "";
    }

    /**
     * Convierte un nodo <semilla> del catálogo en instancia de Semilla.
     *
     * Las imágenes se leen recorriendo los children DIRECTOS de <imagenes>
     * por tagName, sin usar querySelector, para evitar que encuentre el
     * nodo <semilla> padre u otros nodos con el mismo nombre.
     *
     * @param {Element} nodo - Nodo <semilla> hijo de <semillas>
     * @returns {Semilla}
     */
    _nodoASemilla(nodo) {
        const imgs = nodo.querySelector("imagenes");

        // Lee un hijo directo de <imagenes> por su tagName exacto
        const imgTexto = (contenedor, tag) => {
            if (!contenedor) return "";
            for (const hijo of contenedor.children) {
                if (hijo.tagName === tag) return hijo.textContent.trim();
            }
            return "";
        };

        const precioCompraRaw = parseInt(this._texto(nodo, "precioCompra"));

        return new Semilla(
            this._texto(nodo, "nombre"),
            parseInt(this._texto(nodo, "tiempoMaduracion")),
            parseInt(this._texto(nodo, "precioVenta")),
            imgTexto(imgs, "semilla"),    // imgSemilla
            imgTexto(imgs, "creciendo"),  // imgCreciendo
            imgTexto(imgs, "maduro"),     // imgMaduro
            isNaN(precioCompraRaw) ? 0 : precioCompraRaw,
            this._texto(nodo, "tipo")
        );
    }
}