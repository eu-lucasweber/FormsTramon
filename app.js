const { Builder, By, until, Key } = require('selenium-webdriver');
const readline = require('readline');
const lerCSV = require('./lerCSV');
const ajustaCSV = require('./ajustaCSV');
const trataMsg = require('./trataMsg');
const Dados = require('./dados');
const { dados } = require('./dados');

// Cria interface para o usuário digitar a senha no console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Função para criar um atraso
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Função de login
async function start(driver, site, email, senha) {
    try {
        await driver.get(site); // Acessa a página de login
        await delay(2000); // Atraso para carregar a página

        await driver.findElement(By.id('onetrust-accept-btn-handler')).click();

        await delay(1000);

        // Preenche os campos de login
        await driver.findElement(By.id('emailCpf')).sendKeys(email);
        await driver.findElement(By.id('password')).sendKeys(senha);

        // Clica no botão de login
        await driver.findElement(By.css('button[type="submit"]')).click();
        await delay(1000); // Atraso para login ser processado

        // Clica no botão com a classe 'gAWVBQ'
        let abreNovaGuia = await driver.wait(until.elementLocated(By.className('gAWVBQ')), 10000);
        await driver.wait(until.elementIsVisible(abreNovaGuia), 10000);
        await abreNovaGuia.click();
        await delay(3000);

        // Aguarda até que a nova guia seja aberta
        await driver.sleep(2000); // Aguarda 2 segundos para a nova guia abrir

        // Obtém as handles de todas as janelas/abas abertas
        const windows = await driver.getAllWindowHandles();

        // Alterna para a nova guia (normalmente, a última da lista)
        await driver.switchTo().window(windows[1]);

        console.log('Agora estamos na nova guia.');

        // Aguarda até que o título da nova guia esteja presente para confirmar o carregamento
        await driver.wait(until.titleContains('Temporada Tramontina 2025 - Minhas Notas'), 20000);


        await driver.findElement(By.id('onetrust-accept-btn-handler')).click();

        await delay(1000);
    } catch (err) {
        console.error('Erro no login:', err);
        process.exit(1);
    }
}

// Função para inserir um novo registro
async function novoRegistro(driver, NUMERO_NF, DATA_EMISSAO) {
    try {
        // Clique no botão para novo registro
        let incluir = await driver.wait(until.elementLocated(By.css('img[alt="Incluir registro"]')), 10000);
        await driver.wait(until.elementIsVisible(incluir), 10000);
        await incluir.click();

        const inputs = await driver.wait(
            until.elementsLocated(By.css('input.gbc-label-text-container')),
            10000
        );

        await driver.wait(until.elementIsVisible(inputs[0]), 10000);
        await inputs[0].sendKeys(`${NUMERO_NF}`);
        await delay(1000);

        await driver.wait(until.elementIsVisible(inputs[1]), 10000);
        await inputs[1].click();
        await delay(1000);
        await inputs[1].click();
        await delay(1000);
        await inputs[1].clear();
        await delay(1000);
        await inputs[1].sendKeys(DATA_EMISSAO);
        await delay(1000);
        await inputs[1].sendKeys(Key.ENTER);
        await delay(1000);

    } catch (err) {
        console.error('Erro ao inserir novo registro:', err);
        process.exit(1);
    }
}

// Função para inserir produtos
async function insereProduto(driver, REF_PRODUTO, QUANTIDADE, VALOR_UNIT_VENDA, qnt_itens) {
    try {
        const inputsRefProd = await driver.wait(until.elementsLocated(By.css('.w_105 input')), 10000);
        const inputsQuantidade = await driver.wait(until.elementsLocated(By.css('div[data-aui-name="ttaint.intqtd"] input')), 10000);
        const inputsValorUnit = await driver.wait(until.elementsLocated(By.css('div[data-aui-name="ttaint.intvl"] input')), 10000);

        await driver.wait(until.elementIsVisible(inputsRefProd[qnt_itens-1]), 10000);
        await inputsRefProd[qnt_itens-1].sendKeys(`${REF_PRODUTO}`);
        await delay(2000);
        
        await driver.wait(until.elementIsVisible(inputsQuantidade[qnt_itens-1]), 10000);
        await inputsQuantidade[qnt_itens-1].click();
        await delay(1000);
        await inputsQuantidade[qnt_itens-1].clear();
        await inputsQuantidade[qnt_itens-1].sendKeys(QUANTIDADE);
        await delay(2000);

        await driver.wait(until.elementIsVisible(inputsValorUnit[qnt_itens-1]), 10000);
        await inputsValorUnit[qnt_itens-1].click();
        await delay(1000);
        await inputsValorUnit[qnt_itens-1].sendKeys(VALOR_UNIT_VENDA);
        await inputsValorUnit[qnt_itens-1].sendKeys(Key.ENTER);
        await delay(3000);

    } catch (err) {
        console.error('Erro ao inserir produto:', err);
        process.exit(1);
    }
}

// Função para confirmar o registro
async function confirma(driver) {
    try {
        let confirm = await driver.wait(until.elementLocated(By.css('img[alt="Confirmar seleção"]')), 10000);
        await driver.wait(until.elementIsVisible(confirm), 10000);
        await confirm.click();
        delay(3000);
    } catch (err) {
        console.error('Erro ao confirmar:', err);
        process.exit(1);
    }
}

// Função principal
async function app(driver, items) {
    try {
        // Login na aplicação
        const dados = await Dados.dados(); 
        
        await start(driver, dados.site, dados.user, dados.pass);
        await delay(2000);
            
        for (let index = 0; index < items.length; index++) {
            let qnt_itens = 1;

            // Insere novo registro
            await novoRegistro(driver, items[index].NUMERO_NF, items[index].DATA_EMISSAO);
            await delay(2000);

            // Insere o primeiro produto
            await insereProduto(
                driver,
                items[index].REF_PRODUTO,
                items[index].QUANTIDADE,
                items[index].VALOR_UNIT_VENDA,
                qnt_itens
            );
            await delay(1000);

            // Insere produtos adicionais com a mesma NF
            let verifica = true;
            while (verifica) {
                if(index + 1 < items.length && items[index + 1].NUMERO_NF == items[index].NUMERO_NF){
                    index++;
                    qnt_itens++;
                    let incluir = await driver.wait(until.elementLocated(By.css('img[alt="Adicionar registro ao final da lista"]')), 10000);
                    await driver.wait(until.elementIsVisible(incluir), 10000);
                    await incluir.click();
                    delay(3000);
                    await insereProduto(
                        driver,
                        items[index].REF_PRODUTO,
                        items[index].QUANTIDADE,
                        items[index].VALOR_UNIT_VENDA,
                        qnt_itens
                    );
                    await delay(5000);
                } else
                    verifica = false;
            }

            // Confirma o registro
            await confirma(driver);
            await delay(3000);

            console.log(`NF ${items[index].NUMERO_NF} inserida com sucesso`);

            await delay(3000);
        }

    } catch (erro) {
        console.error('Erro no processamento:', erro);
        process.exit(1);
    }
    
}

function verificaMesmoItens(itens){
    for (let index = 0; index < itens.length; index++) {
        if(index+1<itens.length)
            if(
                itens[index].NUMERO_NF == itens[parseInt(index)+1].NUMERO_NF && 
                itens[index].REF_PRODUTO == itens[parseInt(index)+1].REF_PRODUTO
            ){
                console.log(`NF: ${itens[index].NUMERO_NF}, REF: ${itens[index].REF_PRODUTO}`);
            }
    }
}

// Inicia o driver e chama a função principal
(async () => {
    ajustaCSV;
   
    let driver = await new Builder().forBrowser('chrome').build();

    try {
    	const filePath = './teste.csv'; // Substitua pelo caminho do seu arquivo CSV
        const itens = await lerCSV(filePath);

        await app(driver, itens);

    } finally {
        // Fecha o driver ao final
        await driver.quit();
    }

})();
