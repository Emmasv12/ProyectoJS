class Cultivo {

    constructor(semilla) {
        this.nombre = semilla.nombre;
        this.tiempoTotal = semilla.tiempoMaduracion;
        this.tiempoRestante = semilla.tiempoMaduracion;
        this.precioVenta = semilla.precioVenta;

        this.imgSemilla = semilla.imgSemilla;
        this.imgCreciendo = semilla.imgCreciendo;
        this.imgMaduro = semilla.imgMaduro;
    }

    crecer() {
        if (this.tiempoRestante > 0) {
            this.tiempoRestante--;
        }
    }

    estaMaduro() {
        return this.tiempoRestante === 0;
    }

    obtenerFase() {

        const progreso = this.tiempoRestante / this.tiempoTotal;

        if (this.tiempoRestante === this.tiempoTotal) {
            return "semilla";
        }

        if (progreso > 0.5) {
            return "semilla";
        }

        if (progreso > 0) {
            return "creciendo";
        }

        return "maduro";
    }

}