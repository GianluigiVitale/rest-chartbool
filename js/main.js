$(document).ready(function () {

    //  oggetto e array vuoti che verranno popolati grazie alla chiamata ajax
    var oggettoVenditeMese = {
        gennaio: 0,
        febbraio: 0,
        marzo: 0,
        aprile: 0,
        maggio: 0,
        giugno: 0,
        luglio: 0,
        agosto: 0,
        settembre: 0,
        ottobre: 0,
        novembre: 0,
        dicembre: 0,
    };
    var lables = [];
    var venditeMese = [];
        // fine primo grafico

        // secondo grafico
    var totaleVendite2017 = 0;
    var oggettoVenditori2017 = {};
    var venditori = [];
    var percentualeVenditeVenditore = [];
    // fine cose vuote


    $.ajax({
        url: 'http://157.230.17.132:4034/sales',
        method: 'GET',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {     // con questo ciclo for popolo l'oggetto 'oggettoVenditeMese'. Le CHIAVI sono i mesi dell'anno e i VALORI le vendite totali per quel mese. E popolo anche l'oggetto 'oggettoVenditori2017'. Le CHIAVI sono i nomi dei venditori e i VALORI il totale delle vendite nel 2017
                var dataSingolo = data[i];
                var giornoVenditaSingolo = dataSingolo.date;

                var momentMeseAttuale = moment(giornoVenditaSingolo, "DD-MM-YYYY");
                var giornoX = momentMeseAttuale.clone();
                var nomeMese = giornoX.format('MMMM');

                oggettoVenditeMese[nomeMese] += dataSingolo.amount;


                var nomeVenditore = dataSingolo.salesman;
                if (oggettoVenditori2017[nomeVenditore] === undefined) {
                    oggettoVenditori2017[nomeVenditore] = 0;
                }
                oggettoVenditori2017[nomeVenditore] += dataSingolo.amount;
                totaleVendite2017 += dataSingolo.amount;
            }

            for (var key in oggettoVenditeMese) {        // inserisco in due array diversi le chiavi e i rispettivi valori dell'oggetto 'oggettoVenditeMese'
                lables.push(key);
                venditeMese.push(oggettoVenditeMese[key])
            }
            maiuscoloPrimaLetteraArray(lables);
            chartJsVendite();

            for (var key in oggettoVenditori2017) {     // trasformo il valore delle chiavi (rappresentato dalle vendite di ogni venditore) nella percentuale di vendite annuali che ha prodotto E inserisco in due array diversi la chiave e il rispettivo valore
                oggettoVenditori2017[key] = Math.round(oggettoVenditori2017[key] / totaleVendite2017 * 100);
                venditori.push(key);
                percentualeVenditeVenditore.push(oggettoVenditori2017[key]);
            }
            chartJsVenditoriPercentuale()
        }
    });



    // FUNZIONI UTILIZZATE



    function chartJsVenditoriPercentuale() {    // funzione che serve per creare grafico delle vendite di ogni venditore dell'anno 2017 grazie a chart js
        var ctx = $('#contributo-venditori-2017');
        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: percentualeVenditeVenditore,
                    backgroundColor: ['#309FDB', '#E95B54', '#FBCE4A', '#3CAF85']
                }],
                labels: venditori
            },
            options: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Vendite di ogni venditore rispetto al totale (Espresse in percentuale %)'
                }
            }
        });
    }


    function chartJsVendite() {     // funzione che serve per creare grafico delle vendite di ogni mese dell'anno 2017 grazie a chart js
        var chartSalesX = $('#numero-vendite-2017');
        var chartSales = new Chart(chartSalesX, {
            type: 'line',
            data: {
                labels: lables,
                datasets: [{
                    label: 'Vendite Mese per Mese 2017',
                    backgroundColor: '#2E4691',
                    borderColor: '#2E4691',
                    data: venditeMese
                }]
            }
        });
    }

    function maiuscoloPrimaLetteraArray(array) {    // questa funnzione trasforma la prima lettera di ogni stringa di un array in maiuscolo
        for (var i = 0; i < array.length; i++) {
            array[i] = array[i][0].toUpperCase() + array[i].slice(1);
        }
    }


});
