$(document).ready(function () {

    var source = $("#template-venditori").html();   // handlebars
    var template = Handlebars.compile(source);

    ajaxDatiGrafici();


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
                ajaxDatiGrafici();
            },
            error: function() {
                alert('errore')
            }
        });
    });



    // FUNZIONI UTILIZZATE



    function ajaxDatiGrafici() {       // creo i due grafici (vendite mese per mese 2017 e performance venditori 2017)
        removeSalesman();

        //  oggetto e variabile vuoti che verranno popolati grazie alla chiamata ajax
        var oggettoFatturatoMese = {
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
            // fine primo grafico

            // secondo grafico
        var fatturato2017 = 0;
        var oggettoVenditori2017 = {};

            //terzo grafico
        var oggettoFatturatoQuarter = {
            q1: 0,
            q2: 0,
            q3: 0,
            q4: 0
        }
        // fine cose vuote


        $.ajax({
            url: 'http://157.230.17.132:4034/sales',
            method: 'GET',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {     // con questo ciclo for popolo l'oggetto 'oggettoFatturatoMese'. Le CHIAVI sono i mesi dell'anno e i VALORI le vendite totali per quel mese. E popolo anche l'oggetto 'oggettoVenditori2017'. Le CHIAVI sono i nomi dei venditori e i VALORI (fatturato del venditore / fatturato totale) * 100
                    var dataSingolo = data[i];

                    oggettoFatturatoMese = datiVenditePerMese2017(dataSingolo, oggettoFatturatoMese);                   // riga 77,78 e 80 mi estrapolo i dati per popolare i 3 oggetti e la variabile fatturato2017
                    var nuoviDati = datiPerformanceVenditori2017(dataSingolo, oggettoVenditori2017, fatturato2017);
                        oggettoVenditori2017 = nuoviDati.oggettoVenditori2017;
                        fatturato2017 = nuoviDati.fatturato2017;
                    oggettoFatturatoQuarter = datiFatturatoQuarter(dataSingolo, oggettoFatturatoQuarter);

                }
                var oggettoMesiEFatturato = arrayfatturatoMese(oggettoFatturatoMese);               // riga 84, 88 e 92 inserisco i dati degli oggetti in degli array
                    var lables = oggettoMesiEFatturato.lables;
                    var fatturatoMese = oggettoMesiEFatturato.fatturatoMese;

                var oggettoFattVenditori = arrayPerformanceVenditori2017(oggettoVenditori2017, fatturato2017);
                    var venditori = oggettoFattVenditori.venditori;
                    var percentualeFatturatoVenditore = oggettoFattVenditori.percentualeFatturatoVenditore;

                var fatturatoQuarter = arrayFatturatoQuarter(oggettoFatturatoQuarter, fatturatoQuarter);

                chartJsVendite(lables, fatturatoMese);              // riga 94,95,96 creo i grafici grazie ai dati estrapolati sopra
                chartJsVenditoriPercentuale(venditori, percentualeFatturatoVenditore);
                chartJsFatturatoQuarter(fatturatoQuarter);

                handlebarsNomeVenditori(venditori);
            },
            error: function() {
                alert('errore')
            }
        });

    }


    // grafico 1 vendite mese per mese 2017
    function datiVenditePerMese2017(dataSingolo, oggettoFatturatoMese) {     // ottengo i dati delle vendite per ogni mese
        var giornoVenditaSingolo = dataSingolo.date;
        var nomeMese = moment(giornoVenditaSingolo, "DD/MM/YYYY").format('MMMM');

        oggettoFatturatoMese[nomeMese] += dataSingolo.amount;

        return oggettoFatturatoMese;
    }

    function arrayfatturatoMese(oggettoFatturatoMese) {       // inserisco in due array diversi le chiavi e i rispettivi valori dell'oggetto 'oggettoFatturatoMese'
        var lables = [];
        var fatturatoMese = [];

        for (var key in oggettoFatturatoMese) {
            lables.push(key);
            fatturatoMese.push(oggettoFatturatoMese[key])
        }
        maiuscoloPrimaLetteraArray(lables);

        return {
            lables: lables,
            fatturatoMese: fatturatoMese
        }
    }

    function chartJsVendite(lables, fatturatoMese) {     // funzione che serve per creare grafico delle vendite di ogni mese dell'anno 2017 grazie a chart js
        if ($.isEmptyObject(chartSales)) {
            var chartSalesX = $('#fatturato-mese-2017');
            var chartSales = new Chart(chartSalesX, {
                type: 'line',
                data: {
                    labels: lables,
                    datasets: [{
                        label: 'Vendite Mese per Mese 2017',
                        backgroundColor: '#2E4691',
                        borderColor: '#2E4691',
                        data: fatturatoMese
                    }]
                }
            });
        } else {
            chartSales.data.labels = lables;
            chartSales.data.datasets[0].data = fatturatoMese;
            chartSales.update();
        }
    }
    // fine grafico 1


    // grafico 2 performace venditori 2017
    function datiPerformanceVenditori2017(dataSingolo, oggettoVenditori2017, fatturato2017) {      // ottengo la performance (fatturato del venditore / fatturato totale) di ogni venditore nell'anno 2017
        var nomeVenditore = dataSingolo.salesman;
        if (oggettoVenditori2017[nomeVenditore] === undefined) {
            oggettoVenditori2017[nomeVenditore] = 0;
        }
        oggettoVenditori2017[nomeVenditore] += dataSingolo.amount;
        fatturato2017 += dataSingolo.amount;

        return {
            oggettoVenditori2017: oggettoVenditori2017,
            fatturato2017: fatturato2017
        }
    }

    function arrayPerformanceVenditori2017(oggettoVenditori2017, fatturato2017) {       // trasformo il valore delle chiavi (rappresentato dalle vendite di ogni venditore) nella percentuale di vendite annuali che ha prodotto E inserisco in due array diversi la chiave e il rispettivo valore
        var venditori = [];
        var percentualeFatturatoVenditore = [];

        for (var key in oggettoVenditori2017) {
            oggettoVenditori2017[key] = Math.round(oggettoVenditori2017[key] / fatturato2017 * 100);
            venditori.push(key);
            percentualeFatturatoVenditore.push(oggettoVenditori2017[key]);
        }

        return {
            venditori: venditori,
            percentualeFatturatoVenditore: percentualeFatturatoVenditore
        }
    }

    function chartJsVenditoriPercentuale(venditori, percentualeFatturatoVenditore) {    // funzione che serve per creare grafico delle vendite di ogni venditore dell'anno 2017 grazie a chart js
        if ($.isEmptyObject(myPieChart)) {
            var ctx = $('#fatturato-venditori-2017');
            var myPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    datasets: [{
                        data: percentualeFatturatoVenditore,
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
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                            }
                        }
                    }
                }
            });
        } else {
            myPieChart.data.labels = venditori;
            myPieChart.data.datasets[0].data = percentualeFatturatoVenditore;
            myPieChart.update();
        }



    }
    // fine grafico 2


    // grafico 3 fatturato quarters 2017
    function datiFatturatoQuarter(dataSingolo, oggettoFatturatoQuarter) {   // ottengo il fatturato di ogni quarter del 2017
        var giornoVenditaSingolo = dataSingolo.date;
        var numeroQuarter = moment(giornoVenditaSingolo, "DD/MM/YYYY").quarter();
        var chiaveOggFattQuarter = 'q' + numeroQuarter;
        oggettoFatturatoQuarter[chiaveOggFattQuarter] += dataSingolo.amount;

        return oggettoFatturatoQuarter;
    }

    function arrayFatturatoQuarter(oggettoFatturatoQuarter, fatturatoQuarter) {     // trasformo il valore delle chiavi nel fatturato di quel rispettivo trimestre
        var fatturatoQuarter = [];

        for (var key in oggettoFatturatoQuarter) {
            fatturatoQuarter.push(oggettoFatturatoQuarter[key]);
        }

        return fatturatoQuarter;
    }

    function chartJsFatturatoQuarter(fatturatoQuarter) {    // questa funzione crea il grafico del fatturato per quarter grazie a chartjs
        if ($.isEmptyObject(myBarChart)) {
            var ctx1 = $('#fatturato-quarters-2017');
            var myBarChart = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                        label: 'Fatturato per Quarter 2017',
                        backgroundColor: '#2E4691',
                        borderColor: '#2E4691',
                        data: fatturatoQuarter
                    }]
                }
            });
        } else {
            myBarChart.data.datasets[0].data = fatturatoQuarter;
            myBarChart.update();
        }

    }
    // fine grafico 3


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


        if (venditoreSelezionato == '') {
            alert('Perfavore Seleziona un Venditore');
        }
        if (meseSelezionato == '') {
            alert('Perfavore Seleziona un Mese');
        }
        if (isNaN(valoreVendita)) {
            alert('Perfavore Inserisci un numero');
        }

        if ((venditoreSelezionato != '') && (meseSelezionato != '') && (!isNaN(valoreVendita))) {
            $('.venditore-select, .mese-select').val($('select option:first').val());
            $('.input-vendita').val('')

            return {
                venditoreSelezionato: venditoreSelezionato,
                dataMeseSelezionato: dataMeseSelezionato,
                valoreVendita: valoreVendita
            }
        }

    }


    function removeSalesman() {       // svuota la lista dei venditori
        $('.venditore-select option').not(':first').remove();
    }


    function maiuscoloPrimaLetteraArray(array) {    // questa funnzione trasforma la prima lettera di ogni stringa di un array in maiuscolo
        for (var i = 0; i < array.length; i++) {
            array[i] = array[i][0].toUpperCase() + array[i].slice(1);
        }
    }


});
