// clase que representa el campo completo de cultivo
// contiene un array de parcelas segun el tamano indicado
class Terreno {

    constructor(tamano) {

        this.parcelas = [];

        // crea tantas parcelas vacias como indique el tamano
        for (let i = 0; i < tamano; i++) {
            this.parcelas.push(new Parcela());
        }

    }

}