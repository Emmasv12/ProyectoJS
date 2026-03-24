// ============================================================
// Cultivo.js
// Clase que representa una semilla ya plantada en una parcela.
// Gestiona el progreso de crecimiento y la fase visual del cultivo.
// ============================================================
class Cultivo {

    /**
     * Copia los datos de la semilla y establece el contador de tiempo.
     * @param {Semilla} semilla - La semilla que se ha plantado
     */
    constructor(semilla) {
        this.nombre        = semilla.nombre;
        this.tiempoTotal   = semilla.tiempoMaduracion; // tiempo original para calcular el progreso
        this.tiempoRestante = semilla.tiempoMaduracion; // contador que va bajando cada ciclo
        this.precioVenta   = semilla.precioVenta;

        // Rutas de imagen para cada fase visual del cultivo
        this.imgSemilla    = semilla.imgSemilla;
        this.imgCreciendo  = semilla.imgCreciendo;
        this.imgMaduro     = semilla.imgMaduro;
    }

    /**
     * Descuenta un ciclo de tiempo si el cultivo todavía no ha madurado.
     */
    crecer() {
        if (this.tiempoRestante > 0) {
            this.tiempoRestante--;
        }
    }

    /**
     * Devuelve true cuando el tiempo restante llega a cero (cultivo listo).
     * @returns {boolean}
     */
    estaMaduro() {
        return this.tiempoRestante === 0;
    }

    /**
     * Determina en qué fase visual se encuentra el cultivo según el progreso.
     * Fases posibles: "semilla" | "creciendo" | "maduro"
     * @returns {string}
     */
    obtenerFase() {
        // Recién plantado: muestra imagen de semilla
        if (this.tiempoRestante === this.tiempoTotal) {
            return "semilla";
        }

        // Proporción de tiempo restante respecto al total
        const progreso = this.tiempoRestante / this.tiempoTotal;

        // Primera mitad del crecimiento: todavía parece semilla
        if (progreso > 0.5) {
            return "semilla";
        }

        // Segunda mitad del crecimiento: ya se ve la planta creciendo
        if (progreso > 0) {
            return "creciendo";
        }

        // Tiempo agotado: el cultivo está listo para cosechar
        return "maduro";
    }

    /**
     * Devuelve el porcentaje de crecimiento completado (0-100).
     * Útil para mostrar una barra de progreso en la interfaz.
     * @returns {number}
     */
    obtenerPorcentaje() {
        return Math.round(((this.tiempoTotal - this.tiempoRestante) / this.tiempoTotal) * 100);
    }
}