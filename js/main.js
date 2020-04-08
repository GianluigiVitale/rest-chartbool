$(document).ready(function () {

    var source = $("#template-venditori").html();   // handlebars
    var template = Handlebars.compile(source);

    ajaxDatiEGrafici();


    $('.invio-dati').click(function () {
        var nuovaVendita = datiNuovaVendita();
        $.ajax({    // chiamata ajax POST grazie alla quale invio al server i dati presi dalla funzione datiNuovaVendita
            url: 'http://157.230.17.132:4034/sales',
            method: 'POST',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                salesman: nuovaVendita.venditoreSelezionato,
                amount: nuovaVendita.valoreVendita,
                date: nuovaVendita.dataMeseSelezionato
            }),
            success: function() {
                ajaxDatiEGrafici();
            },
            error: function() {
                alert('errore')
            }
        });
    });



    // FUNZIONI UTILIZZATE



    function ajaxDatiEGrafici() {       // creo i due grafici (vendite mese per mese 2017 e performance venditori 2017)

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
                for (var i = 0; i < data.length; i++) {     // con questo ciclo for popolo l'oggetto 'oggettoVenditeMese'. Le CHIAVI sono i mesi dell'anno e i VALORI le vendite totali per quel mese. E popolo anche l'oggetto 'oggettoVenditori2017'. Le CHIAVI sono i nomi dei venditori e i VALORI (fatturato del venditore / fatturato totale) * 100
                    var dataSingolo = data[i];

                    oggettoVenditeMese = datiVenditePerMese2017(dataSingolo, oggettoVenditeMese);
                    var nuoviDati = datiPerformanceVenditori2017(dataSingolo, oggettoVenditori2017, totaleVendite2017);
                    oggettoVenditori2017 = nuoviDati.oggettoVenditori2017;
                    totaleVendite2017 = nuoviDati.totaleVendite2017;
                }

                arrayGrafVenditeMese(oggettoVenditeMese, lables, venditeMese);
                arrayGrafPerformanceVenditori2017(oggettoVenditori2017, venditori, percentualeVenditeVenditore, totaleVendite2017);
                handlebarsNomeVenditori(venditori);
            },
            error: function() {
                alert('errore')
            }
        });

    }


    // grafico 1 vendite mese per mese 2017
    function datiVenditePerMese2017(dataSingolo, oggettoVenditeMese) {     // ottengo i dati delle vendite per ogni mese
        var giornoVenditaSingolo = dataSingolo.date;
        var momentMeseAttuale = moment(giornoVenditaSingolo, "DD-MM-YYYY");
        var giornoX = momentMeseAttuale.clone();
        var nomeMese = giornoX.format('MMMM');

        oggettoVenditeMese[nomeMese] += dataSingolo.amount;

        return oggettoVenditeMese;
    }

    function arrayGrafVenditeMese(oggettoVenditeMese, lables, venditeMese) {       // inserisco in due array diversi le chiavi e i rispettivi valori dell'oggetto 'oggettoVenditeMese'
        for (var key in oggettoVenditeMese) {
            lables.push(key);
            venditeMese.push(oggettoVenditeMese[key])
        }
        maiuscoloPrimaLetteraArray(lables);
        chartJsVendite(lables, venditeMese);
    }

    function chartJsVendite(lables, venditeMese) {     // funzione che serve per creare grafico delle vendite di ogni mese dell'anno 2017 grazie a chart js
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
    // fine grafico 1


    // grafico 2 performace venditori 2017
    function datiPerformanceVenditori2017(dataSingolo, oggettoVenditori2017, totaleVendite2017) {      // ottengo la performance (fatturato del venditore / fatturato totale) di ogni venditore nell'anno 2017
        var nomeVenditore = dataSingolo.salesman;
        if (oggettoVenditori2017[nomeVenditore] === undefined) {
            oggettoVenditori2017[nomeVenditore] = 0;
        }
        oggettoVenditori2017[nomeVenditore] += dataSingolo.amount;
        totaleVendite2017 += dataSingolo.amount;

        return {
            oggettoVenditori2017: oggettoVenditori2017,
            totaleVendite2017: totaleVendite2017
        }
    }

    function arrayGrafPerformanceVenditori2017(oggettoVenditori2017, venditori, percentualeVenditeVenditore, totaleVendite2017) {       // trasformo il valore delle chiavi (rappresentato dalle vendite di ogni venditore) nella percentuale di vendite annuali che ha prodotto E inserisco in due array diversi la chiave e il rispettivo valore
        for (var key in oggettoVenditori2017) {
            oggettoVenditori2017[key] = Math.round(oggettoVenditori2017[key] / totaleVendite2017 * 100);
            venditori.push(key);
            percentualeVenditeVenditore.push(oggettoVenditori2017[key]);
        }
        chartJsVenditoriPercentuale(venditori, percentualeVenditeVenditore);
    }

    function chartJsVenditoriPercentuale(venditori, percentualeVenditeVenditore) {    // funzione che serve per creare grafico delle vendite di ogni venditore dell'anno 2017 grazie a chart js
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
    // fine grafico 2


    function handlebarsNomeVenditori(venditori) {       // funzione che prende l'array venditori e grazie a handlebars inserisce il loro nome come opzione nel select 'venditore-select'
        for (var i = 0; i < venditori.length; i++) {
            var oggetto = {
                nomeVenditore: venditori[i]
            }
            var html = template(oggetto);
            $('.venditore-select').append(html);
        }
    }


    function datiNuovaVendita() {       // questa funzione prende i valori dei due select (venditore e mese) e l'input della vendita
        var venditoreSelezionato = $('.venditore-select').val();
        var meseSelezionato = $('.mese-select').val();
        var dataMeseSelezionato = "01/" + meseSelezionato + "/2017";
        var valoreVendita = parseInt($('.input-vendita').val());

        $('.venditore-select, .mese-select').val($('select option:first').val());
        $('.input-vendita').val('')

        return {
            venditoreSelezionato: venditoreSelezionato,
            dataMeseSelezionato: dataMeseSelezionato,
            valoreVendita: valoreVendita
        }
    }


    function maiuscoloPrimaLetteraArray(array) {    // questa funnzione trasforma la prima lettera di ogni stringa di un array in maiuscolo
        for (var i = 0; i < array.length; i++) {
            array[i] = array[i][0].toUpperCase() + array[i].slice(1);
        }
    }


});
