// clase que representa una semilla ya plantada en una parcela
// gestiona el progreso de crecimiento y la fase visual del cultivo
class Cultivo {

    // copia los datos de la semilla y establece el contador de tiempo
    constructor(semilla) {
        this.nombre = semilla.nombre;
        this.tiempoTotal = semilla.tiempoMaduracion; // tiempo original para calcular el progreso
        this.tiempoRestante = semilla.tiempoMaduracion; // contador que va bajando cada ciclo
        this.precioVenta = semilla.precioVenta;

        // rutas de imagen para cada fase del cultivo
        this.imgSemilla = semilla.imgSemilla;
        this.imgCreciendo = semilla.imgCreciendo;
        this.imgMaduro = semilla.imgMaduro;
    }

    // descuenta un ciclo de tiempo si el cultivo todavia no ha madurado
    crecer() {
        if (this.tiempoRestante > 0) {
            this.tiempoRestante--;
        }
    }

    // devuelve true cuando el tiempo restante llega a cero
    estaMaduro() {
        return this.tiempoRestante === 0;
    }

    // determina en que fase visual se encuentra el cultivo segun el progreso
    obtenerFase() {

        // proporcion de tiempo restante respecto al total (1.0 = recien plantado, 0.0 = maduro)
        const progreso = this.tiempoRestante / this.tiempoTotal;

        // recien plantado: muestra imagen de semilla
        if (this.tiempoRestante === this.tiempoTotal) {
            return "semilla";
        }

        // primera mitad del crecimiento: todavia parece semilla
        if (progreso > 0.5) {
            return "semilla";
        }

        // segunda mitad del crecimiento: ya se ve la planta creciendo
        if (progreso > 0) {
            return "creciendo";
        }

        // tiempo agotado: el cultivo esta listo para cosechar
        return "maduro";
    }
}