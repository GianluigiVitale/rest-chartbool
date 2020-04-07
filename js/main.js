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
    // fine cose vuote


    $.ajax({    // chiamata AJAX per recuperare i dati delle vendite dei vari mesi del 2017
        url: 'http://157.230.17.132:4034/sales',
        method: 'GET',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {     // con questo ciclo for popolo le chiavi dell'oggetto 'oggettoVenditeMese' con il totale delle vendite per quel mese
                var dataSingolo = data[i];
                var giornoVenditaSingolo = dataSingolo.date;

                var momentMeseAttuale = moment(giornoVenditaSingolo, "DD-MM-YYYY");
                var giornoX = momentMeseAttuale.clone();
                var nomeMese = giornoX.format('MMMM');

                oggettoVenditeMese[nomeMese] += dataSingolo.amount;
            }
            for (var key in oggettoVenditeMese) {        // inserisco in due array diversi le chiavi e i rispettivi valori dell'oggetto 'oggettoVenditeMese'
                lables.push(key);
                venditeMese.push(oggettoVenditeMese[key])
            }
            maiuscoloPrimaLetteraArray(lables);
            chartJsVendite();
        }
    });



    // FUNZIONI UTILIZZATE



    function chartJsVendite() {     // funzione che serve per creare grafico grazie a chart js
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
            },
        });
    }

    function maiuscoloPrimaLetteraArray(array) {    // questa funnzione trasforma la prima lettera di ogni stringa di un array in maiuscolo
        for (var i = 0; i < array.length; i++) {
            array[i] = array[i][0].toUpperCase() + array[i].slice(1);
        }
    }


});
