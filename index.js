const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

const Captcha = require("@2captcha/captcha-solver");
const solver = new Captcha.Solver("PONER_API_KEY_ACA");

const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/fixed');


(async () => {
    let encontro_turnos = false;
    let timer; // Declarar intervalId fuera de las funciones


    const ejecutarFuncion = async () => {
        try {
            console.log('Ejecutando ejecutarFuncion...');
            console.log('Abriendo navegador...');
            encontro_turnos = await abrirChromeYHacerTodo();
            console.log('Resultado de abrirChromeYHacerTodo:', encontro_turnos);
            if (encontro_turnos && timer) {
                await clearIntervalAsync(timer);
                console.log('Se encontraron los turnos. Deteniendo la ejecución.');
            }
        } catch (error) {
            console.error('Error en ejecutarFuncion:', error);
            console.log('Hubo algún error y explotó todo');
        }


    }

    await ejecutarFuncion()

    if(!encontro_turnos){
        timer = setIntervalAsync(async () => {
            console.log('Hello')        
            await ejecutarFuncion()
            console.log('Bye')
        }, 1000 * 60 * 15); // 15 minutos = 1000 milisegundos x 60 segundos x 15 minutos
    }

    

})();



async function abrirChromeYHacerTodo()
{


    // Launch the browser in desktop mode and maximized
    const browser = await puppeteer.launch({
        headless: false, // to see the browser window
        defaultViewport: null, // this will ensure the browser is maximized
        args: ['--start-maximized'] // start the browser maximized
    });

    const page = await browser.newPage();

    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`);
    });    

    // Go to the specified URL
    await page.goto('https://secure.e-konsulat.gov.pl/', {
        waitUntil: 'networkidle0' // wait until the page is fully loaded
    });

    // esperar que aparezca el select de lenguaje
    await page.waitForSelector('div.select-language mat-select', { visible: true });

    // hacer click en el boton
    await page.click('div.select-language mat-select');

    // Seleccionar opcion español
    await page.waitForSelector('#mat-option-6', { visible: true });
    await page.click('#mat-option-6');


    // Esperar 2 segundos que cargue la pagina en español
    await new Promise(resolve => setTimeout(resolve, 2000)); 


    // apretar el boton de "A"
    await page.evaluate(() => {
        const buttonA = Array.from(document.querySelectorAll('button.character'))
                            .find(button => button.textContent.trim() === 'A');
        if (buttonA) {
            buttonA.click();
        }
    });

    // esperar que aparezca "Seleccione un país:"
    await page.waitForFunction(() => {
        return document.body.textContent.includes('Seleccione un país:');
    }, { timeout: 10000 }); // 10 seconds timeout

    // Hacer click en el boton de Argentina
    await page.evaluate(() => {
        const argentinaLink = Array.from(document.querySelectorAll('li.countries__list__item.ng-star-inserted a'))
                                .find(link => link.textContent.trim() === 'ARGENTINA (1)');
        if (argentinaLink) {
            argentinaLink.click();
        }
    });

    // Esperar que aprezca buenos aires y hacer click
    await page.waitForSelector('li.institutions__list__item.ng-star-inserted a', { visible: true });
    await page.evaluate(() => {
        const buenosAiresLink = Array.from(document.querySelectorAll('li.institutions__list__item.ng-star-inserted a'))
                                    .find(link => link.textContent.trim() === 'Buenos Aires');
        if (buenosAiresLink) {
            buenosAiresLink.click();         
        }
    });

    // Esperar que cargue el texto de "Citas en el consulado" que esta a la izquierda
    await page.waitForFunction(() => {
        const items = Array.from(document.querySelectorAll('li[role="menuitem"] span.sidebar__nav-link.static-label.ng-star-inserted'));
        return items.some(item => item.textContent.trim() === 'Citas en el consulado');
    }, { timeout: 11000 }); // 11 segundos



    // Hacer click en el link de "Tramites de pasaportes"
    await page.evaluate(() => {
        const tramitesPasaportesLink = Array.from(document.querySelectorAll('a span'))
                                            .find(span => span.textContent.trim() === 'Tramites de pasaportes');
        if (tramitesPasaportesLink) {
            tramitesPasaportesLink.closest('a').click();
        }
    });

    // esperar que aparezca "Cita Previa para Pasaporte"
    await page.waitForSelector('#main-content > app-dashboard > app-institutions > app-institutions > app-passport-matters > div > app-passport-appointment-reservation > app-passport-appointment-reservation-form > h1', { visible: true });    


    await page.waitForSelector('#main-content > app-dashboard > app-institutions > app-institutions > app-passport-matters > div > app-passport-appointment-reservation > app-passport-appointment-reservation-form > div > app-captcha > div > div.d-flex > app-button-control > button', { visible: true });


    await page.evaluate(() => {
        const button = document.querySelector('#main-content > app-dashboard > app-institutions > app-institutions > app-passport-matters > div > app-passport-appointment-reservation > app-passport-appointment-reservation-form > div > app-captcha > div > div.d-flex > app-button-control > button');
        if (button) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });


    // busca y hace click en el primer select
    await page.evaluate(async () => {        
        const matLabel = Array.from(document.querySelectorAll('mat-label'))
                            .find(label => label.textContent.trim() === 'Tipo de servicio');
        if (matLabel) {
            const matFormField = matLabel.nextElementSibling.querySelector('mat-select');            

            if (matFormField) {
                matFormField.click();
            }
        }
    });
    // hace click en la segunda opcion de ese select
    await page.waitForSelector('div.mat-select-panel-wrap mat-option:nth-child(2)', { visible: true });
    await page.evaluate(async () => {    
        const xx = document.querySelector('div.mat-select-panel-wrap mat-option:nth-child(2)')
        xx.click()
    })


    // busca y hace click en el segundo select
    await page.evaluate(async () => {
        const matLabel = Array.from(document.querySelectorAll('mat-label'))
                            .find(label => label.textContent.trim() === 'Cita Previa para');
        if (matLabel) {
            const matFormField = matLabel.nextElementSibling.querySelector('mat-select');
            if (matFormField) {
                matFormField.click();
            }
        }
    });
    
    
    await autoScroll(page);
    
    // hace click en la tercera opcion de ese select --- cambiar por (1) para elegiar la primera = 1 persona.
    await page.waitForSelector('div.mat-select-panel-wrap mat-option:nth-child(3)', { visible: true });
    await page.click('div.mat-select-panel-wrap mat-option:nth-child(3)')


    let pifioElCaptcha = true

    do {


            let pudo_resolver_captcha = false
            let canti_captchas = 0

            do {
                pudo_resolver_captcha = await resolverCaptcha(page)
                console.log('pudo devolver algun captcha? ', pudo_resolver_captcha)
                canti_captchas = canti_captchas + 1
                
            } while (!pudo_resolver_captcha && canti_captchas < 3);

            if(!pudo_resolver_captcha) {
                console.log('tuvo algun problema en resolver el captcha, cerramos este navegador')
                await browser.close();
                return false
            }

            const botones = await page.evaluate(() => {
                const but = document.querySelector('#main-content > app-dashboard > app-institutions > app-institutions > app-passport-matters > div > app-passport-appointment-reservation > app-passport-appointment-reservation-form > div > app-captcha > div > div.d-flex > app-button-control > button')
                but.click()
            })


            await page.waitForNetworkIdle({
                idleTime: 500, // Tiempo de inactividad en milisegundos
                timeout: 15000 // Tiempo máximo de espera en milisegundos
            });    


            const pifio = await page.evaluate(() => {
                return document.body.innerText.includes("Proporcione la solución CAPTCHA");
            });

            pifioElCaptcha = pifio

            if (pifioElCaptcha) {
                console.log('le pifio al captcha al parecer....')      
            } else {
                console.log('mando captcha y estaba OK...')
            }            

    } while (pifioElCaptcha)


    const noHayCitas = await page.evaluate(() => {
        return document.body.innerText.includes("No hay citas disponibles. Inténtalo de nuevo más tarde.");
    });

    if(noHayCitas) {
        
        console.log('NO HAY CITAS, HABRA QUE PROBAR OTRA VEZ...')
        console.log('.....')
        console.log('.....')
        console.log('.....')
        await browser.close();        
        return false

    } else {

        console.log('---------------ATENCION----------------------')
        console.log('salio algo distinto a "no hay citas" chequear')
        console.log('---------------ATENCION----------------------')

        notifier.notify({
            title: 'Llenador de Campos',
            message: 'SALIO ALGO DISTINTO A "No hay citas!!" chequearrr',
            sound: true // optional, adds a sound to the notification
        });
        return true

    }

}

async function resolverCaptcha(page)
{


    // Esperar hasta que la imagen tenga un atributo src válido
    await page.waitForFunction(() => {
        const img = document.querySelector('img[alt="Verificación de imagen"]');
        return img && img.src && img.src !== 'https://secure.e-konsulat.gov.pl/undefined';
    }, { timeout: 10000 }); // 10 seconds timeout

    // Obtener el src de la imagen
    const src = await page.evaluate(() => {
        const img = document.querySelector('img[alt="Verificación de imagen"]');
        return img ? img.src : null;
    });
    
    let res
    let texto_captcha = ''


    console.log('enviando a resolver captcha... ');
    
    try {
        res = await solver.imageCaptcha({
            body: src,
            numeric: 0,
            min_len: 4,
            max_len: 4,
            phrase: 0,
            regsense: 1,
            
        })    
            
        texto_captcha = res.data

        console.log('captcha resuelto: ' + texto_captcha)

        await page.evaluate((texto_captcha) => {
            const textInput = document.querySelector('input[aria-label="Texto que se muestra en la imagen"]');
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(textInput, texto_captcha);
            textInput.dispatchEvent(new Event('input', { bubbles: true }));
        }, texto_captcha);


        console.log('captcha resuelto!')
        
        return true

    } catch (error) {

        console.log('error al resolver captcha xx');
        console.log(error)

        return false
    }

}


async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
            var scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
    
            if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
            }
        }, 100);
        });
    });
    }