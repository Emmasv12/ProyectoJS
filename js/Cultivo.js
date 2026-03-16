class Cultivo {

    constructor(semilla) {
        this.nombre = semilla.nombre;
        this.tiempoRestante = semilla.tiempoMaduracion;
        this.precioVenta = semilla.precioVenta;
    }

    crecer() {
        if (this.tiempoRestante > 0) {
            this.tiempoRestante--;
        }
    }

    estaMaduro() {
        return this.tiempoRestante === 0;
    }

}