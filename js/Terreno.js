class Terreno {

    constructor(tamano) {

        this.parcelas = [];

        for (let i = 0; i < tamano; i++) {
            this.parcelas.push(new Parcela());
        }

    }

}