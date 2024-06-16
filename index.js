const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

(async () => {
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

    // hace click en la tercera opcion de ese select --- cambiar por (1) para elegiar la primera = 1 persona.
    await page.waitForSelector('div.mat-select-panel-wrap mat-option:nth-child(3)', { visible: true });
    await page.evaluate(async () => {    
        const xx = document.querySelector('div.mat-select-panel-wrap mat-option:nth-child(3)')
        xx.click()
    })


    // Esperar a que aparezca la imagen con el alt "Verificación de imagen"
    const captchaImg = await page.waitForSelector('img[alt="Verificación de imagen"]');

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

    console.log('FALTA. El src de la imagen es ya lo tengo pero no lo puedo resolver');


    

    // Mostrar Notificacion
    notifier.notify({
        title: 'Llenador de Campos',
        message: 'Se llenaron todos los campos.',
        sound: true // optional, adds a sound to the notification
    });

    // Keep the browser open
    // Comment out the next line if you want the browser to stay open
    // await browser.close();
})();
